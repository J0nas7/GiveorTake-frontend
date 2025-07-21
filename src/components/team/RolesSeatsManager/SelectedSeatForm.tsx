"use client"

// External
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Box, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { TFunction } from 'next-i18next';
import Link from 'next/link';
import React from 'react';

// Internal
import { FlexibleBox } from '@/components/ui/flexible-box';
import { Role, TeamStates, TeamUserSeat, TeamUserSeatFields } from '@/types';

export type SelectedSeatFormProps = {
    selectedSeat: TeamUserSeat | undefined
    rolesAndPermissionsByTeamId: Role[] | undefined
    handleSeatChange: (field: TeamUserSeatFields, value: string) => void
    t: TFunction
    availablePermissions: string[]
    togglePermission: (permission: string, isChecked: boolean) => Promise<void>
    renderTeam: TeamStates
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<string>>
    handleSeatChanges: () => void
}

export const SelectedSeatForm: React.FC<SelectedSeatFormProps> = (props) => props.selectedSeat && props.renderTeam && (
    <FlexibleBox
        title={props.t('team:rolesSeatsManager:editUserSeat')}
        subtitle={`${props.selectedSeat.user?.User_FirstName} ${props.selectedSeat.user?.User_Surname}`}
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
                            <InputLabel>{props.t('team:rolesSeatsManager:userRole')}</InputLabel>
                            <Select
                                value={props.selectedSeat.Role_ID}
                                onChange={(e) => props.handleSeatChange('Role_ID', e.target.value.toString())}
                                className="bg-white"
                            >
                                {Array.isArray(props.rolesAndPermissionsByTeamId) && props.rolesAndPermissionsByTeamId.map((role) => (
                                    <MenuItem value={role.Role_ID}>{role.Role_Name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Status Dropdown */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>{props.t('team:rolesSeatsManager:status')}</InputLabel>
                            <Select
                                value={props.selectedSeat.Seat_Status}
                                onChange={(e) => props.handleSeatChange('Seat_Status', e.target.value)}
                                className="bg-white"
                            >
                                <MenuItem value="Active">{props.t('team:rolesSeatsManager:active')}</MenuItem>
                                <MenuItem value="Inactive">{props.t('team:rolesSeatsManager:inactive')}</MenuItem>
                                <MenuItem value="Pending">{props.t('team:rolesSeatsManager:pending')}</MenuItem>
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
                            props.setSelectedSeat(undefined)
                            props.setDisplayInviteForm("")
                        }}
                    >
                        Cancel
                    </Link>
                    <button
                        className="button-blue px-6 py-2"
                        onClick={props.handleSeatChanges}
                    >
                        {props.t('team:rolesSeatsManager:saveChanges')}
                    </button>
                </Box>
            </CardContent>
        </Card>
    </FlexibleBox>
)
