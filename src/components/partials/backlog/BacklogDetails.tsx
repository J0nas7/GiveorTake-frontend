"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams, usePathname } from "next/navigation";
import { faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Card, CardContent, Grid, TextField, Typography } from '@mui/material';

// Dynamically import ReactQuill with SSR disabled
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { useBacklogsContext } from '@/contexts';
import { Backlog, BacklogStates, User } from '@/types';
import { selectAuthUser, useTypedSelector } from '@/redux';
import { Block, Text, FlexibleBox } from '@/components';

export const BacklogDetails: React.FC = () => {
    const { backlogId } = useParams<{ backlogId: string }>();
    const pathname = usePathname();
    const authUser = useTypedSelector(selectAuthUser);

    const { readBacklogById, backlogById, saveBacklogChanges, removeBacklog } = useBacklogsContext();
    const [renderBacklog, setRenderBacklog] = useState<BacklogStates>(undefined);

    useEffect(() => {
        if (backlogId) readBacklogById(parseInt(backlogId));
    }, [backlogId]);

    useEffect(() => {
        if (backlogById) {
            setRenderBacklog(backlogById);
            document.title = `Backlog: ${backlogById.Backlog_Name}`;
        }
    }, [backlogById]);

    // Handle Input Change for text fields
    const handleBacklogInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!renderBacklog) return
        const { name, value } = e.target;
        
        setRenderBacklog({
            ...renderBacklog,
            [name]: value,
        });
    };

    // Handle Rich Text or other field changes
    const handleBacklogChange = (field: keyof Backlog, value: string) => {
        if (!renderBacklog) return

        setRenderBacklog({
            ...renderBacklog,
            [field]: value,
        });
    };

    // Save changes to backend
    const handleSaveChanges = async () => {
        if (!renderBacklog) return;
        try {
            await saveBacklogChanges(renderBacklog, renderBacklog.Project_ID);
            alert('Backlog updated successfully.');
        } catch (err) {
            console.error(err);
            alert('Failed to update backlog.');
        }
    };

    // Delete backlog from backend
    const handleDeleteBacklog = async () => {
        if (!renderBacklog || !renderBacklog.Backlog_ID) return

        try {
            await removeBacklog(renderBacklog.Backlog_ID, renderBacklog.Project_ID, `/project/${renderBacklog.Project_ID}`);
            alert('Backlog deleted.');
            // optionally redirect or clear state
        } catch (err) {
            console.error(err);
            alert('Failed to delete backlog.');
        }
    };

    return (
        <BacklogDetailsView
            renderBacklog={renderBacklog}
            authUser={authUser}
            pathname={pathname}
            handleBacklogInputChange={handleBacklogInputChange}
            handleBacklogChange={handleBacklogChange}
            handleSaveChanges={handleSaveChanges}
            handleDeleteBacklog={handleDeleteBacklog}
        />
    );
};

interface BacklogDetailsViewProps {
    renderBacklog: BacklogStates;
    authUser?: User;
    pathname: string;
    handleBacklogInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBacklogChange: (field: keyof Backlog, value: string) => void;
    handleSaveChanges: () => Promise<void>;
    handleDeleteBacklog: () => Promise<void>;
}

