"use client"

// External
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from "next/navigation";
import { TextField, Card, CardContent, Typography, Grid, Box } from '@mui/material';

// Dynamically import ReactQuill with SSR disabled
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { useTeamsContext } from '@/contexts/';
import { Team, TeamFields, TeamStates, User } from '@/types';
import { Block, Heading, Text } from '@/components';
import { selectAuthUser, selectDeleteConfirm, setDeleteConfirm, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FlexibleBox } from '@/components/ui/flexible-box';
import Image from 'next/image';

const TeamDetails: React.FC = () => {
    // Hooks
    const dispatch = useAppDispatch()
    const router = useRouter()
    const pathname = usePathname(); // Get the current pathname
    const { teamId } = useParams<{ teamId: string }>(); // Get teamId from URL
    const { teamById, readTeamById, saveTeamChanges, removeTeam } = useTeamsContext()

    // State
    const authUser = useTypedSelector(selectAuthUser)
    const [renderTeam, setRenderTeam] = useState<TeamStates>(undefined)

    // Effects
    useEffect(() => { readTeamById(parseInt(teamId)); }, [teamId]);
    useEffect(() => {
        if (teamId) {
            setRenderTeam(teamById)
            if (teamById) document.title = `Team: ${teamById.Team_Name} - GiveOrTake`
        }
    }, [teamById]);

    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        handleTeamChange(name as TeamFields, value)
    };

    // Handle input changes for text fields
    const handleTeamChange = (field: TeamFields, value: string) => {
        if (!renderTeam) return

        setRenderTeam({
            ...renderTeam,
            [field]: value
        });
    }

    const handleSaveChanges = async () => {
        if (renderTeam) {
            const saveChanges = await saveTeamChanges(renderTeam, renderTeam.Organisation_ID)

            dispatch(setSnackMessage(
                saveChanges ? "Team changes saved successfully!" : "Failed to save team changes."
            ))
        }
    };

    const handleDeleteTeam = async () => {
        if (!renderTeam || !renderTeam.Team_ID) return
        const removed = await removeTeam(
            renderTeam.Team_ID,
            renderTeam.Organisation_ID,
            `/organisation/${renderTeam.Organisation_ID}`
        )
    }

    return (
        <TeamDetailsView
            renderTeam={renderTeam}
            authUser={authUser}
            pathname={pathname}
            handleHTMLInputChange={handleHTMLInputChange}
            handleTeamChange={handleTeamChange}
            handleSaveChanges={handleSaveChanges}
            handleDeleteTeam={handleDeleteTeam}
        />
    );
};

export interface TeamDetailsViewProps {
    renderTeam: TeamStates;
    authUser: User | undefined;
    pathname: string;
    handleHTMLInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTeamChange: (field: TeamFields, value: string) => void;
    handleSaveChanges: () => Promise<void>
    handleDeleteTeam: () => Promise<void>
}

export const TeamDetailsView: React.FC<TeamDetailsViewProps> = ({
    renderTeam,
    authUser,
    pathname,
    handleHTMLInputChange,
    handleTeamChange,
    handleSaveChanges,
    handleDeleteTeam,
}) => {

    return (
        <Block className="page-content">
            {renderTeam && (
                <Link
                    href={`/organisation/${renderTeam.organisation?.Organisation_ID}`}
                    className="blue-link"
                >
                    &laquo; Go to Organisation
                </Link>
            )}
            <FlexibleBox
                title="Team Settings"
                icon={faUsers}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
                titleAction={
                    renderTeam && (
                        <Block className="flex flex-col sm:flex-row gap-2">
                            <Link
                                href={`${pathname}/seats`}
                                className="blue-link !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faUsers} />
                                <Text variant="span">Seats</Text>
                            </Link>
                            {authUser && renderTeam.organisation?.User_ID === authUser.User_ID && (
                                <Link
                                    href={`${pathname}/create-project`}
                                    className="blue-link !inline-flex gap-2 items-center"
                                >
                                    <FontAwesomeIcon icon={faLightbulb} />
                                    <Text variant="span">Create Project</Text>
                                </Link>
                            )}
                        </Block>
                    )
                }
            >
                {renderTeam === false ? (
                    <Block className="text-center">
                        <Text className="text-gray-400">
                            Team not found
                        </Text>
                    </Block>
                ) : renderTeam === undefined ? (
                    <Block className="flex justify-center">
                        <Image
                            src="/spinner-loader.gif"
                            alt="Loading..."
                            width={45}
                            height={45}
                        />
                    </Block>
                ) : (
                    <Card>
                        {authUser && renderTeam.organisation?.User_ID === authUser.User_ID ? (
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
                                            value={renderTeam.Team_Name}
                                            onChange={handleHTMLInputChange}
                                            name="Team_Name"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography>Team Description</Typography>
                                        <ReactQuill
                                            className="w-full"
                                            theme="snow"
                                            value={renderTeam.Team_Description}
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
                                <Block className="mt-2 flex justify-between">
                                    <button onClick={handleSaveChanges} className="button-blue">
                                        Save Changes
                                    </button>
                                    <button onClick={handleDeleteTeam} className="blue-link-light red-link-light">
                                        Delete Team
                                    </button>
                                </Block>
                            </CardContent>
                        ) : (
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Team Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <strong>Team Name:</strong><br />
                                        {renderTeam.Team_Name}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <strong>Team Description:</strong><br />
                                        <div className="bg-gray-100 p-2" dangerouslySetInnerHTML={{
                                            __html: renderTeam.Team_Description || "No description available"
                                        }} />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        )}
                    </Card>
                )}
            </FlexibleBox>

            {/* Projects Overview Section */}
            {renderTeam && (
                <Box mb={4}>
                    <Typography variant="h5" gutterBottom>
                        Projects Overview
                    </Typography>
                    <Grid container spacing={3}>
                        {renderTeam.projects?.map((project) => (
                            <Grid item xs={12} sm={6} md={4} key={project.Project_ID}>
                                <Card>
                                    <CardContent>
                                        <Link href={`/project/${project.Project_ID}`} className="blue-link-light">
                                            {project.Project_Name}
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
            )}
        </Block>
    );
};

export default TeamDetails;
