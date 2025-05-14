"use client"

// External
import React, { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useDrag, useDrop, DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLightbulb, faTrash, faWindowRestore } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/KanbanBoard.module.scss"
import { Block, Text, Heading } from "@/components"
import { useBacklogsContext, useProjectsContext, useTasksContext } from "@/contexts"
import { Backlog, BacklogStates, Project, Task } from "@/types"
import { selectAuthUser, useTypedSelector } from "@/redux"
import Link from "next/link"
import { FlexibleBox } from "@/components/ui/flexible-box"
import clsx from "clsx"
import Image from "next/image"
import { LoadingState } from "@/core-ui/components/LoadingState"

const ItemType = { TASK: "task" }

interface TaskCardProps {
    task: Task
    setTaskDetail: (task: Task) => void
    archiveTask: (task: Task) => Promise<void>
}

const TaskCard: React.FC<TaskCardProps> = ({
    task, setTaskDetail, archiveTask
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
            <button onClick={() => archiveTask(task)} className={styles.removeButton}>
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </div>
    );
}

interface ColumnProps {
    status: "To Do" | "In Progress" | "Waiting for Review" | "Done"
    label: string
    tasks: Task[] | undefined
    archiveTask: (task: Task) => Promise<void>
    setTaskDetail: (task: Task) => void
    moveTask: (task: Task, newStatus: "To Do" | "In Progress" | "Waiting for Review" | "Done") => Promise<void>
}

const Column: React.FC<ColumnProps> = ({
    status, label, tasks, archiveTask, setTaskDetail, moveTask
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
                {tasks && tasks.map((task) => (
                    <TaskCard
                        key={task.Task_ID}
                        task={task}
                        setTaskDetail={setTaskDetail}
                        archiveTask={archiveTask}
                    />
                ))}
            </Block>
        </div>
    );
};

const KanbanBoardContainer = () => {
    const { backlogId } = useParams<{ backlogId: string }>(); // Get backlogId from URL
    const { backlogById, readBacklogById } = useBacklogsContext()
    const { tasksById, readTasksByBacklogId, newTask, setTaskDetail, handleChangeNewTask, addTask, removeTask, saveTaskChanges } = useTasksContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderBacklog, setRenderBacklog] = useState<BacklogStates>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)

    useEffect(() => {
        console.log("tasksByID changed")
        if (tasksById.length == 0 && renderTasks) {
            setRenderTasks(undefined)
        }
        if (tasksById.length) {
            console.log("renderTasks", renderTasks)
            setRenderTasks(tasksById)
        }
    }, [tasksById])
    useEffect(() => {
        readTasksByBacklogId(parseInt(backlogId))
        readBacklogById(parseInt(backlogId))
    }, [backlogId])
    useEffect(() => {
        if (backlogId) {
            setRenderBacklog(backlogById)
            if (backlogById) document.title = `Kanban: ${backlogById?.Backlog_Name} - GiveOrTake`
        }
    }, [backlogById])

    const columns: {
        [key: string]: "To Do" | "In Progress" | "Waiting for Review" | "Done"
    } = {
        todo: "To Do",
        inProgress: "In Progress",
        review: "Waiting for Review",
        done: "Done"
    }

    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return

        await removeTask(task.Task_ID, task.Backlog_ID, undefined)

        await readTasksByBacklogId(parseInt(backlogId), true)
    }

    const moveTask = async (task: Task, newStatus: "To Do" | "In Progress" | "Waiting for Review" | "Done") => {
        await saveTaskChanges(
            { ...task, Task_Status: newStatus },
            task.Backlog_ID
        )

        await readTasksByBacklogId(parseInt(backlogId), true)
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <KanbanBoardView
                renderBacklog={renderBacklog}
                tasks={renderTasks}
                columns={columns}
                archiveTask={archiveTask}
                setTaskDetail={setTaskDetail}
                moveTask={moveTask}
            />
        </DndProvider>
    )
}

export interface KanbanBoardViewProps {
    renderBacklog: BacklogStates
    tasks: Task[] | undefined
    columns: {
        [key: string]: "To Do" | "In Progress" | "Waiting for Review" | "Done"
    }
    archiveTask: (task: Task) => Promise<void>
    setTaskDetail: (task: Task) => void
    moveTask: (task: Task, newStatus: "To Do" | "In Progress" | "Waiting for Review" | "Done") => Promise<void>
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
    renderBacklog,
    tasks,
    columns,
    archiveTask,
    setTaskDetail,
    moveTask
}) => {
    return (
        <Block className="page-content">
            <FlexibleBox
                title={`Kanban Board`}
                subtitle={renderBacklog ? renderBacklog.Backlog_Name : undefined}
                titleAction={
                    renderBacklog && (
                        <Link
                            href={`/project/${renderBacklog?.Project_ID}`}
                            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faLightbulb} />
                            <Text variant="span">Go to Project</Text>
                        </Link>
                    )
                }
                icon={faWindowRestore}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <LoadingState singular="Backlog" renderItem={renderBacklog}>
                    {renderBacklog && (
                        <Block className={styles.board}>
                            {Object.entries(columns).map(([key, label]) => (
                                <Column
                                    key={key}
                                    status={label}
                                    label={label}
                                    tasks={tasks ? tasks.filter(task => task.Task_Status === label) : undefined}
                                    archiveTask={archiveTask}
                                    setTaskDetail={setTaskDetail}
                                    moveTask={moveTask}
                                />
                            ))}
                        </Block>
                    )}
                </LoadingState>
            </FlexibleBox>
        </Block>
    )
}

export const KanbanBoard = () => (
    <KanbanBoardContainer />
)