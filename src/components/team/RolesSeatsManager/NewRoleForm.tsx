"use client"

// External
import { faShield } from '@fortawesome/free-solid-svg-icons';
import { Box, Card, CardContent, Checkbox, FormControlLabel, Grid, TextField, Typography } from '@mui/material';
import { TFunction } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import React, { useState } from 'react';

// Internal
import { FlexibleBox } from '@/components/ui/flexible-box';
import { setSnackMessage, useAppDispatch } from '@/redux';
import { Backlog, Permission, Project, Role, RoleFields, TeamStates } from '@/types';

export type NewRoleFormProps = {
    renderTeam: TeamStates
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

export const NewRoleForm: React.FC<NewRoleFormProps> = (props) => {
    // Hooks
    const dispatch = useAppDispatch();
    const router = useRouter()

    // State
    const [role, setRole] = useState<Role>({
        Team_ID: parseInt(props.teamId),
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
                        Team_ID: parseInt(props.teamId)
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
            await props.addRole(role.Team_ID, role);

            // Refresh seats list
            await props.readRolesAndPermissionsByTeamId(parseInt(props.teamId))

            // Show success message
            dispatch(setSnackMessage("Role created"))
            props.setDisplayNewRoleForm(false)

            router.push("?")
        } catch (err) {
            console.error("Failed to create role:", err);
        }
    }

    if (!props.renderTeam) return null

    return (
        <FlexibleBox
            title={props.t("team:rolesSeatsManager:createNewRole")}
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
                                label={props.t('team:rolesSeatsManager:roleName')}
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
                                label={props.t('team:rolesSeatsManager:roleDescription')}
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
                            {props.t('team:rolesSeatsManager:permissions')}
                        </Typography>

                        <Grid container spacing={2}>
                            {props.availablePermissions.map((permission) => {
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

                            {props.renderTeam?.projects?.map((project: Project) => {
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
                                props.setSelectedRole(undefined)
                                props.setDisplayNewRoleForm(false)
                            }}
                        >
                            Cancel
                        </Link>
                        <button
                            className="button-blue px-6 py-2"
                            onClick={handleCreateRole}
                        >
                            {props.t('team:rolesSeatsManager:saveRole')}
                        </button>
                    </Box>
                </CardContent>
            </Card>
        </FlexibleBox>
    );
}
