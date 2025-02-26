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

// Internal
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { useTasksContext } from "@/contexts";
import { Task } from "@/types";
import Link from "next/link";

interface TaskDetailProps {
    task?: Task
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task }) => {
    const { taskDetail, setTaskDetail } = useTasksContext()
    const taskDetailRef = useRef<HTMLDivElement>(null);
    const theTask = task ? task : taskDetail

    const [comments, setComments] = useState<string[]>([
        "User1: This is a comment.",
        "User2: Another comment here.",
        "User3: Looks good!"
    ]);
    const [newComment, setNewComment] = useState("");
    const [isEditorVisible, setIsEditorVisible] = useState(false);
    const quillCommentWrapperRef = useRef<any>(null);

    // Title Editing
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState("")
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Description Editing
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [descriptionInput, setDescriptionInput] = useState("")
    const [descriptionEditorInput, setDescriptionEditorInput] = useState("")
    const quillDescriptionWrapperRef = useRef<any>(null);
    
    // Task-loading
    useEffect(() => {
        if (!theTask) return

        if (theTask.Task_Title) setTitleInput(theTask.Task_Title)
        if (theTask.Task_Description) setDescriptionInput(theTask.Task_Description)
        if (theTask.Task_Description) setDescriptionEditorInput(theTask.Task_Description)
    }, [taskDetail])

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

    const handleTitleClick = () => {
        setIsEditingTitle(true);
        setTimeout(() => titleInputRef.current?.focus(), 0);
    };

    const handleTitleBlur = () => setIsEditingTitle(false);

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitleInput(event.target.value);
    };

    const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            setIsEditingTitle(false);
        }
    };

    // Handle Description Editing
    const handleDescriptionClick = () => {
        setIsEditingDescription(true);
    }

    useEffect(() => {
        if (isEditingDescription && quillDescriptionWrapperRef.current) {
            setTimeout(() => {
                const quillInstance = quillDescriptionWrapperRef.current?.querySelector(".ql-editor");
                if (quillInstance) {
                    (quillInstance as HTMLElement).focus();
                }
            }, 100);
        }
    }, [isEditingDescription]);

    const handleDescriptionCancel = () => setIsEditingDescription(false);

    const handleDescriptionChange = (value: string) => {
        setDescriptionEditorInput(value)
    };

    const handleDescriptionSubmit = () => {
        setIsEditingDescription(false)
        setDescriptionInput(descriptionEditorInput)
    }

    const handleDescriptionKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            setIsEditingDescription(false);
        }
    };

    // Handle new comment submission
    const handleCommentSubmit = () => {
        if (newComment.trim()) {
            setComments((prev) => [...prev, `You: ${newComment.trim()}`]);
            setNewComment("");
            setIsEditorVisible(false); // Hide editor after submission
        }
    };

    // Handle new comment cancel
    const handleCommentCancel = () => {
        setNewComment("");
        setIsEditorVisible(false); // Hide editor after cancel
    };

    // Handle clicking the placeholder to show the editor
    const handlePlaceholderClick = () => {
        setIsEditorVisible(true);
    }

    useEffect(() => {
        if (isEditingDescription && quillCommentWrapperRef.current) {
            setTimeout(() => {
                const quillInstance = quillCommentWrapperRef.current?.querySelector(".ql-editor");
                if (quillInstance) {
                    (quillInstance as HTMLElement).focus();
                }
            }, 100);
        }
    }, [isEditorVisible]);

    // If there's no task detail, return null (render nothing)
    if (!theTask) return null;

    return (
        <div className={styles.taskDetailContainer} ref={taskDetailRef}>
            <div className={styles.content}>
                {/* Left: Task Media & Comments */}
                <div className={styles.leftPanel}>
                    {/* Title with Editable Logic */}
                    {!isEditingTitle ? (
                        <div className={styles.titlePlaceholder} onClick={handleTitleClick}>
                            {titleInput || "Click to add title..."}
                        </div>
                    ) : (
                        <input
                            ref={titleInputRef}
                            type="text"
                            className={styles.titleInput}
                            value={titleInput}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                        />
                    )}

                    <Card className={styles.descriptionSection}>
                        <h2>Task Description</h2>

                        {!isEditingDescription ? (
                            <div className={styles.descriptionPlaceholder} onClick={handleDescriptionClick}>
                                {descriptionInput ? (
                                    <div dangerouslySetInnerHTML={{ __html: descriptionInput }} />
                                ) : (
                                    "Click to add description..."
                                )}
                            </div>
                        ) : (
                            <div className={styles.descriptionEditor} ref={quillDescriptionWrapperRef}>
                                <ReactQuill
                                    theme="snow"
                                    value={descriptionEditorInput}
                                    onChange={handleDescriptionChange}
                                    onBlur={handleDescriptionSubmit}
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
                                    <button className={styles.sendButton} onClick={handleDescriptionSubmit}>
                                        <FontAwesomeIcon icon={faPaperPlane} />
                                    </button>
                                    <button className={styles.cancelButton} onClick={handleDescriptionCancel}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>

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

                    <Card className={styles.commentsSection}>
                        <h2>Comments</h2>

                        {/* New Comment Input */}
                        <div className={styles.commentInputContainer}>
                            {!isEditorVisible ? (
                                <div className={styles.commentPlaceholder} onClick={handlePlaceholderClick}>
                                    Add a new comment...
                                </div>
                            ) : (
                                <div className={styles.commentEditor} ref={quillCommentWrapperRef}>
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
                                        <button className={styles.sendButton} onClick={handleCommentSubmit}>
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                        </button>
                                        <button className={styles.cancelButton} onClick={handleCommentCancel}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Comments List */}
                        {comments.map((comment, index) => (
                            <div key={index} className={styles.commentItem}>
                                <div
                                    className={styles.comment}
                                    dangerouslySetInnerHTML={{ __html: comment }}
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
                </div>

                {/* Right: Task Details */}
                <div className={styles.rightPanel}>
                    <div className={styles.ctaButtons}>
                        <button>Edit</button>
                        <button>Delete</button>
                        <button>Share</button>
                        {task === undefined && (
                            <Link href={`/task-detail/${theTask.Task_ID}`}>
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                            </Link>
                        )}
                    </div>

                    <Card className={styles.detailsSection}>
                        <h2>Task Details</h2>
                        <p><strong>Status:</strong> {theTask.Task_Status}</p> {/* Task Status */}
                        <p><strong>Assigned To:</strong> {theTask.Assigned_User_ID ? `User ${theTask.Assigned_User_ID}` : "Unassigned"}</p> {/* Assigned User */}
                        <p><strong>Created At:</strong> {theTask.Task_CreatedAt}</p> {/* Task Created Date */}
                        <p><strong>Due Date:</strong> {theTask.Task_Due_Date || "N/A"}</p> {/* Task Due Date */}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const TaskDetailWithModal = () => {
    const { taskDetail, setTaskDetail } = useTasksContext()
    const taskDetailRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside taskDetailContainer but inside taskDetailModalBackground
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (taskDetail && taskDetailRef.current && !taskDetailRef.current.contains(event.target as Node)) {
            setTaskDetail(undefined)
        }
    };

    if (!taskDetail) return null

    return (
        <div className={styles.taskDetailModalBackground} onClick={handleBackgroundClick}>
            <div ref={taskDetailRef}>
                <TaskDetail />
            </div>
        </div>
    )
}

export const TaskDetailWithoutModal = () => {
    const { taskId } = useParams()

    // Ensure taskId is a string and not an array or undefined
    if (typeof taskId !== 'string') {
        return <div>Invalid task ID</div>; // Handle case when taskId is not valid
    }

    // Fetch tasks using the custom hook
    const { tasks, setTaskDetail } = useTasksContext()

    // Filter the tasks to find the task with the matching taskId
    const theTask = tasks.find((task) => task.Task_ID === parseInt(taskId));

    if (!theTask) {
        return <div>Task not found</div>;
    }

    useEffect(() => {
        setTaskDetail(undefined)
    }, [])

    return (
        <TaskDetail task={theTask} />
    )
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
    return <div className={`bg-white rounded-lg p-4 ${className}`}>{children}</div>;
};