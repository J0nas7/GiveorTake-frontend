import { Text } from "@/components"
import { FinishBacklogProps } from "@/components/backlog"
import { faLightbulb } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"

type FinishBacklogHeaderLinkProps = Pick<
    FinishBacklogProps,
    'renderBacklog'
>

export const FinishBacklogHeaderLink: React.FC<FinishBacklogHeaderLinkProps> = (props) => props.renderBacklog && (
    <Link
        href={`/project/${props.renderBacklog.Project_ID}`}
        className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
    >
        <FontAwesomeIcon icon={faLightbulb} />
        <Text variant="span">Go to Project</Text>
    </Link>
)
