"use client"

// External
import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faWindowRestore } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/KanbanBoard.module.scss"
import { Block, Text, Heading } from "@/components"
import { useProjectsContext, useTasksContext } from "@/contexts"
import { Project, Task } from "@/types"
import { selectAuthUser, useTypedSelector } from "@/redux"
import Link from "next/link"
import { FlexibleBox } from "@/components/ui/flexible-box"

const KanbanBoardContainer = () => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { projectById, readProjectById } = useProjectsContext()
    const { tasksById, readTasksByProjectId, newTask, setTaskDetail, handleChangeNewTask, addTask, removeTask } = useTasksContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderProject, setRenderProject] = useState<Project | undefined>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)

    useEffect(() => {
        console.log("tasksByID changed")
        if (tasksById.length == 0 && renderTasks) {
            setRenderTasks(undefined)
        }
        if (tasksById.length && !renderTasks) {
            console.log("renderTasks", renderTasks)
            setRenderTasks(tasksById)
        }
    }, [tasksById])
    useEffect(() => {
        readTasksByProjectId(parseInt(projectId))
        readProjectById(parseInt(projectId))
    }, [projectId])
    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById)
            document.title = `Kanban: ${projectById?.Project_Name} - GiveOrTake`
        }
    }, [projectById])

    const columns = {
        todo: "To Do",
        inProgress: "In Progress",
        review: "Waiting for Review",
        done: "Done"
    }

    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return
        
        await removeTask(task.Task_ID, task.Project_ID)

        await readTasksByProjectId(parseInt(projectId), true)
    }

    return (
        <KanbanBoardView
            project={renderProject}
            tasks={renderTasks}
            columns={columns}
            archiveTask={archiveTask}
            setTaskDetail={setTaskDetail}
        />
    )
}

export interface KanbanBoardViewProps {
    project: Project | undefined
    tasks: Task[] | undefined
    columns: { [key: string]: string }
    archiveTask: (task: Task) => Promise<void>
    setTaskDetail: (task: Task) => void
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
    project,
    tasks,
    columns,
    archiveTask,
    setTaskDetail
}) => {
    return (
        <Block className="page-content">
            <Link
                href={`/project/${project?.Project_ID}`}
                className="blue-link"
            >
                &laquo; Go to Project
            </Link>
            <FlexibleBox
                title={`Kanban: ${project?.Project_Name}`}
                icon={faWindowRestore}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
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
                                                className={styles.taskTitle}
                                            >
                                                {task.Task_Title}
                                            </Text>
                                            <button
                                                onClick={() => archiveTask(task)}
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
            </FlexibleBox>
        </Block>
    )
}

export const KanbanBoard = () => (
    <KanbanBoardContainer />
)