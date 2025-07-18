"use client"

// External
import React from "react"

// Internal
import { KanbanBoardContent, KanbanBoardWrapper, KanbanColumns } from '@/components/backlog'
import { BacklogStates, Status, Task } from "@/types"

export const ItemType = { TASK: "task" }

export type KanbanBoardProps = {
    renderBacklog: BacklogStates
    renderTasks: Task[] | undefined
    kanbanColumns: Status[] | undefined
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    archiveTask: (task: Task) => Promise<void>
    setTaskDetail: (task: Task) => void
    moveTask: (task: Task, newStatus: number) => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const KanbanBoard: React.FC<KanbanBoardProps> = (props) => props.renderBacklog && (
    <KanbanBoardWrapper>
        <KanbanBoardContent
            renderBacklog={props.renderBacklog}
            canAccessBacklog={props.canAccessBacklog}
        >
            <KanbanColumns {...props} />
        </KanbanBoardContent>
    </KanbanBoardWrapper>
)

