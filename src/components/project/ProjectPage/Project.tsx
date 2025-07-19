"use client"

// External
import { faClock, faLightbulb, faList, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { Block, Text } from '@/components';
import { BacklogItem } from '@/components/project';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { ProjectFields, ProjectStates, User } from '@/types';

export type ProjectProps = {
    renderProject: ProjectStates;
    parsedPermissions: string[] | undefined
    canAccessProject: boolean | undefined
    canManageProject: boolean | undefined
    accessibleBacklogsCount: number
    authUser: User | undefined
    handleProjectChange: (field: ProjectFields, value: string) => void;
    handleSaveChanges: () => Promise<void>
    handleDeleteProject: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const Project: React.FC<ProjectProps> = (props) => (
    <Block className="page-content">
        <FlexibleBox
            title={`Project Details`}
            subtitle={props.renderProject ? props.renderProject.Project_Name : undefined}
            titleAction={
                props.renderProject && (
                    <Block className="flex flex-col sm:flex-row gap-2 items-center w-full">
                        <Link
                            href={`/team/${props.convertID_NameStringToURLFormat(props.renderProject?.team?.Team_ID ?? 0, props.renderProject.team?.Team_Name ?? "")}`}
                            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faUsers} />
                            <Text variant="span">Go to Team</Text>
                        </Link>
                    </Block>
                )
            }
            icon={faLightbulb}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <LoadingState singular="Project" renderItem={props.renderProject} permitted={props.canAccessProject}>
                {props.renderProject && (
                    <Card>
                        {props.canManageProject ? (
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
                                            value={props.renderProject.Project_Name}
                                            onChange={(e) => props.handleProjectChange("Project_Name", e.target.value)}
                                            name="Project_Name"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Project Key"
                                            variant="outlined"
                                            fullWidth
                                            value={props.renderProject.Project_Key}
                                            onChange={(e) => props.handleProjectChange("Project_Key", e.target.value)}
                                            name="Project_Key"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Text>Project Description</Text>
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
                                <Block className="mt-2 flex justify-between">
                                    <button onClick={props.handleSaveChanges} className="button-blue">
                                        Save Changes
                                    </button>
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
                                        <strong>Project Name:</strong><br />
                                        {props.renderProject.Project_Name || 'No name available'}
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <strong>Project Status:</strong><br />
                                        {props.renderProject.Project_Status}
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <strong>Project Key:</strong><br />
                                        {props.renderProject.Project_Key}-?
                                    </Grid>
                                    <Grid item xs={12}>
                                        <strong>Project Description:</strong><br />
                                        <div className="bg-gray-100 p-2" dangerouslySetInnerHTML={{
                                            __html: props.renderProject.Project_Description || 'No description available'
                                        }} />
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
                )}
            </LoadingState>
        </FlexibleBox>

        {/* Projects Overview Section */}
        {props.canAccessProject && props.renderProject && (
            <Box mb={4}>
                <FlexibleBox
                    title={`Backlogs`}
                    icon={faList}
                    subtitle={
                        `${props.accessibleBacklogsCount} backlog${props.accessibleBacklogsCount === 1 ? '' : 's'}`
                    }
                    titleAction={
                        props.renderProject && (
                            <Block className="flex flex-col sm:flex-row gap-2 items-center w-full">
                                {props.canManageProject && (
                                    <Link
                                        href={`/project/${props.convertID_NameStringToURLFormat(props.renderProject?.Project_ID ?? 0, props.renderProject.Project_Name)}/create-backlog`}
                                        className="blue-link !inline-flex gap-2 items-center"
                                    >
                                        <FontAwesomeIcon icon={faList} />
                                        <Text variant="span">Create Backlog</Text>
                                    </Link>
                                )}
                                <Link
                                    href={`/time-tracks/${props.convertID_NameStringToURLFormat(props.renderProject?.Project_ID ?? 0, props.renderProject.Project_Name)}`}
                                    className="blue-link !inline-flex gap-2 items-center"
                                >
                                    <FontAwesomeIcon icon={faClock} />
                                    <Text variant="span">Time Entries</Text>
                                </Link>
                                <Link
                                    href={`/backlogs/${props.convertID_NameStringToURLFormat(props.renderProject?.Project_ID ?? 0, props.renderProject.Project_Name)}`}
                                    className="blue-link !inline-flex gap-2 items-center"
                                >
                                    <FontAwesomeIcon icon={faList} />
                                    <Text variant="span">Backlogs and Tasks</Text>
                                </Link>
                            </Block>
                        )
                    }
                    className="no-box w-auto inline-block"
                    numberOfColumns={2}
                >
                    <Grid container spacing={3}>
                        {props.renderProject?.backlogs?.map((backlog) => props.renderProject && (
                            <BacklogItem
                                key={backlog.Backlog_ID}
                                backlog={backlog}
                                renderProject={props.renderProject}
                                authUser={props.authUser}
                            />
                        ))}
                    </Grid>
                </FlexibleBox>
            </Box>
        )}
    </Block>
)
