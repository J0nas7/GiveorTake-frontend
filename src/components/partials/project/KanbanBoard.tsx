"use client"

// External
import React, { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useDrag, useDrop, DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLightbulb, faPencil, faTrash, faWindowRestore } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/KanbanBoard.module.scss"
import { Block, Text, Heading } from "@/components"
import { useBacklogsContext, useProjectsContext, useTasksContext } from "@/contexts"
import { Backlog, BacklogStates, Project, Status, Task } from "@/types"
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from "@/redux"
import Link from "next/link"
import { FlexibleBox } from "@/components/ui/flexible-box"
import clsx from "clsx"
import Image from "next/image"
import { LoadingState } from "@/core-ui/components/LoadingState"
import { useURLLink } from "@/hooks"

const ItemType = { TASK: "task" }

interface TaskCardProps {
    task: Task
    canManageBacklog: boolean | undefined
    setTaskDetail: (task: Task) => void
    archiveTask: (task: Task) => Promise<void>
}

const TaskCard: React.FC<TaskCardProps> = ({
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

interface ColumnProps {
    status: number
    label: string
    tasks: Task[] | undefined
    canManageBacklog: boolean | undefined
    archiveTask: (task: Task) => Promise<void>
    setTaskDetail: (task: Task) => void
    moveTask: (task: Task, newStatus: number) => Promise<void>
}

const Column: React.FC<ColumnProps> = ({
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
                {tasks && tasks.map((task) => (
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

export const KanbanBoardContainer = () => {
    // ---- Hooks ----
    const { backlogLink } = useParams<{ backlogLink: string }>(); // Get backlogId from URL
    const { backlogById, readBacklogById } = useBacklogsContext()
    const { tasksById, readTasksByBacklogId, newTask, setTaskDetail, handleChangeNewTask, addTask, removeTask, saveTaskChanges } = useTasksContext()
    const { linkId: backlogId, convertID_NameStringToURLFormat } = useURLLink(backlogLink)

    // ---- State and other Variables ----
    const [renderBacklog, setRenderBacklog] = useState<BacklogStates>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)
    const [kanbanColumns, setKanbanColumns] = useState<Status[] | undefined>(undefined)

    const authUser = useTypedSelector(selectAuthUser)
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions)
    // Determine if the authenticated user can access the backlog:
    const canAccessBacklog = (authUser && renderBacklog && (
        renderBacklog.project?.team?.organisation?.User_ID === authUser.User_ID ||
        parsedPermissions?.includes(`accessBacklog.${renderBacklog.Backlog_ID}`)
    ))
    // Determine if the authenticated user can manage the backlog:
    const canManageBacklog = (authUser && renderBacklog && (
        renderBacklog.project?.team?.organisation?.User_ID === authUser.User_ID ||
        parsedPermissions?.includes(`manageBacklog.${renderBacklog.Backlog_ID}`)
    ))

    // ---- Effects ----
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
            if (backlogById) {
                setKanbanColumns(backlogById.statuses)
                document.title = `Kanban: ${backlogById?.Backlog_Name} - GiveOrTake`
            }
        }
    }, [backlogById])

    // ---- Methods ----
    // Archives a task and refreshes the task list.
    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return

        await removeTask(task.Task_ID, task.Backlog_ID, undefined)

        await readTasksByBacklogId(parseInt(backlogId), true)
    }

    // Moves a task to a new status and refreshes the task list.
    const moveTask = async (task: Task, newStatus: number) => {
        await saveTaskChanges(
            { ...task, Status_ID: newStatus },
            task.Backlog_ID
        )

        await readTasksByBacklogId(parseInt(backlogId), true)
    };

    // ---- Render ----
    return (
        <DndProvider backend={HTML5Backend}>
            <KanbanBoardView
                renderBacklog={renderBacklog}
                tasks={renderTasks}
                kanbanColumns={kanbanColumns}
                canAccessBacklog={canAccessBacklog}
                canManageBacklog={canManageBacklog}
                archiveTask={archiveTask}
                setTaskDetail={setTaskDetail}
                moveTask={moveTask}
                convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
            />
        </DndProvider>
    )
}

export interface KanbanBoardViewProps {
    renderBacklog: BacklogStates
    tasks: Task[] | undefined
    kanbanColumns: Status[] | undefined
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    archiveTask: (task: Task) => Promise<void>
    setTaskDetail: (task: Task) => void
    moveTask: (task: Task, newStatus: number) => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
    renderBacklog,
    tasks,
    kanbanColumns,
    canAccessBacklog,
    canManageBacklog,
    archiveTask,
    setTaskDetail,
    moveTask,
    convertID_NameStringToURLFormat
}) => (
    <Block className="page-content">
        <FlexibleBox
            title={`Kanban Board`}
            subtitle={renderBacklog ? renderBacklog.Backlog_Name : undefined}
            titleAction={
                renderBacklog && (
                    <Block className="flex gap-2 items-center w-full">
                        <Link
                            href={`/project/${convertID_NameStringToURLFormat(renderBacklog?.Project_ID, renderBacklog.project?.Project_Name ?? "")}`}
                            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faLightbulb} />
                            <Text variant="span">Go to Project</Text>
                        </Link>
                    </Block>
                )
            }
            icon={faWindowRestore}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <LoadingState singular="Backlog" renderItem={renderBacklog} permitted={canAccessBacklog}>
                {renderBacklog && (
                    <Block className={styles.board}>
                        {kanbanColumns?.
                            // Status_Order low to high:
                            sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))
                            .map(status => (
                                <Column
                                    key={status.Status_ID}
                                    status={status.Status_ID ?? 0}
                                    label={status.Status_Name}
                                    tasks={tasks ? tasks.filter(task => task.Status_ID === status.Status_ID) : undefined}
                                    canManageBacklog={canManageBacklog}
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