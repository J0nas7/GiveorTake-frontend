"use client"

// External
import { Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import React from 'react';

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

// Internal
import { Block } from '@/components';
import { TeamProps } from '@/components/team';

type TeamEditorProps = Pick<
    TeamProps,
    "renderTeam" |
    "canModifyTeamSettings" |
    "handleTeamChange" |
    "handleSaveChanges" |
    "handleHTMLInputChange" |
    "handleDeleteTeam" |
    "showEditToggles"
>

export const TeamEditor: React.FC<TeamEditorProps> = (props) => props.renderTeam && (
    <Block className="editor-wrapper">
        <Card>
            {props.canModifyTeamSettings && props.showEditToggles ? (
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Edit Team Details
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Name"
                                variant="outlined"
                                fullWidth
                                value={props.renderTeam.Team_Name}
                                onChange={props.handleHTMLInputChange}
                                name="Team_Name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography>Description</Typography>
                            <ReactQuill
                                className="w-full"
                                theme="snow"
                                value={props.renderTeam.Team_Description}
                                onChange={(e: string) => props.handleTeamChange("Team_Description", e)}
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
                    <Block className="mt-2 flex justify-end">
                        <button onClick={props.handleDeleteTeam} className="blue-link-light red-link-light">
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
                            <strong>Name:</strong><br />
                            {props.renderTeam.Team_Name}
                        </Grid>
                        <Grid item xs={12}>
                            <strong>Description:</strong><br />
                            <p
                                className="description-area"
                                dangerouslySetInnerHTML={{
                                    __html: props.renderTeam.Team_Description || "No description available"
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            )}
        </Card>
    </Block>
)
