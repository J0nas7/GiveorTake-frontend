import { Block } from "@/components"
import { DashboardProps, ProjectBacklogNavigation } from "@/components/backlog"

type DashboardActionsProps = Pick<
    DashboardProps,
    'renderBacklog' |
    'convertID_NameStringToURLFormat'
>

export const DashboardActions: React.FC<DashboardActionsProps> = (props) => props.renderBacklog && (
    <Block className="actions-wrapper w-auto ml-auto">
        <ProjectBacklogNavigation
            focus="Dashboard"
            renderBacklog={props.renderBacklog}
            convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
        />
    </Block>
)
