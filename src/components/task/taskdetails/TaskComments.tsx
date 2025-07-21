"use client"

// External
import { faPaperPlane, faPencil, faReply, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useState } from 'react';

// Internal
import { Card } from '@/components/task/taskdetails/TaskCard';
import { Block, Text } from '@/components/ui/block-text';
import { useTaskCommentsContext, useTasksContext } from '@/contexts';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { CreatedAtToTimeSince } from '@/core-ui/components/TaskTimeTrackPlayer';
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { selectAuthUser, useTypedSelector } from '@/redux';
import { Task, TaskComment, TeamUserSeat, User } from '@/types';

import dynamic from "next/dynamic";
import "quill-mention/dist/quill.mention.css";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
// Import Quill & register mention module in useEffect
let Quill: any
// Ensure Quill is loaded properly
const loadQuill = async () => {
    if (typeof window !== "undefined") {
        // Dynamically import quill
        const { default: QuillLibrary } = await import("quill");
        Quill = QuillLibrary;
    }
};

export const CommentsArea: React.FC<{ task: Task }> = ({ task }) => {
    const { addTaskComment, saveTaskCommentChanges, removeTaskComment } = useTaskCommentsContext();
    const { readTasksByBacklogId, readTaskByKeys } = useTasksContext()
    const authUser = useTypedSelector(selectAuthUser)

    const [createComment, setCreateComment] = useState<string>("");
    const [editComment, setEditComment] = useState<string>("");
    const [isCreateCommentVisible, setIsCreateCommentVisible] = useState<boolean>(false);
    const [isEditCommentVisible, setIsEditCommentVisible] = useState<TaskComment | undefined>(undefined);
    const [isAnsweringCommentVisible, setIsAnsweringCommentVisible] = useState<TaskComment | undefined>(undefined);

    const handleAddComment = async () => {
        if (!authUser) return

        if (createComment.trim() && authUser.User_ID) {
            const theNewComment: TaskComment = {
                Task_ID: task.Task_ID ?? 0,
                User_ID: authUser.User_ID,
                Comment_Text: createComment.trim()
            }

            if (isAnsweringCommentVisible) {
                theNewComment.Parent_Comment_ID = isAnsweringCommentVisible.Comment_ID;
            }

            console.log("theNewComment", theNewComment)
            await addTaskComment(theNewComment.Task_ID, theNewComment)

            setCreateComment("");
            setIsCreateCommentVisible(false)
            setIsAnsweringCommentVisible(undefined)

            //// Task changed
            if (task) {
                if (task.Backlog_ID) readTasksByBacklogId(task.Backlog_ID, true)
                if (task.Task_Key && task.backlog?.project?.Project_Key) await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
            }
        }
    }

    // Handle new comment cancel
    const handleCommentCancel = () => {
        setCreateComment("");
        setIsCreateCommentVisible(false); // Hide editor after cancel
        setIsAnsweringCommentVisible(undefined)
    };

    const handleEditComment = async () => {
        if (!authUser || (!isEditCommentVisible && !isAnsweringCommentVisible)) return

        if (editComment.trim() && authUser.User_ID) {
            let theEditedComment: TaskComment | undefined;

            if (isEditCommentVisible) {
                theEditedComment = {
                    ...isEditCommentVisible,
                    Comment_Text: editComment.trim()
                };
            } else if (isAnsweringCommentVisible) {
                theEditedComment = {
                    ...isAnsweringCommentVisible,
                    Comment_Text: editComment.trim()
                };
            }

            if (!theEditedComment) return;

            if (isAnsweringCommentVisible) {
                theEditedComment.Parent_Comment_ID = isAnsweringCommentVisible.Comment_ID;
            }

            await saveTaskCommentChanges(theEditedComment, theEditedComment.Task_ID)

            setEditComment("");
            setIsEditCommentVisible(undefined)

            //// Task changed
            if (task) {
                if (task.Backlog_ID) readTasksByBacklogId(task.Backlog_ID, true)
                if (task.Task_Key && task.backlog?.project?.Project_Key) await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
            }
        }
    }

    // Handle new comment cancel
    const handleEditCommentCancel = () => {
        setEditComment("");
        setIsEditCommentVisible(undefined); // Hide editor after cancel
    };

    // Handle comment deletion
    const handleDeleteComment = async (taskComment: TaskComment) => {
        if (!task.Task_ID || !taskComment.Comment_ID) return

        // Send the comment ID to the API through the context function
        if (taskComment.Comment_ID) {
            await removeTaskComment(taskComment.Comment_ID, taskComment.Task_ID, undefined)
            if (isEditCommentVisible && isEditCommentVisible.Comment_ID === taskComment.Comment_ID) {
                setEditComment("")
                setIsEditCommentVisible(undefined)
            }

            //// Task changed
            if (task) {
                if (task.Backlog_ID) await readTasksByBacklogId(task.Backlog_ID, true)
                if (task.Task_Key && task.backlog?.project?.Project_Key) await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
            }
        }
    };

    /**
     * Effects
     */
    useEffect(() => {
        // Only load Quill and mention module on the client
        loadQuill().then(() => {
            // if (Quill) {
            //     Quill.register("modules/mention", Mention);
            // }
            if (Quill) {
                // Dynamically import quill-mention once Quill is loaded
                import("quill-mention").then((mentionModule) => {
                    if (Quill && mentionModule) {
                        // Quill.register("modules/mention", mentionModule);
                    }
                });
            }
        });
    }, [Quill])

    // Quill Editor Modules (Mention plugin added)
    const [mentionUsers, setMentionUsers] = useState<any[]>([])
    useEffect(() => {
        const restructureUsers = task.backlog?.project?.team?.user_seats?.map((seat: TeamUserSeat) => ({
            id: seat.user?.User_ID, // Ensure the id field is used for mentions
            value: `${seat.user?.User_FirstName || ''} ${seat.user?.User_Surname || ''}`, // Concatenating first & last name
        })) || [];

        setMentionUsers(restructureUsers);
    }, [task])

    const quillModule = useMemo(() => ({
        toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }]],
        mention: {
            allowedChars: /^[A-Za-z\s]*$/,
            mentionDenotationChars: ["@"], // Trigger character
            source: (searchTerm: string, renderList: Function) => {
                // Filter users based on search term
                const matches = mentionUsers && mentionUsers.filter(user => user.value.toLowerCase().includes(searchTerm.toLowerCase()));
                renderList(matches);
            },
            /*renderItem: (item: any) => {
                const memberLink = document.createElement("a");
                memberLink.href = `/profile/${item.id}`; // Adjust link as needed
                memberLink.style.color = "#007bff"; // Bootstrap primary color or your preference
                memberLink.style.textDecoration = "none";
                memberLink.textContent = item.value;
                return memberLink;
            }*/
        }
    }), [mentionUsers]);

    return (
        <CommentsAreaView
            createComment={createComment}
            setCreateComment={setCreateComment}
            editComment={editComment}
            setEditComment={setEditComment}
            isCreateCommentVisible={isCreateCommentVisible}
            setIsCreateCommentVisible={setIsCreateCommentVisible}
            isEditCommentVisible={isEditCommentVisible}
            setIsEditCommentVisible={setIsEditCommentVisible}
            isAnsweringCommentVisible={isAnsweringCommentVisible}
            setIsAnsweringCommentVisible={setIsAnsweringCommentVisible}
            task={task}
            authUser={authUser}
            addTaskComment={addTaskComment}
            handleAddComment={handleAddComment}
            handleCommentCancel={handleCommentCancel}
            handleEditComment={handleEditComment}
            handleEditCommentCancel={handleEditCommentCancel}
            handleDeleteComment={handleDeleteComment}
            quillModule={quillModule}
        />
    );
};

