"use client"

// External
import { faChair, faShield, faUser, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Card, CardContent, Checkbox, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { TFunction } from 'next-i18next';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Internal
import { Block, Text } from '@/components';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { useTeamsContext, useTeamUserSeatsContext, useUsersContext } from '@/contexts';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { useAxios, useURLLink } from '@/hooks';
import useRoleAccess from '@/hooks/useRoleAccess';
import { selectAuthUser, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux';
import { Backlog, Permission, Project, Role, RoleFields, Team, TeamStates, TeamUserSeat, TeamUserSeatFields, User } from '@/types';

const TeamRolesSeatsManager: React.FC = () => {
    // ---- Hooks ----
    const router = useRouter()
    const dispatch = useAppDispatch()
    const searchParams = useSearchParams()
    const { t } = useTranslation(['team'])
    const {
        // Seats
        teamUserSeatsById,
        readTeamUserSeatsByTeamId,
        addTeamUserSeat,
        saveTeamUserSeatChanges,
        removeTeamUserSeat,

        // Roles and Permissions
        rolesAndPermissionsByTeamId,
        addRole,
        readRolesAndPermissionsByTeamId,
        removeRolesAndPermissionsByRoleId,
        saveTeamRoleChanges
    } = useTeamUserSeatsContext();
    const { teamById, readTeamById } = useTeamsContext();
    const { addUser } = useUsersContext(); // Assuming you have a `UsersContext` for adding new users
    const { teamLink } = useParams<{ teamLink: string }>() // Get teamLink from URL
    const { linkId: teamId, convertID_NameStringToURLFormat } = useURLLink(teamLink)
    const { canManageTeamMembers } = useRoleAccess(teamById ? teamById.organisation?.User_ID : undefined)

    // ---- State ----
    const urlSeatId = searchParams.get("seatId")
    const urlRoleId = searchParams.get("roleId")
    const authUser = useTypedSelector(selectAuthUser); // Redux
    const [renderUserSeats, setRenderUserSeats] = useState<TeamUserSeat[]>([]);
    const [renderTeam, setRenderTeam] = useState<TeamStates>(undefined)
    const [selectedSeat, setSelectedSeat] = useState<TeamUserSeat | undefined>(undefined);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
    const [displayInviteForm, setDisplayInviteForm] = useState<string>("");
    const [displayNewRoleForm, setDisplayNewRoleForm] = useState<boolean>(false);

    const availablePermissions = ["Modify Organisation Settings", "Modify Team Settings", "Manage Team Members"]

    // ---- Methods ----
    // Handles saving changes made to the selected seat
    const handleSeatChanges = async () => {
        if (selectedSeat) {
            const saveChanges = await saveTeamUserSeatChanges(selectedSeat, parseInt(teamId))

            dispatch(setSnackMessage(
                saveChanges ? "Seat changes saved successfully!" : "Failed to save seat changes."
            ))
        }
    }

    // Handles saving changes made to the selected role
    const handleRoleChanges = async () => {
        if (selectedRole) {
            const saveChanges = await saveTeamRoleChanges(selectedRole, parseInt(teamId))

            dispatch(setSnackMessage(
                saveChanges ? "Role changes saved successfully!" : "Failed to save role changes."
            ))
        }
    }

    // Handles the removal of a team user seat.
    const handleRemoveSeat = (seatId: number) => removeTeamUserSeat(
        seatId,
        parseInt(teamId),
        `/team/${teamLink}/roles-seats`
    );

    // Handles the removal of a team role.
    const handleRemoveRole = (roleId: number) => {
        const seatsNotEmpty = renderUserSeats.filter(seat => roleId === seat.Role_ID)
        if (seatsNotEmpty.length) {
            dispatch(setSnackMessage("You cannot remove a role while there are seats assigned to it."))
            return
        }

        removeRolesAndPermissionsByRoleId(roleId, parseInt(teamId))
    }

    // Handles changes to a specific field of the selected team user seat.
    const handleSeatChange = (field: TeamUserSeatFields, value: string) => {
        if (selectedSeat) {
            setSelectedSeat((prevSeat) => ({
                ...prevSeat!,
                [field]: value,
            }));
        }
    };

    // Handles changes to a specific field of the selected team user seat.
    const handleRoleChange = (field: RoleFields, value: string) => {
        if (selectedRole) {
            setSelectedRole((prevRole) => ({
                ...prevRole!,
                [field]: value,
            }));
        }
    };

    // Handles the selection of a team user seat and updates the URL with the selected seat's ID.
    const handleSelectSeat = (seat: TeamUserSeat) => {
        if (!seat.Seat_ID) return

        const url = new URL(window.location.href)
        url.searchParams.set("seatId", seat.Seat_ID.toString())
        url.searchParams.delete("roleId")

        router.push(url.toString(), { scroll: false }); // Prevent full page reload
    };

    // Handles the selection of a team role and updates the URL with the selected role's ID.
    const handleSelectRole = (role: Role) => {
        if (!role.Role_ID) return

        const url = new URL(window.location.href)
        url.searchParams.set("roleId", role.Role_ID.toString())
        url.searchParams.delete("seatId")

        router.push(url.toString(), { scroll: false }); // Prevent full page reload
    };

    // Toggles a permission for the selected seat by adding or removing it from the permissions list.
    const togglePermission = async (permission: string, isChecked: boolean) => {
        setSelectedRole((prevRole) => {
            if (!prevRole) return prevRole

            const currentPermissions = prevRole.permissions || []

            const isAlreadyIncluded = currentPermissions.some(p => p.Permission_Key === permission)

            let updatedPermissions: Permission[]

            if (isChecked) {
                // Add permission if not already included
                if (!isAlreadyIncluded) {
                    const newPermission: Permission = {
                        Permission_Key: permission,
                        Team_ID: renderTeam ? renderTeam.Team_ID ?? 0 : 0
                    }
                    updatedPermissions = [...currentPermissions, newPermission]
                } else {
                    updatedPermissions = currentPermissions
                }
            } else {
                // Remove the permission
                updatedPermissions = currentPermissions.filter(p => p.Permission_Key !== permission)
            }

            console.log("updatedPermissions", isChecked, permission, updatedPermissions)

            return { ...prevRole, permissions: updatedPermissions }
        })
    }

    // ---- Effects ----
    useEffect(() => {
        if (teamId) {
            readTeamById(parseInt(teamId))
            readTeamUserSeatsByTeamId(parseInt(teamId));
            readRolesAndPermissionsByTeamId(parseInt(teamId));
        }
    }, [teamId]);

    useEffect(() => {
        if (teamUserSeatsById) setRenderUserSeats(teamUserSeatsById)

        setRenderTeam(teamById)
    }, [teamUserSeatsById, teamById]);

    // Handle URL seatId changes and update the state accordingly
    useEffect(() => {
        if (!renderTeam) return

        if (urlSeatId && authUser && canManageTeamMembers === false) {
            router.push(`/team/${convertID_NameStringToURLFormat(renderTeam?.Team_ID ?? 0, renderTeam.Team_Name)}/seats`)
            return
        }

        if (urlSeatId && !isNaN(Number(urlSeatId)) && renderUserSeats.length) {
            const seat = renderUserSeats.find(seat => seat.Seat_ID === parseInt(urlSeatId))
            setDisplayInviteForm("")
            setDisplayNewRoleForm(false)
            setSelectedSeat(seat)
            setSelectedRole(undefined)
        } else if (urlSeatId &&
            (
                urlSeatId === "new" ||
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(urlSeatId)
            )
        ) {
            setDisplayInviteForm(urlSeatId)
            setDisplayNewRoleForm(false)
            setSelectedSeat(undefined)
            setSelectedRole(undefined)
        }
    }, [urlSeatId, renderUserSeats])

    // Handle URL roleId changes and update the state accordingly
    useEffect(() => {
        if (!renderTeam) return

        if (urlRoleId && authUser && canManageTeamMembers === false) {
            router.push(`/team/${convertID_NameStringToURLFormat(renderTeam?.Team_ID ?? 0, renderTeam.Team_Name)}/seats`)
            return
        }

        if (urlRoleId === "new") {
            setDisplayInviteForm("")
            setDisplayNewRoleForm(true)
            setSelectedSeat(undefined)
            setSelectedRole(undefined)
        } else if (urlRoleId && rolesAndPermissionsByTeamId && rolesAndPermissionsByTeamId.length) {
            const role = rolesAndPermissionsByTeamId.find(role => role.Role_ID === parseInt(urlRoleId))
            setDisplayInviteForm("")
            setDisplayNewRoleForm(false)
            setSelectedSeat(undefined)
            setSelectedRole(role)
        }
    }, [urlRoleId, rolesAndPermissionsByTeamId])

    // ---- Render ----
    return (
        <TeamRolesSeatsView
            renderUserSeats={renderUserSeats}
            renderTeam={renderTeam}
            authUser={authUser}
            selectedSeat={selectedSeat}
            displayInviteForm={displayInviteForm}
            selectedRole={selectedRole}
            teamId={teamId}
            t={t}
            availablePermissions={availablePermissions}
            canManageTeamMembers={canManageTeamMembers}
            rolesAndPermissionsByTeamId={rolesAndPermissionsByTeamId}
            addTeamUserSeat={addTeamUserSeat}
            addRole={addRole}
            readTeamUserSeatsByTeamId={readTeamUserSeatsByTeamId}
            readRolesAndPermissionsByTeamId={readRolesAndPermissionsByTeamId}
            handleSelectSeat={handleSelectSeat}
            handleSelectRole={handleSelectRole}
            handleRemoveSeat={handleRemoveSeat}
            handleRemoveRole={handleRemoveRole}
            handleSeatChanges={handleSeatChanges}
            handleRoleChanges={handleRoleChanges}
            handleSeatChange={handleSeatChange}
            handleRoleChange={handleRoleChange}
            setSelectedSeat={setSelectedSeat}
            setDisplayInviteForm={setDisplayInviteForm}
            setSelectedRole={setSelectedRole}
            displayNewRoleForm={displayNewRoleForm}
            setDisplayNewRoleForm={setDisplayNewRoleForm}
            togglePermission={togglePermission}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    );
};

export interface TeamRolesSeatsViewProps {
    renderUserSeats: TeamUserSeat[];
    renderTeam: TeamStates;
    authUser: User | undefined;
    selectedSeat: TeamUserSeat | undefined;
    displayInviteForm: string | undefined
    selectedRole: Role | undefined
    teamId: string
    t: TFunction
    availablePermissions: string[]
    canManageTeamMembers: boolean | undefined
    rolesAndPermissionsByTeamId: Role[] | undefined
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    addRole: (parentId: number, object?: Role | undefined) => Promise<void>
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    readRolesAndPermissionsByTeamId: (teamId: number) => Promise<boolean>
    handleSelectSeat: (seat: TeamUserSeat) => void;
    handleSelectRole: (role: Role) => void
    handleRemoveSeat: (seatId: number) => void;
    handleRemoveRole: (roleId: number) => void
    handleSeatChanges: () => void;
    handleRoleChanges: () => Promise<void>
    handleSeatChange: (field: TeamUserSeatFields, value: string) => void;
    handleRoleChange: (field: RoleFields, value: string) => void
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<string>>
    setSelectedRole: React.Dispatch<React.SetStateAction<Role | undefined>>
    displayNewRoleForm: boolean
    setDisplayNewRoleForm: React.Dispatch<React.SetStateAction<boolean>>
    togglePermission: (permission: string, isChecked: boolean) => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const TeamRolesSeatsView: React.FC<TeamRolesSeatsViewProps> = ({
    renderUserSeats,
    renderTeam,
    authUser,
    selectedSeat,
    displayInviteForm,
    selectedRole,
    teamId,
    t,
    availablePermissions,
    canManageTeamMembers,
    rolesAndPermissionsByTeamId,
    displayNewRoleForm,
    addTeamUserSeat,
    addRole,
    readTeamUserSeatsByTeamId,
    readRolesAndPermissionsByTeamId,
    handleSelectSeat,
    handleSelectRole,
    handleRemoveSeat,
    handleRemoveRole,
    handleSeatChanges,
    handleRoleChanges,
    handleSeatChange,
    handleRoleChange,
    setSelectedSeat,
    setDisplayInviteForm,
    setSelectedRole,
    setDisplayNewRoleForm,
    togglePermission,
    convertID_NameStringToURLFormat
}) => (
    <Block className="page-content">
        <FlexibleBox
            title={t('team:rolesSeatsManager:manageTeamRolesSeats')}
            subtitle={renderTeam ? renderTeam.Team_Name : undefined}
            titleAction={
                renderTeam && (
                    <Block className="flex gap-2 items-center w-full">
                        {/* New Invite Link */}
                        {canManageTeamMembers && (
                            <>
                                <Link
                                    className="blue-link !inline-flex gap-2 items-center"
                                    href="?seatId=new"
                                >
                                    <FontAwesomeIcon icon={faUser} />
                                    <Text variant="span">New Invite</Text>
                                </Link>
                                <Link
                                    className="blue-link !inline-flex gap-2 items-center"
                                    href="?roleId=new"
                                >
                                    <FontAwesomeIcon icon={faShield} />
                                    <Text variant="span">New Role</Text>
                                </Link>
                            </>
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
        ></FlexibleBox>
        <LoadingState singular="Team" renderItem={renderTeam} permitted={canManageTeamMembers}>
            <FlexibleBox
                title={t('team:rolesSeatsManager:rolesHeadline')}
                icon={faShield}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                {renderTeam && (
                    <Card className="shadow-lg rounded-lg mb-4">
                        <CardContent>
                            <Grid container spacing={3}>
                                {Array.isArray(rolesAndPermissionsByTeamId) && rolesAndPermissionsByTeamId.map((role) => (
                                    <Grid item xs={12} sm={6} md={4} key={role.Role_ID}>
                                        <Card className="border border-gray-300 rounded-lg hover:shadow-xl transition-all p-3">
                                            <Typography variant="h6" className="font-semibold text-lg">
                                                {role.Role_Name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Permissions: {role.permissions?.length}
                                            </Typography>

                                            {canManageTeamMembers && (
                                                <div className="flex justify-between mt-4">
                                                    <button
                                                        onClick={() => handleSelectRole(role)}
                                                        className="blue-link w-[48%]"
                                                    >
                                                        {t('team:rolesSeatsManager:edit')}
                                                    </button>
                                                    <button
                                                        onClick={() => role.Role_ID && handleRemoveRole(role.Role_ID)}
                                                        className="blue-link w-[48%]"
                                                    >
                                                        {t('team:rolesSeatsManager:remove')}
                                                    </button>
                                                </div>
                                            )}
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                )}
            </FlexibleBox>
            <FlexibleBox
                title={t('team:rolesSeatsManager:seatsHeadline')}
                icon={faUsers}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                {renderTeam && (
                    <Card className="shadow-lg rounded-lg mb-4">
                        <CardContent>
                            {!renderUserSeats.length && authUser && renderTeam?.organisation?.User_ID === authUser.User_ID ? (
                                <Block>{t('team:rolesSeatsManager:length0_iamowner')}</Block>
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
                                                            {t('team:rolesSeatsManager:role')}: {seat.role?.Role_Name}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {t('team:rolesSeatsManager:status')}: {seat.Seat_Status}
                                                        </Typography>

                                                        {canManageTeamMembers && (
                                                            <div className="flex justify-between mt-4">
                                                                <button
                                                                    onClick={() => handleSelectSeat(seat)}
                                                                    className="blue-link w-[48%]"
                                                                >
                                                                    {t('team:rolesSeatsManager:edit')}
                                                                </button>
                                                                <button
                                                                    onClick={() => seat.Seat_ID && handleRemoveSeat(seat.Seat_ID)}
                                                                    className="blue-link w-[48%]"
                                                                >
                                                                    {t('team:rolesSeatsManager:remove')}
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
            </FlexibleBox>
        </LoadingState>

        {canManageTeamMembers && renderTeam && (
            <>
                {selectedSeat ? (
                    <SelectedSeatForm
                        selectedSeat={selectedSeat}
                        rolesAndPermissionsByTeamId={rolesAndPermissionsByTeamId}
                        handleSeatChange={handleSeatChange}
                        t={t}
                        availablePermissions={availablePermissions}
                        togglePermission={togglePermission}
                        renderTeam={renderTeam}
                        setSelectedSeat={setSelectedSeat}
                        setDisplayInviteForm={setDisplayInviteForm}
                        handleSeatChanges={handleSeatChanges}
                    />
                ) : displayInviteForm && displayInviteForm !== "" ? (
                    <InviteUserForm
                        teamId={teamId}
                        t={t}
                        displayInviteForm={displayInviteForm}
                        rolesAndPermissionsByTeamId={rolesAndPermissionsByTeamId}
                        addTeamUserSeat={addTeamUserSeat}
                        readTeamUserSeatsByTeamId={readTeamUserSeatsByTeamId}
                        setSelectedSeat={setSelectedSeat}
                        setDisplayInviteForm={setDisplayInviteForm}
                    />
                ) : selectedRole ? (
                    <SelectedRoleForm
                        selectedRole={selectedRole}
                        handleRoleChange={handleRoleChange}
                        t={t}
                        availablePermissions={availablePermissions}
                        togglePermission={togglePermission}
                        renderTeam={renderTeam}
                        setSelectedRole={setSelectedRole}
                        setDisplayNewRoleForm={setDisplayNewRoleForm}
                        handleRoleChanges={handleRoleChanges}
                    />
                ) : displayNewRoleForm ? (
                    <NewRoleForm
                        renderTeam={renderTeam}
                        teamId={teamId}
                        t={t}
                        displayNewRoleForm={displayNewRoleForm}
                        rolesAndPermissionsByTeamId={rolesAndPermissionsByTeamId}
                        availablePermissions={availablePermissions}
                        addRole={addRole}
                        readRolesAndPermissionsByTeamId={readRolesAndPermissionsByTeamId}
                        setSelectedRole={setSelectedRole}
                        setDisplayNewRoleForm={setDisplayNewRoleForm}
                    />
                ) : null}
            </>
        )}
    </Block>
)

export interface SelectedSeatFormProps {
    selectedSeat: TeamUserSeat
    rolesAndPermissionsByTeamId: Role[] | undefined
    handleSeatChange: (field: TeamUserSeatFields, value: string) => void
    t: TFunction
    availablePermissions: string[]
    togglePermission: (permission: string, isChecked: boolean) => Promise<void>
    renderTeam: Team
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<string>>
    handleSeatChanges: () => void
}

const SelectedSeatForm: React.FC<SelectedSeatFormProps> = ({
    selectedSeat,
    rolesAndPermissionsByTeamId,
    handleSeatChange,
    t,
    availablePermissions,
    togglePermission,
    renderTeam,
    setSelectedSeat,
    setDisplayInviteForm,
    handleSeatChanges
}) => (
    <FlexibleBox
        title={t('team:rolesSeatsManager:editUserSeat')}
        subtitle={`${selectedSeat.user?.User_FirstName} ${selectedSeat.user?.User_Surname}`}
        icon={faUser}
        className="no-box w-auto inline-block"
        numberOfColumns={2}
    >
        <Card className="shadow-lg rounded-lg mt-4">
            <CardContent className="p-4">
                <Grid container spacing={3}>
                    {/* Role Select */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>{t('team:rolesSeatsManager:userRole')}</InputLabel>
                            <Select
                                value={selectedSeat.Role_ID}
                                onChange={(e) => handleSeatChange('Role_ID', e.target.value.toString())}
                                className="bg-white"
                            >
                                {Array.isArray(rolesAndPermissionsByTeamId) && rolesAndPermissionsByTeamId.map((role) => (
                                    <MenuItem value={role.Role_ID}>{role.Role_Name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Status Dropdown */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>{t('team:rolesSeatsManager:status')}</InputLabel>
                            <Select
                                value={selectedSeat.Seat_Status}
                                onChange={(e) => handleSeatChange('Seat_Status', e.target.value)}
                                className="bg-white"
                            >
                                <MenuItem value="Active">{t('team:rolesSeatsManager:active')}</MenuItem>
                                <MenuItem value="Inactive">{t('team:rolesSeatsManager:inactive')}</MenuItem>
                                <MenuItem value="Pending">{t('team:rolesSeatsManager:pending')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box mt={4} className="flex gap-4 items-center justify-end">
                    <Link
                        className="blue-link-light"
                        href="?"
                        onClick={() => {
                            setSelectedSeat(undefined)
                            setDisplayInviteForm("")
                        }}
                    >
                        Cancel
                    </Link>
                    <button
                        className="button-blue px-6 py-2"
                        onClick={handleSeatChanges}
                    >
                        {t('team:rolesSeatsManager:saveChanges')}
                    </button>
                </Box>
            </CardContent>
        </Card>
    </FlexibleBox>
)

export interface InviteUserFormProps {
    teamId: string
    t: TFunction
    rolesAndPermissionsByTeamId: Role[] | undefined
    displayInviteForm: string | undefined
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<string>>
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({
    teamId,
    t,
    rolesAndPermissionsByTeamId,
    displayInviteForm,
    addTeamUserSeat,
    readTeamUserSeatsByTeamId,
    setSelectedSeat,
    setDisplayInviteForm
}) => {
    // Hooks
    const dispatch = useAppDispatch();
    const router = useRouter()
    const { httpPostWithData } = useAxios();

    // Internal variables
    const [email, setEmail] = useState("");
    const [user, setUser] = useState<User | undefined>(undefined);
    const [role, setRole] = useState<Role | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearchUser = async () => {
        if (!displayInviteForm) return

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(displayInviteForm)) {
            setError(t("team:rolesSeatsManager:invalidEmail"));
            return;
        }

        setLoading(true);
        setError(null);
        setUser(undefined);
        setRole(undefined);

        try {
            const postData = { email: displayInviteForm }
            const data = await httpPostWithData("users/userByEmail", postData);

            if (data.message) {
                throw new Error(t("team:rolesSeatsManager:userNotFound"));
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
            setError(t("team:rolesSeatsManager:userNotFound"));
            return;
        }

        // Construct the new seat object
        const newSeat: TeamUserSeat = {
            Team_ID: parseInt(teamId),
            User_ID: user.User_ID ?? 0, // Use the found user's ID
            Role_ID: role?.Role_ID ?? 0, // Default role
            Seat_Status: "Pending", // Default status
        };

        try {
            // Send a request to create the new seat for the user
            await addTeamUserSeat(newSeat.Team_ID, newSeat);

            // Refresh seats list
            await readTeamUserSeatsByTeamId(parseInt(teamId))

            // Show success message
            dispatch(setSnackMessage(t("team:rolesSeatsManager:inviteSent")))

            setEmail("")
            setLoading(true);
            setError(null);
            setUser(undefined);
            setRole(undefined);

            setDisplayInviteForm("new")

            router.push("?seatId=new")
        } catch (err) {
            console.error("Failed to create seat:", err);
            setError(t("team:rolesSeatsManager:createSeatError"));
        }
    };

    useEffect(() => {
        if (displayInviteForm && displayInviteForm !== "new") {
            setEmail(displayInviteForm);
            handleSearchUser();
        }
    }, [displayInviteForm]);

    return (
        <FlexibleBox
            title={t("team:rolesSeatsManager:searchAndInviteUser")}
            icon={faUserPlus}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <Card className="shadow-lg rounded-lg mt-6">
                <CardContent className="p-4">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label={t("team:rolesSeatsManager:email")}
                                variant="outlined"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white"
                            />
                        </Grid>
                    </Grid>

                    <Box mt={4} className="flex gap-4 items-center justify-end">
                        <Link
                            className="blue-link-light"
                            href="?"
                            onClick={() => {
                                setDisplayInviteForm("")
                                setSelectedSeat(undefined)
                            }}
                        >
                            Cancel
                        </Link>
                        <Link
                            href={`?seatId=${encodeURIComponent(email)}`}
                            className="button-blue px-6 py-2"
                        >
                            {t("team:rolesSeatsManager:searchUser")}
                        </Link>
                    </Box>

                    {error && <Typography color="error" mt={2}>{error}</Typography>}
                    {user && (
                        <Box mt={4}>
                            <Typography>{t("team:rolesSeatsManager:userFound")}</Typography>
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
                                        setRole(rolesAndPermissionsByTeamId?.filter(role => role.Role_ID === parseInt(e.target.value))[0])
                                    }
                                >
                                    <option value="">-</option>
                                    {rolesAndPermissionsByTeamId?.map(role => (
                                        <option value={role.Role_ID}>{role.Role_Name}</option>
                                    ))}
                                </select>
                            </Block>
                        </Box>
                    )}
                    {role && (
                        <Box mt={4}>
                            <Typography>{t("team:rolesSeatsManager:selectedRole")}</Typography>
                            <Block>Name: {role.Role_Name}</Block>
                            <Block>Permissions: {role.permissions?.length}</Block>
                            <button
                                onClick={handleSendInvite}
                                className="button-blue mt-2 px-6 py-2"
                            >
                                {t("team:rolesSeatsManager:sendInvite")}
                            </button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </FlexibleBox>
    );
}

export interface NewRoleFormProps {
    renderTeam: Team
    teamId: string
    t: TFunction
    rolesAndPermissionsByTeamId: Role[] | undefined
    displayNewRoleForm: boolean
    availablePermissions: string[]
    addRole: (parentId: number, object?: Role | undefined) => Promise<void>
    readRolesAndPermissionsByTeamId: (teamId: number) => Promise<boolean>
    setSelectedRole: React.Dispatch<React.SetStateAction<Role | undefined>>
    setDisplayNewRoleForm: React.Dispatch<React.SetStateAction<boolean>>
}

const NewRoleForm: React.FC<NewRoleFormProps> = ({
    renderTeam,
    teamId,
    t,
    rolesAndPermissionsByTeamId,
    displayNewRoleForm,
    availablePermissions,
    addRole,
    readRolesAndPermissionsByTeamId,
    setSelectedRole,
    setDisplayNewRoleForm
}) => {
    // Hooks
    const dispatch = useAppDispatch();
    const router = useRouter()

    // State
    const [role, setRole] = useState<Role>({
        Team_ID: parseInt(teamId),
        Role_Name: ""
    });

    // Handles changes to a specific field of the selected team user seat.
    const handleRoleChange = (field: RoleFields, value: string) => {
        if (role) {
            setRole((prevRole) => ({
                ...prevRole!,
                [field]: value,
            }));
        }
    };

    // Toggles a permission for the selected seat by adding or removing it from the permissions list.
    const togglePermission = async (permission: string, isChecked: boolean) => {
        setRole((prevRole) => {
            if (!prevRole) return prevRole

            const currentPermissions = prevRole.permissions || []

            const isAlreadyIncluded = currentPermissions.some(p => p.Permission_Key === permission)

            let updatedPermissions: Permission[]

            if (isChecked) {
                // Add permission if not already included
                if (!isAlreadyIncluded) {
                    const newPermission: Permission = {
                        Permission_Key: permission,
                        Team_ID: parseInt(teamId)
                    }
                    updatedPermissions = [...currentPermissions, newPermission]
                } else {
                    updatedPermissions = currentPermissions
                }
            } else {
                // Remove the permission
                updatedPermissions = currentPermissions.filter(p => p.Permission_Key !== permission)
            }

            console.log("updatedPermissions", isChecked, permission, updatedPermissions)

            return { ...prevRole, permissions: updatedPermissions }
        })
    }

    const handleCreateRole = async () => {
        try {
            // Send a request to create the new seat for the user
            await addRole(role.Team_ID, role);

            // Refresh seats list
            await readRolesAndPermissionsByTeamId(parseInt(teamId))

            // Show success message
            dispatch(setSnackMessage("Role created"))
            setDisplayNewRoleForm(false)

            router.push("?")
        } catch (err) {
            console.error("Failed to create role:", err);
        }
    }

    return (
        <FlexibleBox
            title={t("team:rolesSeatsManager:createNewRole")}
            icon={faShield}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <Card className="shadow-lg rounded-lg mt-4">
                <CardContent className="p-4">
                    <Grid container spacing={3}>
                        {/* Role Name */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={t('team:rolesSeatsManager:roleName')}
                                variant="outlined"
                                fullWidth
                                value={role.Role_Name}
                                onChange={(e) => handleRoleChange('Role_Name', e.target.value)}
                                className="bg-white"
                            />
                        </Grid>

                        {/* Role Description */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={t('team:rolesSeatsManager:roleDescription')}
                                variant="outlined"
                                fullWidth
                                value={role.Role_Description || ''}
                                onChange={(e) => handleRoleChange('Role_Description', e.target.value)}
                                className="bg-white"
                            />
                        </Grid>
                    </Grid>

                    {/* Permissions */}
                    <Box mt={4}>
                        <Typography variant="subtitle1" gutterBottom>
                            {t('team:rolesSeatsManager:permissions')}
                        </Typography>

                        <Grid container spacing={2}>
                            {availablePermissions.map((permission) => {
                                const checked = role.permissions ?
                                    role.permissions.filter(perm =>
                                        permission === perm.Permission_Key
                                    ).length > 0 : false
                                return (
                                    <Grid item key={permission} xs={6} sm={4}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={checked}
                                                    onChange={(e) => togglePermission(permission, e.target.checked)}
                                                />
                                            }
                                            label={permission}
                                        />
                                    </Grid>
                                )
                            })}

                            {renderTeam?.projects?.map((project: Project) => {
                                const checkedAccess = role.permissions ?
                                    role.permissions.filter(permission =>
                                        `accessProject.${project.Project_ID}` === permission.Permission_Key
                                    ).length > 0 : false
                                const checkedManage = role.permissions ?
                                    role.permissions.filter(permission =>
                                        `manageProject.${project.Project_ID}` === permission.Permission_Key
                                    ).length > 0 : false

                                const permissions = [
                                    {
                                        key1: `accessProject.${project.Project_ID}`,
                                        label1: `Access Project: ${project.Project_Name}`,
                                        checked1: checkedAccess,
                                        key2: `manageProject.${project.Project_ID}`,
                                        label2: `Manage Project: ${project.Project_Name}`,
                                        checked2: checkedManage,
                                    }
                                ];

                                project.backlogs?.map((backlog: Backlog) => {
                                    const checkedAccess = role.permissions ?
                                        role.permissions.filter(permission =>
                                            `accessBacklog.${backlog.Backlog_ID}` === permission.Permission_Key
                                        ).length > 0 : false
                                    const checkedManage = role.permissions ?
                                        role.permissions.filter(permission =>
                                            `manageBacklog.${backlog.Backlog_ID}` === permission.Permission_Key
                                        ).length > 0 : false

                                    permissions.push(
                                        {
                                            key1: `accessBacklog.${backlog.Backlog_ID}`,
                                            label1: `Access Backlog: ${backlog.Backlog_Name}`,
                                            checked1: checkedAccess,
                                            key2: `manageBacklog.${backlog.Backlog_ID}`,
                                            label2: `Manage Backlog: ${backlog.Backlog_Name}`,
                                            checked2: checkedManage
                                        }
                                    );
                                });

                                return permissions.map(permission => (
                                    <Grid item key={permission.key1} xs={6} sm={4}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={permission.checked1}
                                                    onChange={async (e) => {
                                                        await togglePermission(permission.key1, e.target.checked);
                                                        if (!e.target.checked) togglePermission(permission.key2, false);
                                                    }}
                                                />
                                            }
                                            label={permission.label1}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={permission.checked2}
                                                    onChange={async (e) => {
                                                        togglePermission(permission.key2, e.target.checked);
                                                        if (e.target.checked) await togglePermission(permission.key1, true);
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
                    <Box mt={4} className="flex gap-4 items-center justify-end">
                        <Link
                            className="blue-link-light"
                            href="?"
                            onClick={() => {
                                setSelectedRole(undefined)
                                setDisplayNewRoleForm(false)
                            }}
                        >
                            Cancel
                        </Link>
                        <button
                            className="button-blue px-6 py-2"
                            onClick={handleCreateRole}
                        >
                            {t('team:rolesSeatsManager:saveRole')}
                        </button>
                    </Box>
                </CardContent>
            </Card>
        </FlexibleBox>
    );
}

export interface SelectedRoleFormProps {
    selectedRole: Role
    handleRoleChange: (field: RoleFields, value: string) => void
    t: (key: string) => string
    availablePermissions: string[]
    togglePermission: (permission: string, isChecked: boolean) => Promise<void>
    renderTeam: Team
    setSelectedRole: React.Dispatch<React.SetStateAction<Role | undefined>>
    setDisplayNewRoleForm: React.Dispatch<React.SetStateAction<boolean>>
    handleRoleChanges: () => void
}

const SelectedRoleForm: React.FC<SelectedRoleFormProps> = ({
    selectedRole,
    handleRoleChange,
    t,
    availablePermissions,
    togglePermission,
    renderTeam,
    setSelectedRole,
    setDisplayNewRoleForm,
    handleRoleChanges
}) => (
    <FlexibleBox
        title={t('team:rolesSeatsManager:editRole')}
        subtitle={selectedRole?.Role_Name}
        icon={faShield}
        className="no-box w-auto inline-block"
        numberOfColumns={2}
    >
        <Card className="shadow-lg rounded-lg mt-4">
            <CardContent className="p-4">
                <Grid container spacing={3}>
                    {/* Role Name */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label={t('team:rolesSeatsManager:roleName')}
                            variant="outlined"
                            fullWidth
                            value={selectedRole.Role_Name}
                            onChange={(e) => handleRoleChange('Role_Name', e.target.value)}
                            className="bg-white"
                        />
                    </Grid>

                    {/* Role Description */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label={t('team:rolesSeatsManager:roleDescription')}
                            variant="outlined"
                            fullWidth
                            value={selectedRole.Role_Description || ''}
                            onChange={(e) => handleRoleChange('Role_Description', e.target.value)}
                            className="bg-white"
                        />
                    </Grid>
                </Grid>

                {/* Permissions */}
                <Box mt={4}>
                    <Typography variant="subtitle1" gutterBottom>
                        {t('team:rolesSeatsManager:permissions')}
                    </Typography>

                    <Grid container spacing={2}>
                        {availablePermissions.map((permission) => {
                            const checked = selectedRole.permissions ?
                                selectedRole.permissions.filter(perm =>
                                    permission === perm.Permission_Key
                                ).length > 0 : false
                            return (
                                <Grid item key={permission} xs={6} sm={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={checked}
                                                onChange={(e) => togglePermission(permission, e.target.checked)}
                                            />
                                        }
                                        label={permission}
                                    />
                                </Grid>
                            )
                        })}

                        {renderTeam?.projects?.map((project: Project) => {
                            const checkedAccess = selectedRole.permissions ?
                                selectedRole.permissions.filter(permission =>
                                    `accessProject.${project.Project_ID}` === permission.Permission_Key
                                ).length > 0 : false
                            const checkedManage = selectedRole.permissions ?
                                selectedRole.permissions.filter(permission =>
                                    `manageProject.${project.Project_ID}` === permission.Permission_Key
                                ).length > 0 : false

                            const permissions = [
                                {
                                    key1: `accessProject.${project.Project_ID}`,
                                    label1: `Access Project: ${project.Project_Name}`,
                                    checked1: checkedAccess,
                                    key2: `manageProject.${project.Project_ID}`,
                                    label2: `Manage Project: ${project.Project_Name}`,
                                    checked2: checkedManage,
                                }
                            ];

                            project.backlogs?.map((backlog: Backlog) => {
                                const checkedAccess = selectedRole.permissions ?
                                    selectedRole.permissions.filter(permission =>
                                        `accessBacklog.${backlog.Backlog_ID}` === permission.Permission_Key
                                    ).length > 0 : false
                                const checkedManage = selectedRole.permissions ?
                                    selectedRole.permissions.filter(permission =>
                                        `manageBacklog.${backlog.Backlog_ID}` === permission.Permission_Key
                                    ).length > 0 : false

                                permissions.push(
                                    {
                                        key1: `accessBacklog.${backlog.Backlog_ID}`,
                                        label1: `Access Backlog: ${backlog.Backlog_Name}`,
                                        checked1: checkedAccess,
                                        key2: `manageBacklog.${backlog.Backlog_ID}`,
                                        label2: `Manage Backlog: ${backlog.Backlog_Name}`,
                                        checked2: checkedManage
                                    }
                                );
                            });

                            return permissions.map(permission => (
                                <Grid item key={permission.key1} xs={6} sm={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={permission.checked1}
                                                onChange={async (e) => {
                                                    await togglePermission(permission.key1, e.target.checked);
                                                    if (!e.target.checked) togglePermission(permission.key2, false);
                                                }}
                                            />
                                        }
                                        label={permission.label1}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={permission.checked2}
                                                onChange={async (e) => {
                                                    togglePermission(permission.key2, e.target.checked);
                                                    if (e.target.checked) await togglePermission(permission.key1, true);
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
                <Box mt={4} className="flex gap-4 items-center justify-end">
                    <Link
                        className="blue-link-light"
                        href="?"
                        onClick={() => {
                            setSelectedRole(undefined)
                            setDisplayNewRoleForm(false)
                        }}
                    >
                        Cancel
                    </Link>
                    <button
                        className="button-blue px-6 py-2"
                        onClick={handleRoleChanges}
                    >
                        {t('team:rolesSeatsManager:saveRole')}
                    </button>
                </Box>
            </CardContent>
        </Card>
    </FlexibleBox>
)

export default TeamRolesSeatsManager;
