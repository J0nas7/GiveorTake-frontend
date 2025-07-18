"use client"

import { Block, FlexibleBox } from "@/components"
import { LoadingState } from "@/core-ui/components/LoadingState"
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { Card, CardContent } from "@mui/material"
import React from "react"

import {
    FinishBacklogHeaderLink,
    FinishBacklogMoveOptions,
    FinishBacklogMoveToExisting,
    FinishBacklogMoveToNew,
    FinishBacklogStats
} from "@/components/backlog"
import { Backlog, BacklogStates, ProjectStates, Task, TasksStates } from '@/types'

export type FinishBacklogProps = {
    renderBacklog: BacklogStates
    canManageBacklog: boolean | undefined
    tasksById: TasksStates
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

export const FinishBacklog: React.FC<FinishBacklogProps> = (props) => props.renderBacklog && (
    <Block className="page-content">
        <FlexibleBox
            title="Finishing Backlog"
            subtitle={props.renderBacklog?.Backlog_Name}
            icon={faCheckCircle}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
            titleAction={<FinishBacklogHeaderLink renderBacklog={props.renderBacklog} />}
        >
            <LoadingState singular="Backlog" renderItem={props.renderBacklog} permitted={props.canManageBacklog}>
                {props.renderBacklog && (
                    <Card>
                        <CardContent>
                            <FinishBacklogStats
                                tasksById={props.tasksById}
                                taskStatusCounter={props.taskStatusCounter}
                            />

                            <FinishBacklogMoveOptions
                                moveAction={props.moveAction}
                                setMoveAction={props.setMoveAction}
                            />

                            {props.moveAction === "move-to-new" && (
                                <FinishBacklogMoveToNew
                                    newBacklog={props.newBacklog}
                                    setNewBacklog={props.setNewBacklog}
                                />
                            )}

                            {props.moveAction === "move-to-existing" && (
                                <FinishBacklogMoveToExisting
                                    newBacklog={props.newBacklog}
                                    setNewBacklog={props.setNewBacklog}
                                    projectById={props.projectById}
                                    backlogId={props.backlogId}
                                />
                            )}

                            <Block className="mt-3">
                                <button className="blue-link" onClick={props.doFinishBacklog}>Finish backlog</button>
                            </Block>
                        </CardContent>
                    </Card>
                )}
            </LoadingState>
        </FlexibleBox>
    </Block>
)
