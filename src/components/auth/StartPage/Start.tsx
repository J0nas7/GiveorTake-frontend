"use client";

// External
import { faBuilding, faHouseChimney, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";

// Internal
import { Block, FlexibleBox, Text } from "@/components";
import { OrganisationItem } from '@/components/auth';
import { LoadingState } from '@/core-ui/components/LoadingState';
import useRoleAccess from '@/hooks/useRoleAccess';
import { Organisation, User } from '@/types';

export type StartProps = {
    authUser: User | undefined
    organisationsById: false | Organisation[] | undefined
}

export const Start: React.FC<StartProps> = (props) => props.authUser && (
    <Block className="page-content">
        <FlexibleBox
            title={`Hej ${props.authUser?.User_FirstName}`}
            titleAction={<>
                <Block className="actions-wrapper">
                    {/* Create Organisation Link */}
                    <Link href={`/organisation/create`} className="blue-link action-button">
                        <FontAwesomeIcon icon={faBuilding} />
                        <Text variant="span">Create Organisation</Text>
                    </Link>

                    {/* Profile Link */}
                    <Link href={`/profile`} className="blue-link action-button button-right">
                        <FontAwesomeIcon icon={faUser} />
                        <Text variant="span">Go to Profile Settings</Text>
                    </Link>
                </Block>
            </>}
            icon={faHouseChimney}
            className="no-box w-auto"
        >
            <Block className="flex flex-col gap-3">
                <Text className="text-lg font-semibold">
                    Din GiveOrTake-bruger har adgang til følgende organisationer:
                </Text>

                {/* Organisation List */}
                <LoadingState singular='Organisation' renderItem={props.organisationsById} permitted={undefined}>
                    <Block className="space-y-6">
                        {props.organisationsById && props.organisationsById.length ? (
                            props.organisationsById.map((organisation) => {
                                const { canModifyOrganisationSettings } = useRoleAccess(organisation ? organisation.User_ID : undefined)

                                return (
                                    <OrganisationItem
                                        key={organisation.Organisation_ID}
                                        authUser={props.authUser}
                                        organisation={organisation}
                                        canModifyOrganisationSettings={canModifyOrganisationSettings}
                                    />
                                )
                            })
                        ) : (
                            <i>Ingen organisationer</i>
                        )}
                    </Block>
                </LoadingState>
            </Block>
        </FlexibleBox>
    </Block>
)
