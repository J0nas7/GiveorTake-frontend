import { Text } from "@/components"
import { DashboardProps } from "@/components/backlog"
import { faLightbulb } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"

type DashboardHeaderLinkProps = Pick<
    DashboardProps,
    'renderBacklog' | 'convertID_NameStringToURLFormat'
>

export const DashboardHeaderLink: React.FC<DashboardHeaderLinkProps> = (props) =>
    props.renderBacklog ? (
        <Link
            href={`/project/${props.convertID_NameStringToURLFormat(
                props.renderBacklog.Project_ID,
                props.renderBacklog.project?.Project_Name ?? ""
            )}`}
            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
        >
            <FontAwesomeIcon icon={faLightbulb} />
            <Text variant="span">Go to Project</Text>
        </Link>
    ) : null
