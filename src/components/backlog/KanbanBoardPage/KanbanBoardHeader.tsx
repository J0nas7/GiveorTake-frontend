import { Block } from '@/components'
import { KanbanBoardProps, ProjectBacklogNavigation } from '@/components/backlog'

type KanbanBoardHeaderProps = Pick<
    KanbanBoardProps,
    'renderBacklog' |
    'convertID_NameStringToURLFormat'
>

export const KanbanBoardHeader: React.FC<KanbanBoardHeaderProps> = (props) => props.renderBacklog && (
    <Block className="actions-wrapper w-auto ml-auto">
        <ProjectBacklogNavigation
            focus="Kanban"
            renderBacklog={props.renderBacklog}
            convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
        />
    </Block>
)
