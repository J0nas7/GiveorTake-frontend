"use client"

// External
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { useTasks } from "@/contexts";

const TaskDetailContainer = () => {
    const { taskDetail, setTaskDetail } = useTasks()
    const taskDetailRef = useRef<HTMLDivElement>(null);

    const [comments, setComments] = useState<string[]>([
        "User1: This is a comment.",
        "User2: Another comment here.",
        "User3: Looks good!"
    ]);
    const [newComment, setNewComment] = useState("");
    const [isEditorVisible, setIsEditorVisible] = useState(false);
    const quillRef = useRef<any>(null);

    // Title Editing
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState("")
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Task-loading
    useEffect(() => {
        if (!taskDetail) return

        if (taskDetail.Task_Title) setTitleInput(taskDetail.Task_Title)
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

    // Handle clicks outside taskDetailContainer but inside taskDetailModalBackground
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (taskDetail && taskDetailRef.current && !taskDetailRef.current.contains(event.target as Node)) {
            setTaskDetail(undefined)
        }
    };

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
        setTimeout(() => {
            if (quillRef.current) {
                quillRef.current.getEditor().focus(); // Access Quill instance and call focus
            }
        }, 0); // Delay to ensure React updates the state before focusing
    };

    // If there's no task detail, return null (render nothing)
    if (!taskDetail) return null;

    return (
        <div className={styles.taskDetailModalBackground} onClick={handleBackgroundClick}>
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
                            <p>{taskDetail.Task_Description || "No description available"}</p>
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
                                    <>
                                        <ReactQuill
                                            value={newComment}
                                            onChange={setNewComment}
                                            placeholder="Write a comment..."
                                            className={styles.commentInput}
                                            theme="snow"
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
                                        <div className={styles.newCommentActions}>
                                            <button className={styles.sendButton} onClick={handleCommentSubmit}>
                                                <FontAwesomeIcon icon={faPaperPlane} />
                                            </button>
                                            <button className={styles.cancelButton} onClick={handleCommentCancel}>
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Comments List */}
                            {comments.map((comment, index) => (
                                <div key={index} className={styles.commentItem}>
                                    <div className={styles.comment}>{comment}</div>
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
                        </div>

                        <Card className={styles.detailsSection}>
                            <h2>Task Details</h2>
                            <p><strong>Status:</strong> {taskDetail.Task_Status}</p> {/* Task Status */}
                            <p><strong>Assigned To:</strong> {taskDetail.Assigned_User_ID ? `User ${taskDetail.Assigned_User_ID}` : "Unassigned"}</p> {/* Assigned User */}
                            <p><strong>Created At:</strong> {taskDetail.Task_CreatedAt}</p> {/* Task Created Date */}
                            <p><strong>Due Date:</strong> {taskDetail.Task_Due_Date || "N/A"}</p> {/* Task Due Date */}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TaskDetail = () => (
    <TaskDetailContainer />
)

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
    return <div className={`bg-white rounded-lg p-4 ${className}`}>{children}</div>;
};