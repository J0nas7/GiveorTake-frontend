"use client"

import { Block, Text } from "@/components/ui/block-text"
import { faHouseChimney, faUsers } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import React from "react"

type OrganisationEditActionsProps = {
    organisationId?: number
    organisationName?: string
    canModify?: boolean
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const OrganisationEditActions: React.FC<OrganisationEditActionsProps> = ({
    organisationId,
    organisationName,
    canModify,
    convertID_NameStringToURLFormat,
}) => {
    if (!organisationId || !organisationName) return null

    return (
        <Block className="flex gap-3 w-full">
            {canModify && (
                <Link
                    href={`/organisation/${convertID_NameStringToURLFormat(organisationId, organisationName)}/create-team`}
                    className="blue-link !inline-flex gap-2 items-center"
                >
                    <FontAwesomeIcon icon={faUsers} />
                    <Text variant="span">Create Team</Text>
                </Link>
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
}
