"use client"

// External
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPaperPlane, faArrowUpRightFromSquare, faTrashCan, faArrowUpFromBracket, faPlay, faStop } from "@fortawesome/free-solid-svg-icons";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal components and hooks
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { useTaskCommentsContext, useTasksContext, useTaskTimeTrackContext } from "@/contexts";
import { Task, TaskComment, TaskTimeTrack, User } from "@/types";
import Link from "next/link";
import { Block, Text } from "@/components/ui/block-text";
import { Heading } from "@/components/ui/heading";
import clsx from "clsx";
import { selectAuthUser, selectAuthUserTaskTimeTrack, setAuthUserTaskTimeTrack, useAppDispatch, useAuthActions, useTypedSelector } from "@/redux";
import { SecondsToTimeDisplay, TimeSpentDisplay } from "./TaskTimeTrackPlayer";

interface TaskDetailProps {
    task?: Task
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
    return <Block className={`bg-white rounded-lg p-4 mb-4 ${className}`}>{children}</Block>;
};

const TitleArea: React.FC<{ task: Task }> = ({ task }) => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { readTasksByProjectId, saveTaskChanges } = useTasksContext();
    const inputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.Task_Title || "");

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleBlur = async () => {
        setIsEditing(false);

        await saveTaskChanges(
            { ...task, Task_Title: title },
            task.Project_ID
        );

        /// Task changed
        if (projectId) {
            readTasksByProjectId(parseInt(projectId), true)
        }
    };

    useEffect(() => {
        setTitle(task.Task_Title)
    }, [task])

    return (
        <TitleAreaView
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            title={title}
            setTitle={setTitle}
            inputRef={inputRef}
            task={task}
            handleBlur={handleBlur}
        />
    );
};

interface TitleAreaViewProps {
    isEditing: boolean
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
    title: string
    setTitle: React.Dispatch<React.SetStateAction<string>>
    inputRef: React.RefObject<HTMLInputElement | null>
    task: Task;
    handleBlur: () => Promise<void>
}

export const TitleAreaView: React.FC<TitleAreaViewProps> = ({
    isEditing, setIsEditing, title, setTitle, inputRef, task, handleBlur
}) => {
    return (
        <Block className={styles.titleArea}>
            {!isEditing ? (
                <Block className={styles.titlePlaceholder} onClick={() => setIsEditing(true)}>
                    {title || "Click to add title..."}
                </Block>
            ) : (
                <input
                    className={styles.titleInput}
                    ref={inputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleBlur}
                />
            )}
        </Block>
    );
};

const DescriptionArea: React.FC<{ task: Task }> = ({ task }) => {
    const { saveTaskChanges } = useTasksContext();
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(task.Task_Description || "");

    const handleSave = () => {
        setIsEditing(false);
        saveTaskChanges(
            { ...task, Task_Description: description },
            task.Project_ID
        )
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <DescriptionAreaView
            task={task}
            saveTaskChanges={saveTaskChanges}
        />
    );
};

interface DescriptionAreaViewProps {
    task: Task;
    saveTaskChanges: (task: Task, projectId: number) => void;
}

export const DescriptionAreaView: React.FC<DescriptionAreaViewProps> = ({ task, saveTaskChanges }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(task.Task_Description || "");

    const handleSave = () => {
        setIsEditing(false);
        saveTaskChanges(
            { ...task, Task_Description: description },
            task.Project_ID
        );
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <Card className={styles.descriptionSection}>
            <h2>Task Description</h2>
            {!isEditing ? (
                <div
                    className={styles.descriptionPlaceholder}
                    onClick={() => setIsEditing(true)}
                    dangerouslySetInnerHTML={{ __html: description || "Click to add description..." }}
                />
            ) : (
                <Block className={styles.descriptionEditor}>
                    <ReactQuill
                        className={styles.descriptionInput}
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        onBlur={handleSave}
                    />
                    <Block className={styles.editDescriptionActions}>
                        <button className={styles.sendButton} onClick={handleSave}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                        <button className={styles.cancelButton} onClick={handleCancel}>
                            Cancel
                        </button>
                    </Block>
                </Block>
            )}
        </Card>
    );
};

const MediaFilesArea: React.FC<{ task: Task }> = ({ task }) => {
    return (
        <MediaFilesAreaView
            task={task}
        />
    );
};

interface MediaFilesAreaViewProps {
    task: Task;
}

