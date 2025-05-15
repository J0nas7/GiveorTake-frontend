"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { TextField, Card, CardContent, Typography, Box, Grid } from '@mui/material';
import Link from 'next/link';
import { faClock, faGauge, faLightbulb, faList, faUsers, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';

// Dynamically import ReactQuill with SSR disabled
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { useProjectsContext } from '@/contexts/';
import { Project, ProjectFields, ProjectStates, User } from '@/types';
import { Block, Heading, Text } from '@/components';
import { selectAuthUser, useTypedSelector } from '@/redux';
import { FlexibleBox } from '@/components/ui/flexible-box';
import Image from 'next/image';
import { LoadingState } from '@/core-ui/components/LoadingState';

const ProjectDetails: React.FC = () => {
    // Hooks
    const router = useRouter()
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { projectById, readProjectById, saveProjectChanges, removeProject } = useProjectsContext()

    // State
    const authUser = useTypedSelector(selectAuthUser)
    const [renderProject, setRenderProject] = useState<ProjectStates>(undefined)

    // Effects
    useEffect(() => { readProjectById(parseInt(projectId)); }, [projectId]);
    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById)
            if (projectById) document.title = `Project: ${projectById.Project_Name} - GiveOrTake`
        }
    }, [projectById])

    // Methods
    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        handleProjectChange(name as ProjectFields, value)
    };

    // Handle input changes for text fields
    const handleProjectChange = (field: ProjectFields, value: string) => {
        if (!renderProject) return

        setRenderProject({
            ...renderProject,
            [field]: value
        });
    }

    const handleSaveChanges = async () => {
        if (renderProject) await saveProjectChanges(renderProject, renderProject.Team_ID)
    }

    const handleDeleteProject = async () => {
        if (!renderProject || !renderProject.Project_ID) return
        const removed = await removeProject(
            renderProject.Project_ID,
            renderProject.Team_ID,
            `/team/${renderProject.Team_ID}`
        )
    }

    return (
        <ProjectDetailsView
            renderProject={renderProject}
            authUser={authUser}
            handleProjectChange={handleProjectChange}
            handleSaveChanges={handleSaveChanges}
            handleDeleteProject={handleDeleteProject}
        />
    );
};

