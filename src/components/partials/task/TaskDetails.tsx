"use client"

// External
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPaperPlane, faArrowUpRightFromSquare, faTrashCan, faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal components and hooks
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { useTaskCommentsContext, useTasksContext } from "@/contexts";
import { Task, TaskComment } from "@/types";
import Link from "next/link";
import { Text } from "@/components/ui/block-text";
import { Heading } from "@/components/ui/heading";
import clsx from "clsx";
import { selectAuthUser, useTypedSelector } from "@/redux";

interface TaskDetailProps {
    task?: Task
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
    return <div className={`bg-white rounded-lg p-4 mb-4 ${className}`}>{children}</div>;
};

const TitleArea: React.FC<{ task: Task }> = ({ task }) => {
    const { saveTaskChanges } = useTasksContext();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.Task_Title || "");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        saveTaskChanges({ ...task, Task_Title: title });
    };

    return (
        <div className={styles.titleArea}>
            {!isEditing ? (
                <div className={styles.titlePlaceholder} onClick={() => setIsEditing(true)}>
                    {title || "Click to add title..."}
                </div>
            ) : (
                <input
                    className={styles.titleInput}
                    ref={inputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleBlur}
                />
            )}
        </div>
    );
};

const DescriptionArea: React.FC<{ task: Task }> = ({ task }) => {
    const { saveTaskChanges } = useTasksContext();
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(task.Task_Description || "");

    const handleSave = () => {
        setIsEditing(false);
        saveTaskChanges({ ...task, Task_Description: description });
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
                <div className={styles.descriptionEditor}>
                    <ReactQuill
                        className={styles.descriptionInput}
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        onBlur={handleSave}
                        modules={{
                            toolbar: [
                                [{ header: "1" }, { header: "2" }, { font: [] }],
                                [{ list: "ordered" }, { list: "bullet" }],
                                ["bold", "italic", "underline", "strike"],
                                [{ align: [] }],
                                ["link"],
                                ["blockquote"],
                            ],
                        }}
                    />
                    <div className={styles.editDescriptionActions}>
                        <button className={styles.sendButton} onClick={handleSave}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                        <button className={styles.cancelButton} onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
};

const MediaFilesArea: React.FC<{ task: Task }> = () => {
    return (
        <Card className={styles.mediaSection}>
            <h2>Media Files</h2>
            <div className={styles.mediaPlaceholders}>
                {/* Dummy media items (replace with actual media files if available) */}
                {[1, 2, 3].map((index) => (
                    <div key={index} className={styles.mediaItem}>
                        <div className={styles.mediaPlaceholder}>Image {index}</div>
                        <div className={styles.mediaMeta}>
                            <span>Created: {new Date().toISOString().split('T')[0]}</span> {/* Replace with actual creation date if available */}
                            <div className={styles.mediaActions}>
                                <FontAwesomeIcon icon={faEdit} className={styles.icon} />
                                <FontAwesomeIcon icon={faTrash} className={styles.icon} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
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
        
        if (newComment.trim()) {
            const theNewComment: TaskComment = {
                Task_ID: task.Task_ID,
                User_ID: authUser.User_ID,
                Comment_Text: newComment.trim()
            }
            console.log("theNewComment", theNewComment)
            await addTaskComment(theNewComment)
            
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
        <Card className={styles.commentsSection}>
            <h2>Comments</h2>
            {!isEditorVisible ? (
                <div className={styles.commentPlaceholder} onClick={() => setIsEditorVisible(true)}>
                    Add a new comment...
                </div>
            ) : (
                <div className={styles.commentEditor}>
                    <ReactQuill
                        value={newComment}
                        onChange={setNewComment}
                        placeholder="Write a comment..."
                        className={styles.commentInput}
                        theme="snow"
                        modules={{
                            toolbar: [
                                [{ list: "ordered" }, { list: "bullet" }],
                                ["bold", "italic", "underline", "strike"],
                                ["link"]
                            ],
                        }}
                    />
                    <div className={styles.newCommentActions}>
                        <button className={styles.sendButton} onClick={handleAddComment}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                        <button className={styles.cancelButton} onClick={handleCommentCancel}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {/* Comments List */}
            {task.comments?.map((comment, index) => (
                <div key={index} className={styles.commentItem}>
                    <div
                        className={styles.comment}
                        dangerouslySetInnerHTML={{ __html: comment.Comment_Text }}
                    />
                    <div className={styles.commentMeta}>
                        <span>Created: {comment.Comment_CreatedAt}</span>
                        <div className={styles.commentActions}>
                            <FontAwesomeIcon icon={faEdit} className={styles.icon} />
                            <FontAwesomeIcon icon={faTrash} className={styles.icon} />
                        </div>
                    </div>
                </div>
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
        <div className={styles.ctaButtons}>
            <button className={styles.ctaButton}>
                <FontAwesomeIcon icon={faTrashCan} />
                <Text variant="span">Archive</Text>
            </button>
            <button className={styles.ctaButton}>
                <FontAwesomeIcon icon={faArrowUpFromBracket} />
                <Text variant="span">Share</Text>
            </button>
            {task === undefined && (
                <Link href={`/task/${theTask.Task_ID}`} className={styles.ctaButton}>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    <Text variant="span">Open in URL</Text>
                </Link>
            )}
        </div>
    );
};

const TaskDetailsArea: React.FC<{ task: Task }> = ({ task }) => {
    const { taskDetail, setTaskDetail, saveTaskChanges } = useTasksContext();

    // Handle status change
    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = event.target.value as Task["Task_Status"]
        handleTaskChanges("Task_Status", newStatus)
    };

    const handleTaskChanges = (field: keyof Task, value: string) => {
        saveTaskChanges({
            ...task,
            [field]: value
        })

        if (taskDetail) {
            setTaskDetail({
                ...taskDetail,
                [field]: value
            })
        }
    }

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
        </Card>
    );
};

export const TaskDetail: React.FC<TaskDetailProps> = ({ task }) => {
    const { taskDetail, setTaskDetail, saveTaskChanges } = useTasksContext();
    const theTask: Task | undefined = task || taskDetail;

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

    if (!theTask) return null;

    return (
        <>
            <Link
                href={`/project/${theTask.project?.Project_ID}`}
                className="text-xs"
            >
                &laquo; Go to Project Settings
            </Link>
            <div className={styles.content}>
                <div className={styles.leftPanel}>
                    <TitleArea task={theTask} />
                    <DescriptionArea task={theTask} />
                    <MediaFilesArea task={theTask} />
                    <CommentsArea task={theTask} />
                </div>
                <div className={styles.rightPanel}>
                    <CtaButtons theTask={theTask} task={task} />
                    <TaskDetailsArea task={theTask} />
                </div>
            </div>
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
        <div className={styles.taskDetailModalBackground} onClick={handleBackgroundClick}>
            <div className={clsx(styles.taskDetailContainer, styles.withModal)} ref={taskDetailRef}>
                <TaskDetail />
            </div>
        </div>
    )
}

export const TaskDetailWithoutModal = () => {
    const taskDetailRef = useRef<HTMLDivElement>(null);
    const { taskId } = useParams()

    // Fetch tasks using the custom hook
    const { tasks, setTaskDetail } = useTasksContext()

    const [theTask, setTheTask] = useState<Task | undefined>(undefined)


    useEffect(() => {
        setTaskDetail(undefined)

        // Ensure taskId is a string and not an array or undefined
        // Handle case when taskId is not valid
        if (typeof taskId == 'string') {
            if (tasks) {
                // Filter the tasks to find the task with the matching taskId
                const findTask = tasks.find((t) => t.Task_ID === parseInt(taskId))
                setTheTask(findTask)
            }
        }
    }, [tasks, taskId])

    if (!theTask) return <div>Task not found</div>

    return (
        <div className={styles.taskDetailContainer} ref={taskDetailRef}>
            <TaskDetail task={theTask} />
        </div>
    )
}