const calculateTaskStats = (tasks: Backlog["tasks"]) => {
    if (!tasks || tasks.length === 0) return null;

    const total = tasks.length;
    const statusCount = tasks.reduce((acc, task) => {
        acc[task.Task_Status] = (acc[task.Task_Status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const assigneeCount = tasks.reduce((acc, task) => {
        const key = task.Assigned_User_ID || "Unassigned";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string | number, number>);

    return { total, statusCount, assigneeCount };
};

const BacklogDetailsView: React.FC<BacklogDetailsViewProps> = ({
    renderBacklog,
    authUser,
    pathname,
    handleBacklogInputChange,
    handleBacklogChange,
    handleSaveChanges,
    handleDeleteBacklog,
}) => {
    const stats = renderBacklog ? calculateTaskStats(renderBacklog.tasks) : null;

    return (
        <Block className="page-content">
            <FlexibleBox
                title="Backlog"
                subtitle={renderBacklog ? renderBacklog.Backlog_Name : ''}
                icon={faList}
                className="no-box w-auto inline-block"
            >
                {renderBacklog === false ? (
                    <Block className="text-center">
                        <Text className="text-gray-400">
                            Team not found
                        </Text>
                    </Block>
                ) : renderBacklog === undefined ? (
                    <Block className="flex justify-center">
                        <Image
                            src="/spinner-loader.gif"
                            alt="Loading..."
                            width={45}
                            height={45}
                        />
                    </Block>
                ) : (
                    <Card>
                        {authUser && renderBacklog.project?.team?.organisation?.User_ID === authUser.User_ID ? (
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Edit Backlog Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Backlog Name"
                                            variant="outlined"
                                            fullWidth
                                            value={renderBacklog.Backlog_Name}
                                            onChange={handleBacklogInputChange}
                                            name="Backlog_Name"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography>Backlog Description</Typography>
                                        <ReactQuill
                                            className="w-full"
                                            theme="snow"
                                            value={renderBacklog.Backlog_Description}
                                            onChange={(e: string) => handleBacklogChange("Backlog_Description", e)}
                                            modules={{
                                                toolbar: [
                                                    [{ header: "1" }, { header: "2" }, { font: [] }],
                                                    [{ list: "ordered" }, { list: "bullet" }],
                                                    ["bold", "italic", "underline", "strike"],
                                                    [{ align: [] }],
                                                    ["link"],
                                                    ["blockquote"],
                                                ],
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Start Date"
                                            type="date"
                                            variant="outlined"
                                            fullWidth
                                            value={renderBacklog.Backlog_StartDate || ''}
                                            onChange={(e) => handleBacklogChange("Backlog_StartDate", e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="End Date"
                                            type="date"
                                            variant="outlined"
                                            fullWidth
                                            value={renderBacklog.Backlog_EndDate || ''}
                                            onChange={(e) => handleBacklogChange("Backlog_EndDate", e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </Grid>
                                <Block className="mt-2 flex justify-between">
                                    <button onClick={handleSaveChanges} className="button-blue">
                                        Save Changes
                                    </button>
                                    <button onClick={handleDeleteBacklog} className="blue-link-light red-link-light">
                                        Delete Backlog
                                    </button>
                                </Block>
                            </CardContent>
                        ) : (
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Backlog Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <strong>Description:</strong>
                                        <div
                                            className="bg-gray-100 p-2"
                                            dangerouslySetInnerHTML={{
                                                __html: renderBacklog.Backlog_Description || "No description provided",
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <strong>Start:</strong> {renderBacklog.Backlog_StartDate || "N/A"}
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <strong>End:</strong> {renderBacklog.Backlog_EndDate || "N/A"}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        )}
                    </Card>
                )}
            </FlexibleBox>

            {/* Task Summary Section */}
            {renderBacklog && renderBacklog?.tasks && stats && (
                <Box mt={4}>
                    <Typography variant="h5" gutterBottom>
                        Task Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Total Tasks</Typography>
                                    <Typography>{stats.total}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Status Breakdown</Typography>
                                    {Object.entries(stats.statusCount).map(([status, count]) => (
                                        <Typography key={status}>
                                            {status}: {((count / stats.total) * 100).toFixed(1)}%
                                        </Typography>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Assignee Distribution</Typography>
                                    {Object.entries(stats.assigneeCount).map(([assignee, count]) => (
                                        <Typography key={assignee}>
                                            {assignee === "Unassigned" ? "Unassigned" : `User #${assignee}`}:
                                            {((count / stats.total) * 100).toFixed(1)}%
                                        </Typography>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Block>
    );
};
