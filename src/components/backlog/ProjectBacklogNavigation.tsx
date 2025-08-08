import { Text } from '@/components'
import { Backlog, BacklogStates } from '@/types'
import { faGauge, faLightbulb, faList, faWindowRestore } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'

type ProjectBacklogNavigationProps = {
    focus: string
    renderBacklog: BacklogStates | Backlog
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

const links = [
    {
        link: "backlog",
        focus: "Backlog",
        icon: faList
    },
    {
        link: "kanban",
        focus: "Kanban",
        icon: faWindowRestore
    },
    {
        link: "dashboard",
        focus: "Dashboard",
        icon: faGauge
    },
]

export const ProjectBacklogNavigation: React.FC<ProjectBacklogNavigationProps> = (props) => props.renderBacklog && (
    <>
        {links.map((link) => props.renderBacklog && (
            <Link
                key={link.link}
                href={`/${link.link}/${(props.convertID_NameStringToURLFormat(
                    props.renderBacklog.Backlog_ID ?? 0, props.renderBacklog.Backlog_Name
                )) || props.renderBacklog.Backlog_ID}`}
                className={clsx(
                    props.focus == link.focus ? "button-blue" : "blue-link",
                    "action-button button-right"
                )}
            >
                <FontAwesomeIcon icon={link.icon} />
            </Link>
        ))}

        <Link
            href={`/project/${props.convertID_NameStringToURLFormat(props.renderBacklog.Project_ID, props.renderBacklog.project?.Project_Name ?? "")}`}
            className="blue-link action-button button-right"
        >
            <FontAwesomeIcon icon={faLightbulb} />
            <Text variant="span">Go to Project</Text>
        </Link>

        <Link
            href={`/backlogs/${props.convertID_NameStringToURLFormat(props.renderBacklog.Project_ID, props.renderBacklog.project?.Project_Name ?? "")}`}
            className="blue-link action-button button-right"
        >
            <FontAwesomeIcon icon={faList} />
            <Text variant="span">Backlogs and Tasks</Text>
        </Link>
    </>
)
