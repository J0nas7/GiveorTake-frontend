"use client";

// External
import { faBuilding, faHouseChimney, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Internal
import { Block, FlexibleBox, Text } from "@/components";
import { useOrganisationsContext, useTeamUserSeatsContext } from "@/contexts";
import { useURLLink } from "@/hooks";
import { selectAuthUser, setSnackMessage, useAppDispatch, useTypedSelector } from "@/redux";
import { TeamUserSeat } from "@/types";

export const Startpage = () => {
    // Hooks
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { organisationsById, readOrganisationsByUserId } = useOrganisationsContext();
    const { saveTeamUserSeatChanges, removeTeamUserSeat } = useTeamUserSeatsContext()
    const { convertID_NameStringToURLFormat } = useURLLink("-")

    // State
    const authUser = useTypedSelector(selectAuthUser);

    // Methods
    const approvePending = async (mySeat: TeamUserSeat) => {
        mySeat.Seat_Status = "Active"; // Set the seat status to active
        const saveChanges = await saveTeamUserSeatChanges(mySeat, mySeat.Team_ID)

        dispatch(setSnackMessage(
            saveChanges ? "Seat approved successfully!" : "Failed to approve seat. Try again."
        ))

        router.push("/")
    }

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
                    <Block className="space-y-6">
                        {organisationsById?.length ? (
                            organisationsById.map((organisation) => {
                                const seat = organisation.teams && organisation.teams[0].user_seats?.find(seat => seat.User_ID === authUser?.User_ID)

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
                                                        </Block>
                                                    ))}
                                                </Block>
                                            </Block>
                                        ) : (
                                            <Text className="text-gray-500 mt-2">Ingen teams tilgængelige.</Text>
                                        )}
                                    </Block>
                                )
                            })
                        ) : (
                            <Text className="text-gray-500">Ingen organisationer fundet.</Text>
                        )}
                    </Block>
                </Block>
            </FlexibleBox>
        </Block>
    );
};
