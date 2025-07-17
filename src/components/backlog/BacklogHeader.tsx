import { Block, Text } from '@/components';
import { BacklogProps } from '@/components/backlog';
import { faCheckDouble, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

type BacklogHeaderProps = Pick<
    BacklogProps,
    'renderBacklog' |
    'setStatusUrlEditing' |
    'statusUrlEditing' |
    'convertID_NameStringToURLFormat'
>

export const BacklogHeader: React.FC<BacklogHeaderProps> = (props) => props.renderBacklog && (
    <Block className="flex gap-2 items-center w-full">
        <Text
            className="blue-link !inline-flex gap-2 items-center cursor-pointer"
            onClick={() => props.setStatusUrlEditing(!props.statusUrlEditing)}
        >
            <FontAwesomeIcon icon={faCheckDouble} />
            <Text variant="span">Filter Statuses</Text>
        </Text>
        <Link
            href={`/project/${props.convertID_NameStringToURLFormat(props.renderBacklog.Project_ID, props.renderBacklog.project?.Project_Name ?? "")}`}
            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
        >
            <FontAwesomeIcon icon={faLightbulb} />
            <Text variant="span">Go to Project</Text>
        </Link>
    </Block>
);