export const MediaFilesAreaView: React.FC<MediaFilesAreaViewProps> = ({ task }) => {
    return (
        <Card className={styles.mediaSection}>
            <h2>Media Files</h2>
            <Block className={styles.mediaPlaceholders}>
                {[1, 2, 3].map((index) => (
                    <Block key={index} className={styles.mediaItem}>
                        <Block className={styles.mediaPlaceholder}>Image {index}</Block>
                        <Block className={styles.mediaMeta}>
                            <span>Created: {new Date().toISOString().split('T')[0]}</span>
                            <Block className={styles.mediaActions}>
                                <FontAwesomeIcon icon={faEdit} className={styles.icon} />
                                <FontAwesomeIcon icon={faTrash} className={styles.icon} />
                            </Block>
                        </Block>
                    </Block>
                ))}
            </Block>
        </Card>
    );
};

const CommentsArea: React.FC<{ task: Task }> = ({ task }) => {
    const { addTaskComment, handleChangeNewTaskComment } = useTaskCommentsContext();
    const authUser = useTypedSelector(selectAuthUser)

    const [newComment, setNewComment] = useState("");
    const [isEditorVisible, setIsEditorVisible] = useState(false);

    const handleAddComment = async () => {
        if (!authUser) return

        if (newComment.trim() && authUser.User_ID) {
            const theNewComment: TaskComment = {
                Task_ID: task.Task_ID,
                User_ID: authUser.User_ID,
                Comment_Text: newComment.trim()
            }
            console.log("theNewComment", theNewComment)
            await addTaskComment(theNewComment.Task_ID, theNewComment)

            setNewComment("");
            setIsEditorVisible(false);
        }
    }

    // Handle new comment cancel
    const handleCommentCancel = () => {
        setNewComment("");
        setIsEditorVisible(false); // Hide editor after cancel
    };

    return (
        <CommentsAreaView
            newComment={newComment}
            setNewComment={setNewComment}
            isEditorVisible={isEditorVisible}
            setIsEditorVisible={setIsEditorVisible}
            task={task}
            authUser={authUser}
            addTaskComment={addTaskComment}
            handleCommentCancel={handleCommentCancel}
            handleAddComment={handleAddComment}
        />
    );
};

interface CommentsAreaViewProps {
    newComment: string
    setNewComment: React.Dispatch<React.SetStateAction<string>>
    isEditorVisible: boolean
    setIsEditorVisible: React.Dispatch<React.SetStateAction<boolean>>
    task: Task;
    authUser: User | undefined
    addTaskComment: (taskId: number, comment: TaskComment) => Promise<void>
    handleCommentCancel: () => void
    handleAddComment: () => Promise<void>
}

export const CommentsAreaView: React.FC<CommentsAreaViewProps> = ({
    newComment, setNewComment, isEditorVisible, setIsEditorVisible, task, authUser, addTaskComment, handleCommentCancel, handleAddComment
}) => {
    return (
        <Card className={styles.commentsSection}>
            <h2>Comments</h2>
            {!isEditorVisible ? (
                <Block className={styles.commentPlaceholder} onClick={() => setIsEditorVisible(true)}>
                    Add a new comment...
                </Block>
            ) : (
                <Block className={styles.commentEditor}>
                    <ReactQuill
                        value={newComment}
                        onChange={setNewComment}
                        placeholder="Write a comment..."
                        className={styles.commentInput}
                        theme="snow"
                    />
                    <Block className={styles.newCommentActions}>
                        <button className={styles.sendButton} onClick={handleAddComment}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                        <button className={styles.cancelButton} onClick={handleCommentCancel}>
                            Cancel
                        </button>
                    </Block>
                </Block>
            )}
            {task.comments?.map((comment, index) => (
                <Block key={index} className={styles.commentItem}>
                    <div
                        className={styles.comment}
                        dangerouslySetInnerHTML={{ __html: comment.Comment_Text }}
                    />
                    <Block className={styles.commentMeta}>
                        <span>Created: {comment.Comment_CreatedAt}</span>
                        <Block className={styles.commentActions}>
                            <FontAwesomeIcon icon={faEdit} className={styles.icon} />
                            <FontAwesomeIcon icon={faTrash} className={styles.icon} />
                        </Block>
                    </Block>
                </Block>
            ))}
        </Card>
    );
};

const CtaButtons = ({
    theTask, task
}: {
    theTask: Task,
    task: Task | undefined
}) => {
    return (
        <CtaButtonsView
            theTask={theTask}
            task={task}
        />
    );
};

interface CtaButtonsViewProps {
    theTask: Task,
    task: Task | undefined
}

export const CtaButtonsView: React.FC<CtaButtonsViewProps> = ({
    theTask, task
}) => {
    return (
        <Block className={styles.ctaButtons}>
            <button className={clsx(
                "blue-link",
                styles.ctaButton
            )}>
                <FontAwesomeIcon icon={faTrashCan} />
                <Text variant="span">Archive</Text>
            </button>
            <button className={clsx(
                "blue-link",
                styles.ctaButton
            )}>
                <FontAwesomeIcon icon={faArrowUpFromBracket} />
                <Text variant="span">Share</Text>
            </button>
            {task === undefined && (
                <Link href={`/task/${theTask.Task_ID}`} className={clsx(
                    "blue-link",
                    styles.ctaButton
                )}>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    <Text variant="span">Open in URL</Text>
                </Link>
            )}
        </Block>
    )
}

