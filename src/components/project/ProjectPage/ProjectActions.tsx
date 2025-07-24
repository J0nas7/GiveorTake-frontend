"use client"

// External
import { faCheck, faList, faPencil, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react';

// Internal
import { Block, Text } from '@/components';
import { ProjectProps } from '@/components/project';
import clsx from 'clsx';

type ProjectActionsProps = Pick<
    ProjectProps,
    "renderProject" |
    "canManageProject" |
    "convertID_NameStringToURLFormat" |
    "showEditToggles" |
    "setShowEditToggles" |
    "handleSaveChanges"
>

export const ProjectActions: React.FC<ProjectActionsProps> = (props) => props.renderProject && (
    <Block className="actions-wrapper">
        {props.canManageProject && (
            <>
                <Link
                    href={`/project/${props.convertID_NameStringToURLFormat(props.renderProject?.Project_ID ?? 0, props.renderProject.Project_Name)}/create-backlog`}
                    className="blue-link action-button"
                >
                    <FontAwesomeIcon icon={faList} />
                    <Text variant="span">Create Backlog</Text>
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
        <Link
            href={`/team/${props.convertID_NameStringToURLFormat(props.renderProject?.team?.Team_ID ?? 0, props.renderProject.team?.Team_Name ?? "")}`}
            className="blue-link action-button button-right"
        >
            <FontAwesomeIcon icon={faUsers} />
            <Text variant="span">Go to Team</Text>
        </Link>
    </Block>
)
