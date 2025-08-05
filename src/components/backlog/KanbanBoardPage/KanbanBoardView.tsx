"use client"

// External
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"

// Internal
import { KanbanBoard, KanbanBoardProps } from '@/components/backlog'
import { useBacklogsContext, useTasksContext } from "@/contexts"
import { useURLLink } from "@/hooks"
import useRoleAccess from "@/hooks/useRoleAccess"
import { Status, Task } from "@/types"

void React.createElement

export const KanbanBoardView = () => {
    // ---- Hooks ----
    const { backlogLink } = useParams<{ backlogLink: string }>(); // Get backlogId from URL
    const { backlogById: renderBacklog, readBacklogById } = useBacklogsContext()
    const { tasksById, readTasksByBacklogId, newTask, setTaskDetail, handleChangeNewTask, addTask, removeTask, saveTaskChanges } = useTasksContext()
    const { linkId: backlogId, convertID_NameStringToURLFormat } = useURLLink(backlogLink)
    const { canAccessBacklog, canManageBacklog } = useRoleAccess(
        renderBacklog ? renderBacklog.project?.team?.organisation?.User_ID : undefined,
        "backlog",
        renderBacklog ? renderBacklog.Backlog_ID : 0
    )

    // ---- State and other Variables ----
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)
    const [kanbanColumns, setKanbanColumns] = useState<Status[] | undefined>(undefined)

    // ---- Effects ----
    useEffect(() => {
        console.log("tasksByID changed")
        if (tasksById && tasksById.length == 0 && renderTasks) {
            setRenderTasks(undefined)
        }
        if (tasksById && tasksById.length) {
            console.log("renderTasks", renderTasks)
            setRenderTasks(tasksById)
        }
    }, [tasksById])
    useEffect(() => {
        readTasksByBacklogId(parseInt(backlogId))
        readBacklogById(parseInt(backlogId))
    }, [backlogId])
    useEffect(() => {
        if (backlogId && renderBacklog) {
            setKanbanColumns(renderBacklog.statuses)
            document.title = `Kanban: ${renderBacklog?.Backlog_Name} - GiveOrTake`
        }
    }, [renderBacklog])

    // ---- Methods ----
    // Archives a task and refreshes the task list.
    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return

        await removeTask(task.Task_ID, task.Backlog_ID, undefined)

        await readTasksByBacklogId(parseInt(backlogId), true)
    }

    // Moves a task to a new status and refreshes the task list.
    const moveTask = async (task: Task, newStatus: number) => {
        await saveTaskChanges(
            { ...task, Status_ID: newStatus },
            task.Backlog_ID
        )

        await readTasksByBacklogId(parseInt(backlogId), true)
    };

    // ---- Render ----
    const kanbanBoardProps: KanbanBoardProps = {
        renderBacklog,
        renderTasks,
        kanbanColumns,
        canAccessBacklog,
        canManageBacklog,
        archiveTask,
        setTaskDetail,
        moveTask,
        convertID_NameStringToURLFormat
    }

    return <KanbanBoard {...kanbanBoardProps} />
}
