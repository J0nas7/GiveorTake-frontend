"use client"

// External
import { faShield } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import React from 'react';

// Internal
import { RolesSeatsProps } from '@/components/team';
import { FlexibleBox } from '@/components/ui/flexible-box';

export const RolesOverview: React.FC<RolesSeatsProps> = (props) => (
    <FlexibleBox
        title={props.t('team:rolesSeatsManager:rolesHeadline')}
        icon={faShield}
        className="no-box w-auto inline-block"
        numberOfColumns={2}
    >
        {props.renderTeam && (
            <Card className="shadow-lg rounded-lg mb-4">
                <CardContent>
                    <Grid container spacing={3}>
                        {Array.isArray(props.rolesAndPermissionsByTeamId) &&
                            props.rolesAndPermissionsByTeamId.map((role) => (
                                <Grid item xs={12} sm={6} md={4} key={role.Role_ID}>
                                    <Card className="border border-gray-300 rounded-lg hover:shadow-xl transition-all p-3">
                                        <Typography variant="h6" className="font-semibold text-lg">
                                            {role.Role_Name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Permissions: {role.permissions?.length}
                                        </Typography>
                                        {props.canManageTeamMembers && (
                                            <div className="flex justify-between mt-4">
                                                <button
                                                    onClick={() => props.handleSelectRole(role)}
                                                    className="blue-link w-[48%]"
                                                >
                                                    {props.t('team:rolesSeatsManager:edit')}
                                                </button>
                                                <button
                                                    onClick={() => role.Role_ID && props.handleRemoveRole(role.Role_ID)}
                                                    className="blue-link w-[48%]"
                                                >
                                                    {props.t('team:rolesSeatsManager:remove')}
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
)