export interface ProjectDetailsViewProps {
    renderProject: ProjectStates;
    authUser: User | undefined;
    handleProjectChange: (field: ProjectFields, value: string) => void;
    handleSaveChanges: () => Promise<void>
    handleDeleteProject: () => Promise<void>
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({
    renderProject,
    authUser,
    handleProjectChange,
    handleSaveChanges,
    handleDeleteProject
}) => {
    const STATUSES = ["To Do", "In Progress", "Waiting for Review", "Done"]

    return (
        <Block className="page-content">
            <FlexibleBox
                title={`Project Details`}
                subtitle={renderProject ? renderProject.Project_Name : undefined}
                titleAction={
                    renderProject && (
                        <Block className="flex flex-col sm:flex-row gap-2 items-center w-full">
                            <Link
                                href={`/team/${renderProject?.team?.Team_ID}`}
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
                <LoadingState singular="Project" renderItem={renderProject} permitted={undefined}>
                    {renderProject && (
                        <Card>
                            {authUser && renderProject.team?.organisation?.User_ID === authUser.User_ID ? (
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
                                                value={renderProject.Project_Name}
                                                onChange={(e) => handleProjectChange("Project_Name", e.target.value)}
                                                name="Project_Name"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Project Key"
                                                variant="outlined"
                                                fullWidth
                                                value={renderProject.Project_Key}
                                                onChange={(e) => handleProjectChange("Project_Key", e.target.value)}
                                                name="Project_Key"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Text>Project Description</Text>
                                            <ReactQuill
                                                className="w-full"
                                                theme="snow"
                                                value={renderProject.Project_Description}
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
                                                value={renderProject.Project_Start_Date || ''}
                                                onChange={(e) => handleProjectChange("Project_Start_Date", e.target.value)}
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
                                                value={renderProject.Project_End_Date || ''}
                                                onChange={(e) => handleProjectChange("Project_End_Date", e.target.value)}
                                                name="Project_End_Date"
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Block className="mt-2 flex justify-between">
                                        <button onClick={handleSaveChanges} className="button-blue">
                                            Save Changes
                                        </button>
                                        <button onClick={handleDeleteProject} className="blue-link-light red-link-light">
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
                                            {renderProject.Project_Name || 'No name available'}
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <strong>Project Status:</strong><br />
                                            {renderProject.Project_Status}
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <strong>Project Key:</strong><br />
                                            {renderProject.Project_Key}-0
                                        </Grid>
                                        <Grid item xs={12}>
                                            <strong>Project Description:</strong><br />
                                            <div className="bg-gray-100 p-2" dangerouslySetInnerHTML={{
                                                __html: renderProject.Project_Description || 'No description available'
                                            }} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <strong>Start Date:</strong><br />
                                            {renderProject.Project_Start_Date}
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <strong>End Date</strong><br />
                                            {renderProject.Project_End_Date}
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            )}
                        </Card>
                    )}
                </LoadingState>
            </FlexibleBox>

            {/* Projects Overview Section */}
            {renderProject && (
                <Box mb={4}>
                    <FlexibleBox
                        title={`Backlogs`}
                        icon={faList}
                        subtitle={`${renderProject?.backlogs?.length} total`}
                        titleAction={
                            renderProject && (
                                <Block className="flex flex-col sm:flex-row gap-2 items-center w-full">
                                    <Link
                                        href={`/time-tracks/project/${renderProject?.Project_ID}`}
                                        className="blue-link !inline-flex gap-2 items-center"
                                    >
                                        <FontAwesomeIcon icon={faClock} />
                                        <Text variant="span">Time Entries</Text>
                                    </Link>
                                    <Link
                                        href={`/backlogs/${renderProject.Project_ID}`}
                                        className="blue-link !inline-flex gap-2 items-center"
                                    >
                                        <FontAwesomeIcon icon={faList} />
                                        <Text variant="span">All Backlogs and Tasks</Text>
                                    </Link>
                                </Block>
                            )
                        }
                        className="no-box w-auto inline-block"
                        numberOfColumns={2}
                    >
                        <Grid container spacing={3}>
                            {renderProject?.backlogs?.map((backlog) => (
                                <Grid item xs={12} sm={6} md={4} key={backlog.Backlog_ID}>
                                    <Card>
                                        <CardContent>
                                            <Text variant="p" className="font-semibold">
                                                {backlog.Backlog_Name}
                                            </Text>

                                            <Typography variant="body2" color="textSecondary" paragraph>
                                                <div dangerouslySetInnerHTML={{
                                                    __html: backlog.Backlog_Description || 'No description available'
                                                }} />
                                            </Typography>

                                            <Block className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 my-2">
                                                <Link
                                                    href={`/backlog/${backlog.Backlog_ID}`}
                                                    className="blue-link !inline-flex gap-2 items-center"
                                                >
                                                    <FontAwesomeIcon icon={faList} />
                                                    Backlog
                                                </Link>
                                                <Link
                                                    href={`/kanban/${backlog.Backlog_ID}`}
                                                    className="blue-link !inline-flex gap-2 items-center"
                                                >
                                                    <FontAwesomeIcon icon={faWindowRestore} />
                                                    Kanban Board
                                                </Link>
                                                <Link
                                                    href={`/dashboard/${backlog.Backlog_ID}`}
                                                    className="blue-link !inline-flex gap-2 items-center"
                                                >
                                                    <FontAwesomeIcon icon={faGauge} />
                                                    <Text variant="span">Dashboard</Text>
                                                </Link>
                                            </Block>

                                            <Block className="bg-gray-100 p-2 my-2 rounded-lg">
                                                <Text variant="span">Number of Tasks: {backlog.tasks?.length || 0}</Text>
                                                <Block className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                                                    {Array.isArray(backlog.tasks ?? []) && STATUSES.map(status => {
                                                        const totalTasks = (backlog.tasks ?? []).length;
                                                        const statusCount = (backlog.tasks ?? []).filter(task => task.Task_Status === status).length;
                                                        const percentage = totalTasks > 0 ? ((statusCount / totalTasks) * 100).toFixed(0) : 0;
                                                        return (
                                                            <Text key={status}>
                                                                {status}: {statusCount} ({percentage}%)
                                                            </Text>
                                                        );
                                                    })}
                                                </Block>
                                            </Block>

                                            <Block className="flex justify-between sm:items-end flex-col sm:flex-row">
                                                <Block>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Start Date: {backlog.Backlog_StartDate ? new Date(backlog.Backlog_StartDate).toLocaleString() : 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        End Date: {backlog.Backlog_EndDate ? new Date(backlog.Backlog_EndDate).toLocaleString() : 'N/A'}
                                                    </Typography>
                                                </Block>

                                                {backlog.Backlog_IsPrimary ? (
                                                    <Block className="mt-2 text-gray-400">
                                                        Primary Backlog
                                                    </Block>
                                                ) : (
                                                    <Block className="mt-2">
                                                        <Link href={`/finish-backlog/${backlog.Backlog_ID}`} className="blue-link-light red-link-light">
                                                            Finish Backlog
                                                        </Link>
                                                    </Block>
                                                )}
                                            </Block>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </FlexibleBox>
                </Box>
            )}
        </Block>
    );
};

export default ProjectDetails;
