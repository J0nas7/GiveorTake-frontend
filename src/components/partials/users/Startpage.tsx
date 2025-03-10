"use client";

// External
import React, { useEffect } from "react";
import Link from "next/link";
import { faBuilding, faPlus, faUser } from "@fortawesome/free-solid-svg-icons";

// Internal
import { Block, FlexibleBox, Text } from "@/components";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { useOrganisationsContext } from "@/contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Startpage = () => {
    const authUser = useTypedSelector(selectAuthUser);
    const { organisationsById, readOrganisationsByUserId } = useOrganisationsContext();

    useEffect(() => {
        if (authUser && authUser.User_ID) readOrganisationsByUserId(authUser.User_ID);
        document.title = "Startside - GiveOrTake";
    }, [authUser]);

    return (
        <Block className="page-content">
            {/* Profile Link */}
            <Link href={`/profile`} className="blue-link">
                &laquo; Go to Profile Settings
            </Link>

            {/* Welcome Section */}
            <FlexibleBox
                title={`Hej ${authUser?.User_FirstName}`}
                titleAction={<>
                    <Block className="flex gap-3">
                        <Link href={`/organisation/create`} className="blue-link !inline-flex gap-2 items-center">
                            <FontAwesomeIcon icon={faBuilding} />
                            <Text variant="span">Create Organisation</Text>
                        </Link>
                    </Block>
                </>}
                icon={faUser}
                className="no-box w-auto"
            >
                <Block className="flex flex-col gap-3">
                    <Text className="text-lg font-semibold">
                        Din GiveOrTake-bruger har adgang til følgende organisationer:
                    </Text>

                    {/* Organisation List */}
                    <Block className="space-y-6">
                        {organisationsById?.length ? (
                            organisationsById.map((organisation) => (
                                <Block key={organisation.Organisation_ID} className="bg-white p-5 rounded-lg shadow-md">
                                    {/* Organisation Name */}
                                    <Link
                                        href={`/organisation/${organisation.Organisation_ID}`}
                                        className="blue-link-light"
                                    >
                                        <Text className="text-xl font-bold">{organisation.Organisation_Name}</Text>
                                    </Link>
                                    <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{
                                        __html: organisation.Organisation_Description || 'No description available'
                                    }} />

                                    {/* Teams & Projects */}
                                    {organisation.teams?.length ? (
                                        <Block className="mt-4">
                                            <Text className="font-semibold text-gray-700">Teams:</Text>
                                            <Block className="mt-2 space-y-3">
                                                {organisation.teams.map((team) => (
                                                    <Block key={team.Team_ID} className="p-4 border-l-4 border-blue-500 bg-gray-50 rounded-md">
                                                        {/* Team Name */}
                                                        <Link href={`/team/${team.Team_ID}`} className="blue-link-light">
                                                            <Text className="text-lg font-medium">{team.Team_Name}</Text>
                                                        </Link>
                                                        <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{
                                                            __html: team.Team_Description || 'No description available'
                                                        }} />

                                                        <Text className="mt-3 text-sm text-gray-600">{team.user_seats?.length} team members</Text>
                                                        
                                                        {/* Projects under the Team */}
                                                        {team.projects?.length ? (
                                                            <Block className="mt-2">
                                                                <Text className="text-sm font-semibold text-gray-700">Projekter:</Text>
                                                                <Block className="mt-2 space-y-2">
                                                                    {team.projects.map((project) => (
                                                                        <Link
                                                                            key={project.Project_ID}
                                                                            href={`/project/${project.Project_ID}`}
                                                                            className="block p-3 bg-white rounded-md shadow-sm blue-link w-full"
                                                                        >
                                                                            <Text className="text-blue-500 font-medium">{project.Project_Name}</Text>
                                                                            <div className="text-xs text-gray-500" dangerouslySetInnerHTML={{
                                                                                __html: project.Project_Description || 'No description available'
                                                                            }} />
                                                                        </Link>
                                                                    ))}
                                                                </Block>
                                                            </Block>
                                                        ) : (
                                                            <Text className="text-sm text-gray-500 mt-1">Ingen projekter tilgængelige.</Text>
                                                        )}
                                                    </Block>
                                                ))}
                                            </Block>
                                        </Block>
                                    ) : (
                                        <Text className="text-gray-500 mt-2">Ingen teams tilgængelige.</Text>
                                    )}
                                </Block>
                            ))
                        ) : (
                            <Text className="text-gray-500">Ingen organisationer fundet.</Text>
                        )}
                    </Block>
                </Block>
            </FlexibleBox>
        </Block>
    );
};
