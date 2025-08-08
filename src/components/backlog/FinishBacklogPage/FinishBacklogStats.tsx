import { Block, Text } from "@/components"
import { FinishBacklogProps } from "@/components/backlog"
import React from 'react'

void React.createElement

export type FinishBacklogStatsProps = Pick<
    FinishBacklogProps,
    'tasksById' |
    'taskStatusCounter'
>

export const FinishBacklogStats: React.FC<FinishBacklogStatsProps> = (props) => (
    <>
        <Block className="font-semibold">
            {props.tasksById && props.tasksById.length || 0} tasks total in this backlog
        </Block>
        <Block className="flex gap-4">
            {props.taskStatusCounter?.map(({ name, counter }) => (
                <Text key={name}>
                    {counter?.length || 0} {name}
                </Text>
            ))}
        </Block>
    </>
)
