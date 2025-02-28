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
import { Project, ProjectFields } from '@/types';
import { Text } from '@/components';
import Link from 'next/link';

const ProjectDetails: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { projectsById, saveProjectChanges } = useProjectsContext();

    const [theProject, setTheProject] = useState<Project | undefined>(undefined);

    useEffect(() => {
        if (projectsById) {
            const foundProject = projectsById.find((p) => p.Project_ID === parseInt(projectId));
            if (foundProject) {
                setTheProject(foundProject);
            }
        }
    }, [projectsById, projectId]);

    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        handleProjectChange(name as ProjectFields, value)
    };

    // Handle input changes for text fields
    const handleProjectChange = (field: ProjectFields, value: string) => {
        if (!theProject) return

        setTheProject((prev) => ({
            ...prev!,
            [field]: value
        }));
    }

    const handleSaveChanges = () => {
        if (theProject) saveProjectChanges(theProject, theProject.Team_ID)
    };

    if (!theProject) {
        return <div>Loading...</div>;
    }

    return (
        <Container maxWidth="lg">
            <Box mb={4}>
                <Link 
                    href={`/team/${theProject.team?.Team_ID}`}
                    className="text-xs"
                >
                    &laquo; Go to Team
                </Link>
                <Typography variant="h4" gutterBottom>
                    Project Settings
                </Typography>
                <Card>
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
                                    value={theProject.Project_Name}
                                    onChange={handleHTMLInputChange}
                                    name="Project_Name"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Text>Project Description</Text>
                                <ReactQuill
                                    className="w-full"
                                    theme="snow"
                                    value={theProject.Project_Description}
                                    onChange={(e: string) => handleProjectChange("Project_Description", e)}
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
                                    value={theProject.Project_Start_Date || ''}
                                    onChange={handleHTMLInputChange}
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
                                    value={theProject.Project_End_Date || ''}
                                    onChange={handleHTMLInputChange}
                                    name="Project_End_Date"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                        <Box mt={2}>
                            <Button variant="contained" color="primary" onClick={handleSaveChanges}>
                                Save Changes
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default ProjectDetails;
