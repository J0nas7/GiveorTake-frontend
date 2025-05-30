"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TextField, Card, CardContent, Typography, Grid, Box, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'next-i18next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChair, faPlus, faUser, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';

// Internal
import { useTeamsContext, useTeamUserSeatsContext, useUsersContext } from '@/contexts';
import { Backlog, Project, Team, TeamStates, TeamUserSeat, TeamUserSeatFields, User } from '@/types';
import { Block, Heading, Text } from '@/components';
import { selectAuthUser, selectAuthUserSeatPermissions, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux';
import { useAxios, useURLLink } from '@/hooks';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { LoadingState } from '@/core-ui/components/LoadingState';
import useRoleAccess from '@/hooks/useRoleAccess';

const TeamUserSeatsManager: React.FC = () => {
    // ---- Hooks ----
    const router = useRouter()
    const dispatch = useAppDispatch()
    const searchParams = useSearchParams()
    const { t } = useTranslation(['team'])
    const {
        teamUserSeatsById,
        readTeamUserSeatsByTeamId,
        addTeamUserSeat,
        saveTeamUserSeatChanges,
        removeTeamUserSeat
    } = useTeamUserSeatsContext();
    const { teamById, readTeamById } = useTeamsContext();
    const { addUser } = useUsersContext(); // Assuming you have a `UsersContext` for adding new users
    const { teamLink } = useParams<{ teamLink: string }>() // Get teamLink from URL
    const { linkId: teamId, convertID_NameStringToURLFormat } = useURLLink(teamLink)
    const { canManageTeamMembers } = useRoleAccess(teamById ? teamById.organisation?.User_ID : undefined)

    // ---- State ----
    const urlSeatId = searchParams.get("seatId")
    const authUser = useTypedSelector(selectAuthUser); // Redux
    const [renderUserSeats, setRenderUserSeats] = useState<TeamUserSeat[]>([]);
    const [renderTeam, setRenderTeam] = useState<TeamStates>(undefined)
    const [selectedSeat, setSelectedSeat] = useState<TeamUserSeat | undefined>(undefined);
    const [displayInviteForm, setDisplayInviteForm] = useState<boolean>(false);
    const availablePermissions = ["Modify Organisation Settings", "Modify Team Settings", "Manage Team Members"]
    // New User Form State
    const [newUserDetails, setNewUserDetails] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role: 'user', // default role
        status: 'active', // default status
    });

    // ---- Methods ----
    // Handles saving changes made to the selected seat
    const handleSaveChanges = async () => {
        if (selectedSeat) {
            const saveChanges = await saveTeamUserSeatChanges(selectedSeat, parseInt(teamId))

            dispatch(setSnackMessage(
                saveChanges ? "Seat changes saved successfully!" : "Failed to save seat changes."
            ))
        }
    };

    // Handles the removal of a team user seat.
    const handleRemoveSeat = (seatId: number) => removeTeamUserSeat(seatId, parseInt(teamId), "/team/" + teamId + "/seats");

    // Handles changes to a specific field of the selected team user seat.
    const handleSeatChange = (field: TeamUserSeatFields, value: string) => {
        if (selectedSeat) {
            setSelectedSeat((prevSeat) => ({
                ...prevSeat!,
                [field]: value,
            }));
        }
    };

    // Handles the selection of a team user seat and updates the URL with the selected seat's ID.
    const handleSelectSeat = (seat: TeamUserSeat) => {
        if (!seat.Seat_ID) return

        const url = new URL(window.location.href)
        url.searchParams.set("seatId", seat.Seat_ID.toString())

        router.push(url.toString(), { scroll: false }); // Prevent full page reload
    };

    // Updates the state for new user details based on input changes.
    const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUserDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    // Handles the creation of a new user and assigns a seat to the team.
    const handleCreateNewUser = async () => {
        const { email, firstName, lastName, role, status } = newUserDetails;
        if (!email || !firstName || !lastName) {
            alert(t('team:seatsManager:pleaseFillInAllFields'));
            return;
        }

        // Add new user
        const newUser: User = {
            User_Email: email,
            User_FirstName: firstName,
            User_Surname: lastName,
            User_Status: status,
            User_CreatedAt: new Date().toISOString(),
        };
        await addUser(parseInt(teamId), newUser);

        // After user is created, add the seat for the user
        // Assuming you have a method to create a seat for the user
        const newSeat: TeamUserSeat = {
            Seat_Role: role,
            Seat_Status: status,
            Team_ID: parseInt(teamId),
        };
        await saveTeamUserSeatChanges(newSeat, parseInt(teamId));
    };

    // Toggles a permission for the selected seat by adding or removing it from the permissions list.
    const togglePermission = (permission: string, isChecked: boolean) => {
        setSelectedSeat((prevSeat) => {
            if (!prevSeat) return prevSeat;

            const updatedPermissions = isChecked
                ? [
                    ...(Array.isArray(prevSeat.Seat_Permissions)
                        ? prevSeat.Seat_Permissions
                        : JSON.parse(prevSeat.Seat_Permissions || "[]")), // Parse JSON if it's a string
                    permission
                ]
                : (
                    (Array.isArray(prevSeat.Seat_Permissions)
                        ? prevSeat.Seat_Permissions
                        : JSON.parse(prevSeat.Seat_Permissions || "[]"))
                ).filter((perm: string) => perm !== permission);

            return { ...prevSeat, Seat_Permissions: JSON.stringify(updatedPermissions) };
        });
    };

    // ---- Effects ----
    useEffect(() => {
        if (teamId) {
            readTeamById(parseInt(teamId))
            readTeamUserSeatsByTeamId(parseInt(teamId));
        }
    }, [teamId]);

    useEffect(() => {
        setRenderUserSeats(teamUserSeatsById);
        setRenderTeam(teamById)
    }, [teamUserSeatsById, teamById]);

    // Handle URL seatId changes and update the state accordingly
    useEffect(() => {
        if (!renderTeam) return

        if (urlSeatId && authUser && canManageTeamMembers === false) {
            router.push(`/team/${convertID_NameStringToURLFormat(renderTeam?.Team_ID ?? 0, renderTeam.Team_Name)}/seats`)
            return
        }

        if (urlSeatId === "new") {
            setDisplayInviteForm(true)
            setSelectedSeat(undefined)
        } else if (urlSeatId && renderUserSeats.length) {
            const seat = renderUserSeats.find(seat => seat.Seat_ID === parseInt(urlSeatId))
            setDisplayInviteForm(false)
            setSelectedSeat(seat)
        }
    }, [urlSeatId, renderUserSeats])

    // ---- Render ----
    return (
        <TeamUserSeatsView
            renderUserSeats={renderUserSeats}
            renderTeam={renderTeam}
            authUser={authUser}
            selectedSeat={selectedSeat}
            displayInviteForm={displayInviteForm}
            newUserDetails={newUserDetails}
            teamId={teamId}
            t={t}
            availablePermissions={availablePermissions}
            canManageTeamMembers={canManageTeamMembers}
            addTeamUserSeat={addTeamUserSeat}
            readTeamUserSeatsByTeamId={readTeamUserSeatsByTeamId}
            handleSelectSeat={handleSelectSeat}
            handleRemoveSeat={handleRemoveSeat}
            handleSaveChanges={handleSaveChanges}
            handleSeatChange={handleSeatChange}
            handleUserInputChange={handleUserInputChange}
            handleCreateNewUser={handleCreateNewUser}
            setNewUserDetails={setNewUserDetails}
            setSelectedSeat={setSelectedSeat}
            setDisplayInviteForm={setDisplayInviteForm}
            togglePermission={togglePermission}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    );
};

