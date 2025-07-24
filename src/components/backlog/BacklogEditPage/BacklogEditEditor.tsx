"use client"

import { Block } from '@/components';
import { BacklogEditProps } from '@/components/backlog';
import { Card, CardContent, Grid, TextField, Typography } from '@mui/material';

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type BacklogEditorProps = Pick<
    BacklogEditProps,
    "localBacklog" |
    "handleBacklogChange" |
    "handleBacklogInputChange" |
    "handleDeleteBacklog" |
    "canManageBacklog" |
    "showEditToggles"
>

export const BacklogEditEditor: React.FC<BacklogEditorProps> = (props) => props.localBacklog && (
    <Block className="editor-wrapper">
        <Card>
            {props.canManageBacklog && props.showEditToggles ? (
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Edit Backlog Details
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Name"
                                variant="outlined"
                                fullWidth
                                value={props.localBacklog.Backlog_Name}
                                onChange={props.handleBacklogInputChange}
                                name="Backlog_Name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography>Description</Typography>
                            <ReactQuill
                                className="w-full"
                                theme="snow"
                                value={props.localBacklog.Backlog_Description}
                                onChange={(e: string) => props.handleBacklogChange("Backlog_Description", e)}
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
                                type="date"
                                variant="outlined"
                                fullWidth
                                value={props.localBacklog.Backlog_StartDate || ''}
                                onChange={(e) => props.handleBacklogChange("Backlog_StartDate", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="End Date"
                                type="date"
                                variant="outlined"
                                fullWidth
                                value={props.localBacklog.Backlog_EndDate || ''}
                                onChange={(e) => props.handleBacklogChange("Backlog_EndDate", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                    <Block className="button-right">
                        <button onClick={props.handleDeleteBacklog} className="blue-link-light red-link-light">
                            Delete Backlog
                        </button>
                    </Block>
                </CardContent>
            ) : (
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Backlog Details
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <strong>Name:</strong><br />
                            {props.localBacklog.Backlog_Name}
                        </Grid>
                        <Grid item xs={12}>
                            <strong>Description:</strong>
                            <div
                                className="description-area"
                                dangerouslySetInnerHTML={{
                                    __html: props.localBacklog.Backlog_Description || "No description provided",
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <strong>Start:</strong> {props.localBacklog.Backlog_StartDate || "N/A"}
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <strong>End:</strong> {props.localBacklog.Backlog_EndDate || "N/A"}
                        </Grid>
                    </Grid>
                </CardContent>
            )}
        </Card>
    </Block>
)
