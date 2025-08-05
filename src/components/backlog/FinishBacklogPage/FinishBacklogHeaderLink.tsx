import { Block, Text } from "@/components"
import { FinishBacklogProps } from "@/components/backlog"
import { faLightbulb } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import React from 'react'

void React.createElement

type FinishBacklogHeaderLinkProps = Pick<
    FinishBacklogProps,
    'renderBacklog'
>

export const FinishBacklogHeaderLink: React.FC<FinishBacklogHeaderLinkProps> = (props) => props.renderBacklog && (
    <Block className="actions-wrapper">
        <Link
            href={`/project/${props.renderBacklog.Project_ID}`}
            className="blue-link action-button button-right"
        >
            <FontAwesomeIcon icon={faLightbulb} />
            <Text variant="span">Go to Project</Text>
        </Link>
    </Block>
)
