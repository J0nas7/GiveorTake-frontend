"use client"

// External
import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/KanbanBoard.module.scss"
import { Block, Text, Heading } from "@/components"
import { useProjectsContext, useTasksContext } from "@/contexts"
import { Project, Task } from "@/types"
import { selectAuthUser, useTypedSelector } from "@/redux"

const KanbanBoardContainer = () => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { projectById, readProjectById } = useProjectsContext()
    const { tasksById, readTasksByProjectId, newTask, setTaskDetail, handleChangeNewTask, addTask, removeTask } = useTasksContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderProject, setRenderProject] = useState<Project | undefined>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)

    useEffect(() => {
        readTasksByProjectId(parseInt(projectId))
        readProjectById(parseInt(projectId))
    }, [projectId])
    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById)
            setRenderTasks(tasksById)
            document.title = `Kanban: ${projectById?.Project_Name} - GiveOrTake`
        }
    }, [projectById])

    const columns = {
        todo: "To Do",
        inProgress: "In Progress",
        review: "Waiting for Review",
        done: "Done"
    }

    return (
        <KanbanBoardView
            project={renderProject}
            tasks={renderTasks}
            columns={columns}
            removeTask={removeTask}
            setTaskDetail={setTaskDetail}
        />
    )
}

export interface KanbanBoardViewProps {
    project: Project | undefined
    tasks: Task[] | undefined
    columns: { [key: string]: string }
    removeTask: (taskId: number, projectId: number) => void
    setTaskDetail: (task: Task) => void
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
    project,
    tasks,
    columns,
    removeTask,
    setTaskDetail
}) => {
    return (
        <Block className={styles.container}>
            <Heading variant="h1" className={styles.title}>{`Kanban: ${project?.Project_Name}`}</Heading>
            <Block className={styles.board}>
                {Object.entries(columns).map(([key, label]) => (
                    <Block key={key} className={styles.column}>
                        <Heading variant="h2" className={styles.columnTitle}>{label}</Heading>
                        <Block className={styles.taskList}>
                            {(Array.isArray(tasks) ? tasks : [])
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