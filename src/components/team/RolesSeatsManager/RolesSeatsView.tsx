"use client"

// External
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Internal
import { RolesSeats, RolesSeatsProps } from '@/components/team';
import { useTeamsContext, useTeamUserSeatsContext, useUsersContext } from '@/contexts';
import { useURLLink } from '@/hooks';
import useRoleAccess from '@/hooks/useRoleAccess';
import { selectAuthUser, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux';
import { Permission, Role, RoleFields, TeamStates, TeamUserSeat, TeamUserSeatFields } from '@/types';

export const RolesSeatsView: React.FC = () => {
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
    const { linkId: teamId, linkName, convertID_NameStringToURLFormat } = useURLLink(teamLink)
    const { canManageTeamMembers } = useRoleAccess(teamById ? teamById.organisation?.User_ID : undefined)

    // ---- State ----
    const urlSeatId = searchParams.get("seatId")
    const urlRoleId = searchParams.get("roleId")
    const authUser = useTypedSelector(selectAuthUser); // Redux
    const [renderUserSeats, setRenderUserSeats] = useState<TeamUserSeat[]>([]);
    const [renderTeam, setRenderTeam] = useState<TeamStates>(undefined)
    const [selectedSeat, setSelectedSeat] = useState<TeamUserSeat | undefined>(undefined);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
    const [displayInviteForm, setDisplayInviteForm] = useState<string | undefined>("");
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
        `/team/${convertID_NameStringToURLFormat(parseInt(teamId), linkName)}/roles-seats`
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
    const rolesSeatsProps: RolesSeatsProps = {
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
    }

    return <RolesSeats {...rolesSeatsProps} />
}
