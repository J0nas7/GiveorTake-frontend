"use client";

// External
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from 'react';

// Internal
import { Block, Text } from "@/components";
import { TeamItem } from '@/components/auth';
import { useTeamUserSeatsContext } from "@/contexts";
import { useURLLink } from "@/hooks";
import useRoleAccess from '@/hooks/useRoleAccess';
import { selectAuthUser, setSnackMessage, useAppDispatch, useTypedSelector } from "@/redux";
import { Organisation, TeamUserSeat } from "@/types";

type OrganisationItemProps = {
    organisation: Organisation
}

export const OrganisationItem: React.FC<OrganisationItemProps> = ({
    organisation
}) => {
    // Hooks
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { canModifyOrganisationSettings } = useRoleAccess(organisation ? organisation.User_ID : undefined)
    const { saveTeamUserSeatChanges, removeTeamUserSeat } = useTeamUserSeatsContext()
    const { convertID_NameStringToURLFormat } = useURLLink("-")

    // State
    const authUser = useTypedSelector(selectAuthUser)

    // Methods
    const approvePending = async (mySeat: TeamUserSeat) => {
        mySeat.Seat_Status = "Active"; // Set the seat status to active
        const saveChanges = await saveTeamUserSeatChanges(mySeat, mySeat.Team_ID)

        dispatch(setSnackMessage(
            saveChanges ? "Seat approved successfully!" : "Failed to approve seat. Try again."
        ))

        router.push("/")
    }

    let seat = null;
    if (organisation.teams && organisation.teams?.length > 0) {
        seat = organisation.teams[0]?.user_seats?.find(
            seat => seat.User_ID === authUser?.User_ID
        );
    }

    if (seat?.Seat_Status === "Inactive") return null; // Skip inactive seats

    if (seat && seat?.Seat_Status === "Pending") {
        return (
            <Block key={organisation.Organisation_ID} className="bg-yellow-100 p-5 rounded-lg shadow-md">
                <Text className="text-xl font-bold text-yellow-800">{organisation.Organisation_Name}</Text>
                <Text className="text-sm text-yellow-700">Your access is pending your approval.</Text>
                <Block className="mt-2 flex gap-2 items-center">
                    <button
                        className="blue-link"
                        onClick={() => approvePending(seat)}
                    >
                        Approve
                    </button>
                    <button
                        className="blue-link-light red-link-light"
                        onClick={() => removeTeamUserSeat(
                            seat.Seat_ID ?? 0,
                            seat.Team_ID,
                            undefined
                        )}
                    >
                        Decline
                    </button>
                </Block>
            </Block>
        );
    }

    return (
        <Block key={organisation.Organisation_ID} className="bg-white p-5 rounded-lg shadow-md">
            {/* Organisation Name */}
            <Link
                href={`/organisation/${convertID_NameStringToURLFormat(organisation.Organisation_ID ?? 0, organisation.Organisation_Name)}`}
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
                            <TeamItem team={team} ownerId={organisation.User_ID} />
                        ))}
                    </Block>
                </Block>
            ) : (
                <Text className="text-gray-500 mt-2">Ingen teams tilgængelige.</Text>
            )}
            {canModifyOrganisationSettings && (
                <Link
                    className="blue-link-light mt-3"
                    href={`/organisation/${convertID_NameStringToURLFormat(organisation.Organisation_ID ?? 0, organisation.Organisation_Name)}/create-team`}
                >
                    <small>Create Team</small>
                </Link>
            )}
        </Block>
    )
}
