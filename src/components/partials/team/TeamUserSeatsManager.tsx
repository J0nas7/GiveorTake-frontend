"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { TextField, Button, Card, CardContent, Typography, Grid, Container, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Internal
import { useTeamsContext, useTeamUserSeatsContext, useUsersContext } from '@/contexts';
import { Team, TeamUserSeat, TeamUserSeatFields, User } from '@/types';
import { Block } from '@/components';
import { selectAuthUser, useTypedSelector } from '@/redux';

const TeamUserSeatsManager: React.FC = () => {
    const { t } = useTranslation(['team'])

    const { teamId } = useParams<{ teamId: string }>(); // Get teamId from URL
    const { teamUserSeatsById, readTeamUserSeatsByTeamId, saveTeamUserSeatChanges, removeTeamUserSeat } = useTeamUserSeatsContext();
    const { teamById, readTeamById } = useTeamsContext();
    const { addUser } = useUsersContext(); // Assuming you have a `UsersContext` for adding new users
    const authUser = useTypedSelector(selectAuthUser); // Redux

    const [renderUserSeats, setRenderUserSeats] = useState<TeamUserSeat[]>([]);
    const [renderTeam, setRenderTeam] = useState<Team|undefined>(undefined);
    const [selectedSeat, setSelectedSeat] = useState<TeamUserSeat | undefined>(undefined);

    // New User Form State
    const [newUserDetails, setNewUserDetails] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role: 'user', // default role
        status: 'active', // default status
    });

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

    const handleSaveChanges = () => {
        if (selectedSeat) {
            saveTeamUserSeatChanges(selectedSeat, parseInt(teamId));
        }
    };

    const handleRemoveSeat = (seatId: number) => {
        removeTeamUserSeat(seatId, parseInt(teamId));
    };

    const handleSeatChange = (field: TeamUserSeatFields, value: string) => {
        if (selectedSeat) {
            setSelectedSeat((prevSeat) => ({
                ...prevSeat!,
                [field]: value,
            }));
        }
    };

    const handleSelectSeat = (seat: TeamUserSeat) => {
        setSelectedSeat(seat);
    };

    const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUserDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

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

    return (
        <>
            <Container maxWidth="lg">
                <Box mb={6}>
                    <Typography variant="h4" className="font-bold mb-4">
                        {t('team:seatsManager:manageTeamUserSeats')}
                    </Typography>

                    <Card className="shadow-lg rounded-lg mb-4">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('team:seatsManager:teamUserSeats')}
                            </Typography>

                            {!renderUserSeats.length && 
                            authUser && renderTeam?.organisation?.User_ID === authUser.User_ID ? (
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

                                                        <div className="flex justify-between mt-4">
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() => handleSelectSeat(seat)}
                                                                className="w-[48%]"
                                                            >
                                                                {t('team:seatsManager:edit')}
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() => seat.Seat_ID && handleRemoveSeat(seat.Seat_ID)}
                                                                className="w-[48%]"
                                                            >
                                                                {t('team:seatsManager:remove')}
                                                            </Button>
                                                        </div>
                                                    </Block>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg rounded-lg mt-6">
                        <CardContent className="p-4">
                            <Typography variant="h6" gutterBottom>
                                {t('team:seatsManager:createNewUserAndAssignSeat')}
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label={t('team:seatsManager:firstName')}
                                        variant="outlined"
                                        fullWidth
                                        name="firstName"
                                        value={newUserDetails.firstName}
                                        onChange={handleUserInputChange}
                                        className="bg-white"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label={t('team:seatsManager:lastName')}
                                        variant="outlined"
                                        fullWidth
                                        name="lastName"
                                        value={newUserDetails.lastName}
                                        onChange={handleUserInputChange}
                                        className="bg-white"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label={t('team:seatsManager:email')}
                                        variant="outlined"
                                        fullWidth
                                        name="email"
                                        value={newUserDetails.email}
                                        onChange={handleUserInputChange}
                                        className="bg-white"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t('team:seatsManager:role')}</InputLabel>
                                        <Select
                                            value={newUserDetails.role}
                                            onChange={(e) =>
                                                setNewUserDetails((prev) => ({
                                                    ...prev,
                                                    role: e.target.value,
                                                }))
                                            }
                                            className="bg-white"
                                        >
                                            <MenuItem value="user">{t('team:seatsManager:user')}</MenuItem>
                                            <MenuItem value="admin">{t('team:seatsManager:admin')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Box mt={4} className="flex justify-end">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleCreateNewUser}
                                    className="px-6 py-2"
                                >
                                    {t('team:seatsManager:createAndAssignSeat')}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {selectedSeat && (
                        <Card className="shadow-lg rounded-lg mt-4">
                            <CardContent className="p-4">
                                <Typography variant="h6" gutterBottom className="font-semibold">
                                    {t('team:seatsManager:editUserSeat')}
                                </Typography>

                                <Grid container spacing={3}>
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
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>{t('team:seatsManager:status')}</InputLabel>
                                            <Select
                                                value={selectedSeat.Seat_Status}
                                                onChange={(e) => handleSeatChange('Seat_Status', e.target.value)}
                                                className="bg-white"
                                            >
                                                <MenuItem value="active">{t('team:seatsManager:active')}</MenuItem>
                                                <MenuItem value="inactive">{t('team:seatsManager:inactive')}</MenuItem>
                                                <MenuItem value="pending">{t('team:seatsManager:pending')}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Box mt={4} className="flex justify-end">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSaveChanges}
                                        className="px-6 py-2"
                                    >
                                        {t('team:seatsManager:saveChanges')}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </Container>
        </>
    );
};

export default TeamUserSeatsManager;
