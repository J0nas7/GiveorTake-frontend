// External
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';

// Internal
import { Card } from '@/components/partials/task/taskdetails/TaskCard';
import { Block } from '@/components/ui/block-text';
import { useTasksContext } from '@/contexts';
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { Task, TeamUserSeat } from '@/types';

export const DescriptionArea: React.FC<{ task: Task }> = ({ task }) => {
    const { readTaskByKeys, readTasksByBacklogId, saveTaskChanges } = useTasksContext();
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(task.Task_Description || "");

    const handleSave = () => {
        setIsEditing(false);
        saveTaskChanges(
            { ...task, Task_Description: description },
            task.Backlog_ID
        )

        //// Task changed
        if (task) {
            if (task.Backlog_ID) readTasksByBacklogId(task.Backlog_ID, true)
            if (task.backlog?.project?.Project_Key && task.Task_Key) readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

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
        <DescriptionAreaView
            task={task}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            description={description}
            setDescription={setDescription}
            handleSave={handleSave}
            handleCancel={handleCancel}
            quillModule={quillModule}
        />
    );
};

interface DescriptionAreaViewProps {
    task: Task
    isEditing: boolean
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
    description: string
    setDescription: React.Dispatch<React.SetStateAction<string>>
    handleSave: () => void
    handleCancel: () => void
    quillModule: {
        mention: {
            allowedChars: RegExp;
            mentionDenotationChars: string[];
            source: (searchTerm: string, renderList: Function) => void;
        };
    }
}

export const DescriptionAreaView: React.FC<DescriptionAreaViewProps> =
    ({
        task,
        isEditing,
        setIsEditing,
        description,
        setDescription,
        handleSave,
        handleCancel,
        quillModule
    }) => {
        return (
            <Card className={styles.descriptionSection}>
                <h2>Task Description</h2>
                {!isEditing ? (
                    <div
                        className={styles.descriptionPlaceholder}
                        onClick={() => setIsEditing(true)}
                        dangerouslySetInnerHTML={{ __html: description || "Click to add a description..." }}
                    />
                ) : (
                    <Block className={styles.descriptionEditor}>
                        <ReactQuill
                            className={styles.descriptionInput}
                            theme="snow"
                            value={description}
                            onChange={setDescription}
                            onBlur={handleSave}
                            modules={quillModule}
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
