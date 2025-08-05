import { Block } from '@/components'
import { KanbanBoardProps, ProjectBacklogNavigation } from '@/components/backlog'
import React from 'react'

void React.createElement

type KanbanBoardActionsProps = Pick<
    KanbanBoardProps,
    'renderBacklog' |
    'convertID_NameStringToURLFormat'
>

export const KanbanBoardActions: React.FC<KanbanBoardActionsProps> = (props) => props.renderBacklog && (
    <Block className="actions-wrapper w-auto ml-auto">
        <ProjectBacklogNavigation
            focus="Kanban"
            renderBacklog={props.renderBacklog}
            convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
        />
    </Block>
)
