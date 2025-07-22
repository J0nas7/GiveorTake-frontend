"use client";

// External
import { faBuilding, faHouseChimney, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect } from "react";

// Internal
import { Block, FlexibleBox, Text } from "@/components";
import { OrganisationItem } from '@/components/auth';
import { useOrganisationsContext } from "@/contexts";
import { LoadingState } from '@/core-ui/components/LoadingState';
import { selectAuthUser, useTypedSelector } from "@/redux";

export const StartView = () => {
    // Hooks
    const { organisationsById, readOrganisationsByUserId } = useOrganisationsContext();

    // State
    const authUser = useTypedSelector(selectAuthUser);

    // Effects
    useEffect(() => {
        if (authUser && authUser.User_ID) readOrganisationsByUserId(authUser.User_ID);
        document.title = "Welcome - GiveOrTake";
    }, [authUser]);

    return (
        <Block className="page-content">
            <FlexibleBox
                title={`Hej ${authUser?.User_FirstName}`}
                titleAction={<>
                    <Block className="flex gap-3 w-full">
                        <Link href={`/organisation/create`} className="blue-link !inline-flex gap-2 items-center">
                            <FontAwesomeIcon icon={faBuilding} />
                            <Text variant="span">Create Organisation</Text>
                        </Link>

                        {/* Profile Link */}
                        <Link href={`/profile`} className="blue-link sm:ml-auto !inline-flex gap-2 items-center">
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
                    <LoadingState singular='Organisation' renderItem={organisationsById} permitted={undefined}>
                        <Block className="space-y-6">
                            {organisationsById && organisationsById.length ? (
                                organisationsById.map((organisation) => (
                                    <OrganisationItem organisation={organisation} />
                                ))
                            ) : (
                                <i>Ingen organisationer</i>
                            )}
                        </Block>
                    </LoadingState>
                </Block>
            </FlexibleBox>
        </Block>
    );
};
