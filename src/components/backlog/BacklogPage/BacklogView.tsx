"use client"

// External
import { useTranslation } from "next-i18next";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

// Internal
import { Backlog, BacklogProps } from '@/components/backlog';
import { useBacklogsContext, useProjectsContext, useTasksContext } from "@/contexts";
import { useURLLink } from "@/hooks";
import useRoleAccess from "@/hooks/useRoleAccess";
import { Status, Task } from "@/types";

export const BacklogView = () => {
    // ---- Hooks ----
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation(['backlog'])
    const {
        projectById: renderProject,
        readProjectById
    } = useProjectsContext()
    const {
        backlogById: renderBacklog,
        readBacklogById
    } = useBacklogsContext()
    const {
        tasksById,
        newTask,
        readTasksByBacklogId,
        setTaskDetail,
        handleChangeNewTask,
        addTask,
        removeTask
    } = useTasksContext()
    const { backlogLink } = useParams<{ backlogLink: string }>(); // Get backlogLink from URL
    const { linkId: backlogId, convertID_NameStringToURLFormat } = useURLLink(backlogLink)
    const { canAccessBacklog, canManageBacklog } = useRoleAccess(
        renderBacklog ? renderBacklog.project?.team?.organisation?.User_ID : undefined,
        "backlog",
        renderBacklog ? renderBacklog.Backlog_ID : 0
    )

    // ---- State and other Variables ----
    const urlTaskIds = searchParams.get("taskIds")
    const urlTaskBulkFocus = searchParams.get("taskBulkFocus")
    const urlStatusIds = searchParams.get("statusIds")
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([])
    const [selectAll, setSelectAll] = useState(false); // To track the "Select All" checkbox
    const [statusUrlEditing, setStatusUrlEditing] = useState<boolean>(false)

    // ---- Effects ----
    useEffect(() => {
        // console.log("tasksByID changed")
        console.log("tasksById changed", tasksById, renderTasks)
        if (tasksById && tasksById.length == 0 && renderTasks) {
            setRenderTasks(undefined)
        }
        if (tasksById && tasksById.length) {
            console.log("renderTasks", renderTasks, "tasksById", tasksById)
            setRenderTasks(tasksById)
        }
    }, [tasksById])
    useEffect(() => {
        console.log("backlogLink changed", backlogLink)
        readTasksByBacklogId(parseInt(backlogId))
        readBacklogById(parseInt(backlogId))
    }, [backlogLink, backlogId])
    useEffect(() => {
        if (backlogLink && renderBacklog) {
            const firstStatus: Status | undefined = renderBacklog.statuses?.
                // Status_Order low to high:
                sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))[0]
            handleChangeNewTask("Status_ID", (firstStatus?.Status_ID ?? "").toString());
            document.title = `Backlog: ${renderBacklog?.Backlog_Name} - GiveOrTake`;

            readProjectById(renderBacklog.Project_ID)
        }
    }, [renderBacklog]);

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

    // ---- Methods ----
    // Handles the 'Enter' key press event to trigger task creation.
    const ifEnter = (e: React.KeyboardEvent) => (e.key === 'Enter') ? handleCreateTask() : null

    // Prepares and creates a new task in the backlog.
    const handleCreateTask = async () => {
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
            if (tasksById && newTaskIds.length > 0 && newTaskIds.length <= tasksById.length) {
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

    const backlogProps: BacklogProps = {
        renderBacklog,
        sortedTasks,
        currentSort,
        currentOrder,
        t,
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
    }

    return <Backlog {...backlogProps} />
}
