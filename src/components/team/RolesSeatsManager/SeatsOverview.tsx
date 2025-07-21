"use client"

// External
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import React from 'react';

// Internal
import { Block } from '@/components';
import { RolesSeatsProps } from '@/components/team';
import { FlexibleBox } from '@/components/ui/flexible-box';

export const SeatsOverview: React.FC<RolesSeatsProps> = (props) => (
    <FlexibleBox
        title={props.t('team:rolesSeatsManager:seatsHeadline')}
        icon={faUsers}
        className="no-box w-auto inline-block"
        numberOfColumns={2}
    >
        {props.renderTeam && (
            <Card className="shadow-lg rounded-lg mb-4">
                <CardContent>
                    {!props.renderUserSeats.length &&
                        props.authUser &&
                        props.renderTeam?.organisation?.User_ID === props.authUser.User_ID ? (
                        <Block>{props.t('team:rolesSeatsManager:length0_iamowner')}</Block>
                    ) : (
                        <Grid container spacing={3}>
                            {Array.isArray(props.renderUserSeats) &&
                                props.renderUserSeats.map((seat) => (
                                    <Grid item xs={12} sm={6} md={4} key={seat.Seat_ID}>
                                        <Card className="border border-gray-300 rounded-lg hover:shadow-xl transition-all">
                                            <CardContent className="p-4">
                                                <Block variant="span" className="flex flex-col gap-3">
                                                    <Typography variant="h6" className="font-semibold text-lg">
                                                        {seat.user?.User_FirstName} {seat.user?.User_Surname}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {props.t('team:rolesSeatsManager:role')}: {seat.role?.Role_Name}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {props.t('team:rolesSeatsManager:status')}: {seat.Seat_Status}
                                                    </Typography>
                                                    {props.canManageTeamMembers && (
                                                        <div className="flex justify-between mt-4">
                                                            <button
                                                                onClick={() => props.handleSelectSeat(seat)}
                                                                className="blue-link w-[48%]"
                                                            >
                                                                {props.t('team:rolesSeatsManager:edit')}
                                                            </button>
                                                            <button
                                                                onClick={() => seat.Seat_ID && props.handleRemoveSeat(seat.Seat_ID)}
                                                                className="blue-link w-[48%]"
                                                            >
                                                                {props.t('team:rolesSeatsManager:remove')}
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
)
