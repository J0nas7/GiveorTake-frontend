import { Block, Text } from "@/components"
import { FinishBacklogProps } from "@/components/backlog"
import { faLightbulb } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import React from 'react'

void React.createElement

type FinishBacklogHeaderLinkProps = Pick<
    FinishBacklogProps,
    'renderBacklog' |
    'convertID_NameStringToURLFormat'
>

export const FinishBacklogHeaderLink: React.FC<FinishBacklogHeaderLinkProps> = (props) => props.renderBacklog && (
    <Block className="actions-wrapper">
        <Link
            href={`/project/${props.convertID_NameStringToURLFormat(props.renderBacklog.Project_ID ?? 0, props.renderBacklog.project?.Project_Name ?? '')}`}
            className="blue-link action-button button-right"
        >
            <FontAwesomeIcon icon={faLightbulb} />
            <Text variant="span">Go to Project</Text>
        </Link>
    </Block>
)
