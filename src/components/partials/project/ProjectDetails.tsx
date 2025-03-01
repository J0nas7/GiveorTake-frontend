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
import { useProjectsContext } from '@/contexts/';
import { Project, ProjectFields, User } from '@/types';
import { Text } from '@/components';
import Link from 'next/link';
import { selectAuthUser, useTypedSelector } from '@/redux';

const ProjectDetails: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { projectById, readProjectById, saveProjectChanges } = useProjectsContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderProject, setRenderProject] = useState<Project | undefined>(undefined)

    useEffect(() => { readProjectById(parseInt(projectId)); }, [projectId]);
    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById)
            document.title = `Project: ${projectById?.Project_Name} - GiveOrTake`
        }
    }, [projectById])

    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        handleProjectChange(name as ProjectFields, value)
    };

    // Handle input changes for text fields
    const handleProjectChange = (field: ProjectFields, value: string) => {
        if (!renderProject) return

        setRenderProject((prev) => ({
            ...prev!,
            [field]: value
        }));
    }

    const handleSaveChanges = () => {
        if (renderProject) saveProjectChanges(renderProject, renderProject.Team_ID)
    };

    if (!renderProject) {
        return <div>Loading...</div>;
    }

    return (
        <ProjectDetailsView
            project={renderProject}
            authUser={authUser}
            onProjectChange={handleProjectChange}
            onSaveChanges={handleSaveChanges}
        />
    );
};

export interface ProjectDetailsViewProps {
    project: Project | undefined;
    authUser: User | undefined;
    onProjectChange: (field: ProjectFields, value: string) => void;
    onSaveChanges: () => void;
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({
    project,
    authUser,
    onProjectChange,
    onSaveChanges
}) => {
    return (
        <Box mb={4}>
            <Link href={`/team/${project?.team?.Team_ID}`} className="text-xs">
                &laquo; Go to Team
            </Link>
            <Typography variant="h4" gutterBottom>
                Project Info
            </Typography>
            <Card>
                {authUser && project?.team?.organisation?.User_ID === authUser.User_ID ? (
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Edit Project Details
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Project Name"
                                    variant="outlined"
                                    fullWidth
                                    value={project?.Project_Name}
                                    onChange={(e) => onProjectChange("Project_Name", e.target.value)}
                                    name="Project_Name"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Text>Project Description</Text>
                                <ReactQuill
                                    className="w-full"
                                    theme="snow"
                                    value={project?.Project_Description}
                                    onChange={(e: string) => onProjectChange("Project_Description", e)}
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Start Date"
                                    variant="outlined"
                                    fullWidth
                                    type="date"
                                    value={project?.Project_Start_Date || ''}
                                    onChange={(e) => onProjectChange("Project_Start_Date", e.target.value)}
                                    name="Project_Start_Date"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="End Date"
                                    variant="outlined"
                                    fullWidth
                                    type="date"
                                    value={project?.Project_End_Date || ''}
                                    onChange={(e) => onProjectChange("Project_End_Date", e.target.value)}
                                    name="Project_End_Date"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                        <Box mt={2}>
                            <Button variant="contained" color="primary" onClick={onSaveChanges}>
                                Save Changes
                            </Button>
                        </Box>
                    </CardContent>
                ) : (
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Project Details
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <strong>Project Name:</strong><br />
                                {project?.Project_Name}
                            </Grid>
                            <Grid item xs={12}>
                                <strong>Project Description:</strong><br />
                                <div className="bg-gray-100 p-2" dangerouslySetInnerHTML={{
                                    __html: project?.Project_Description || 'No description available'
                                }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <strong>Start Date:</strong><br />
                                {project?.Project_Start_Date}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <strong>End Date</strong><br />
                                {project?.Project_End_Date}
                            </Grid>
                        </Grid>
                    </CardContent>
                )}
            </Card>
        </Box>
    );
};

export default ProjectDetails;
