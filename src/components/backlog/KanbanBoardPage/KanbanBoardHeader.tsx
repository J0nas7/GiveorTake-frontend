import { Block, Text } from '@/components'
import { KanbanBoardProps } from '@/components/backlog'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'

type KanbanBoardHeaderProps = Pick<
    KanbanBoardProps,
    'renderBacklog' |
    'convertID_NameStringToURLFormat'
>

export const KanbanBoardHeader: React.FC<KanbanBoardHeaderProps> = (props) => props.renderBacklog && (
    <Block className="flex gap-2 items-center w-full">
        <Link
            href={`/project/${props.convertID_NameStringToURLFormat(
                props.renderBacklog.Project_ID,
                props.renderBacklog.project?.Project_Name ?? ''
            )}`}
            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
        >
            <FontAwesomeIcon icon={faLightbulb} />
            <Text variant="span">Go to Project</Text>
        </Link>
    </Block>
)
