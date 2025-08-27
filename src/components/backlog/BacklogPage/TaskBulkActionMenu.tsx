"use client"

// External
import { faCheck, faCopy, faEye, faEyeSlash, faPencil, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

// Internal
import { Block, Field, Heading, Text } from '@/components'
import { useBacklogsContext, useTasksContext } from '@/contexts'
import { LoadingButton } from '@/core-ui/components/LoadingState'
import { useAxios, useURLLink } from '@/hooks'
import { AppDispatch, selectSnackMessage, setSnackMessage, useTypedSelector } from '@/redux'
import { Project, Task } from '@/types'
import { useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import { useDispatch } from 'react-redux'

export const TaskBulkActionMenu: React.FC<{ project?: Project | undefined }> = ({
    project
}) => {
    // Hooks
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const { backlogLink, projectLink } = useParams<{ backlogLink: string, projectLink: string }>() // Get backlogLink from URL
    const searchParams = useSearchParams()
    const { httpPostWithData } = useAxios()
    const { readTasksByBacklogId } = useTasksContext()
    const { linkId: backlogId, linkName: backlogName, convertID_NameStringToURLFormat: backlogURLFormat } = useURLLink(backlogLink)
    const { linkId: projectId, linkName: projectName, convertID_NameStringToURLFormat: projectURLFormat } = useURLLink(projectLink)

    // State
    const snackMessage = useTypedSelector(selectSnackMessage)
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [copySuccess, setCopySuccess] = useState(false)
    const [taskBulkEditing, setTaskBulkEditing] = useState(false)
    const [taskBulkFocus, setTaskBulkFocus] = useState<boolean>(false)
    const urlTaskIds = searchParams.get("taskIds")
    const urlTaskBulkFocus = searchParams.get("taskBulkFocus")

    // Methods
    const updateURLParams = (returnUrl?: boolean) => {
        const url = new URL(window.location.href)

        url.searchParams.delete("taskIds")

        if (returnUrl) {
            return url.toString()
        } else {
            router.push(url.toString(), { scroll: false }) // Prevent full page reload
        }
    }

    const handleCopy = async (textToCopy: string) => {
        try {
            // Copy the text to clipboard
            await navigator.clipboard.writeText(textToCopy)
            setCopySuccess(true)
            // Clear the success message after a short time
            setTimeout(() => setCopySuccess(false), 2000)
        } catch (err) {
            setCopySuccess(false)
            console.error("Failed to copy text:", err)
        }
    }

    const handleEdit = async () => setTaskBulkEditing(true)

    const handleDelete = async () => {
        if (!selectedTaskIds.length || !project) return;

        // Fetch all tasks for all backlogs
        const backlogPromises = project.backlogs?.map(async (backlog) => {
            if (backlog.Backlog_ID) {
                return await readTasksByBacklogId(backlog.Backlog_ID, false, true);
            }
            return [];
        });

        // Wait for all promises to resolve and flatten the result
        const allTasksArrays = await Promise.all(backlogPromises || []);
        const allTasks = allTasksArrays.flat();

        // Filter out tasks with Status_Is_Closed: false
        const tasksToDelete = selectedTaskIds.filter(taskId => {
            const task = allTasks?.find(t => t.Task_ID == parseInt(taskId));
            return task?.status?.Status_Is_Closed !== false;
        });

        // Count how many tasks were not deleted
        const notDeletedCount = selectedTaskIds.length - tasksToDelete.length;

        if (!confirm("Are you sure you want to delete the items?")) return;

        if (tasksToDelete.length === 0) {
            dispatch(setSnackMessage("No tasks were deleted because all selected tasks are open."))
            return;
        }

        const result = await httpPostWithData("tasks/bulk-destroy", {
            task_ids: JSON.stringify(tasksToDelete)
        });

        if (result.success) {
            if (notDeletedCount > 0) {
                dispatch(setSnackMessage(`${notDeletedCount} task(s) were not deleted because they are open.`))
            }

            await readTasksByBacklogId(parseInt(backlogId), true);
            updateURLParams();
        }
    };

    const handleFocus = (newFocus: boolean) => {
        const url = new URL(window.location.href)
        if (newFocus) {
            url.searchParams.set("taskBulkFocus", "1")
        } else {
            url.searchParams.delete("taskBulkFocus")
        }

        return url.toString()
    }

    /**
     * Effects
     */
    // Get user IDs from URL
    useEffect(() => {
        if (urlTaskIds) {
            // If userIds exist in the URL, use them
            const taskIdsFromURL = urlTaskIds ? urlTaskIds.split(",") : []
            setSelectedTaskIds(taskIdsFromURL)
        }
    }, [urlTaskIds])

    useEffect(() => {
        setTaskBulkFocus(urlTaskBulkFocus ? true : false)
    }, [urlTaskBulkFocus])

    if (!urlTaskIds || snackMessage) return null

    return (
        <>
            <Block
                className={clsx(
                    "task-bulkedit-container",
                    { ["task-bulkedit-container-open"]: taskBulkEditing }
                )}
            >
                {taskBulkEditing && (
                    <BulkEdit
                        renderProject={project}
                        selectedTaskIds={selectedTaskIds}
                        setTaskBulkEditing={setTaskBulkEditing}
                    />
                )}
            </Block>
            <Block className="taskplayer-container flex items-center justify-between">
                <Block className="flex gap-2 items-center">
                    <Link href={`/backlog/${backlogURLFormat(parseInt(backlogId), backlogName)}`}>
                        <FontAwesomeIcon icon={faXmark} />
                    </Link>
                    <strong>{selectedTaskIds.length} tasks selected</strong>
                </Block>

                <Link
                    href={handleFocus(!taskBulkFocus)}
                    className="flex gap-2 items-center cursor-pointer"
                    data-testid="task-bulk-focus-toggle"
                >
                    <FontAwesomeIcon icon={taskBulkFocus ? faEye : faEyeSlash} />
                    <Text variant="span">
                        {taskBulkFocus ? (
                            <>Show</>
                        ) : (
                            <>Hide</>
                        )}
                        {" "}others
                    </Text>
                </Link>

                <Block className="flex gap-2 items-center cursor-pointer" onClick={() => handleEdit()}>
                    <FontAwesomeIcon icon={faPencil} />
                    <Text variant="span">Edit</Text>
                </Block>

                {copySuccess ? (
                    <Block className="flex gap-2 items-center">
                        <FontAwesomeIcon icon={faCheck} />
                        <Text variant="span">{selectedTaskIds.length} items copied</Text>
                    </Block>
                ) : (
                    <Block className="flex gap-2 items-center cursor-pointer" onClick={() => handleCopy("tester")}>
                        <FontAwesomeIcon icon={faCopy} />
                        <Text variant="span">Copy to clipboard</Text>
                    </Block>
                )}

                <Block className="flex gap-2 items-center cursor-pointer" onClick={() => handleDelete()}>
                    <FontAwesomeIcon icon={faTrashCan} />
                    <Text variant="span">Delete</Text>
                </Block>
            </Block>
        </>
    )
}

interface BulkEditProps {
    renderProject: Project | undefined
    selectedTaskIds: string[]
    setTaskBulkEditing: React.Dispatch<React.SetStateAction<boolean>>
}

const BulkEdit: React.FC<BulkEditProps> = ({
    renderProject,
    selectedTaskIds,
    setTaskBulkEditing
}) => {
    // Hooks
    const { backlogLink } = useParams<{ backlogLink: string }>(); // Get backlogLink from URL
    const { linkId: backlogId, convertID_NameStringToURLFormat } = useURLLink(backlogLink)
    const { httpPostWithData } = useAxios()
    const { backlogById, backlogsById, readBacklogById, readBacklogsByProjectId } = useBacklogsContext()
    const { readTasksByBacklogId } = useTasksContext()

    // State
    const [newUserId, setNewUserId] = useState<number | undefined>(undefined)
    const [newDueDate, setNewDueDate] = useState<string>("")
    const [newStatus, setNewStatus] = useState<string>("")
    const [newBacklog, setNewBacklog] = useState<number>(0)
    // const [bulkUpdatePending, setBulkUpdatePending] = useState<boolean>(false)
    const bulkUpdateRef = useRef<boolean>(false)

    /**
     * Methods
     */
    const { mutate: doBulkUpdate, isPending: bulkUpdatePending } = useMutation({
        mutationFn: () => {
            const updatedTasks = selectedTaskIds.map((taskId) => ({
                Task_ID: taskId,
                Backlog_ID: newBacklog || null,
                Status_ID: newStatus,
                Task_Due_Date: newDueDate,
                Assigned_User_ID: newUserId,
            }));
            console.log("Bulk update data:", updatedTasks);
            return httpPostWithData("tasks/bulk-update", { tasks: updatedTasks });
        },
        onSuccess: (result) => {
            console.log("Bulk update result:", result);
            if (result.updated_tasks) {
                readTasksByBacklogId(parseInt(backlogId), true);
                setTaskBulkEditing(false);
            }
        },
    });

    const handleBulkUpdate = () => {
        if (bulkUpdateRef.current) return;
        if (!selectedTaskIds.length) return;

        bulkUpdateRef.current = true;
        doBulkUpdate(undefined, {
            onSettled: () => {
                bulkUpdateRef.current = false;
            },
        });
    };

    /**
     * Effects
     */
    useEffect(() => { readBacklogById(parseInt(backlogId)) }, [backlogId])
    useEffect(() => {
        if (backlogById) {
            readBacklogsByProjectId(backlogById.Project_ID)
        }
    }, [backlogById])

    if (!backlogById) return null

    return (
        <Block className="flex flex-col gap-3">
            <Block className="flex justify-between">
                <Heading variant="h3" className="font-bold text-xl">Bulk edit</Heading>
                <Text className="text-xl">{selectedTaskIds.length} tasks</Text>
            </Block>
            {/* Assignee */}
            <Block>
                <Text variant="span" className="font-semibold">Assignee</Text>
                {/* Dropdown to change the user assignee */}
                <select
                    value={newUserId}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                        const newAssigneeID = event.target.value as unknown as Task["Assigned_User_ID"]
                        if (newAssigneeID) setNewUserId(newAssigneeID)
                    }}
                    className="p-2 border rounded bg-gray-200 w-60 h-14"
                >
                    <option value="">Assignee</option>
                    {renderProject?.team?.user_seats?.map(userSeat => {
                        return (
                            <option value={userSeat.user?.User_ID}>{userSeat.user?.User_FirstName} {userSeat.user?.User_Surname}</option>
                        )
                    })}
                </select>
            </Block>
            {/* Due Date */}
            <Block>
                <Text variant="span" className="font-semibold">Due Date</Text>
                <Field
                    type="date"
                    lbl=""
                    value={newDueDate}
                    className="bg-gray-200 w-60"
                    onChange={(e: string) => setNewDueDate(e)}
                    disabled={false}
                />
            </Block>
            {/* Status */}
            <Block className={newBacklog > 0 ? "opacity-100" : "opacity-50"}>
                <Text variant="span" className="font-semibold">Status</Text>
                {/* Dropdown to change the status */}
                <select
                    value={newStatus}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                        const newStatus = event.target.value as unknown as Task["Status_ID"]
                        setNewStatus(newStatus.toString())
                    }}
                    className="p-2 border rounded bg-gray-200 w-60 h-14"
                >
                    <option value="">Status</option>
                    {renderProject?.backlogs?.
                        find(backlog => backlog.Backlog_ID === newBacklog)?.
                        statuses?.map(status => (
                            <option value={status.Status_ID}>{status.Status_Name}</option>
                        ))}
                </select>
            </Block>
            <Block>
                <Text variant="span" className="font-semibold">Backlog</Text>
                {/* Dropdown to change the backlog */}
                <select
                    value={newBacklog}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                        const newBacklog = parseInt(event.target.value) as Task["Backlog_ID"]
                        setNewBacklog(newBacklog)
                        setNewStatus("") // Reset status when changing backlog
                    }}
                    className="p-2 border rounded bg-gray-200 w-60 h-14"
                >
                    <option value="0" disabled>Backlog</option>
                    {renderProject?.backlogs?.map(backlog => (
                        <option key={backlog.Backlog_ID} value={backlog.Backlog_ID}>
                            {backlog.Backlog_Name}
                        </option>
                    ))}
                </select>
            </Block>
            <Block className="flex gap-2 ml-auto">
                <button onClick={() => setTaskBulkEditing(false)}>
                    Cancel
                </button>
                <button
                    className="button-blue"
                    onClick={handleBulkUpdate}
                >
                    {bulkUpdatePending ? (
                        <LoadingButton />
                    ) : (
                        <>Confirm</>
                    )}
                </button>
            </Block>
        </Block>
    )
}