interface TaskDetailsAreaProps {
    task: Task,
    setTheTask: React.Dispatch<React.SetStateAction<Task | undefined>>
}

const TaskDetailsArea: React.FC<TaskDetailsAreaProps> = ({ task, setTheTask }) => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { readTasksByProjectId, taskDetail, setTaskDetail, saveTaskChanges } = useTasksContext()
    const { taskTimeTracksById, readTaskTimeTracksByTaskId, addTaskTimeTrack, saveTaskTimeTrackChanges, handleTaskTimeTrack } = useTaskTimeTrackContext()
    
    const [taskTimeSpent, setTaskTimeSpent] = useState<number>(0) // Total amount of seconds spend

    useEffect(() => {
        if (task.Task_ID) {
            readTaskTimeTracksByTaskId(task.Task_ID)
        }
    }, [task])

    useEffect(() => {
        if (Array.isArray(taskTimeTracksById)) {
            const totalTimeInSeconds = taskTimeTracksById.reduce((total, timeTrack) => {
                // If 'Time_Tracking_Duration' exists, add it to the total time in seconds
                if (timeTrack.Time_Tracking_Duration) {
                    return total + timeTrack.Time_Tracking_Duration;
                }
                return total;
            }, 0);
    
            // Update the taskTimeSpent state with the calculated total time in seconds
            setTaskTimeSpent(totalTimeInSeconds);
        }
    }, [taskTimeTracksById])

    // Handle status change
    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = event.target.value as Task["Task_Status"]
        handleTaskChanges("Task_Status", newStatus)
    };

    const handleTaskChanges = async (field: keyof Task, value: string) => {
        // Update the task change (this will update it in the database)
        await saveTaskChanges(
            { ...task, [field]: value },
            task.Project_ID
        )

        /// Task changed
        if (projectId) {
            readTasksByProjectId(parseInt(projectId), true)
        }

        if (taskDetail) {
            setTaskDetail({
                ...taskDetail,
                [field]: value
            })
        }
    }

    return (
        <TaskDetailsView
            task={task}
            taskDetail={taskDetail}
            taskTimeSpent={taskTimeSpent}
            taskTimeTracksById={taskTimeTracksById}
            setTaskDetail={setTaskDetail}
            saveTaskChanges={saveTaskChanges}
            handleStatusChange={handleStatusChange}
            handleTaskChanges={handleTaskChanges}
            handleTaskTimeTrack={handleTaskTimeTrack}
        />
    );
};

interface TaskDetailsViewProps {
    task: Task
    taskDetail: Task | undefined
    taskTimeSpent: number
    taskTimeTracksById: TaskTimeTrack[]
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    saveTaskChanges: (taskChanges: Task, parentId: number) => void
    handleStatusChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    handleTaskChanges: (field: keyof Task, value: string) => void
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
}

interface TimeSpentDisplayViewProps {
    task: Task
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
}

const TimeSpentDisplayView: React.FC<TimeSpentDisplayViewProps> = ({
    task,
    handleTaskTimeTrack
}) => {
    const authUser = useTypedSelector(selectAuthUser)
    const taskTimeTrack = useTypedSelector(selectAuthUserTaskTimeTrack)

    return (
        <>
            {(taskTimeTrack && taskTimeTrack.Task_ID === task.Task_ID) ? (
                <Block variant="span" className="flex gap-2 items-center">
                    <button className={clsx("timetrack-button", "timetrack-stopbutton")} onClick={() => handleTaskTimeTrack("Stop", task)}>
                        <FontAwesomeIcon icon={faStop} />
                    </button>
                    <Block variant="span">
                        {/* Calculate and display time spent since start */}
                        {taskTimeTrack.Time_Tracking_Start_Time ? (
                            <TimeSpentDisplay startTime={taskTimeTrack.Time_Tracking_Start_Time} />
                        ) : null}
                    </Block>
                </Block>
            ) : (
                <button className={clsx("timetrack-button", "timetrack-playbutton")} onClick={() => handleTaskTimeTrack("Play", task)}>
                    <FontAwesomeIcon icon={faPlay} />
                </button>
            )}
        </>
    )
}

