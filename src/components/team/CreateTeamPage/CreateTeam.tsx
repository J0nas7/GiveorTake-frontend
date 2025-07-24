"use client"

import { faBuilding, faUsers } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import React from "react"

import { Block, FlexibleBox, Text } from "@/components"
import { CreateTeamForm } from "@/components/team"
import { LoadingState } from "@/core-ui/components/LoadingState"
import { OrganisationStates, Team, TeamFields } from "@/types"

export type CreateTeamProps = {
    organisationById: OrganisationStates
    canModifyOrganisationSettings: boolean | undefined
    newTeam: Team
    handleInputChange: (field: TeamFields, value: string) => void
    handleCreateTeam: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const CreateTeam: React.FC<CreateTeamProps> = (props) => (
    <Block className="page-content">
        <Block className="mb-8">
            <FlexibleBox
                title="Create New Team"
                titleAction={
                    props.organisationById && (
                        <Block className="actions-wrapper">
                            <Link
                                href={`/organisation/${props.convertID_NameStringToURLFormat(
                                    props.organisationById.Organisation_ID ?? 0,
                                    props.organisationById.Organisation_Name
                                )}`}
                                className="blue-link action-button button-right"
                            >
                                <FontAwesomeIcon icon={faBuilding} />
                                <Text variant="span">Go to Organisation</Text>
                            </Link>
                        </Block>
                    )
                }
                icon={faUsers}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <LoadingState
                    singular="Organisation"
                    renderItem={props.organisationById}
                    permitted={props.canModifyOrganisationSettings}
                >
                    <CreateTeamForm {...props} />
                </LoadingState>
            </FlexibleBox>
        </Block>
    </Block>
)
