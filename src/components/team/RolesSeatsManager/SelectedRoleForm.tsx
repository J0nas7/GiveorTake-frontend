"use client"

// External
import { faShield } from '@fortawesome/free-solid-svg-icons';
import { Box, Card, CardContent, Checkbox, FormControlLabel, Grid, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';

// Internal
import { FlexibleBox } from '@/components/ui/flexible-box';
import { Backlog, Project, Role, RoleFields, TeamStates } from '@/types';

export type SelectedRoleFormProps = {
    selectedRole: Role | undefined
    handleRoleChange: (field: RoleFields, value: string) => void
    t: (key: string) => string
    availablePermissions: string[]
    togglePermission: (permission: string, isChecked: boolean) => Promise<void>
    renderTeam: TeamStates
    setSelectedRole: React.Dispatch<React.SetStateAction<Role | undefined>>
    setDisplayNewRoleForm: React.Dispatch<React.SetStateAction<boolean>>
    handleRoleChanges: () => void
}

export const SelectedRoleForm: React.FC<SelectedRoleFormProps> = (props) => props.selectedRole && props.renderTeam && (
    <FlexibleBox
        title={props.t('team:rolesSeatsManager:editRole')}
        subtitle={props.selectedRole?.Role_Name}
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
                            value={props.selectedRole.Role_Name}
                            onChange={(e) => props.handleRoleChange('Role_Name', e.target.value)}
                            className="bg-white"
                        />
                    </Grid>

                    {/* Role Description */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label={props.t('team:rolesSeatsManager:roleDescription')}
                            variant="outlined"
                            fullWidth
                            value={props.selectedRole.Role_Description || ''}
                            onChange={(e) => props.handleRoleChange('Role_Description', e.target.value)}
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
                            const checked = props.selectedRole &&
                                props.selectedRole.permissions
                                ? props.selectedRole.permissions.some(
                                    (perm) => permission === perm.Permission_Key
                                )
                                : false;

                            return (
                                <Grid item key={permission} xs={6} sm={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={checked}
                                                onChange={(e) => props.togglePermission(permission, e.target.checked)}
                                            />
                                        }
                                        label={permission}
                                    />
                                </Grid>
                            );
                        })}

                        {props.renderTeam?.projects?.map((project: Project) => {
                            const checkedAccess = props.selectedRole &&
                                props.selectedRole.permissions
                                ? props.selectedRole.permissions.some(
                                    (permission) =>
                                        `accessProject.${project.Project_ID}` === permission.Permission_Key
                                )
                                : false;
                            const checkedManage = props.selectedRole &&
                                props.selectedRole.permissions
                                ? props.selectedRole.permissions.some(
                                    (permission) =>
                                        `manageProject.${project.Project_ID}` === permission.Permission_Key
                                )
                                : false;

                            const permissions = [
                                {
                                    key1: `accessProject.${project.Project_ID}`,
                                    label1: `Access Project: ${project.Project_Name}`,
                                    checked1: checkedAccess,
                                    key2: `manageProject.${project.Project_ID}`,
                                    label2: `Manage Project: ${project.Project_Name}`,
                                    checked2: checkedManage,
                                },
                            ];

                            project.backlogs?.forEach((backlog: Backlog) => {
                                const checkedAccess = props.selectedRole &&
                                    props.selectedRole.permissions
                                    ? props.selectedRole.permissions.some(
                                        (permission) =>
                                            `accessBacklog.${backlog.Backlog_ID}` === permission.Permission_Key
                                    )
                                    : false;
                                const checkedManage = props.selectedRole &&
                                    props.selectedRole.permissions
                                    ? props.selectedRole.permissions.some(
                                        (permission) =>
                                            `manageBacklog.${backlog.Backlog_ID}` === permission.Permission_Key
                                    )
                                    : false;

                                permissions.push({
                                    key1: `accessBacklog.${backlog.Backlog_ID}`,
                                    label1: `Access Backlog: ${backlog.Backlog_Name}`,
                                    checked1: checkedAccess,
                                    key2: `manageBacklog.${backlog.Backlog_ID}`,
                                    label2: `Manage Backlog: ${backlog.Backlog_Name}`,
                                    checked2: checkedManage,
                                });
                            });

                            return permissions.map((permission) => (
                                <Grid item key={permission.key1} xs={6} sm={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={permission.checked1}
                                                onChange={async (e) => {
                                                    await props.togglePermission(permission.key1, e.target.checked);
                                                    if (!e.target.checked) {
                                                        props.togglePermission(permission.key2, false);
                                                    }
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
                                                    props.togglePermission(permission.key2, e.target.checked);
                                                    if (e.target.checked) {
                                                        await props.togglePermission(permission.key1, true);
                                                    }
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
                            props.setSelectedRole(undefined);
                            props.setDisplayNewRoleForm(false);
                        }}
                    >
                        Cancel
                    </Link>
                    <button
                        className="button-blue px-6 py-2"
                        onClick={props.handleRoleChanges}
                    >
                        {props.t('team:rolesSeatsManager:saveRole')}
                    </button>
                </Box>
            </CardContent>
        </Card>
    </FlexibleBox>
);
