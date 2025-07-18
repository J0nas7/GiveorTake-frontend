"use client"

import { Block, Text } from "@/components/ui/block-text"
import { Card, CardContent, Grid, TextField, Typography } from "@mui/material"
import React from "react"
import { OrganisationEditProps } from "./OrganisationEdit"

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type OrganisationDetailsCardProps = Pick<
    OrganisationEditProps,
    "renderOrganisation" |
    "canModifyOrganisationSettings" |
    "handleOrganisationChange" |
    "handleSaveChanges" |
    "handleDeleteOrganisation"
>

export const OrganisationDetailsCard: React.FC<OrganisationDetailsCardProps> = (props) => props.renderOrganisation && (
    <Card>
        <CardContent>
            <Typography variant="h6" gutterBottom>
                {props.canModifyOrganisationSettings ? "Edit Organisation Details" : "Organisation Details"}
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    {props.canModifyOrganisationSettings ? (
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
                    ) : (
                        <>
                            <strong>Organisation Name:</strong>
                            <br />
                            {props.renderOrganisation.Organisation_Name}
                        </>
                    )}
                </Grid>

                <Grid item xs={12}>
                    <Text>Organisation Description</Text>
                    {props.canModifyOrganisationSettings ? (
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
                    ) : (
                        <div
                            className="bg-gray-100 p-2"
                            dangerouslySetInnerHTML={{
                                __html: props.renderOrganisation.Organisation_Description || "No description available",
                            }}
                        />
                    )}
                </Grid>
            </Grid>

            {props.canModifyOrganisationSettings && (
                <Block className="mt-2 flex justify-between">
                    <button onClick={props.handleSaveChanges} className="button-blue">
                        Save Changes
                    </button>
                    <button
                        onClick={props.handleDeleteOrganisation}
                        className="blue-link-light red-link-light"
                    >
                        Delete Organisation
                    </button>
                </Block>
            )}
        </CardContent>
    </Card>
)
