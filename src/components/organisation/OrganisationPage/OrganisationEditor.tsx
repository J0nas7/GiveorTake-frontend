"use client"

import { Block, Text } from "@/components/ui/block-text"
import { Card, CardContent, Grid, TextField, Typography } from "@mui/material"
import React from "react"
import { OrganisationProps } from "./Organisation"

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type OrganisationEditorProps = Pick<
    OrganisationProps,
    "renderOrganisation" |
    "canModifyOrganisationSettings" |
    "handleOrganisationChange" |
    "handleSaveChanges" |
    "handleDeleteOrganisation" |
    "showEditToggles"
>

export const OrganisationEditor: React.FC<OrganisationEditorProps> = (props) => props.renderOrganisation && (
    <Card>
        <CardContent>
            <Typography variant="h6" gutterBottom>Organisation Details</Typography>

            {props.canModifyOrganisationSettings && props.showEditToggles ? (
                <>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Organisation Name"
                                variant="outlined"
                                fullWidth
                                value={props.renderOrganisation.Organisation_Name}
                                onChange={(e) =>
                                    props.handleOrganisationChange("Organisation_Name", e.target.value)
                                }
                                name="Organisation_Name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Text>Organisation Description</Text>
                            <ReactQuill
                                className="w-full"
                                theme="snow"
                                value={props.renderOrganisation.Organisation_Description}
                                onChange={(value) =>
                                    props.handleOrganisationChange("Organisation_Description", value)
                                }
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
                        <button
                            onClick={props.handleDeleteOrganisation}
                            className="blue-link-light red-link-light"
                        >
                            Delete Organisation
                        </button>
                    </Block>
                </>
            ) : (
                <>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <strong>Organisation Name:</strong>
                            <br />
                            {props.renderOrganisation.Organisation_Name}
                        </Grid>
                        <Grid item xs={12}>
                            <div
                                className="bg-gray-100 p-2"
                                dangerouslySetInnerHTML={{
                                    __html: props.renderOrganisation.Organisation_Description || "No description available",
                                }}
                            />
                        </Grid>
                    </Grid>
                </>
            )}
        </CardContent>
    </Card >
)