interface CommentsAreaViewProps {
    createComment: string
    setCreateComment: React.Dispatch<React.SetStateAction<string>>
    editComment: string
    setEditComment: React.Dispatch<React.SetStateAction<string>>
    isCreateCommentVisible: boolean
    setIsCreateCommentVisible: React.Dispatch<React.SetStateAction<boolean>>
    isEditCommentVisible: TaskComment | undefined
    setIsEditCommentVisible: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    isAnsweringCommentVisible: TaskComment | undefined
    setIsAnsweringCommentVisible: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    task: Task;
    authUser: User | undefined
    addTaskComment: (taskId: number, comment: TaskComment) => Promise<void>
    handleAddComment: () => Promise<void>
    handleCommentCancel: () => void
    handleEditComment: () => Promise<void>
    handleEditCommentCancel: () => void
    handleDeleteComment: (taskComment: TaskComment) => Promise<void>
    quillModule: {
        toolbar: (string[] | {
            list: string;
        }[])[];
        mention: {
            allowedChars: RegExp;
            mentionDenotationChars: string[];
            source: (searchTerm: string, renderList: Function) => void;
        };
    }
}

export const CommentsAreaView: React.FC<CommentsAreaViewProps> = ({
    createComment,
    setCreateComment,
    editComment,
    setEditComment,
    isCreateCommentVisible,
    setIsCreateCommentVisible,
    isEditCommentVisible,
    setIsEditCommentVisible,
    isAnsweringCommentVisible,
    setIsAnsweringCommentVisible,
    task,
    authUser,
    addTaskComment,
    handleAddComment,
    handleCommentCancel,
    handleEditComment,
    handleEditCommentCancel,
    handleDeleteComment,
    quillModule
}) => (
    <Card className={styles.commentsSection}>
        <Block className="flex gap-2 items-center">
            <h2>Comments</h2>
            <Text className="text-xs">({task.comments?.length})</Text>
        </Block>
        {isEditCommentVisible ? (
            <Block className={styles.commentEditor}>
                <ReactQuill
                    value={editComment}
                    onChange={setEditComment}
                    placeholder="Write a comment..."
                    className={styles.commentInput}
                    theme="snow"
                    modules={quillModule}
                />
                <Block className={styles.newCommentActions}>
                    <button className={styles.sendButton} onClick={handleEditComment}>
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                    <button className={styles.cancelButton} onClick={handleEditCommentCancel}>
                        Cancel
                    </button>
                </Block>
            </Block>
        ) : (
            <>
                {!isCreateCommentVisible && !isAnsweringCommentVisible ? (
                    <Block className={styles.commentPlaceholder} onClick={() => setIsCreateCommentVisible(true)}>
                        Add a new comment...
                    </Block>
                ) : (
                    <Block className={styles.commentEditor}>
                        {isAnsweringCommentVisible && (
                            <>Answering: {isAnsweringCommentVisible.user?.User_FirstName} {isAnsweringCommentVisible.user?.User_Surname}</>
                        )}
                        <ReactQuill
                            value={createComment}
                            onChange={setCreateComment}
                            placeholder="Write a comment..."
                            className={styles.commentInput}
                            theme="snow"
                            modules={quillModule}
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
            </>
        )}
        {task.comments?.filter(comment => !comment.Parent_Comment_ID).map((comment: TaskComment, index) => (
            <CommentItem
                key={index}
                comment={comment}
                setCreateComment={setCreateComment}
                setEditComment={setEditComment}
                setIsEditCommentVisible={setIsEditCommentVisible}
                setIsAnsweringCommentVisible={setIsAnsweringCommentVisible}
                handleDeleteComment={handleDeleteComment}
            />
        ))}
    </Card>
);

type CommentItemProps = {
    comment: TaskComment
    setCreateComment: React.Dispatch<React.SetStateAction<string>>
    setEditComment: (value: React.SetStateAction<string>) => void
    setIsEditCommentVisible: (value: React.SetStateAction<TaskComment | undefined>) => void
    setIsAnsweringCommentVisible: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    handleDeleteComment: (taskComment: TaskComment) => Promise<void>
}

export const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    setCreateComment,
    setEditComment,
    setIsEditCommentVisible,
    setIsAnsweringCommentVisible,
    handleDeleteComment
}) => {
    // Hooks
    const { readCommentById } = useTaskCommentsContext();

    // State
    const [theComment, setTheComment] = useState<TaskComment | undefined>(undefined);

    useEffect(() => {
        const readComment = async () => {
            if (comment.Comment_ID) {
                const result = await readCommentById(comment.Comment_ID, true)

                if (result) setTheComment(result)
            }
        }
        readComment()
    }, [])

    return (
        <LoadingState singular="Comment" renderItem={theComment} permitted={true}>
            {theComment && (
                <>
                    <Block className={styles.commentItem}>
                        <div
                            className={styles.comment}
                            dangerouslySetInnerHTML={{ __html: theComment.Comment_Text }}
                        />
                        <Block className={styles.commentMeta}>
                            <Block>
                                <Block>
                                    Created:{" "}
                                    {theComment.Comment_CreatedAt && (
                                        <CreatedAtToTimeSince dateCreatedAt={theComment.Comment_CreatedAt} />
                                    )}
                                </Block>
                                <Block>
                                    By: {theComment.user?.User_FirstName} {theComment.user?.User_Surname}
                                </Block>
                            </Block>
                            <Block className={styles.commentActions}>
                                <FontAwesomeIcon icon={faReply} className={styles.icon} onClick={() => {
                                    setCreateComment("");
                                    setIsAnsweringCommentVisible(theComment);
                                }} />
                                <FontAwesomeIcon icon={faPencil} className={styles.icon} onClick={() => {
                                    setEditComment(theComment.Comment_Text || "");
                                    setIsEditCommentVisible(theComment);
                                }} />
                                <button
                                    className={styles.mediaActions}
                                    onClick={() => handleDeleteComment(theComment)}
                                >
                                    <FontAwesomeIcon icon={faTrashCan} className={styles.icon} />
                                </button>
                            </Block>
                        </Block>
                    </Block>
                    {Array.isArray(theComment.children_comments) && theComment.children_comments.length > 0 && (
                        <Block className="ml-5">
                            {theComment.children_comments?.map((childComment: TaskComment, childIndex) => (
                                <CommentItem
                                    key={childIndex}
                                    comment={childComment}
                                    setCreateComment={setCreateComment}
                                    setEditComment={setEditComment}
                                    setIsEditCommentVisible={setIsEditCommentVisible}
                                    setIsAnsweringCommentVisible={setIsAnsweringCommentVisible}
                                    handleDeleteComment={handleDeleteComment}
                                />
                            ))}
                        </Block>
                    )}
                </>
            )}
        </LoadingState>
    )
}
