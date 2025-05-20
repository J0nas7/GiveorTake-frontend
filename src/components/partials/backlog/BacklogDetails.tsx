"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams, usePathname } from "next/navigation";
import { faArrowDown, faArrowUp, faCheckDouble, faLightbulb, faList, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Card, CardContent, Grid, TextField, Typography } from '@mui/material';

// Dynamically import ReactQuill with SSR disabled
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import styles from "@/core-ui/styles/modules/Backlog.module.scss"
import { useBacklogsContext } from '@/contexts';
import { Backlog, BacklogStates, User } from '@/types';
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from '@/redux';
import { Block, Text, FlexibleBox } from '@/components';
import { LoadingState } from '@/core-ui/components/LoadingState';

export const BacklogDetails: React.FC = () => {
    // ---- Hooks ----
    const { backlogId } = useParams<{ backlogId: string }>();
    const pathname = usePathname();
    const { readBacklogById, backlogById, saveBacklogChanges, removeBacklog } = useBacklogsContext();

    // ---- State ----
    const authUser = useTypedSelector(selectAuthUser);
    const [renderBacklog, setRenderBacklog] = useState<BacklogStates>(undefined);
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions)
    // Determine if the authenticated user can access the backlog:
    const canAccessBacklog = (authUser && renderBacklog && (
        renderBacklog.project?.team?.organisation?.User_ID === authUser.User_ID ||
        parsedPermissions?.includes(`accessBacklog.${renderBacklog.Backlog_ID}`)
    ))
    // Determine if the authenticated user can manage the backlog:
    const canManageBacklog = (authUser && renderBacklog && (
        renderBacklog.project?.team?.organisation?.User_ID === authUser.User_ID ||
        parsedPermissions?.includes(`manageBacklog.${renderBacklog.Backlog_ID}`)
    ))

    // ---- Methods ----
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

    // ---- Effects ----
    useEffect(() => {
        if (backlogId) readBacklogById(parseInt(backlogId));
    }, [backlogId]);

    useEffect(() => {
        if (backlogById) {
            setRenderBacklog(backlogById);
            document.title = `Backlog: ${backlogById.Backlog_Name}`;
        }
    }, [backlogById]);

    // ---- Render ----
    return (
        <BacklogDetailsView
            renderBacklog={renderBacklog}
            authUser={authUser}
            canAccessBacklog={canAccessBacklog}
            canManageBacklog={canManageBacklog}
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
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    handleBacklogInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBacklogChange: (field: keyof Backlog, value: string) => void;
    handleSaveChanges: () => Promise<void>;
    handleDeleteBacklog: () => Promise<void>;
}

const calculateTaskStats = (backlog: Backlog) => {
    if (!backlog.tasks || backlog.tasks.length === 0) return null;

    const total = backlog.tasks.length;
    const assigneeCount = backlog.tasks.reduce((acc, task) => {
        const key = task.Assigned_User_ID || "Unassigned";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string | number, number>);

    return { total, assigneeCount };
};

const BacklogDetailsView: React.FC<BacklogDetailsViewProps> = ({
    renderBacklog,
    authUser,
    canAccessBacklog,
    canManageBacklog,
    handleBacklogInputChange,
    handleBacklogChange,
    handleSaveChanges,
    handleDeleteBacklog,
}) => {
    const stats = renderBacklog ? calculateTaskStats(renderBacklog) : null;

    return (
        <Block className="page-content">
            <FlexibleBox
                title="Backlog"
                subtitle={renderBacklog ? renderBacklog.Backlog_Name : ''}
                titleAction={
                    renderBacklog && (
                        <Link
                            href={`/project/${renderBacklog?.Project_ID}`}
                            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faLightbulb} />
                            <Text variant="span">Go to Project</Text>
                        </Link>
                    )
                }
                icon={faList}
                className="no-box w-auto inline-block"
            >
                <LoadingState singular="Backlog" renderItem={renderBacklog} permitted={canAccessBacklog}>
                    {renderBacklog && (
                        <Card>
                            {canManageBacklog ? (
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
                </LoadingState>
            </FlexibleBox>

            {/* Statuses Section */}
            {canManageBacklog && renderBacklog && renderBacklog?.statuses && (
                <FlexibleBox
                    title="Statuses"
                    icon={faCheckDouble}
                    className="no-box w-auto inline-block"
                >
                    <table className={styles.taskTable}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Order</th>
                                <th>Is Default?</th>
                                <th>Is Closed?</th>
                                <th>Number of Tasks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderBacklog.statuses.map(status => (
                                <tr>
                                    <td>{status.Status_Name}</td>
                                    <td>
                                        <Block className="flex gap-1 items-center">
                                            {!status.Status_Is_Default && !status.Status_Is_Closed ? (
                                                <>
                                                    <Text className="w-3">
                                                        {(status.Status_Order || 0) > 2 && (
                                                            <FontAwesomeIcon icon={faArrowUp} size="xs" />
                                                        )}
                                                    </Text>
                                                    <Text className="w-3">
                                                        {renderBacklog.statuses && renderBacklog.statuses.length > (status.Status_Order || 0) + 1 && (
                                                            <FontAwesomeIcon icon={faArrowDown} size="xs" />
                                                        )}
                                                    </Text>
                                                    <Text>{status.Status_Order}</Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Text>{status.Status_Order}</Text>
                                                    <FontAwesomeIcon icon={faLock} size="xs" color="lightgrey" />
                                                </>
                                            )}
                                        </Block>
                                    </td>
                                    <td>{status.Status_Is_Default ? "Yes" : (
                                        <input
                                            type="radio"
                                        />
                                    )}</td>
                                    <td>{status.Status_Is_Closed ? "Yes" : (
                                        <input
                                            type="radio"
                                        />
                                    )}</td>
                                    <td>
                                        {(() => {
                                            const allTasks = renderBacklog.tasks?.length
                                            const numberOfTasks = renderBacklog.tasks?.filter(task => task.Status_ID === status.Status_ID).length
                                            if (!numberOfTasks || !allTasks) return

                                            return (
                                                <>
                                                    {numberOfTasks} ({((numberOfTasks / allTasks) * 100).toFixed(0)}%)
                                                </>
                                            )
                                        })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </FlexibleBox>
            )}

            {/* Task Summary Section */}
            {canAccessBacklog && renderBacklog && renderBacklog?.tasks && stats && (
                <FlexibleBox
                    title="Task Summary"
                    icon={undefined}
                    className="no-box w-auto inline-block"
                >
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
                </FlexibleBox>
            )}
        </Block>
    );
};
