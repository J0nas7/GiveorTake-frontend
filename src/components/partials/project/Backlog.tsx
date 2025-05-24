"use client"

// External
import React, { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TFunction, useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckDouble, faEllipsisV, faLightbulb, faList, faPencil, faPlus, faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/Backlog.module.scss"
import { Block, Text, Field, Heading } from "@/components"
import { useBacklogsContext, useProjectsContext, useTasksContext } from "@/contexts"
import { Backlog, BacklogStates, Project, Status, Task, TaskFields } from "@/types";
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from "@/redux";
import Link from "next/link";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { TaskBulkActionMenu } from "../task/TaskBulkActionMenu";
import { CreatedAtToTimeSince } from "../task/TaskTimeTrackPlayer";
import Image from "next/image";
import { LoadingState } from "@/core-ui/components/LoadingState";
import { BacklogStatusActionMenu } from "../backlog/BacklogStatusActionMenu";
import { useURLLink } from "@/hooks";

export const BacklogContainer = () => {
    // ---- Hooks ----
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation(['backlog'])
    const { backlogById, readBacklogById } = useBacklogsContext()
    const { tasksById, readTasksByBacklogId, newTask, setTaskDetail, handleChangeNewTask, addTask, removeTask } = useTasksContext()
    const { backlogLink } = useParams<{ backlogLink: string }>(); // Get backlogLink from URL
    const { linkId: backlogId, convertID_NameStringToURLFormat } = useURLLink(backlogLink)

    // ---- State and other Variables ----
    const urlTaskIds = searchParams.get("taskIds")
    const urlTaskBulkFocus = searchParams.get("taskBulkFocus")
    const urlStatusIds = searchParams.get("statusIds")
    const [renderBacklog, setRenderBacklog] = useState<BacklogStates>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([])
    const [selectAll, setSelectAll] = useState(false); // To track the "Select All" checkbox
    const [statusUrlEditing, setStatusUrlEditing] = useState<boolean>(false)
    const authUser = useTypedSelector(selectAuthUser)
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
    // Handles the 'Enter' key press event to trigger task creation.
    const ifEnter = (e: React.KeyboardEvent) => (e.key === 'Enter') ? prepareCreateTask() : null

    // Prepares and creates a new task in the backlog.
    const prepareCreateTask = async () => {
        if (!renderBacklog) return

        const newTaskPlaceholder: Task = {
            Backlog_ID: parseInt(backlogId),
            Team_ID: renderBacklog?.project?.team?.Team_ID ? renderBacklog?.project?.team?.Team_ID : 0,
            Task_Title: newTask?.Task_Title || "",
            Status_ID: newTask?.Status_ID || renderBacklog.statuses && renderBacklog.statuses?.
                // Status_Order low to high:
                sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))[0]
                ?.Status_ID || 0,
            Assigned_User_ID: newTask?.Assigned_User_ID
        }

        await addTask(parseInt(backlogId), newTaskPlaceholder)

        await readTasksByBacklogId(parseInt(backlogId), true)
    }

    // Archives a task by removing it and refreshing the backlog tasks.
    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return

        await removeTask(task.Task_ID, task.Backlog_ID, undefined)

        await readTasksByBacklogId(parseInt(backlogId), true)
    }

    // Handles the change event for a checkbox input, updating the selected task IDs and URL parameters.
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        let updatedTaskIds = selectedTaskIds;

        if (checked) {
            updatedTaskIds = [...selectedTaskIds, value]; // Add new ID
        } else {
            updatedTaskIds = selectedTaskIds.filter(id => id !== value); // Remove unchecked ID
        }

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

    // Updates the URL parameters based on the provided task IDs and optionally returns the updated URL.
    const updateURLParams = (newTaskIds?: string[] | string, returnUrl?: boolean) => {
        const url = new URL(window.location.href)

        if (newTaskIds === undefined) {
            url.searchParams.delete("taskIds")
        } else if (Array.isArray(newTaskIds)) { // Handle taskIds (convert array to a comma-separated string)
            if (newTaskIds.length > 0 && newTaskIds.length <= tasksById.length) {
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
    useEffect(() => {
        // console.log("tasksByID changed")
        console.log("tasksById changed", tasksById, renderTasks)
        if (tasksById.length == 0 && renderTasks) {
            setRenderTasks(undefined)
        }
        if (tasksById.length) {
            console.log("renderTasks", renderTasks, "tasksById", tasksById)
            setRenderTasks(tasksById)
        }
    }, [tasksById])
    useEffect(() => {
        readTasksByBacklogId(parseInt(backlogId))
        readBacklogById(parseInt(backlogId))
    }, [backlogLink])
    useEffect(() => {
        if (backlogLink) {
            setRenderBacklog(backlogById)
            if (backlogById) {
                const firstStatus: Status | undefined = backlogById.statuses?.
                    // Status_Order low to high:
                    sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))[0]
                handleChangeNewTask("Status_ID", (firstStatus?.Status_ID ?? "").toString());
                document.title = `Backlog: ${backlogById?.Backlog_Name} - GiveOrTake`;
            }
        }
    }, [backlogById]);

    // Get user IDs from URL
    useEffect(() => {
        if (urlTaskIds) {
            // If userIds exist in the URL, use them
            const taskIdsFromURL = urlTaskIds ? urlTaskIds.split(",") : [];
            setSelectedTaskIds(taskIdsFromURL);
        } else {
            setSelectedTaskIds([]);
        }
    }, [urlTaskIds]);

    // Sync selected backlog IDs with URL or default to all backlogs
    useEffect(() => {
        if (!renderBacklog) return

        if (urlStatusIds) {
            // If statusIds exist in the URL, use them
            const statusIdsFromURL = urlStatusIds ? urlStatusIds.split(",") : [];
            setSelectedStatusIds(statusIdsFromURL);
        } else if (renderBacklog?.statuses?.length) {
            // If no statusIds in URL, select all statuses by default
            const allStatusIds = renderBacklog?.statuses
                .map((status: Status) => status.Status_ID?.toString())
                .filter((statusId) => statusId !== undefined) // Remove undefined values
            setSelectedStatusIds(allStatusIds)
        }
    }, [urlStatusIds, renderBacklog])

    // ---- Special: Sorting ----
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

    return (
        <>
            <BacklogStatusActionMenu
                statusUrlEditing={statusUrlEditing}
                renderBacklog={renderBacklog}
                selectedStatusIds={selectedStatusIds}
            />
            <TaskBulkActionMenu />
            <BacklogContainerView
                renderBacklog={renderBacklog}
                sortedTasks={sortedTasks}
                newTask={newTask}
                currentSort={currentSort}
                currentOrder={currentOrder}
                t={t}
                selectedTaskIds={selectedTaskIds}
                selectedStatusIds={selectedStatusIds}
                selectAll={selectAll}
                canAccessBacklog={canAccessBacklog}
                canManageBacklog={canManageBacklog}
                handleSort={handleSort}
                handleCreateTask={prepareCreateTask}
                ifEnter={ifEnter}
                handleChangeNewTask={handleChangeNewTask}
                setTaskDetail={setTaskDetail}
                handleCheckboxChange={handleCheckboxChange}
                handleSelectAllChange={handleSelectAllChange}
                statusUrlEditing={statusUrlEditing}
                setStatusUrlEditing={setStatusUrlEditing}
                convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
            />
        </>
    );
}