export const TaskDetailsView: React.FC<TaskDetailsViewProps> = ({
    task,
    taskDetail,
    taskTimeSpent,
    taskTimeTracksById,
    setTaskDetail,
    saveTaskChanges,
    handleStatusChange,
    handleTaskChanges,
    handleTaskTimeTrack,
}) => {
    return (
        <Card className={styles.detailsSection}>
            <Heading variant="h2" className="font-bold">Task Details</Heading>
            {/* Task Status */}
            <p>
                <strong>Status:</strong>
                {/* Dropdown to change the status */}
                <select value={task.Task_Status} onChange={handleStatusChange} className="p-2 border rounded">
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Review">Waiting for Review</option>
                    <option value="Done">Done</option>
                </select>
            </p>
            {/* Task Assignee */}
            <p><strong>Assigned To:</strong> {task.Assigned_User_ID || "Unassigned"}</p>
            <p><strong>Team:</strong> {task.project?.team?.Team_Name}</p>
            <p><strong>Created At:</strong> {task.Task_CreatedAt}</p>
            <p><strong>Due Date:</strong> {task.Task_Due_Date || "N/A"}</p>
            <p className="timetrack-metric">
                <strong>Time Tracking:</strong>
                <TimeSpentDisplayView task={task} handleTaskTimeTrack={handleTaskTimeTrack} />
            </p>
            <p className="timespent-metric mt-2">
                <strong>Time Spent:</strong>
                <Block variant="span">
                    <SecondsToTimeDisplay totalSeconds={taskTimeSpent} />{" "}
                    <Block variant="small">({taskTimeTracksById.length} entries)</Block>
                </Block>
            </p>
        </Card>
    )
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task }) => {
    const { taskDetail, setTaskDetail, saveTaskChanges } = useTasksContext();

    const [theTask, setTheTask] = useState<Task | undefined>(task || taskDetail)

    // Disable body scrolling when TaskDetailContainer is mounted
    useEffect(() => {
        if (taskDetail) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.body.style.overflow = ''; // Restore scrolling on unmount
        };
    }, [taskDetail]);

    // Effect to listen for the ESC key
    useEffect(() => {
        const handleEscPress = (event: KeyboardEvent) => {
            if (event.key === "Escape" && taskDetail) setTaskDetail(undefined)
        };

        // Attach event listener when component is visible
        window.addEventListener("keydown", handleEscPress)
    }, [taskDetail]); // This ensures it runs whenever taskDetail is set

    useEffect(() => {
        if (task) {
            setTheTask(task)
        }
    }, [task])

    if (!theTask) return null;

    return (
        <>
            <Block>
                <Link
                    href={`/project/${theTask.project?.Project_ID}`}
                    className="page-back-navigation"
                >
                    &laquo; Go to Project
                </Link>
            </Block>
            <Block className={styles.content}>
                <Block className={styles.leftPanel}>
                    <TitleArea task={theTask} />
                    <DescriptionArea task={theTask} />
                    <MediaFilesArea task={theTask} />
                    <CommentsArea task={theTask} />
                </Block>
                <Block className={styles.rightPanel}>
                    <CtaButtons theTask={theTask} task={task} />
                    <TaskDetailsArea task={theTask} setTheTask={setTheTask} />
                </Block>
            </Block>
        </>
    );
};

export const TaskDetailWithModal = () => {
    const taskDetailRef = useRef<HTMLDivElement>(null);
    const { taskDetail, setTaskDetail } = useTasksContext()

    // Handle clicks outside taskDetailContainer but inside taskDetailModalBackground
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (taskDetail && taskDetailRef.current && !taskDetailRef.current.contains(event.target as Node)) {
            setTaskDetail(undefined)
        }
    };

    if (!taskDetail) return null

    return (
        <Block className={styles.taskDetailModalBackground} onClick={handleBackgroundClick}>
            <Block className={clsx(styles.taskDetailContainer, styles.withModal)} ref={taskDetailRef}>
                <TaskDetail />
            </Block>
        </Block>
    )
}

export const TaskDetailWithoutModal = () => {
    const { taskId } = useParams<{ taskId: string }>(); // Get taskId from URL
    const { taskById, readTaskById, setTaskDetail } = useTasksContext()
    const taskDetailRef = useRef<HTMLDivElement>(null);

    const [renderTask, setRenderTask] = useState<Task | undefined>(undefined)

    useEffect(() => {
        setRenderTask(undefined)
        readTaskById(parseInt(taskId))
        setTaskDetail(undefined)
    }, [taskId])

    useEffect(() => {
        if (taskId) {
            setRenderTask(taskById)
            console.log("tasktask", taskId, taskById)
            document.title = `Task: ${taskById?.Task_Title} - GiveOrTake`
        }
    }, [taskById])

    if (!renderTask) return <Block>Task not found</Block>

    return (
        <Block className="page-content">
            {/* <Link
                href={`/project/${renderTask.project?.Project_ID}`}
                className="page-back-navigation"
            >
                &laquo; Go to Project
            </Link> */}
            <Block className={styles.taskDetailContainer} ref={taskDetailRef}>
                <TaskDetail task={renderTask} />
            </Block>
        </Block>
    )
}
