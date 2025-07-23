"use client"

import { OrganisationProps } from '@/components/organisation'
import { Block, Text } from "@/components/ui/block-text"
import { faCheck, faHouseChimney, faPencil, faUsers } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import clsx from 'clsx'
import Link from "next/link"
import React from "react"

type OrganisationActionsProps = Pick<
    OrganisationProps,
    "renderOrganisation" |
    "canModifyOrganisationSettings" |
    "convertID_NameStringToURLFormat" |
    "handleSaveChanges" |
    "showEditToggles" |
    "setShowEditToggles"
>

export const OrganisationActions: React.FC<OrganisationActionsProps> = (props) => props.renderOrganisation && (
    <Block className="flex gap-3 w-full">
        {props.canModifyOrganisationSettings && (
            <>
                <Link
                    href={`/organisation/${props.renderOrganisation && props.convertID_NameStringToURLFormat(props.renderOrganisation.Organisation_ID ?? 0, props.renderOrganisation.Organisation_Name)}/create-team`}
                    className="blue-link !inline-flex gap-2 items-center"
                >
                    <FontAwesomeIcon icon={faUsers} />
                    <Text variant="span">Create Team</Text>
                </Link>
                <Text
                    variant="button"
                    className={clsx(
                        props.showEditToggles ? `button-blue` : `blue-link`,
                        `!inline-flex gap-2 items-center`
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
            href="/"
            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
        >
            <FontAwesomeIcon icon={faHouseChimney} />
            <Text variant="span">Go to Home</Text>
        </Link>
    </Block>
)