export interface TeamUserSeatsViewProps {
    renderUserSeats: TeamUserSeat[];
    renderTeam: TeamStates;
    authUser: User | undefined;
    selectedSeat: TeamUserSeat | undefined;
    displayInviteForm: boolean | undefined
    newUserDetails: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
    };
    teamId: string
    t: TFunction
    availablePermissions: string[]
    canManageTeamMembers: boolean | undefined
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    handleSelectSeat: (seat: TeamUserSeat) => void;
    handleRemoveSeat: (seatId: number) => void;
    handleSaveChanges: () => void;
    handleSeatChange: (field: TeamUserSeatFields, value: string) => void;
    handleUserInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCreateNewUser: () => void;
    setNewUserDetails: (value: React.SetStateAction<{
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
    }>) => void
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<boolean>>
    togglePermission: (permission: string, isChecked: boolean) => void
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const TeamUserSeatsView: React.FC<TeamUserSeatsViewProps> = ({
    renderUserSeats,
    renderTeam,
    authUser,
    selectedSeat,
    displayInviteForm,
    newUserDetails,
    teamId,
    t,
    availablePermissions,
    canManageTeamMembers,
    addTeamUserSeat,
    readTeamUserSeatsByTeamId,
    handleSelectSeat,
    handleRemoveSeat,
    handleSaveChanges,
    handleSeatChange,
    handleUserInputChange,
    handleCreateNewUser,
    setNewUserDetails,
    setSelectedSeat,
    setDisplayInviteForm,
    togglePermission,
    convertID_NameStringToURLFormat
}) => (
    <Block className="page-content">
        <FlexibleBox
            title={t('team:seatsManager:manageTeamUserSeats')}
            subtitle={renderTeam ? renderTeam.Team_Name : undefined}
            titleAction={
                renderTeam && (
                    <Block className="flex gap-2 items-center w-full">
                        {/* New Invite Link */}
                        {canManageTeamMembers && (
                            <Link
                                className="blue-link !inline-flex gap-2 items-center"
                                href="?seatId=new"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <Text variant="span">New Invite</Text>
                            </Link>
                        )}

                        <Link
                            href={`/team/${convertID_NameStringToURLFormat(renderTeam.Team_ID ?? 0, renderTeam.Team_Name)}`}
                            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faUsers} />
                            <Text variant="span">Go to Team</Text>
                        </Link>
                    </Block>
                )
            }
            icon={faChair}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <LoadingState singular="Team" renderItem={renderTeam} permitted={canManageTeamMembers}>
                {renderTeam && (
                    <Card className="shadow-lg rounded-lg mb-4">
                        <CardContent>
                            {!renderUserSeats.length && authUser && renderTeam?.organisation?.User_ID === authUser.User_ID ? (
                                <Block>{t('team:seatsManager:length0_iamowner')}</Block>
                            ) : (
                                <Grid container spacing={3}>
                                    {Array.isArray(renderUserSeats) && renderUserSeats.map((seat) => (
                                        <Grid item xs={12} sm={6} md={4} key={seat.Seat_ID}>
                                            <Card className="border border-gray-300 rounded-lg hover:shadow-xl transition-all">
                                                <CardContent className="p-4">
                                                    <Block variant="span" className="flex flex-col gap-3">
                                                        <Typography variant="h6" className="font-semibold text-lg">
                                                            {seat.user?.User_FirstName} {seat.user?.User_Surname}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {t('team:seatsManager:role')}: {seat.Seat_Role}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {t('team:seatsManager:status')}: {seat.Seat_Status}
                                                        </Typography>

                                                        {canManageTeamMembers && (
                                                            <div className="flex justify-between mt-4">
                                                                <button
                                                                    onClick={() => handleSelectSeat(seat)}
                                                                    className="blue-link w-[48%]"
                                                                >
                                                                    {t('team:seatsManager:edit')}
                                                                </button>
                                                                <button
                                                                    onClick={() => seat.Seat_ID && handleRemoveSeat(seat.Seat_ID)}
                                                                    className="blue-link w-[48%]"
                                                                >
                                                                    {t('team:seatsManager:remove')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Block>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                )}
            </LoadingState>
        </FlexibleBox>

        {canManageTeamMembers && (
            <>
                {renderTeam && selectedSeat ? (
                    <FlexibleBox
                        title={t('team:seatsManager:editUserSeat')}
                        subtitle={`${selectedSeat.user?.User_FirstName} ${selectedSeat.user?.User_Surname}`}
                        icon={faUser}
                        className="no-box w-auto inline-block"
                        numberOfColumns={2}
                    >
                        <Card className="shadow-lg rounded-lg mt-4">
                            <CardContent className="p-4">
                                <Grid container spacing={3}>
                                    {/* Role Input */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label={t('team:seatsManager:userRole')}
                                            variant="outlined"
                                            fullWidth
                                            value={selectedSeat.Seat_Role}
                                            onChange={(e) => handleSeatChange('Seat_Role', e.target.value)}
                                            className="bg-white"
                                        />
                                    </Grid>

                                    {/* Status Dropdown */}
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>{t('team:seatsManager:status')}</InputLabel>
                                            <Select
                                                value={selectedSeat.Seat_Status}
                                                onChange={(e) => handleSeatChange('Seat_Status', e.target.value)}
                                                className="bg-white"
                                            >
                                                <MenuItem value="Active">{t('team:seatsManager:active')}</MenuItem>
                                                <MenuItem value="Inactive">{t('team:seatsManager:inactive')}</MenuItem>
                                                <MenuItem value="Pending">{t('team:seatsManager:pending')}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                {/* Permissions Section */}
                                <Box mt={4}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        {t('team:seatsManager:permissions')}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {availablePermissions.map((permission) => (
                                            <Grid item key={permission} xs={6} sm={4}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={selectedSeat.Seat_Permissions?.includes(permission) || false}
                                                            onChange={(e) => togglePermission(permission, e.target.checked)}
                                                        />
                                                    }
                                                    label={permission}
                                                />
                                            </Grid>
                                        ))}

                                        {renderTeam?.projects?.map((project: Project) => {
                                            // Define permissions for each project and its associated backlogs
                                            const permissions = [
                                                {
                                                    key1: `accessProject.${project.Project_ID}`,
                                                    label1: `Access Project: ${project.Project_Name}`,
                                                    key2: `manageProject.${project.Project_ID}`,
                                                    label2: `Manage Project: ${project.Project_Name}`,
                                                }
                                            ];

                                            // Add permissions for each backlog within the project
                                            project.backlogs?.map((backlog: Backlog) => {
                                                permissions.push(
                                                    {
                                                        key1: `accessBacklog.${backlog.Backlog_ID}`,
                                                        label1: `Access Backlog: ${backlog.Backlog_Name}`,
                                                        key2: `manageBacklog.${backlog.Backlog_ID}`,
                                                        label2: `Manage Backlog: ${backlog.Backlog_Name}`,
                                                    }
                                                );
                                            });

                                            // Map through permissions and render checkboxes for each permission
                                            return permissions.map(permission => (
                                                <Grid item key={permission.key1} xs={6} sm={4}>
                                                    {/* Checkbox for the first permission */}
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={selectedSeat.Seat_Permissions?.includes(permission.key1) || false}
                                                                onChange={(e) => {
                                                                    // Toggle the first permission and ensure the second permission is unchecked if the first is unchecked
                                                                    togglePermission(permission.key1, e.target.checked);
                                                                    if (!e.target.checked) togglePermission(permission.key2, e.target.checked);
                                                                }}
                                                            />
                                                        }
                                                        label={permission.label1}
                                                    />
                                                    {/* Checkbox for the second permission */}
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={selectedSeat.Seat_Permissions?.includes(permission.key2) || false}
                                                                onChange={(e) => {
                                                                    // Toggle the second permission and ensure the first permission is checked if the second is checked
                                                                    if (e.target.checked) togglePermission(permission.key1, e.target.checked);
                                                                    togglePermission(permission.key2, e.target.checked);
                                                                }}
                                                            />
                                                        }
                                                        label={permission.label2}
                                                    />
                                                </Grid>
                                            ));
                                        })}
                                    </Grid>
                                </Box>

                                {/* Action Buttons */}
                                <Box mt={4} className="flex gap-4 justify-end">
                                    <button
                                        className="blue-link-light"
                                        onClick={() => {
                                            setSelectedSeat(undefined)
                                            setDisplayInviteForm(false)
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="button-blue px-6 py-2"
                                        onClick={handleSaveChanges}
                                    >
                                        {t('team:seatsManager:saveChanges')}
                                    </button>
                                </Box>
                            </CardContent>
                        </Card>
                    </FlexibleBox>
                ) : displayInviteForm ? (
                    <FlexibleBox
                        title={t("team:seatsManager:searchAndInviteUser")}
                        icon={faUserPlus}
                        className="no-box w-auto inline-block"
                        numberOfColumns={2}
                    >
                        <Card className="shadow-lg rounded-lg mt-6">
                            <InviteUserForm
                                teamId={teamId}
                                t={t}
                                addTeamUserSeat={addTeamUserSeat}
                                readTeamUserSeatsByTeamId={readTeamUserSeatsByTeamId}
                                setSelectedSeat={setSelectedSeat}
                                setDisplayInviteForm={setDisplayInviteForm}
                            />
                        </Card>
                    </FlexibleBox>
                ) : null}
            </>
        )}
    </Block>
)

export interface InviteUserFormProps {
    teamId: string
    t: TFunction
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<boolean>>
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({
    teamId,
    t,
    addTeamUserSeat,
    readTeamUserSeatsByTeamId,
    setSelectedSeat,
    setDisplayInviteForm
}) => {
    // Hooks
    const { httpPostWithData } = useAxios();

    // Internal variables
    const [email, setEmail] = useState("");
    const [user, setUser] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearchUser = async () => {
        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            setError(t("team:seatsManager:invalidEmail"));
            return;
        }

        setLoading(true);
        setError(null);
        setUser(undefined);

        try {
            const data = await httpPostWithData("users/userByEmail", { email });
            console.log(data)

            if (data.message) {
                throw new Error(t("team:seatsManager:userNotFound"));
                return;
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
            setError(t("team:seatsManager:userNotFound"));
            return;
        }

        // Construct the new seat object
        const newSeat: TeamUserSeat = {
            Team_ID: parseInt(teamId),
            User_ID: user.User_ID, // Use the found user's ID
            Seat_Role: "Member", // Default role
            Seat_Status: "Pending", // Default status
        };

        try {
            // Send a request to create the new seat for the user
            await addTeamUserSeat(newSeat.Team_ID, newSeat);

            // Refresh seats list
            await readTeamUserSeatsByTeamId(parseInt(teamId))

            // Show success message
            alert(`${t("team:seatsManager:inviteSent")} ${email}`);
        } catch (err) {
            console.error("Failed to create seat:", err);
            setError(t("team:seatsManager:createSeatError"));
        }
    };

    return (
        <CardContent className="p-4">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        label={t("team:seatsManager:email")}
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white"
                    />
                </Grid>
            </Grid>

            <Box mt={4} className="flex gap-4 justify-end">
                <button
                    className="blue-link-light"
                    onClick={() => {
                        setDisplayInviteForm(false)
                        setSelectedSeat(undefined)
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSearchUser}
                    disabled={loading}
                    className="button-blue px-6 py-2"
                >
                    {t("team:seatsManager:searchUser")}
                </button>
            </Box>

            {error && <Typography color="error" mt={2}>{error}</Typography>}
            {user && (
                <Box mt={4}>
                    <Typography>{t("team:seatsManager:userFound")}</Typography>
                    <Block variant="span">
                        Name: {user.User_FirstName + " " + user.User_Surname}
                    </Block>
                    <button
                        onClick={handleSendInvite}
                        className="button-blue mt-2 px-6 py-2"
                    >
                        {t("team:seatsManager:sendInvite")}
                    </button>
                </Box>
            )}
        </CardContent>
    );
}

export default TeamUserSeatsManager;
