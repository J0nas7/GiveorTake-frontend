"use client"

// External
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Box, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import { TFunction } from 'next-i18next';
import Link from 'next/link';
import { useParams, useRouter } from "next/navigation";
import React, { KeyboardEvent, useEffect, useState } from 'react';

// Internal
import { Block } from '@/components';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { useAxios, useURLLink } from '@/hooks';
import { setSnackMessage, useAppDispatch } from '@/redux';
import { Role, TeamUserSeat, User } from '@/types';

export type InviteUserFormProps = {
    teamId: string
    t: TFunction
    rolesAndPermissionsByTeamId: Role[] | undefined
    displayInviteForm: string | undefined
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<false | TeamUserSeat>
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const InviteUserForm: React.FC<InviteUserFormProps> = (props) => {
    // Hooks
    const dispatch = useAppDispatch();
    const router = useRouter()
    const { httpPostWithData } = useAxios();
    const { teamLink } = useParams<{ teamLink: string }>() // Get teamLink from URL
    const { convertID_NameStringToURLFormat, linkName } = useURLLink(teamLink)

    // Internal variables
    const [email, setEmail] = useState("");
    const [user, setUser] = useState<User | undefined>(undefined);
    const [role, setRole] = useState<Role | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearchUser = async () => {
        if (!props.displayInviteForm) return

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(props.displayInviteForm)) {
            setError(props.t("team:rolesSeatsManager:invalidEmail"));
            return;
        }

        setLoading(true);
        setError(null);
        setUser(undefined);
        setRole(undefined);

        try {
            const postData = { email: props.displayInviteForm }
            const data = await httpPostWithData("users/userByEmail", postData);

            if (data.message) {
                throw new Error(props.t("team:rolesSeatsManager:userNotFound"));
            }

            setUser(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log(error || "An error occurred while searching for the user.");
                setError(error.message)
            } else {
                console.log("An unknown error occurred.");
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvite = async () => {
        if (!user) {
            setError(props.t("team:rolesSeatsManager:userNotFound"));
            return;
        }

        // Construct the new seat object
        const newSeat: TeamUserSeat = {
            Team_ID: parseInt(props.teamId),
            User_ID: user.User_ID ?? 0, // Use the found user's ID
            Role_ID: role?.Role_ID ?? 0, // Default role
            Seat_Status: "Pending", // Default status
        };

        try {
            // Send a request to create the new seat for the user
            await props.addTeamUserSeat(newSeat.Team_ID, newSeat);

            // Refresh seats list
            await props.readTeamUserSeatsByTeamId(parseInt(props.teamId))

            // Show success message
            dispatch(setSnackMessage(props.t("team:rolesSeatsManager:inviteSent")))

            setEmail("")
            setLoading(true);
            setError(null);
            setUser(undefined);
            setRole(undefined);

            props.setDisplayInviteForm(undefined)

            window.location.href =
                `/team/${convertID_NameStringToURLFormat(parseInt(props.teamId), linkName)}/roles-seats` // Forces a full page reload
        } catch (err) {
            console.error("Failed to create seat:", err);
            setError(props.t("team:rolesSeatsManager:createSeatError"));
        }
    };

    const ifEnter = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.code === 'Enter') {
            props.setDisplayInviteForm(email)
            handleSearchUser()
        }
    }

    useEffect(() => {
        if (props.displayInviteForm && props.displayInviteForm !== "new") {
            setEmail(props.displayInviteForm);
            handleSearchUser();
        }
    }, [props.displayInviteForm]);

    return (
        <FlexibleBox
            title={props.t("team:rolesSeatsManager:searchAndInviteUser")}
            icon={faUserPlus}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <Card className="shadow-lg rounded-lg mt-6">
                <CardContent className="p-4">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label={props.t("team:rolesSeatsManager:email")}
                                variant="outlined"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={ifEnter}
                                className="bg-white"
                            />
                        </Grid>
                    </Grid>

                    <Box mt={4} className="flex gap-4 items-center justify-end">
                        <Link
                            className="blue-link-light"
                            href="?"
                            onClick={() => {
                                props.setDisplayInviteForm("")
                                props.setSelectedSeat(undefined)
                            }}
                        >
                            Cancel
                        </Link>
                        <Link
                            href={`?seatId=${encodeURIComponent(email)}`}
                            className="button-blue px-6 py-2"
                        >
                            {props.t("team:rolesSeatsManager:searchUser")}
                        </Link>
                    </Box>

                    {error && <Typography color="error" mt={2}>{error}</Typography>}
                    {user && (
                        <Box mt={4}>
                            <Typography>{props.t("team:rolesSeatsManager:userFound")}</Typography>
                            <Block variant="span">
                                Name: {user.User_FirstName + " " + user.User_Surname}
                            </Block>
                            <Block className="w-full mt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Role
                                </label>
                                <select
                                    className="border rounded w-full p-2"
                                    value={role?.Role_ID}
                                    onChange={(e) =>
                                        setRole(props.rolesAndPermissionsByTeamId?.filter(role => role.Role_ID === parseInt(e.target.value))[0])
                                    }
                                >
                                    <option value="">-</option>
                                    {props.rolesAndPermissionsByTeamId?.map(role => (
                                        <option key={role.Role_ID} value={role.Role_ID}>{role.Role_Name}</option>
                                    ))}
                                </select>
                            </Block>
                        </Box>
                    )}
                    {role && (
                        <Box mt={4}>
                            <Typography>{props.t("team:rolesSeatsManager:selectedRole")}</Typography>
                            <Block>Name: {role.Role_Name}</Block>
                            <Block>Permissions: {role.permissions?.length}</Block>
                            <button
                                onClick={handleSendInvite}
                                className="button-blue mt-2 px-6 py-2"
                            >
                                {props.t("team:rolesSeatsManager:sendInvite")}
                            </button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </FlexibleBox>
    );
}
