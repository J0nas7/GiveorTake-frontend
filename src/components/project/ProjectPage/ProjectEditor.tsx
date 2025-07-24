"use client"

// External
import { Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import React from 'react';

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { Block, Text } from '@/components';
import { ProjectProps } from '@/components/project';

type ProjectEditorProps = Pick<
    ProjectProps,
    "renderProject" |
    "canManageProject" |
    "showEditToggles" |
    "handleProjectChange" |
    "handleDeleteProject"
>

export const ProjectEditor: React.FC<ProjectEditorProps> = (props) => props.renderProject && (
    <Block className="editor-wrapper">
        <Card>
            {props.canManageProject && props.showEditToggles ? (
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Edit Project Details
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Name"
                                variant="outlined"
                                fullWidth
                                value={props.renderProject.Project_Name}
                                onChange={(e) => props.handleProjectChange("Project_Name", e.target.value)}
                                name="Project_Name"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Key"
                                variant="outlined"
                                fullWidth
                                value={props.renderProject.Project_Key}
                                onChange={(e) => props.handleProjectChange("Project_Key", e.target.value)}
                                name="Project_Key"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Text>Description</Text>
                            <ReactQuill
                                className="w-full"
                                theme="snow"
                                value={props.renderProject.Project_Description}
                                onChange={(e: string) => props.handleProjectChange("Project_Description", e)}
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
                                value={props.renderProject.Project_Start_Date || ''}
                                onChange={(e) => props.handleProjectChange("Project_Start_Date", e.target.value)}
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
                                value={props.renderProject.Project_End_Date || ''}
                                onChange={(e) => props.handleProjectChange("Project_End_Date", e.target.value)}
                                name="Project_End_Date"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                    <Block className="button-right">
                        <button onClick={props.handleDeleteProject} className="blue-link-light red-link-light">
                            Delete Project
                        </button>
                    </Block>
                </CardContent>
            ) : (
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Project Details
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <strong>Name:</strong><br />
                            {props.renderProject.Project_Name || 'No name available'}
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <strong>Status:</strong><br />
                            {props.renderProject.Project_Status}
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <strong>Key:</strong><br />
                            {props.renderProject.Project_Key}-
                        </Grid>
                        <Grid item xs={12}>
                            <strong>Description:</strong><br />
                            <div
                                className="description-area"
                                dangerouslySetInnerHTML={{
                                    __html: props.renderProject.Project_Description || 'No description available'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <strong>Start Date:</strong><br />
                            {props.renderProject.Project_Start_Date}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <strong>End Date</strong><br />
                            {props.renderProject.Project_End_Date}
                        </Grid>
                    </Grid>
                </CardContent>
            )}
        </Card>
    </Block>
)
