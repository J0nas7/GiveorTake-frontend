import { Block } from "@/components"
import { DashboardProps, ProductBacklogNavigation } from "@/components/backlog"

type DashboardHeaderLinkProps = Pick<
    DashboardProps,
    'renderBacklog' | 'convertID_NameStringToURLFormat'
>

export const DashboardHeaderLink: React.FC<DashboardHeaderLinkProps> = (props) => props.renderBacklog && (
    <Block className="actions-wrapper w-auto ml-auto">
        <ProductBacklogNavigation
            focus="Dashboard"
            renderBacklog={props.renderBacklog}
            convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
        />
    </Block>
)
