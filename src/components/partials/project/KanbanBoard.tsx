"use client"

// External
import React, { useEffect } from "react"
import { useParams } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/KanbanBoard.module.scss"
import { Block, Text, Heading } from "@/components"
import { useTasksContext } from "@/contexts"
import { Task } from "@/types"

const KanbanBoardContainer = () => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { tasksById, readTasksByProjectId, setTaskDetail, removeTask } = useTasksContext()
    
    useEffect(() => {
        if (projectId) readTasksByProjectId(parseInt(projectId))
    }, [projectId])

    const columns = {
        todo: "To Do",
        inProgress: "In Progress",
        review: "Waiting for Review",
        done: "Done"
    }

    return (
        <Block className={styles.container}>
            <Heading variant="h1" className={styles.title}>Kanban Board</Heading>
            <Block className={styles.board}>
                {Object.entries(columns).map(([key, label]) => (
                    <Block key={key} className={styles.column}>
                        <Heading variant="h2" className={styles.columnTitle}>{label}</Heading>
                        <Block className={styles.taskList}>
                            {(Array.isArray(tasksById) ? tasksById : [])
                                .filter((task: Task) => task.Task_Status === label)
                                .map((task: Task, index: number) => (
                                    <Block key={index} className={styles.taskCard}>
                                        <Text
                                            onClick={() => setTaskDetail(task)}
                                            className="cursor-pointer hover:underline"
                                        >
                                            {task.Task_Title}
                                        </Text>
                                        <button
                                            onClick={() => removeTask(task.Task_ID, task.Project_ID)}
                                            className={styles.removeButton}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </Block>
                                ))}
                        </Block>
                    </Block>
                ))}
            </Block>
        </Block>
    )
}

export const KanbanBoard = () => (
    <KanbanBoardContainer />
)