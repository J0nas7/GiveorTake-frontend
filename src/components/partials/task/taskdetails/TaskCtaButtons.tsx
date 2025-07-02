// External
import { faArrowUpFromBracket, faArrowUpRightFromSquare, faLightbulb, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Internal
import { Block, Text } from '@/components/ui/block-text';
import { useTasksContext } from '@/contexts';
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { useURLLink } from '@/hooks';
import { Task } from '@/types';

export const CtaButtons: React.FC<{ task: Task }> = ({ task }) => {
    const router = useRouter()
    const { taskDetail, setTaskDetail, removeTask, readTasksByBacklogId } = useTasksContext()
    const { taskLink } = useParams<{ taskLink: string }>()
    const { convertID_NameStringToURLFormat } = useURLLink(taskLink)

    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return

        const removed = await removeTask(
            task.Task_ID,
            task.Backlog_ID,
            undefined
        )

        await readTasksByBacklogId(task.Backlog_ID, true)

        if (taskDetail) {
            setTaskDetail(undefined)
        } else {
            router.push(`/project/${task.Backlog_ID}`, { scroll: false })
        }
    }

    const shareTask = async () => {
        try {
            const url = new URL(window.location.href)
            // Copy the task url to clipboard
            await navigator.clipboard.writeText(url.toString());
            alert("Link to task was copied to your clipboard");
        } catch (err) {
            alert("Failed to copy link to task");
        }
    };

    return (
        <CtaButtonsView
            task={task}
            taskDetail={taskDetail}
            archiveTask={archiveTask}
            shareTask={shareTask}
            setTaskDetail={setTaskDetail}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    );
};

interface CtaButtonsViewProps {
    task: Task
    taskDetail: Task | undefined
    archiveTask: (task: Task) => Promise<void>
    shareTask: () => Promise<void>
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const CtaButtonsView: React.FC<CtaButtonsViewProps> = ({
    task, taskDetail, archiveTask, shareTask, setTaskDetail, convertID_NameStringToURLFormat
}) => (
    <Block className={styles.ctaButtons}>
        <button
            className={clsx(
                "blue-link",
                styles.ctaButton
            )}
            onClick={() => archiveTask(task)}
        >
            <FontAwesomeIcon icon={faTrashCan} />
            <Text variant="span">Archive</Text>
        </button>
        <button
            className={clsx(
                "blue-link",
                styles.ctaButton
            )}
            onClick={() => shareTask()}
        >
            <FontAwesomeIcon icon={faArrowUpFromBracket} />
            <Text variant="span">Share</Text>
        </button>
        {taskDetail !== undefined && (
            <Link
                href={`/task/${taskDetail.backlog?.project?.Project_Key}/${convertID_NameStringToURLFormat(taskDetail.Task_Key ?? 0, taskDetail.Task_Title)}`}
                className={clsx(
                    "blue-link",
                    styles.ctaButton
                )}
            >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                <Text variant="span">Open in URL</Text>
            </Link>
        )}

        <Block className="flex ml-auto gap-2">
            <Link
                onClick={() => setTaskDetail(undefined)}
                href={`/project/${convertID_NameStringToURLFormat(task.backlog?.project?.Project_ID ?? 0, task.backlog?.project?.Project_Name ?? "")}`}
                className="blue-link !inline-flex gap-2 items-center"
            >
                <FontAwesomeIcon icon={faLightbulb} />
                <Text variant="span">Go to Project</Text>
            </Link>
            {taskDetail !== undefined && (
                <button onClick={() => setTaskDetail(undefined)} className="blue-link">
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            )}
        </Block>
    </Block>
)
