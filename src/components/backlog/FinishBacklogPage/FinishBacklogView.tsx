"use client"

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { FinishBacklog, FinishBacklogProps } from '@/components/backlog';
import { useBacklogsContext, useProjectsContext, useTasksContext } from '@/contexts';
import { useURLLink } from '@/hooks';
import useRoleAccess from '@/hooks/useRoleAccess';
import { setSnackMessage, useAppDispatch } from '@/redux';
import { Backlog, Task } from '@/types';

export const FinishBacklogView = () => {
    // ---- Hooks ----
    const dispatch = useAppDispatch()
    const router = useRouter();
    const { backlogLink } = useParams<{ backlogLink: string }>(); // Get backlogId from URL
    const { backlogById: renderBacklog, readBacklogById, finishBacklog } = useBacklogsContext()
    const { tasksById, readTasksByBacklogId } = useTasksContext()
    const { projectById, readProjectById } = useProjectsContext()
    const { linkId: backlogId, convertID_NameStringToURLFormat } = useURLLink(backlogLink)
    const { canManageBacklog } = useRoleAccess(
        renderBacklog ? renderBacklog.project?.team?.organisation?.User_ID : undefined,
        "backlog",
        renderBacklog ? renderBacklog.Backlog_ID : 0
    )

    // ---- State ----
    const [taskStatusCounter, setTaskStatusCounter] = useState<{
        name: string;
        counter: Task[] | undefined;
    }[] | undefined>(undefined)
    const [moveAction, setMoveAction] = useState<string>('move-to-primary')
    const [newBacklog, setNewBacklog] = useState<Backlog>({
        Backlog_Name: '',
        Project_ID: 0,
        Backlog_IsPrimary: false,
    })

    // ---- Methods ----
    // Handles the finishing of the current backlog and redirects accordingly
    const doFinishBacklog = async () => {
        if (!renderBacklog) return

        const targetBacklog = await finishBacklog(backlogId, moveAction, newBacklog)
        if (targetBacklog) {
            router.push(`/backlog/${convertID_NameStringToURLFormat(targetBacklog.id, targetBacklog.name)}`); // Redirect to new backlog page
        } else {
            dispatch(setSnackMessage("Error happened while finishing backlog. Try again."))
        }
    }

    // ---- Effects ----
    useEffect(() => {
        readBacklogById(parseInt(backlogId))
        readTasksByBacklogId(parseInt(backlogId))
    }, [backlogId])

    // Sync backlog and project data when backlog changes
    useEffect(() => {
        if (backlogId && renderBacklog) {
            readProjectById(renderBacklog.Project_ID)

            setNewBacklog({
                ...newBacklog,
                Project_ID: renderBacklog.Project_ID,
            })

            setTaskStatusCounter(() => {
                const statuses = renderBacklog.statuses
                const tasks = renderBacklog.tasks

                return statuses?.map(status => {
                    return {
                        name: status.Status_Name,
                        counter: tasks?.filter(task => task.Status_ID === status.Status_ID)
                    }
                })
            })

            document.title = `Finishing Backlog: ${renderBacklog.Backlog_Name} - GiveOrTake`
        }
    }, [renderBacklog])

    const finishBacklogProps: FinishBacklogProps = {
        renderBacklog,
        canManageBacklog,
        tasksById,
        taskStatusCounter,
        moveAction,
        newBacklog,
        projectById,
        backlogId,
        setMoveAction,
        setNewBacklog,
        doFinishBacklog
    }

    return <FinishBacklog {...finishBacklogProps} />
}
