"use client"

// External
import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/KanbanBoard.module.scss"
import { Block, Text, Heading } from "@/components"
import { TasksProvider, useTasks } from "@/contexts"
import { Task } from "@/types"

const KanbanBoardContainer = () => {
    const { tasks, removeTask } = useTasks()
    const columns = {
        todo: "To Do",
        inProgress: "In Progress",
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
                            {tasks
                                .filter((task: Task) => task.column === key)
                                .map((task: Task, index: number) => (
                                    <Block key={index} className={styles.taskCard}>
                                        <Text>{task.text}</Text>
                                        <button
                                            onClick={() => removeTask(task.id)}
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
    <TasksProvider>
        <KanbanBoardContainer />
    </TasksProvider>
)