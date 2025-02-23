"use client"

// External
import React from "react"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsis, faPlus } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/Backlog.module.scss"
import { Block, Text, Field, Heading } from "@/components"
import { TasksProvider, useTasks } from "@/contexts"

const BacklogContainer = () => {
    const { t } = useTranslation(['backlog'])
    const { tasks, newTask, handleChangeNewTask, addTask, removeTask } = useTasks()
    
    return (
        <Block className={styles.container}>
            <Heading variant="h1" className={styles.title}>Project Backlog</Heading>
            <Block className={styles.inputContainer}>
                <Field
                    type="text"
                    lbl={t('backlog:list:New task')}
                    innerLabel={true}
                    value={newTask?.Task_Title ?? ''}
                    onChange={(e: string) => handleChangeNewTask("Task_Title", e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => null}
                    disabled={false}
                />
                <button
                    type="submit"
                    onClick={addTask} 
                    className={styles.addButton}
                >
                    <FontAwesomeIcon icon={faPlus} /> Add
                </button>
            </Block>
            <Block className={styles.taskList}>
                {tasks.map((task, index) => (
                    <Block key={index} className={styles.taskCard}>
                        <Block className="flex items-center flex-grow">
                            <Text className="inline-block">{task.Task_Title}</Text>
                            <Block variant="span" className="mr-3 italic text-sm ml-auto">
                                {task.Task_Status}
                            </Block>
                        </Block>
                        <Block className="w-6 h-4 items-center">
                            <button
                                onClick={() => removeTask(task.Task_ID)} 
                                className={`inline-flex items-center justify-center ${styles.removeButton}`}
                            >
                                <FontAwesomeIcon icon={faEllipsis} />
                            </button>
                        </Block>
                    </Block>
                ))}
            </Block>
        </Block>
    )
}

export const Backlog = () => (
    <TasksProvider>
        <BacklogContainer />
    </TasksProvider>
)