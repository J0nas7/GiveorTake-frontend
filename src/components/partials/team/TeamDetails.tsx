"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { TextField, Button, Card, CardContent, Typography, Grid, Container, Box } from '@mui/material';

// Dynamically import ReactQuill with SSR disabled
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { useTeamsContext } from '@/contexts/';
import { Team, TeamFields } from '@/types';
import Link from 'next/link';
import { Text } from '@/components';
import { selectAuthUser, useTypedSelector } from '@/redux';

const TeamDetails: React.FC = () => {
    const { teamId } = useParams<{ teamId: string }>(); // Get teamId from URL
    const { teams, saveTeamChanges } = useTeamsContext();

    const [theTeam, setTheTeam] = useState<Team | undefined>(undefined);
    const authUser = useTypedSelector(selectAuthUser) // Redux

    useEffect(() => {
        if (teams) {
            const foundTeam = teams.find((t) => t.Team_ID === parseInt(teamId));
            if (foundTeam) {
                setTheTeam(foundTeam);
            }
        }
    }, [teams, teamId]);

    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        handleTeamChange(name as TeamFields, value)
    };

    // Handle input changes for text fields
    const handleTeamChange = (field: TeamFields, value: string) => {
        if (!theTeam) return

        setTheTeam((prev) => ({
            ...prev!,
            [field]: value
        }));
    }

    const handleSaveChanges = () => {
        if (theTeam) {
            saveTeamChanges(theTeam);
        }
    };

    if (!theTeam) {
        return <div>Loading...</div>;
    }

    return (
        <Container maxWidth="lg">
            <Box mb={4}>
                <Link
                    href={`/organisation/${theTeam.organisation?.Organisation_ID}`}
                    className="text-xs"
                >
                    &laquo; Go to Organisation
                </Link>
                <Typography variant="h4" gutterBottom>
                    Team Settings
                </Typography>
                <Card>
                    {authUser && theTeam.organisation?.User_ID === authUser.User_ID ? (
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Edit Team Details
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Team Name"
                                        variant="outlined"
                                        fullWidth
                                        value={theTeam.Team_Name}
                                        onChange={handleHTMLInputChange}
                                        name="Team_Name"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Text>Team Description</Text>
                                    <ReactQuill
                                        className="w-full"
                                        theme="snow"
                                        value={theTeam.Team_Description}
                                        onChange={(e: string) => handleTeamChange("Team_Description", e)}
                                        modules={{
                                            toolbar: [
                                                [{ header: "1" }, { header: "2" }, { font: [] }],
                                                [{ list: "ordered" }, { list: "bullet" }],
                                                ["bold", "italic", "underline", "strike"],
                                                [{ align: [] }],
                                                ["link"],
                                                ["blockquote"],
                                            ],
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Box mt={2}>
                                <Button variant="contained" color="primary" onClick={handleSaveChanges}>
                                    Save Changes
                                </Button>
                            </Box>
                        </CardContent>
                    ) : (
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Team Details
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <strong>Team Name:</strong><br />
                                    {theTeam.Team_Name}
                                </Grid>
                                <Grid item xs={12}>
                                    <strong>Team Description:</strong><br />
                                    <div className="bg-gray-100 p-2" dangerouslySetInnerHTML={{
                                        __html: theTeam.Team_Description || "No description available"
                                    }} />
                                </Grid>
                            </Grid>
                        </CardContent>
                    )}
                </Card>
            </Box>

            {/* Projects Overview Section */}
            <Box mb={4}>
                <Typography variant="h5" gutterBottom>
                    Projects Overview
                </Typography>
                <Grid container spacing={3}>
                    {theTeam.projects?.map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project.Project_ID}>
                            <Card>
                                <CardContent>
                                    <Link
                                        href={`/project/${project.Project_ID}`} passHref
                                        className="blue-link"
                                    >
                                        <Typography variant="h6" component="a" sx={{ textDecoration: 'none', color: 'inherit' }}>
                                            {project.Project_Name}
                                        </Typography>
                                    </Link>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        <div dangerouslySetInnerHTML={{
                                            __html: project.Project_Description || 'No description available'
                                        }} />
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Status: {project.Project_Status}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Start Date: {project.Project_Start_Date || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        End Date: {project.Project_End_Date || 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default TeamDetails;
