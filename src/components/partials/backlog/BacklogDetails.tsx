"use client"

// External
import { faArrowDown, faArrowUp, faCheckDouble, faLightbulb, faList, faLock, faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { useParams, usePathname } from "next/navigation";
import React, { useEffect, useState } from 'react';

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { Block, Field, FlexibleBox, Text } from '@/components';
import { useBacklogsContext, useStatusContext } from '@/contexts';
import { LoadingState } from '@/core-ui/components/LoadingState';
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { useURLLink } from '@/hooks';
import useRoleAccess from '@/hooks/useRoleAccess';
import { selectAuthUser, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux';
import { Backlog, BacklogStates, Status, User } from '@/types';

export const BacklogDetails: React.FC = () => {
    // ---- Hooks ----
    const dispatch = useAppDispatch()
    const { backlogLink } = useParams<{ backlogLink: string }>(); // Get backlogLink from URL
    const pathname = usePathname();
    const { readBacklogById, backlogById, saveBacklogChanges, removeBacklog } = useBacklogsContext();
    const { moveOrder, assignDefault, assignClosed, addStatus, saveStatusChanges, removeStatus } = useStatusContext()
    const { linkId: backlogId, convertID_NameStringToURLFormat } = useURLLink(backlogLink)
    const { canAccessBacklog, canManageBacklog } = useRoleAccess(
        backlogById ? backlogById.project?.team?.organisation?.User_ID : undefined,
        "backlog",
        backlogById ? backlogById.Backlog_ID : 0
    )

    // ---- State ----
    const authUser = useTypedSelector(selectAuthUser);
    const [newStatus, setNewStatus] = useState<Status>({
        Backlog_ID: 0,
        Status_Name: '',
        Status_Order: 0,
        Status_Is_Default: false,
        Status_Is_Closed: false,
        Status_Color: '',
    });
    const [localBacklog, setLocalBacklog] = useState<BacklogStates>(undefined);

    // ---- Effects ----
    useEffect(() => {
        if (backlogId) readBacklogById(parseInt(backlogId));
    }, [backlogId]);

    useEffect(() => {
        if (backlogById) {
            setLocalBacklog(backlogById);
            setNewStatus({
                ...newStatus,
                Backlog_ID: backlogById.Backlog_ID ?? 0
            })
            document.title = `Backlog: ${backlogById.Backlog_Name}`;
        }
    }, [backlogById]);

    // ---- Methods ----
    // Handle Input Change for text fields
    const handleBacklogInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!localBacklog) return
        const { name, value } = e.target;

        setLocalBacklog({
            ...localBacklog,
            [name]: value,
        });
    };

    // Handle Rich Text or other field changes
    const handleBacklogChange = (field: keyof Backlog, value: string) => {
        if (!localBacklog) return

        setLocalBacklog({
            ...localBacklog,
            [field]: value,
        });
    };

    // Save backlog changes to backend
    const handleSaveBacklogChanges = async () => {
        if (!localBacklog) return;
        try {
            const saveChanges = await saveBacklogChanges(localBacklog, localBacklog.Project_ID);

            dispatch(setSnackMessage(
                saveChanges ? "Backlog updated successfully." : "Failed to update backlog."
            ));
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to update backlog."));
        }
    };

    // Handles the 'Enter' key press event to trigger update status name.
    const ifEnterSaveStatus = (e: React.KeyboardEvent, status: Status) => (e.key === 'Enter') ? handleSaveStatusChanges(status) : null

    // Save status changes to backend
    const handleSaveStatusChanges = async (status: Status) => {
        if (!localBacklog) return;
        try {
            const saveChanges = await saveStatusChanges(status, localBacklog.Project_ID)

            dispatch(setSnackMessage(
                saveChanges ? "Status changes saved successfully!" : "Failed to save status changes."
            ))

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to save update status."))
        }
    };

    // Handles the movement of a status within the backlog by changing its order.
    const handleMoveStatusChanges = async (statusId: number, direction: "up" | "down") => {
        if (!localBacklog) return;
        try {
            const saveChanges = await moveOrder(statusId, direction)

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to update status order."))
        }
    };

    // Handles the assignment of a default status to a backlog item.
    const handleAssignDefaultStatus = async (statusId: number) => {
        if (!localBacklog) return;
        try {
            const saveChanges = await assignDefault(statusId)

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to assign default status."))
        }
    };

    // Handles the assignment of a default status to a backlog item.
    const handleAssignClosedStatus = async (statusId: number) => {
        if (!localBacklog) return;
        try {
            const saveChanges = await assignClosed(statusId)

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to assign closed status."))
        }
    };

    // Handles the 'Enter' key press event to trigger status creation
    const ifEnterCreateStatus = (e: React.KeyboardEvent) => (e.key === 'Enter') ? handleCreateStatus() : null

    // Handles the creation of a new status for the backlog.
    const handleCreateStatus = async () => {
        if (!newStatus.Status_Name.trim()) {
            dispatch(setSnackMessage("Please enter a status name."))
            return;
        }

        await addStatus(parseInt(backlogId), newStatus)
        setNewStatus({
            ...newStatus,
            Status_Name: ""
        })
        setLocalBacklog(undefined)
        readBacklogById(parseInt(backlogId))
    };

    // Delete backlog from backend
    const handleDeleteBacklog = async () => {
        if (!localBacklog || !localBacklog.Backlog_ID) return

        try {
            await removeBacklog(
                localBacklog.Backlog_ID,
                localBacklog.Project_ID,
                `/project/${convertID_NameStringToURLFormat(localBacklog.Project_ID, localBacklog.project?.Project_Name ?? "")}`
            );
            alert('Backlog deleted.');
            // optionally redirect or clear state
        } catch (err) {
            console.error(err);
            alert('Failed to delete backlog.');
        }
    };

    // ---- Render ----
    return (
        <BacklogDetailsView
            localBacklog={localBacklog}
            newStatus={newStatus}
            authUser={authUser}
            canAccessBacklog={canAccessBacklog}
            canManageBacklog={canManageBacklog}
            setNewStatus={setNewStatus}
            handleBacklogInputChange={handleBacklogInputChange}
            handleBacklogChange={handleBacklogChange}
            handleSaveBacklogChanges={handleSaveBacklogChanges}
            handleSaveStatusChanges={handleSaveStatusChanges}
            ifEnterSaveStatus={ifEnterSaveStatus}
            handleCreateStatus={handleCreateStatus}
            ifEnterCreateStatus={ifEnterCreateStatus}
            handleDeleteBacklog={handleDeleteBacklog}
            handleMoveStatusChanges={handleMoveStatusChanges}
            handleAssignDefaultStatus={handleAssignDefaultStatus}
            handleAssignClosedStatus={handleAssignClosedStatus}
            removeStatus={removeStatus}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    );
};

