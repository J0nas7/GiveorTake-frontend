"use client"

// External
import { TFunction, useTranslation } from "next-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

// Internal
import { Block } from "@/components";
import { BacklogSiblingsHeader, BacklogSiblingsNewTaskRow, BacklogSiblingsTaskTableBody, BacklogSiblingsTaskTableHeader } from '@/components/backlog';
import { useBacklogsContext, useTasksContext } from "@/contexts";
import { LoadingState } from "@/core-ui/components/LoadingState";
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { useURLLink } from "@/hooks";
import useRoleAccess from "@/hooks/useRoleAccess";
import { BacklogStates, Task, TaskFields } from "@/types";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';

type BacklogWithSiblingsProps = {
    backlogId: number | undefined
}

export type BacklogSiblingsProps = {
    localBacklog?: BacklogStates;
    sortedTasks: Task[];
    numberOfTasks: number;
    localNewTask: Task | undefined;
    currentSort: string;
    currentOrder: string;
    t: TFunction
    selectedTaskIds: string[]
    selectAll: boolean
    canAccessBacklog: boolean | undefined
    createTaskPending: boolean
    handleSort: (column: string) => void;
    handleCreateTask: () => void
    ifEnter: (e: React.KeyboardEvent) => void | null
    handleChangeLocalNewTask: (field: TaskFields, value: string) => Promise<void>
    setTaskDetail: (task: Task) => void;
    handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const BacklogWithSiblings: React.FC<BacklogWithSiblingsProps> = ({
    backlogId
}) => {
    // ---- Hooks ----
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t } = useTranslation(['backlog'])
    const { readBacklogById } = useBacklogsContext()
    const { readTasksByBacklogId, setTaskDetail, addTask, removeTask } = useTasksContext()
    const { convertID_NameStringToURLFormat } = useURLLink("-")

    // ---- Tanstack Query ----
    // Fetch backlog by backlogId
    const { data: localBacklog } = useQuery<BacklogStates>({
        queryKey: ["backlog", backlogId],
        queryFn: () => backlogId ? readBacklogById(backlogId, true) : Promise.resolve(null),
        enabled: !!backlogId,
        select: (theBacklog: BacklogStates | null) => {
            if (!theBacklog) return undefined;

            return {
                ...theBacklog,
                statuses: theBacklog.statuses?.sort(
                    (a, b) => (a.Status_Order || 0) - (b.Status_Order || 0)
                ),
            };
        }
    });

    // Fetch tasks by backlogId
    const { data: renderTasks } = useQuery<Task[] | undefined>({
        queryKey: ["tasks", backlogId],
        queryFn: () => backlogId ?
            readTasksByBacklogId(backlogId, undefined, true) : Promise.resolve(null),
        enabled: !!backlogId,
        select: (tasks: Task[] | undefined) => tasks ?? [], // fallback for null
    });

    // ---- State and other Variables ----
    const [localNewTask, setLocalNewTask] = useState<Task | undefined>(undefined)
    // const [localBacklog, setLocalBacklog] = useState<BacklogStates>(undefined)
    // const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)
    const urlTaskIds = searchParams.get("taskIds")
    const urlTaskBulkFocus = searchParams.get("taskBulkFocus")
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [selectAll, setSelectAll] = useState(false); // To track the "Select All" checkbox
    // const [createTaskPending, setCreateTaskPending] = useState<boolean>(false)
    const createTaskRef = useRef<boolean>(false)

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
    const ifEnter = (e: React.KeyboardEvent) => (e.key === 'Enter') ? handleCreateTask() : null

    // Prepares and creates a new task in the backlog.
    const { mutate: doCreateTask, isPending: createTaskPending } = useMutation({
        mutationFn: async () => {
            if (!localBacklog || !localBacklog.Backlog_ID) return false;

            const newTaskPlaceholder: Task = {
                Backlog_ID: parseInt(localBacklog.Backlog_ID.toString()),
                Team_ID: localBacklog?.project?.team?.Team_ID ? localBacklog?.project?.team?.Team_ID : 0,
                Task_Title: localNewTask?.Task_Title || "",
                Status_ID: localNewTask?.Status_ID || 0,
                Assigned_User_ID: localNewTask?.Assigned_User_ID
            };

            // inline delay using setTimeout
            // await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds

            return addTask(localBacklog.Backlog_ID, newTaskPlaceholder);
        },
        // Optimistic update
        onMutate: async () => {
            if (!localBacklog || !localBacklog.Backlog_ID) return;

            // Cancel any outgoing refetches, so they don’t overwrite optimistic update
            await queryClient.cancelQueries({ queryKey: ["tasks", localBacklog.Backlog_ID] });

            // Snapshot the previous tasks
            const previousTasks = queryClient.getQueryData<Task[]>(["tasks", localBacklog.Backlog_ID]);

            // Create a temporary task with a fake ID
            const optimisticTask: Task = {
                Task_ID: 0, // temporary client-side ID
                Backlog_ID: parseInt(localBacklog.Backlog_ID.toString()),
                Team_ID: localBacklog?.project?.team?.Team_ID || 0,
                Task_Title: localNewTask?.Task_Title || "",
                Status_ID: localNewTask?.Status_ID || 0,
                Assigned_User_ID: localNewTask?.Assigned_User_ID,
            };

            // Optimistically update the cache
            queryClient.setQueryData<Task[]>(["tasks", localBacklog.Backlog_ID], old => [
                ...(old || []),
                optimisticTask,
            ]);

            // Return rollback snapshot
            return { previousTasks };
        },
        // If the mutation fails, rollback
        onError: (err, _, context) => {
            if (localBacklog && context?.previousTasks) {
                queryClient.setQueryData(["tasks", localBacklog.Backlog_ID], context.previousTasks);
            }
        },
        // Sync with server after mutation
        onSettled: async () => {
            if (!localBacklog || !localBacklog.Backlog_ID) return;

            await queryClient.invalidateQueries({
                queryKey: ["tasks", localBacklog.Backlog_ID],
            });
        },
        onSuccess: async () => {
            if (localNewTask) {
                setLocalNewTask({
                    ...localNewTask,
                    Task_Title: ""
                })
            }
        }
    });

    const handleCreateTask = () => {
        if (createTaskRef.current) return;
        if (!localBacklog || !localBacklog.Backlog_ID) return;

        createTaskRef.current = true;
        doCreateTask(undefined, {
            onSettled: () => {
                createTaskRef.current = false;
            },
        });
    };

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
    // Set Status ID for new task row, when localBacklog changes
    useEffect(() => {
        if (!localBacklog) return;

        const firstStatus = localBacklog.statuses?.[0];
        handleChangeLocalNewTask(
            "Status_ID",
            (firstStatus?.Status_ID ?? "").toString()
        );
    }, [localBacklog]);

    // Get task IDs from URL
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
        if (!Array.isArray(renderTasks)) return [];

        let arrayToSort: Task[] = renderTasks;

        if (urlTaskBulkFocus && urlTaskIds) {
            const taskIdsBulkFocus: string[] = urlTaskIds.split(",");
            arrayToSort = arrayToSort.filter(task => taskIdsBulkFocus.includes(task.Task_ID!.toString()));
        }

        const sortField = SORT_KEYS[Number(currentSort)] || DEFAULT_SORT_KEY;

        // Separate tasks with Task_ID === 0 from the rest
        const optimisticTasks = arrayToSort.filter(task => task.Task_ID === 0);
        const normalTasks = arrayToSort.filter(task => task.Task_ID !== 0);

        // Sort normal tasks
        const sortedNormalTasks = [...normalTasks].sort((a, b) => {
            const aValue = a[sortField] ?? "";
            const bValue = b[sortField] ?? "";

            if (typeof aValue === "string" && typeof bValue === "string") {
                return currentOrder === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            } else if (typeof aValue === "number" && typeof bValue === "number") {
                return currentOrder === "asc" ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });

        // Place optimistic tasks at the top
        return [...optimisticTasks, ...sortedNormalTasks];
    }, [localBacklog, renderTasks, currentSort, currentOrder, urlTaskBulkFocus, urlTaskIds]);

    // ---- Render ----
    return (
        <LoadingState singular="Backlog" renderItem={localBacklog} permitted={canAccessBacklog}>
            {localBacklog && (
                <Block>
                    <BacklogSiblingsHeader
                        localBacklog={localBacklog}
                        numberOfTasks={sortedTasks.length}
                        convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
                    />

                    <Block className="relative w-full overflow-x-auto">
                        <table className={clsx(
                            styles.taskTable
                        )}>
                            <BacklogSiblingsTaskTableHeader
                                selectAll={selectAll}
                                handleSelectAllChange={handleSelectAllChange}
                                currentSort={currentSort}
                                currentOrder={currentOrder}
                                handleSort={handleSort}
                            />

                            <tbody>
                                <BacklogSiblingsNewTaskRow
                                    localNewTask={localNewTask}
                                    localBacklog={localBacklog}
                                    createTaskPending={createTaskPending}
                                    handleChangeLocalNewTask={handleChangeLocalNewTask}
                                    handleCreateTask={handleCreateTask}
                                    ifEnter={ifEnter}
                                />

                                <BacklogSiblingsTaskTableBody
                                    sortedTasks={sortedTasks}
                                    selectedTaskIds={selectedTaskIds}
                                    handleCheckboxChange={handleCheckboxChange}
                                    setTaskDetail={setTaskDetail}
                                    localBacklog={localBacklog}
                                />
                            </tbody>
                        </table>
                    </Block>
                </Block>
            )}
        </LoadingState>
    );
}
