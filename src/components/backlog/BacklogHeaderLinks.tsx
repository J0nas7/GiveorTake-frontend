"use client"

import { Block, Text } from '@/components';
import { BacklogEditProps } from '@/components/backlog';
import { faLightbulb, faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

export const BacklogHeaderLinks: React.FC<BacklogEditProps> = (props) => props.localBacklog && (
    <Block className="flex gap-2 ml-auto">
        <Link
            href={`/backlog/${props.convertID_NameStringToURLFormat(props.localBacklog.Backlog_ID ?? 0, props.localBacklog.Backlog_Name)}`}
            className="blue-link !inline-flex gap-2 items-center"
        >
            <FontAwesomeIcon icon={faList} />
            <Text variant="span">Go to Backlog</Text>
        </Link>
        <Link
            href={`/project/${props.convertID_NameStringToURLFormat(props.localBacklog?.Project_ID ?? 0, props.localBacklog.project?.Project_Name ?? "")}`}
            className="blue-link !inline-flex gap-2 items-center"
        >
            <FontAwesomeIcon icon={faLightbulb} />
            <Text variant="span">Go to Project</Text>
        </Link>
    </Block>
);
