"use client"

// External
import { faBuilding, faCheck, faLightbulb, faPencil, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'

// Internal
import { Block, Text } from '@/components'
import { TeamProps } from '@/components/team'

type TeamActionsProps = Pick<
    TeamProps,
    "renderTeam" |
    "canManageTeamMembers" |
    "pathname" |
    "canModifyTeamSettings" |
    "convertID_NameStringToURLFormat" |
    "showEditToggles" |
    "setShowEditToggles" |
    "handleSaveChanges"
>

export const TeamActions: React.FC<TeamActionsProps> = (props) => props.renderTeam && (
    <Block className="actions-wrapper">
        {props.canModifyTeamSettings && (
            <>
                <Link
                    href={`${props.pathname}/create-project`}
                    className="blue-link action-button"
                >
                    <FontAwesomeIcon icon={faLightbulb} />
                    <Text variant="span">Create Project</Text>
                </Link>
                <Text
                    variant="button"
                    className={clsx(
                        props.showEditToggles ? `button-blue` : `blue-link`,
                        `action-button`
                    )}
                    onClick={() => {
                        if (props.showEditToggles) props.handleSaveChanges()

                        props.setShowEditToggles(!props.showEditToggles)
                    }}
                >
                    <FontAwesomeIcon icon={
                        props.showEditToggles ? faCheck : faPencil
                    } />
                </Text>
            </>
        )}
        {props.canManageTeamMembers && (
            <Link
                href={`${props.pathname}/roles-seats`}
                className="blue-link action-button"
            >
                <FontAwesomeIcon icon={faUsers} />
                <Text variant="span">Roles & Seats</Text>
            </Link>
        )}

        <Link
            href={`/organisation/${props.convertID_NameStringToURLFormat(props.renderTeam.organisation?.Organisation_ID ?? 0, props.renderTeam.organisation?.Organisation_Name ?? "")}`}
            className="blue-link action-button button-right"
        >
            <FontAwesomeIcon icon={faBuilding} />
            <Text variant="span">Go to Organisation</Text>
        </Link>
    </Block>
)
