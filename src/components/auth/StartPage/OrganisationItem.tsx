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
import { setSnackMessage, useAppDispatch } from "@/redux";
import { Organisation, TeamUserSeat, User } from "@/types";

type OrganisationItemProps = {
    authUser: User | undefined
    organisation: Organisation
    canModifyOrganisationSettings: boolean | undefined
}

export const OrganisationItem: React.FC<OrganisationItemProps> = (props) => {
    // Hooks
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { saveTeamUserSeatChanges, removeTeamUserSeat } = useTeamUserSeatsContext()
    const { convertID_NameStringToURLFormat } = useURLLink("-")

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
    if (props.organisation.teams && props.organisation.teams?.length > 0) {
        seat = props.organisation.teams[0]?.user_seats?.find(
            seat => seat.User_ID === props.authUser?.User_ID
        );
    }

    if (seat?.Seat_Status === "Inactive") return null; // Skip inactive seats

    if (seat && seat?.Seat_Status === "Pending") {
        return (
            <Block key={props.organisation.Organisation_ID} className="bg-yellow-100 p-5 rounded-lg shadow-md">
                <Text className="text-xl font-bold text-yellow-800">{props.organisation.Organisation_Name}</Text>
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
        <Block key={props.organisation.Organisation_ID} className="bg-white p-5 rounded-lg shadow-md">
            {/* Organisation Name */}
            <Link
                href={`/organisation/${convertID_NameStringToURLFormat(props.organisation.Organisation_ID ?? 0, props.organisation.Organisation_Name)}`}
                className="blue-link-light"
            >
                <Text className="text-xl font-bold">{props.organisation.Organisation_Name}</Text>
            </Link>
            <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{
                __html: props.organisation.Organisation_Description || 'No description available'
            }} />

            {/* Teams & Projects */}
            {props.organisation.teams?.length ? (
                <Block className="mt-4">
                    <Text className="font-semibold text-gray-700">Teams:</Text>
                    <Block className="mt-2 space-y-3">
                        {props.organisation.teams.map((team) => (
                            <TeamItem
                                key={team.Team_ID}
                                team={team}
                                ownerId={props.organisation.User_ID}
                            />
                        ))}
                    </Block>
                </Block>
            ) : (
                <Text className="text-gray-500 mt-2">Ingen teams tilgængelige.</Text>
            )}
            {props.canModifyOrganisationSettings && (
                <Link
                    className="blue-link-light mt-3"
                    href={`/organisation/${convertID_NameStringToURLFormat(props.organisation.Organisation_ID ?? 0, props.organisation.Organisation_Name)}/create-team`}
                >
                    <small>Create Team</small>
                </Link>
            )}
        </Block>
    )
}
