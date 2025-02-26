"use client"

// External
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPaperPlane, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal components and hooks
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { useTasksContext } from "@/contexts";
import { Task } from "@/types";
import Link from "next/link";

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

const CommentsArea: React.FC<{ task: Task }> = () => {
    const [comments, setComments] = useState([
        { text: "User1: Great work!", createdAt: "2025-02-26" },
        { text: "User2: Needs changes.", createdAt: "2025-02-25" }
    ]);
    const [newComment, setNewComment] = useState("");
    const [isEditorVisible, setIsEditorVisible] = useState(false);

    const handleAddComment = () => {
        if (newComment.trim()) {
            setComments([...comments, { text: `You: ${newComment.trim()}`, createdAt: new Date().toISOString().split("T")[0] }]);
            setNewComment("");
            setIsEditorVisible(false);
        }
    };

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
            {comments.map((comment, index) => (
                <div key={index} className={styles.commentItem}>
                    <div
                        className={styles.comment}
                        dangerouslySetInnerHTML={{ __html: comment.text }}
                    />
                    <div className={styles.commentMeta}>
                        <span>Created: {new Date().toISOString().split("T")[0]}</span>
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
            <button className={styles.editButton}>Edit</button>
            <button className={styles.deleteButton}>Delete</button>
            <button className={styles.shareButton}>Share</button>
            {task === undefined && (
                <Link href={`/task-detail/${theTask.Task_ID}`}>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </Link>
            )}
        </div>
    );
};

const TaskDetailsArea: React.FC<{ task: Task }> = ({ task }) => {
    return (
        <Card className={styles.detailsSection}>
            <h2>Task Details</h2>
            <p><strong>Status:</strong> {task.Task_Status}</p>
            <p><strong>Assigned To:</strong> {task.Assigned_User_ID || "Unassigned"}</p>
            <p><strong>Created At:</strong> {task.Task_CreatedAt}</p>
            <p><strong>Due Date:</strong> {task.Task_Due_Date || "N/A"}</p>
        </Card>
    );
};

export const TaskDetail: React.FC<TaskDetailProps> = ({ task }) => {
    const { taskDetail, setTaskDetail, saveTaskChanges } = useTasksContext();
    const theTask = task || taskDetail;
    const [title, setTitle] = useState(theTask?.Task_Title || "");
    const [description, setDescription] = useState(theTask?.Task_Description || "");

    useEffect(() => {
        if (theTask) {
            setTitle(theTask.Task_Title || "");
            setDescription(theTask.Task_Description || "");
        }
    }, [theTask]);

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
            <div className={styles.taskDetailContainer} ref={taskDetailRef}>
                <TaskDetail />
            </div>
        </div>
    )
}

export const TaskDetailWithoutModal = () => {
    const taskDetailRef = useRef<HTMLDivElement>(null);
    const { taskId } = useParams()

    useEffect(() => {
        setTaskDetail(undefined)
    }, [])


    // Fetch tasks using the custom hook
    const { tasks, setTaskDetail } = useTasksContext()

    // Ensure taskId is a string and not an array or undefined
    // Handle case when taskId is not valid
    if (typeof taskId !== 'string') return <div>Invalid task ID</div>

    // Filter the tasks to find the task with the matching taskId
    const theTask = tasks.find((task) => task.Task_ID === parseInt(taskId))


    if (!theTask) return <div>Task not found</div>

    return (
        <div className={styles.taskDetailContainer} ref={taskDetailRef}>
            <TaskDetail task={theTask} />
        </div>
    )
}
