"use client"

// External
import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useRef } from "react"
import { useDrag } from "react-dnd"

// Internal
import { Text } from "@/components"
import { ItemType } from '@/components/backlog'
import styles from "@/core-ui/styles/modules/KanbanBoard.module.scss"
import { Task } from "@/types"

type TaskCardProps = {
    task: Task
    canManageBacklog: boolean | undefined
    setTaskDetail: (task: Task) => void
    archiveTask: (task: Task) => Promise<void>
}

export const TaskCard: React.FC<TaskCardProps> = ({
    task, canManageBacklog, setTaskDetail, archiveTask
}) => {
    const dragRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: ItemType.TASK,
        item: task,
        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        })
    })

    drag(dragRef);

    return (
        <div ref={dragRef} className={styles.taskCard} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <Text onClick={() => setTaskDetail(task)} className={styles.taskTitle}>
                {task.Task_Title}
            </Text>
            {canManageBacklog && (
                <button onClick={() => archiveTask(task)} className={styles.removeButton}>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            )}
        </div>
    );
}
