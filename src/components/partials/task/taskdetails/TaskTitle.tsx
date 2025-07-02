// External
import { useEffect, useRef, useState } from 'react';

// Internal
import { Block } from '@/components/ui/block-text';
import { useTasksContext } from '@/contexts';
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { Task } from '@/types';

export const TitleArea: React.FC<{ task: Task }> = ({ task }) => {
    const { readTasksByBacklogId, readTaskByKeys, saveTaskChanges } = useTasksContext();
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
            task.Backlog_ID
        );

        //// Task changed
        if (task) {
            if (task.Backlog_ID) readTasksByBacklogId(task.Backlog_ID, true)
            if (task.backlog?.project?.Project_Key && task.Task_Key) readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
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
