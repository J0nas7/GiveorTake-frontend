import { Block } from '@/components'
import { KanbanBoardActions, KanbanBoardProps } from '@/components/backlog'
import { FlexibleBox } from '@/components/ui/flexible-box'
import { LoadingState } from '@/core-ui/components/LoadingState'
import styles from "@/core-ui/styles/modules/KanbanBoard.module.scss"
import { faWindowRestore } from '@fortawesome/free-solid-svg-icons'
import React from 'react'

void React.createElement

type KanbanBoardContentProps = Pick<
    KanbanBoardProps,
    'renderBacklog' |
    'canAccessBacklog'
> & {
    children: React.ReactNode
}

export const KanbanBoardContent: React.FC<KanbanBoardContentProps> = (props) => props.renderBacklog && (
    <FlexibleBox
        title="Kanban Board"
        subtitle={props.renderBacklog.Backlog_Name}
        titleAction={
            <KanbanBoardActions renderBacklog={props.renderBacklog} convertID_NameStringToURLFormat={() => ''} />
        }
        icon={faWindowRestore}
        className="no-box w-auto inline-block"
        numberOfColumns={2}
    >
        <LoadingState
            singular="Backlog"
            renderItem={props.renderBacklog}
            permitted={props.canAccessBacklog}
        >
            <Block className={styles.board}>{props.children}</Block>
        </LoadingState>
    </FlexibleBox>
)