interface BacklogDetailsViewProps {
    localBacklog: BacklogStates;
    newStatus: Status
    authUser?: User;
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    setNewStatus: React.Dispatch<React.SetStateAction<Status>>
    handleBacklogInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBacklogChange: (field: keyof Backlog, value: string) => void;
    handleSaveBacklogChanges: () => Promise<void>;
    handleSaveStatusChanges: (status: Status) => Promise<void>
    ifEnterSaveStatus: (e: React.KeyboardEvent, status: Status) => Promise<void> | null
    handleCreateStatus: () => Promise<void>
    ifEnterCreateStatus: (e: React.KeyboardEvent) => Promise<void> | null
    handleDeleteBacklog: () => Promise<void>;
    handleMoveStatusChanges: (statusId: number, direction: "up" | "down") => Promise<void>
    handleAssignDefaultStatus: (statusId: number) => Promise<void>
    handleAssignClosedStatus: (statusId: number) => Promise<void>
    removeStatus: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
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
    localBacklog,
    newStatus,
    authUser,
    canAccessBacklog,
    canManageBacklog,
    setNewStatus,
    handleBacklogInputChange,
    handleBacklogChange,
    handleSaveBacklogChanges,
    handleSaveStatusChanges,
    ifEnterSaveStatus,
    handleCreateStatus,
    ifEnterCreateStatus,
    handleDeleteBacklog,
    handleMoveStatusChanges,
    handleAssignDefaultStatus,
    handleAssignClosedStatus,
    removeStatus,
    convertID_NameStringToURLFormat
}) => {
    const stats = localBacklog ? calculateTaskStats(localBacklog) : null;

    return (
        <Block className="page-content">
            <FlexibleBox
                title="Backlog"
                subtitle={localBacklog ? localBacklog.Backlog_Name : ''}
                titleAction={
                    canAccessBacklog && localBacklog && (
                        <Block className="flex gap-2 ml-auto">
                            <Link
                                href={`/backlog/${convertID_NameStringToURLFormat(localBacklog?.Backlog_ID ?? 0, localBacklog.Backlog_Name)}`}
                                className="blue-link !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faList} />
                                <Text variant="span">Go to Backlog</Text>
                            </Link>
                            <Link
                                href={`/project/${localBacklog?.Project_ID}`}
                                className="blue-link !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faLightbulb} />
                                <Text variant="span">Go to Project</Text>
                            </Link>
                        </Block>
                    )
                }
                icon={faList}
                className="no-box w-auto inline-block"
            >
                <LoadingState singular="Backlog" renderItem={localBacklog} permitted={canAccessBacklog}>
                    {localBacklog && (
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
                                                value={localBacklog.Backlog_Name}
                                                onChange={handleBacklogInputChange}
                                                name="Backlog_Name"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography>Backlog Description</Typography>
                                            <ReactQuill
                                                className="w-full"
                                                theme="snow"
                                                value={localBacklog.Backlog_Description}
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
                                                value={localBacklog.Backlog_StartDate || ''}
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
                                                value={localBacklog.Backlog_EndDate || ''}
                                                onChange={(e) => handleBacklogChange("Backlog_EndDate", e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Block className="mt-2 flex justify-between">
                                        <button onClick={handleSaveBacklogChanges} className="button-blue">
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
                                                    __html: localBacklog.Backlog_Description || "No description provided",
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <strong>Start:</strong> {localBacklog.Backlog_StartDate || "N/A"}
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <strong>End:</strong> {localBacklog.Backlog_EndDate || "N/A"}
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            )}
                        </Card>
                    )}
                </LoadingState>
            </FlexibleBox>

            {/* Statuses Section */}
            {canManageBacklog && localBacklog && localBacklog?.statuses && (
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
                            <tr>
                                <td colSpan={6}>
                                    <Block className="flex gap-2 items-center">
                                        <Field
                                            type="text"
                                            lbl="New status"
                                            innerLabel={true}
                                            value={newStatus.Status_Name}
                                            onChange={(e: string) => setNewStatus({
                                                ...newStatus,
                                                Status_Name: e
                                            })}
                                            onKeyDown={
                                                (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                                                    ifEnterCreateStatus(event)
                                            }
                                            disabled={false}
                                            className="status-name-field"
                                        />
                                        <button className="blue-link" onClick={handleCreateStatus}>
                                            Create status
                                        </button>
                                    </Block>
                                </td>
                            </tr>
                            {localBacklog.statuses
                                // Status_Order low to high:
                                .sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))
                                .map((status: Status) => {
                                    const allTasks = localBacklog.tasks?.length
                                    const numberOfTasks = localBacklog.tasks?.filter(task => task.Status_ID === status.Status_ID).length
                                    const [statusName, setStatusName] = useState<string>(status.Status_Name)

                                    return (
                                        <tr>
                                            <td>
                                                <Block className="flex gap-2 items-center">
                                                    <Field
                                                        type="text"
                                                        lbl=""
                                                        value={statusName}
                                                        onChange={(e: string) => setStatusName(e)}
                                                        onKeyDown={
                                                            (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                                                                ifEnterSaveStatus(event, {
                                                                    ...status,
                                                                    Status_Name: statusName
                                                                })
                                                        }
                                                        disabled={false}
                                                        className="status-name-field"
                                                    />
                                                    {statusName !== status.Status_Name ? (
                                                        <button>
                                                            <FontAwesomeIcon icon={faPencil} color="green"
                                                                onClick={() => handleSaveStatusChanges(
                                                                    {
                                                                        ...status,
                                                                        Status_Name: statusName
                                                                    }
                                                                )}
                                                            />
                                                        </button>
                                                    ) : status.Status_ID && !status.Status_Is_Default && !status.Status_Is_Closed ? (
                                                        <button>
                                                            <FontAwesomeIcon icon={faTrashCan} color="red" size="xs"
                                                                onClick={() => removeStatus(
                                                                    status.Status_ID!,
                                                                    status.Backlog_ID,
                                                                    `/backlog/${convertID_NameStringToURLFormat(localBacklog.Backlog_ID ?? 0, localBacklog.Backlog_Name)}/edit`
                                                                )}
                                                            />
                                                        </button>
                                                    ) : null}
                                                </Block>
                                            </td>
                                            <td>
                                                <Block className="flex gap-1 items-center">
                                                    {!status.Status_Is_Default && !status.Status_Is_Closed ? (
                                                        <>
                                                            <Text className="w-3">
                                                                {status.Status_ID && (status.Status_Order || 0) > 2 && (
                                                                    <button>
                                                                        <FontAwesomeIcon icon={faArrowUp} size="xs"
                                                                            onClick={() => handleMoveStatusChanges(status.Status_ID!, "up")}
                                                                        />
                                                                    </button>
                                                                )}
                                                            </Text>
                                                            <Text className="w-3">
                                                                {status.Status_ID && localBacklog.statuses && localBacklog.statuses.length > (status.Status_Order || 0) + 1 && (
                                                                    <button>
                                                                        <FontAwesomeIcon icon={faArrowDown} size="xs"
                                                                            onClick={() => handleMoveStatusChanges(status.Status_ID!, "down")}
                                                                        />
                                                                    </button>
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
                                                    onClick={() => handleAssignDefaultStatus(status.Status_ID ?? 0)}
                                                />
                                            )}</td>
                                            <td>{status.Status_Is_Closed ? "Yes" : (
                                                <input
                                                    type="radio"
                                                    onClick={() => handleAssignClosedStatus(status.Status_ID ?? 0)}
                                                />
                                            )}</td>
                                            <td>
                                                {allTasks && numberOfTasks && (
                                                    <>{numberOfTasks} ({((numberOfTasks / allTasks) * 100).toFixed(0)}%)</>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </table>
                </FlexibleBox>
            )}

            {/* Task Summary Section */}
            {canAccessBacklog && localBacklog && localBacklog?.tasks && stats && (
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
