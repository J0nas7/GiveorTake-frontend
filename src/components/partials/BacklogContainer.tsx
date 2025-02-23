// External
import React from "react"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/Backlog.module.scss"
import { Block, Text, Field, Heading } from "@/components"
import { TasksProvider, useTasks } from "@/contexts"

const BacklogContainer = () => {
    const { t } = useTranslation(['backlog'])
    const { tasks, newTask, setNewTask, addTask, removeTask } = useTasks()
    
    return (
        <Block className={styles.container}>
            <Heading variant="h1" className={styles.title}>Project Backlog</Heading>
            <Block className={styles.inputContainer}>
                <Field
                    type="text"
                    lbl={t('backlog:list:New task')}
                    innerLabel={true}
                    value={newTask}
                    onChange={(e: string) => setNewTask(e)}
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
                        <Text>{task}</Text>
                        <button
                            onClick={() => removeTask(index)} 
                            className={styles.removeButton}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </Block>
                ))}
            </Block>
        </Block>
    )
}

const Backlog = () => (
    <TasksProvider>
        <BacklogContainer />
    </TasksProvider>
)

export default Backlog