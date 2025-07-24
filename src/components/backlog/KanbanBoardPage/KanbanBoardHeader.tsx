import { Block } from '@/components'
import { KanbanBoardProps, ProductBacklogNavigation } from '@/components/backlog'

type KanbanBoardHeaderProps = Pick<
    KanbanBoardProps,
    'renderBacklog' |
    'convertID_NameStringToURLFormat'
>

export const KanbanBoardHeader: React.FC<KanbanBoardHeaderProps> = (props) => props.renderBacklog && (
    <Block className="actions-wrapper w-auto ml-auto">
        <ProductBacklogNavigation
            focus="Kanban"
            renderBacklog={props.renderBacklog}
            convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
        />
    </Block>
)
