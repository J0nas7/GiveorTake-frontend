"use client"

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Block, Field, FlexibleBox, Text } from '@/components';
import { useBacklogsContext, useProjectsContext, useTasksContext } from '@/contexts';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { useURLLink } from '@/hooks';
import useRoleAccess from '@/hooks/useRoleAccess';
import { setSnackMessage, useAppDispatch } from '@/redux';
import { Backlog, BacklogStates, ProjectStates, Task } from '@/types';
import { faCheckCircle, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent } from '@mui/material';

export const FinishBacklog = () => {
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

    // ---- Render ----
    return (
        <FinishBacklogView
            renderBacklog={renderBacklog}
            canManageBacklog={canManageBacklog}
            tasksById={tasksById}
            taskStatusCounter={taskStatusCounter}
            moveAction={moveAction}
            newBacklog={newBacklog}
            projectById={projectById}
            backlogId={backlogId}
            setMoveAction={setMoveAction}
            setNewBacklog={setNewBacklog}
            doFinishBacklog={doFinishBacklog}
        />
    )
}

type FinishBacklogViewProps = {
    renderBacklog: BacklogStates
    canManageBacklog: boolean | undefined
    tasksById: Task[]
    taskStatusCounter: {
        name: string;
        counter: Task[] | undefined;
    }[] | undefined
    moveAction: string
    newBacklog: Backlog
    projectById: ProjectStates
    backlogId: string
    setMoveAction: React.Dispatch<React.SetStateAction<string>>
    setNewBacklog: React.Dispatch<React.SetStateAction<Backlog>>
    doFinishBacklog: () => Promise<void>
}

export const FinishBacklogView: React.FC<FinishBacklogViewProps> = ({
    renderBacklog, canManageBacklog, tasksById, taskStatusCounter, moveAction, newBacklog, projectById, backlogId,
    setMoveAction, setNewBacklog, doFinishBacklog
}) => (
    <Block className="page-content">
        <FlexibleBox
            title={`Finishing Backlog`}
            subtitle={renderBacklog ? renderBacklog.Backlog_Name : undefined}
            titleAction={
                renderBacklog && (
                    <Link
                        href={`/project/${renderBacklog?.Project_ID}`}
                        className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                    >
                        <FontAwesomeIcon icon={faLightbulb} />
                        <Text variant="span">Go to Project</Text>
                    </Link>
                )
            }
            icon={faCheckCircle}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <LoadingState singular="Backlog" renderItem={renderBacklog} permitted={canManageBacklog}>
                {renderBacklog && (
                    <Card>
                        <CardContent>
                            <Block className="font-semibold">{tasksById.length || 0} tasks total in this backlog</Block>
                            <Block className="flex gap-4">
                                {Array.isArray(taskStatusCounter) && taskStatusCounter.map(({ name, counter }) => (
                                    <Text key={name}>
                                        {counter?.length || 0} {name}
                                    </Text>
                                ))}
                            </Block>

                            <Block className="my-3">
                                <Text>You can finish this backlog, and move all unfinished tasks to the <strong>primary project-backlog</strong>, move them to a new backlog or an existing backlog.</Text>
                                <Text>What do you want to do with the unfinished tasks in this backlog?</Text>
                            </Block>

                            <Block className="my-3">
                                <Block>
                                    <input
                                        type="radio"
                                        value="move-to-primary"
                                        name="move"
                                        id="move-to-primary"
                                        checked={moveAction === "move-to-primary"}
                                        onChange={() => setMoveAction("move-to-primary")}
                                    />
                                    <label htmlFor="move-to-primary" className="ml-2">Move to the primary backlog</label>
                                </Block>
                                <Block>
                                    <input
                                        type="radio"
                                        value="move-to-new"
                                        name="move"
                                        id="move-to-new"
                                        onChange={() => setMoveAction("move-to-new")}
                                    />
                                    <label htmlFor="move-to-new" className="ml-2">Move to a new backlog</label>
                                </Block>
                                <Block>
                                    <input
                                        type="radio"
                                        value="move-to-existing"
                                        name="move"
                                        id="move-to-existing"
                                        onChange={() => setMoveAction("move-to-existing")}
                                    />
                                    <label htmlFor="move-to-existing" className="ml-2">Move to an existing backlog</label>
                                </Block>
                            </Block>

                            {moveAction === "move-to-new" ? (
                                <Block className="my-3 flex flex-col gap-2 p-4 bg-gray-200 rounded">
                                    <Field
                                        type="text"
                                        lbl="New Backlog Name"
                                        value={newBacklog.Backlog_Name}
                                        onChange={(e: string) => setNewBacklog({
                                            ...newBacklog,
                                            Backlog_Name: e,
                                        })}
                                        placeholder="Enter new backlog name"
                                        className="w-full max-w-xs"
                                        disabled={false}
                                    />
                                    <Field
                                        type="text"
                                        lbl="New Backlog Description (optional)"
                                        value={newBacklog.Backlog_Description || ""}
                                        onChange={(e: string) => setNewBacklog({
                                            ...newBacklog,
                                            Backlog_Description: e,
                                        })}
                                        placeholder="Enter new backlog description"
                                        className="w-full max-w-xs"
                                        disabled={false}
                                    />
                                    <Field
                                        type="date"
                                        lbl="New Backlog Start Date (optional)"
                                        value={newBacklog.Backlog_StartDate || ""}
                                        onChange={(e: string) => setNewBacklog({
                                            ...newBacklog,
                                            Backlog_StartDate: e,
                                        })}
                                        placeholder="Enter new backlog start date"
                                        className="w-full max-w-xs"
                                        disabled={false}
                                    />
                                    <Field
                                        type="date"
                                        lbl="New Backlog End Date (optional)"
                                        value={newBacklog.Backlog_EndDate || ""}
                                        onChange={(e: string) => setNewBacklog({
                                            ...newBacklog,
                                            Backlog_EndDate: e,
                                        })}
                                        placeholder="Enter new backlog end date"
                                        className="w-full max-w-xs"
                                        disabled={false}
                                    />
                                </Block>
                            ) : moveAction === "move-to-existing" ? (
                                <Block className="my-3 flex flex-col gap-2 p-4 bg-gray-200 rounded">
                                    <label htmlFor="existing-backlog-select" className="font-semibold">Select an existing backlog:</label>
                                    <select
                                        id="existing-backlog-select"
                                        className="w-full max-w-xs p-2 border rounded"
                                        value={newBacklog.Backlog_ID || ""}
                                        onChange={(e) => setNewBacklog({
                                            ...newBacklog,
                                            Backlog_ID: parseInt(e.target.value),
                                        })}
                                    >
                                        <option value="" disabled>Select a backlog</option>
                                        {projectById && projectById.backlogs?.map(backlog => {
                                            if (backlogId === backlog.Backlog_ID?.toString()) return null

                                            return (
                                                <option key={backlog.Backlog_ID} value={backlog.Backlog_ID}>
                                                    {backlog.Backlog_Name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </Block>
                            ) : null}

                            <Block className="mt-3">
                                <button className="blue-link" onClick={doFinishBacklog}>Finish backlog</button>
                            </Block>
                        </CardContent>
                    </Card>
                )}
            </LoadingState>
        </FlexibleBox>
    </Block>
)
