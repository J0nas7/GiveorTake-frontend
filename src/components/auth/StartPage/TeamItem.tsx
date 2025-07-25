"use client";

// External
import Link from "next/link";

// Internal
import { Block, Text } from "@/components";
import { useURLLink } from "@/hooks";
import useRoleAccess from '@/hooks/useRoleAccess';
import { selectAuthUser, useTypedSelector } from '@/redux';
import { Team } from "@/types";
import React from 'react';

type TeamItemProps = {
    team: Team
    ownerId: number
}

export const TeamItem: React.FC<TeamItemProps> = ({
    team,
    ownerId
}) => {
    const { canModifyTeamSettings } = useRoleAccess(ownerId)
    const { convertID_NameStringToURLFormat } = useURLLink("-")
    const authUser = useTypedSelector(selectAuthUser)

    return (
        <Block key={team.Team_ID} className="p-4 border-l-4 border-blue-500 bg-gray-50 rounded-md">
            {/* Team Name */}
            <Link href={`/team/${convertID_NameStringToURLFormat(team.Team_ID ?? 0, team.Team_Name)}`} className="blue-link-light">
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
                                href={`/backlogs/${convertID_NameStringToURLFormat(project.Project_ID ?? 0, project.Project_Name)}`}
                                className="p-3 bg-white rounded-md shadow-sm blue-link inline-block w-full sm:w-1/4"
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
            {canModifyTeamSettings && (
                <Link
                    className="blue-link-light mt-3"
                    href={`/team/${convertID_NameStringToURLFormat(team.Team_ID ?? 0, team.Team_Name)}/create-project`}
                >
                    <small>Create Project</small>
                </Link>
            )}
        </Block>
    )
}
