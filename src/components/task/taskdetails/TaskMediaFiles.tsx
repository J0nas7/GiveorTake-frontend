"use client"

// External
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import Link from 'next/link';
import { useState } from 'react';

// Internal
import { Card } from '@/components/task/taskdetails/TaskCard';
import { Block, Text } from '@/components/ui/block-text';
import { useTaskMediaFilesContext, useTasksContext } from '@/contexts';
import { CreatedAtToTimeSince } from '@/core-ui/components/TaskTimeTrackPlayer';
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { env } from '@/env.urls';
import { AppDispatch, setSnackMessage } from '@/redux';
import { Task, TaskMediaFile } from '@/types';
import { useDispatch } from 'react-redux';

export const MediaFilesArea: React.FC<{ task: Task }> = ({ task }) => {
    const [toggleAddFile, setToggleAddFile] = useState<boolean>(false)
    const { removeTaskMediaFile } = useTaskMediaFilesContext()
    const { readTasksByBacklogId, readTaskByKeys } = useTasksContext()

    // Handle file deletion
    const handleDelete = async (taskMediaFile: TaskMediaFile) => {
        if (!task.Task_ID || !taskMediaFile.Media_ID) return

        // Send the file ID to the API through the context function
        if (taskMediaFile.Media_ID) {
            await removeTaskMediaFile(taskMediaFile.Media_ID, taskMediaFile.Task_ID, undefined)

            //// Task changed
            if (task) {
                if (task.Backlog_ID) await readTasksByBacklogId(task.Backlog_ID, true)
                if (task.Task_Key && task.backlog?.project?.Project_Key) await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
            }

            setToggleAddFile(false);
        }
    };

    return (
        <>
            {!toggleAddFile ? (
                <MediaFilesAreaView
                    task={task}
                    setToggleAddFile={setToggleAddFile}
                    handleDelete={handleDelete}
                />
            ) : (
                <AddTaskMediaFile
                    task={task}
                    setToggleAddFile={setToggleAddFile}
                />
            )}
        </>
    );
};

interface MediaFilesAreaViewProps {
    task: Task;
    setToggleAddFile: React.Dispatch<React.SetStateAction<boolean>>
    handleDelete: (taskMediaFile: TaskMediaFile) => Promise<void>
}

export const MediaFilesAreaView: React.FC<MediaFilesAreaViewProps> = ({
    task,
    setToggleAddFile,
    handleDelete
}) => (
    <Card className={styles.mediaSection}>
        <Block className="flex gap-2 items-center">
            <h2>Media Files</h2>
            <button
                className="blue-link-light"
                onClick={() => setToggleAddFile(true)}
            >
                Add file
            </button>
        </Block>
        <Block className={styles.mediaPlaceholders}>
            {task.media_files?.map((media, index) => (
                <Block key={index} className={clsx(
                    styles.mediaItem,
                    "flex flex-col items-center"
                )}>
                    <Block variant="span" className="font-semibold text-xs">
                        {/* Split the Media_File_Name by hyphen (-) and get the part after the first hyphen */}
                        {media.Media_File_Name.split('-').slice(1).join('-')}
                    </Block>
                    {(media.Media_File_Type === "jpeg" || media.Media_File_Type === "jpg") ? (
                        <img
                            className={styles.mediaPlaceholder}
                            src={`${env.url.API_URL}/storage/${media.Media_File_Path}`}
                        />
                    ) : (
                        <Link
                            className={styles.mediaPlaceholder}
                            href={`${env.url.API_URL}/storage/${media.Media_File_Path}`}
                            target="_blank"
                        >
                            <Text variant="span" className="text-sm font-semibold">PDF</Text>
                        </Link>
                    )}
                    <Block className={styles.mediaMeta}>
                        <Block>
                            <Block>
                                Created:{" "}
                                {media.Media_CreatedAt && (
                                    <CreatedAtToTimeSince dateCreatedAt={media.Media_CreatedAt} />
                                )}
                            </Block>
                            <Block>By: {media.user?.User_FirstName} {media.user?.User_Surname}</Block>
                        </Block>
                        <button
                            className={styles.mediaActions}
                            onClick={() => handleDelete(media)}
                        >
                            <FontAwesomeIcon icon={faTrashCan} className={styles.icon} />
                        </button>
                    </Block>
                </Block>
            ))}
        </Block>
    </Card>
);

type AddTaskMediaFileProps = {
    task: Task; // Task ID to associate the media file with
    setToggleAddFile: React.Dispatch<React.SetStateAction<boolean>>
};

export const AddTaskMediaFile: React.FC<AddTaskMediaFileProps> = ({
    task,
    setToggleAddFile
}) => {
    // ---- Hooks ----
    const dispatch = useDispatch<AppDispatch>()
    const { addTaskMediaFile } = useTaskMediaFilesContext()
    const { readTasksByBacklogId, readTaskByKeys } = useTasksContext()

    // Internal variables
    const [file, setFile] = useState<File | null>(null);
    const [mediaFileName, setMediaFileName] = useState<string>("");
    const [mediaFileType, setMediaFileType] = useState<string>("");

    /**
     * Methods
     */
    // Handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMediaFileName(selectedFile.name);
            setMediaFileType(selectedFile.type);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!task.Task_ID) return

        if (!file || !mediaFileName || !mediaFileType) {
            dispatch(setSnackMessage("Please select a file and provide all necessary details."))
            return;
        }

        // Prepare the media file object
        const newMediaFile: TaskMediaFile = {
            Task_ID: task.Task_ID,
            Uploaded_By_User_ID: 1, // You can get the user ID dynamically (e.g., from auth context)
            Media_File: file,
            Media_File_Name: mediaFileName,
            Media_File_Path: "", // Will be populated by the response from API
            Media_File_Type: mediaFileType,
            Media_CreatedAt: new Date().toISOString(), // Current timestamp
            Media_UpdatedAt: new Date().toISOString(),
        };

        // Send the file to the API through the context function
        if (addTaskMediaFile) {
            await addTaskMediaFile(task.Task_ID, newMediaFile);
            dispatch(setSnackMessage("Media file uploaded successfully."))
            // Clear form
            setFile(null);
            setMediaFileName("");
            setMediaFileType("");

            //// Task changed
            if (task) {
                if (task.Backlog_ID) await readTasksByBacklogId(task.Backlog_ID, true)
                if (task.Task_Key && task.backlog?.project?.Project_Key) await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
            }

            setToggleAddFile(false);
        }
    };

    if (!task.Task_ID) return

    return (
        <Card className={styles.mediaSection}>
            <Block className="flex gap-2 items-center">
                <h2>Upload Media File</h2>
                <button
                    className="blue-link-light"
                    onClick={() => setToggleAddFile(false)}
                >
                    Cancel
                </button>
            </Block>
            <form
                onSubmit={handleSubmit}
                className="flex items-center justify-between"
            >
                <input
                    type="file"
                    id="mediaFile"
                    name="mediaFile"
                    accept="image/jpeg, image/png, application/pdf"
                    onChange={handleFileChange}
                />
                <button
                    type="submit"
                    disabled={!file}
                    className="blue-link"
                >
                    Upload Media File
                </button>
            </form>
        </Card>
    );
};
