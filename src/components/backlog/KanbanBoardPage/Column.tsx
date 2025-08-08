"use client"

// External
import React, { useRef } from "react"
import { useDrop } from "react-dnd"

// Internal
import { Block, Heading } from "@/components"
import { ItemType, TaskCard } from '@/components/backlog'
import styles from "@/core-ui/styles/modules/KanbanBoard.module.scss"
import { Task } from "@/types"
import clsx from "clsx"

export type ColumnProps = {
    status: number
    label: string
    tasks: Task[] | undefined
    canManageBacklog: boolean | undefined
    archiveTask: (task: Task) => Promise<void>
    setTaskDetail: (task: Task) => void
    moveTask: (task: Task, newStatus: number) => Promise<void>
}

export const Column: React.FC<ColumnProps> = ({
    status, label, tasks, canManageBacklog, archiveTask, setTaskDetail, moveTask
}) => {
    const dropRef = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemType.TASK,
        drop: (item: Task) => moveTask(item, status),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    drop(dropRef);

    return (
        <div ref={dropRef} className={clsx(
            styles.column,
            {
                [styles.isOver]: isOver
            }
        )}>
            <Heading variant="h2" className={styles.columnTitle}>{label}</Heading>
            <Block className={styles.taskList}>
                {tasks && tasks.length && tasks.map((task) => (
                    <TaskCard
                        key={task.Task_ID}
                        task={task}
                        canManageBacklog={canManageBacklog}
                        setTaskDetail={setTaskDetail}
                        archiveTask={archiveTask}
                    />
                ))}
            </Block>
        </div>
    );
};