export interface BacklogContainerViewProps {
    renderBacklog?: BacklogStates;
    sortedTasks: Task[];
    newTask: Task | undefined;
    currentSort: string;
    currentOrder: string;
    t: TFunction
    selectedTaskIds: string[]
    selectedStatusIds: string[]
    selectAll: boolean
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    handleSort: (column: string) => void;
    handleCreateTask: () => void;
    ifEnter: (e: React.KeyboardEvent) => Promise<void> | null
    handleChangeNewTask: (field: TaskFields, value: string) => Promise<void>
    setTaskDetail: (task: Task) => void;
    handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    statusUrlEditing: boolean
    setStatusUrlEditing: React.Dispatch<React.SetStateAction<boolean>>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const BacklogContainerView: React.FC<BacklogContainerViewProps> = ({
    renderBacklog,
    sortedTasks,
    currentSort,
    currentOrder,
    newTask,
    selectedTaskIds,
    selectedStatusIds,
    selectAll,
    canAccessBacklog,
    canManageBacklog,
    handleSort,
    handleCreateTask,
    ifEnter,
    handleChangeNewTask,
    setTaskDetail,
    handleCheckboxChange,
    handleSelectAllChange,
    statusUrlEditing,
    setStatusUrlEditing,
    convertID_NameStringToURLFormat
}) => {
    return (
        <Block className="page-content">
            <FlexibleBox
                title={`Backlog`}
                subtitle={renderBacklog ? renderBacklog.Backlog_Name : undefined}
                titleAction={
                    renderBacklog && (
                        <Block className="flex gap-2 items-center w-full">
                            <Text
                                className="blue-link !inline-flex gap-2 items-center cursor-pointer"
                                onClick={() => setStatusUrlEditing(!statusUrlEditing)}
                            >
                                <FontAwesomeIcon icon={faCheckDouble} />
                                <Text variant="span">Filter Statuses</Text>
                            </Text>
                            <Link
                                href={`/project/${convertID_NameStringToURLFormat(renderBacklog?.Project_ID, renderBacklog.project?.Project_Name ?? "")}`}
                                className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faLightbulb} />
                                <Text variant="span">Go to Project</Text>
                            </Link>
                        </Block>
                    )
                }
                icon={faList}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <LoadingState singular="Backlog" renderItem={renderBacklog} permitted={canAccessBacklog}>
                    {renderBacklog && (
                        <Block className="overflow-x-auto">
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
                                                value={newTask?.Task_Title ?? ''}
                                                onChange={(e: string) => handleChangeNewTask("Task_Title", e)}
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
                                                value={newTask?.Status_ID}
                                                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                                    const newStatus = event.target.value as unknown as Task["Status_ID"]
                                                    handleChangeNewTask("Status_ID", newStatus.toString())
                                                }}
                                                className="p-2 border rounded"
                                            >
                                                {renderBacklog.statuses?.
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
                                                value={newTask?.Assigned_User_ID}
                                                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                                    const newAssigneeID = event.target.value as unknown as Task["Assigned_User_ID"]
                                                    if (newAssigneeID) handleChangeNewTask("Assigned_User_ID", newAssigneeID.toString())
                                                }}
                                                className="p-2 border rounded"
                                            >
                                                <option value="">Assignee</option>
                                                {renderBacklog?.project?.team?.user_seats?.map(userSeat => {
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
                                    {sortedTasks.
                                        filter(task => {
                                            if (selectedStatusIds.length) {
                                                return selectedStatusIds.includes(task.Status_ID.toString())
                                            } else {
                                                return true
                                            }
                                        })
                                        .map((task) => (
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
                                                    {renderBacklog?.project?.Project_Key}-{task.Task_Key}
                                                </td>
                                                <td onClick={() => setTaskDetail(task)} className="cursor-pointer hover:underline">
                                                    {task.Task_Title}
                                                </td>
                                                <td className={styles.status}>
                                                    {renderBacklog.statuses?.find(status => status.Status_ID === task.Status_ID)?.Status_Name}
                                                </td>
                                                {(() => {
                                                    const assignee = renderBacklog?.project?.team?.user_seats?.find(userSeat => userSeat.User_ID === task.Assigned_User_ID)?.user
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
            </FlexibleBox>
        </Block >
    );
};
