"use client"

// External
import { faGauge, faList, faPlus, faSortDown, faSortUp, faWindowRestore } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TFunction, useTranslation } from "next-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

// Internal
import { Block, Field, Text } from "@/components";
import { useBacklogsContext, useTasksContext } from "@/contexts";
import { LoadingState } from "@/core-ui/components/LoadingState";
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { useURLLink } from "@/hooks";
import useRoleAccess from "@/hooks/useRoleAccess";
import { BacklogStates, Status, Task, TaskFields } from "@/types";
import clsx from "clsx";
import Link from "next/link";
import { CreatedAtToTimeSince } from "../task/TaskTimeTrackPlayer";

type BacklogWithSiblingsContainerProps = {
    backlogId: number | undefined
}

export const BacklogWithSiblingsContainer: React.FC<BacklogWithSiblingsContainerProps> = ({
    backlogId
}) => {
    // ---- Hooks ----
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation(['backlog'])
    const { readBacklogById } = useBacklogsContext()
    const { readTasksByBacklogId, setTaskDetail, addTask, removeTask } = useTasksContext()
    const { convertID_NameStringToURLFormat } = useURLLink("-")

    // ---- State and other Variables ----
    const [localNewTask, setLocalNewTask] = useState<Task | undefined>(undefined)
    const [localBacklog, setLocalBacklog] = useState<BacklogStates>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)
    const urlTaskIds = searchParams.get("taskIds")
    const urlTaskBulkFocus = searchParams.get("taskBulkFocus")
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [selectAll, setSelectAll] = useState(false); // To track the "Select All" checkbox

    const { canAccessBacklog } = useRoleAccess(
        localBacklog ? localBacklog.project?.team?.organisation?.User_ID : undefined,
        "backlog",
        localBacklog ? localBacklog.Backlog_ID : 0
    )

    // ---- Methods ----
    // Handles changes to the local new task state by updating specific fields or merging an object.
    const handleChangeLocalNewTask = async (field: TaskFields, value: string, object?: Task) => {
        if (object) {
            setLocalNewTask((prevState) => ({
                ...prevState,
                ...object
            } as Task))
        } else {
            setLocalNewTask((prevState) => ({
                ...prevState,
                [field]: value,
            } as Task))
        }
    }

    // Handles the 'Enter' key press event to trigger task creation.
    const ifEnter = (e: React.KeyboardEvent) => (e.key === 'Enter') ? prepareCreateTask() : null

    // Prepares and creates a new task in the backlog.
    const prepareCreateTask = async () => {
        if (!localBacklog || !localBacklog.Backlog_ID) return

        const newTaskPlaceholder: Task = {
            Backlog_ID: parseInt(localBacklog.Backlog_ID.toString()),
            Team_ID: localBacklog?.project?.team?.Team_ID ? localBacklog?.project?.team?.Team_ID : 0,
            Task_Title: localNewTask?.Task_Title || "",
            Status_ID: localNewTask?.Status_ID || 0,
            Assigned_User_ID: localNewTask?.Assigned_User_ID
        }

        await addTask(localBacklog.Backlog_ID, newTaskPlaceholder)

        const theTasks = await readTasksByBacklogId(localBacklog.Backlog_ID, undefined, true)
        if (theTasks && theTasks.length == 0 && renderTasks) setRenderTasks(undefined)

        if (theTasks && theTasks.length) setRenderTasks(theTasks)
    }

    // Archives a task by removing it from the backlog and updating the rendered tasks.
    const archiveTask = async (task: Task) => {
        if (!task.Task_ID || !localBacklog || !localBacklog.Backlog_ID) return

        await removeTask(task.Task_ID, task.Backlog_ID, undefined)

        const theTasks = await readTasksByBacklogId(localBacklog.Backlog_ID, undefined, true)
        if (theTasks && theTasks.length == 0 && renderTasks) setRenderTasks(undefined)

        if (theTasks && theTasks.length) setRenderTasks(theTasks)
    }

    // Handles the change event for a checkbox input, updating the selected task IDs and URL parameters.
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        let updatedTaskIds = selectedTaskIds;

        updatedTaskIds = checked ?
            [...selectedTaskIds, value] : // Add new ID
            selectedTaskIds.filter(id => id !== value) // Remove unchecked ID

        updateURLParams(updatedTaskIds)
    };

    // Handles the change event for selecting or deselecting all tasks.
    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setSelectAll(checked);

        let updatedTaskIds = selectedTaskIds

        if (checked) {
            // Select all task IDs
            updatedTaskIds = sortedTasks.map((task) => task.Task_ID!.toString())
        } else {
            // Deselect all task IDs
            updatedTaskIds = []
        }

        updateURLParams(updatedTaskIds)
    };

    // Updates the URL parameters based on the provided task IDs.
    const updateURLParams = (newTaskIds?: string[] | string, returnUrl?: boolean) => {
        const url = new URL(window.location.href)

        if (newTaskIds === undefined) {
            url.searchParams.delete("taskIds")
        } else if (Array.isArray(newTaskIds)) { // Handle taskIds (convert array to a comma-separated string)
            if (
                newTaskIds.length > 0 && renderTasks
                //  && newTaskIds.length <= renderTasks.length
            ) {
                url.searchParams.set("taskIds", newTaskIds.join(",")); // Store as comma-separated values
            } else {
                url.searchParams.delete("taskIds"); // Remove if empty
            }
        }
        // } else if (newUserId || userId) {
        //     url.searchParams.set("userId", newUserId || userId!);
        // }

        if (returnUrl) {
            return url.toString()
        } else {
            router.push(url.toString(), { scroll: false }); // Prevent full page reload
        }
    };

    // ---- Effects ----
    // Fetch and set backlog and tasks when backlogId changes
    useEffect(() => {
        const fetchBacklog = async () => {
            if (backlogId) {
                const theBacklog = await readBacklogById(backlogId, true)
                if (theBacklog) {
                    setLocalBacklog(theBacklog)

                    const firstStatus: Status | undefined = theBacklog.statuses?.
                        // Status_Order low to high:
                        sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))[0]
                    handleChangeLocalNewTask("Status_ID", (firstStatus?.Status_ID ?? "").toString());

                    const theTasks = await readTasksByBacklogId(backlogId, undefined, true)
                    if (theTasks && theTasks.length == 0 && renderTasks) setRenderTasks(undefined)

                    if (theTasks && theTasks.length && !renderTasks) setRenderTasks(theTasks)
                }
            }
        }
        fetchBacklog()
    }, [backlogId])

    // Get user IDs from URL
    useEffect(() => {
        if (urlTaskIds) {
            // If userIds exist in the URL, use them
            const taskIdsFromURL = urlTaskIds ? urlTaskIds.split(",") : [];
            setSelectedTaskIds(taskIdsFromURL);
        } else {
            setSelectedTaskIds([])
        }
    }, [urlTaskIds])

    // ---- Special: Backlog Sorting ----
    const currentSort = searchParams.get("sort") || "Task_ID";
    const currentOrder = searchParams.get("order") || "desc";

    const SORT_KEYS: Record<number, keyof Task> = {
        1: "Task_Title",
        2: "Status_ID",
        3: "Assigned_User_ID",
        4: "Task_CreatedAt",
    };

    // Default sorting field if an invalid key is used
    const DEFAULT_SORT_KEY: keyof Task = "Task_ID";

    // Function to toggle sorting order
    const handleSort = (column: string) => {
        const newOrder = currentSort === column && currentOrder === "asc" ? "desc" : "asc";
        router.push(`?sort=${column}&order=${newOrder}`);
    };

    // Sorting logic based on URL query parameters
    const sortedTasks = useMemo(() => {
        console.log("renderTasks sortedTasks = ")
        if (!Array.isArray(renderTasks)) return []; // Ensure tasks is an array

        let arrayToSort: Task[] = renderTasks

        if (urlTaskBulkFocus && urlTaskIds) {
            const taskIdsBulkFocus: string[] = urlTaskIds.split(",")

            arrayToSort = arrayToSort.filter(task => taskIdsBulkFocus.includes(task.Task_ID!.toString()))
        }

        const sortField = SORT_KEYS[Number(currentSort)] || DEFAULT_SORT_KEY; // Convert number to field name

        return [...arrayToSort].sort((a, b) => {
            const aValue = a[sortField] ?? "";
            const bValue = b[sortField] ?? "";

            if (typeof aValue === "string" && typeof bValue === "string") {
                return currentOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else if (typeof aValue === "number" && typeof bValue === "number") {
                return currentOrder === "asc" ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
    }, [renderTasks, currentSort, currentOrder, urlTaskBulkFocus, urlTaskIds]);

    // ---- Render ----
    return (
        <BacklogContainerView
            localBacklog={localBacklog}
            sortedTasks={sortedTasks}
            localNewTask={localNewTask}
            currentSort={currentSort}
            currentOrder={currentOrder}
            t={t}
            selectedTaskIds={selectedTaskIds}
            selectAll={selectAll}
            canAccessBacklog={canAccessBacklog}
            handleSort={handleSort}
            handleCreateTask={prepareCreateTask}
            ifEnter={ifEnter}
            handleChangeLocalNewTask={handleChangeLocalNewTask}
            setTaskDetail={setTaskDetail}
            handleCheckboxChange={handleCheckboxChange}
            handleSelectAllChange={handleSelectAllChange}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    );
}

export interface BacklogContainerViewProps {
    localBacklog?: BacklogStates;
    sortedTasks: Task[];
    localNewTask: Task | undefined;
    currentSort: string;
    currentOrder: string;
    t: TFunction
    selectedTaskIds: string[]
    selectAll: boolean
    canAccessBacklog: boolean | undefined
    handleSort: (column: string) => void;
    handleCreateTask: () => void;
    ifEnter: (e: React.KeyboardEvent) => Promise<void> | null
    handleChangeLocalNewTask: (field: TaskFields, value: string) => Promise<void>
    setTaskDetail: (task: Task) => void;
    handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const BacklogContainerView: React.FC<BacklogContainerViewProps> = ({
    localBacklog,
    sortedTasks,
    currentSort,
    currentOrder,
    localNewTask,
    selectedTaskIds,
    selectAll,
    canAccessBacklog,
    handleSort,
    handleCreateTask,
    ifEnter,
    handleChangeLocalNewTask,
    setTaskDetail,
    handleCheckboxChange,
    handleSelectAllChange,
    convertID_NameStringToURLFormat
}) => (
    <LoadingState singular="Backlog" renderItem={localBacklog} permitted={canAccessBacklog}>
        {localBacklog && (
            <Block className="overflow-x-auto">
                <Block className={styles.taskTable}>
                    <Block className={clsx(
                        styles.header,
                        "flex justify-between"
                    )}>
                        <Block className="flex gap-4 items-center">
                            <Text>{localBacklog.Backlog_Name}</Text>
                            <Text className="text-sm text-gray-600">{localBacklog.tasks?.length} tasks</Text>
                        </Block>
                        <Block className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 my-2">
                            <Link
                                href={`/backlog/${convertID_NameStringToURLFormat(localBacklog.Backlog_ID ?? 0, localBacklog.Backlog_Name)}`}
                                className="blue-link !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faList} />
                                Backlog
                            </Link>
                            <Link
                                href={`/kanban/${convertID_NameStringToURLFormat(localBacklog.Backlog_ID ?? 0, localBacklog.Backlog_Name)}`}
                                className="blue-link !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faWindowRestore} />
                                Kanban Board
                            </Link>
                            <Link
                                href={`/dashboard/${convertID_NameStringToURLFormat(localBacklog.Backlog_ID ?? 0, localBacklog.Backlog_Name)}`}
                                className="blue-link !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faGauge} />
                                <Text variant="span">Dashboard</Text>
                            </Link>
                        </Block>
                    </Block>
                </Block>
                <table className={styles.taskTable}>
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAllChange}
                                />
                            </th>
                            <th onClick={() => handleSort("2")}>
                                <Text variant="span">Task Key</Text>
                                {currentSort === "2" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                            </th>
                            <th onClick={() => handleSort("1")}>
                                <Text variant="span">Task Title</Text>
                                {currentSort === "1" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                            </th>
                            <th onClick={() => handleSort("3")}>
                                <Text variant="span">Status</Text>
                                {currentSort === "3" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                            </th>
                            <th onClick={() => handleSort("4")}>
                                <Text variant="span">Assignee</Text>
                                {currentSort === "4" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                            </th>
                            <th onClick={() => handleSort("5")}>
                                <Text variant="span">Created At</Text>
                                {currentSort === "5" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={2}></td>
                            <td>
                                <Field
                                    type="text"
                                    lbl="New Task"
                                    innerLabel={true}
                                    value={localNewTask?.Task_Title ?? ''}
                                    onChange={(e: string) => handleChangeLocalNewTask("Task_Title", e)}
                                    onKeyDown={
                                        (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                                            ifEnter(event)
                                    }
                                    disabled={false}
                                    className="w-full"
                                />
                            </td>
                            <td>
                                {/* Dropdown to change the status */}
                                <select
                                    value={localNewTask?.Status_ID}
                                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                        const newStatus = event.target.value as unknown as Task["Status_ID"]
                                        handleChangeLocalNewTask("Status_ID", newStatus.toString())
                                    }}
                                    className="p-2 border rounded"
                                >
                                    <option value="">-</option>
                                    {localBacklog.statuses?.
                                        // Status_Order low to high:
                                        sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))
                                        .map(status => (
                                            <option value={status.Status_ID}>{status.Status_Name}</option>
                                        ))}
                                </select>
                            </td>
                            <td>
                                {/* Dropdown to change the user assignee */}
                                <select
                                    value={localNewTask?.Assigned_User_ID}
                                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                        const newAssigneeID = event.target.value as unknown as Task["Assigned_User_ID"]
                                        if (newAssigneeID) handleChangeLocalNewTask("Assigned_User_ID", newAssigneeID.toString())
                                    }}
                                    className="p-2 border rounded"
                                >
                                    <option value="">Assignee</option>
                                    {localBacklog?.project?.team?.user_seats?.map(userSeat => {
                                        return (
                                            <option value={userSeat.user?.User_ID}>{userSeat.user?.User_FirstName} {userSeat.user?.User_Surname}</option>
                                        )
                                    })}
                                </select>
                            </td>
                            <td>
                                <button type="submit" onClick={handleCreateTask} className={styles.addButton}>
                                    <FontAwesomeIcon icon={faPlus} /> Create
                                </button>
                            </td>
                        </tr>
                        {sortedTasks.map((task) => (
                            <tr key={task.Task_ID}>
                                <td>
                                    <input
                                        type="checkbox"
                                        value={task.Task_ID}
                                        checked={task.Task_ID ? selectedTaskIds.includes(task.Task_ID.toString()) : false}
                                        onChange={handleCheckboxChange}
                                    />
                                </td>
                                <td onClick={() => setTaskDetail(task)} className="cursor-pointer hover:underline">
                                    {localBacklog?.project?.Project_Key}-{task.Task_Key}
                                </td>
                                <td onClick={() => setTaskDetail(task)} className="cursor-pointer hover:underline">
                                    {task.Task_Title}
                                </td>
                                <td className={styles.status}>
                                    {localBacklog.statuses?.find(status => status.Status_ID === task.Status_ID)?.Status_Name}
                                </td>
                                {(() => {
                                    const assignee = localBacklog?.project?.team?.user_seats?.find(userSeat => userSeat.User_ID === task.Assigned_User_ID)?.user
                                    return (
                                        <td>{assignee ? `${assignee.User_FirstName} ${assignee.User_Surname}` : "Unassigned"}</td>
                                    )
                                })()}
                                <td>
                                    {task.Task_CreatedAt && (
                                        <CreatedAtToTimeSince dateCreatedAt={task.Task_CreatedAt} />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Block>
        )}
    </LoadingState>
)
