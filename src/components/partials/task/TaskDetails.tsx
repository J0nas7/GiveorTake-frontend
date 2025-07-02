"use client"

// External
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// Internal components and hooks
import { CommentsArea, CtaButtons, DescriptionArea, MediaFilesArea, TaskDetailsArea, TitleArea } from '@/components/partials/task/taskdetails/';
import { Block } from "@/components/ui/block-text";
import { useTasksContext } from "@/contexts";
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { useURLLink } from "@/hooks";
import { Task } from "@/types";
import clsx from "clsx";

interface TaskDetailProps {
    theTask: Task
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ theTask }) => {
    const { taskDetail, setTaskDetail } = useTasksContext()

    if (!theTask) return null

    return (
        <Block className={styles.content}>
            <Block className={styles.leftPanel}>
                <TitleArea task={theTask} />
                <DescriptionArea task={theTask} />
                <MediaFilesArea task={theTask} />
                <CommentsArea task={theTask} />
            </Block>
            <Block className={styles.rightPanel}>
                <CtaButtons task={theTask} />
                <TaskDetailsArea task={theTask} />
            </Block>
        </Block>
    );
};

export const TaskDetailWithModal = () => {
    const taskDetailRef = useRef<HTMLDivElement>(null);
    const { taskDetail, setTaskDetail, tasksById } = useTasksContext()

    // Handle clicks outside taskDetailContainer but inside taskDetailModalBackground
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (taskDetail && taskDetailRef.current && !taskDetailRef.current.contains(event.target as Node)) {
            setTaskDetail(undefined)
        }
    }

    useEffect(() => {
        // Disable body scrolling when TaskDetailContainer is mounted
        if (taskDetail) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        // Effect to listen for the ESC key
        const handleEscPress = (event: KeyboardEvent) => {
            if (event.key === "Escape" && taskDetail) setTaskDetail(undefined)
        };

        // Attach event listener when component is visible
        window.addEventListener("keydown", handleEscPress)

        return () => {
            document.body.style.overflow = ''; // Restore scrolling on unmount
        };
    }, [taskDetail])

    useEffect(() => {
        if (tasksById.length) {
            const updatedTask = tasksById.find(task => task.Task_ID === taskDetail?.Task_ID)
            if (updatedTask) setTaskDetail({ ...updatedTask })
        }
    }, [tasksById])

    if (!taskDetail) return null

    return (
        <Block className={styles.taskDetailModalBackground} onClick={handleBackgroundClick}>
            <Block className={clsx(styles.taskDetailContainer, styles.withModal)} ref={taskDetailRef}>
                <TaskDetail theTask={taskDetail} />
            </Block>
        </Block>
    )
}

export const TaskDetailWithoutModal = () => {
    const { taskByKeys, readTaskByKeys, setTaskDetail } = useTasksContext()
    const taskDetailRef = useRef<HTMLDivElement>(null);
    const { projectKey, taskLink } = useParams<{ projectKey: string, taskLink: string }>(); // Get projectKey and taskLink from URL
    const { linkId: taskKey, convertID_NameStringToURLFormat } = useURLLink(taskLink)

    const [renderTask, setRenderTask] = useState<Task | undefined>(undefined)

    useEffect(() => {
        const fetch = async () => {
            setRenderTask(undefined)
            await readTaskByKeys(projectKey, taskKey)
            setTaskDetail(undefined)
        }

        if (projectKey && taskKey) fetch()
    }, [projectKey, taskKey])

    useEffect(() => {
        if (taskKey) {
            setRenderTask(taskByKeys)
            document.title = `Task: ${taskByKeys?.Task_Title} - GiveOrTake`
        }
    }, [taskByKeys])

    if (!renderTask) return <Block>Task not found</Block>

    return (
        <Block className="page-content">
            <Block className={styles.taskDetailContainer} ref={taskDetailRef}>
                <TaskDetail theTask={renderTask} />
            </Block>
        </Block>
    )
}
