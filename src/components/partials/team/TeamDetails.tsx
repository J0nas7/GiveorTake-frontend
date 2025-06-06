"use client"

// External
import { faBuilding, faLightbulb, faList, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Box, Card, CardContent, Grid, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from "next/navigation"
import React, { useEffect, useState } from 'react'

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

// Internal
import { Block, FlexibleBox, Text } from '@/components'
import { useTeamsContext } from '@/contexts/'
import { LoadingState } from '@/core-ui/components/LoadingState'
import { useURLLink } from '@/hooks'
import useRoleAccess from '@/hooks/useRoleAccess'
import { selectAuthUser, selectAuthUserSeatPermissions, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux'
import { TeamFields, TeamStates, User } from '@/types'

export const TeamDetails = () => {
    // ---- Hooks ----
    const dispatch = useAppDispatch()
    const router = useRouter()
    const pathname = usePathname() // Get the current pathname
    const { teamById, readTeamById, saveTeamChanges, removeTeam } = useTeamsContext()
    const { teamLink } = useParams<{ teamLink: string }>() // Get teamLink from URL
    const { linkId: teamId, convertID_NameStringToURLFormat } = useURLLink(teamLink)
    const { canManageTeamMembers, canModifyTeamSettings } = useRoleAccess(teamById ? teamById.organisation?.User_ID : undefined)

    // ---- State ----
    const authUser = useTypedSelector(selectAuthUser)
    const [renderTeam, setRenderTeam] = useState<TeamStates>(undefined)
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions) // Redux

    const accessibleProjectsCount = renderTeam && renderTeam.projects?.filter(
        (project) =>
            authUser &&
            (
                renderTeam.organisation?.User_ID === authUser.User_ID ||
                parsedPermissions?.includes(`accessProject.${project.Project_ID}`)
            )
    ).length || 0

    // ---- Methods ----
    // Handles changes to HTML input elements and updates the team state accordingly.
    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        handleTeamChange(name as TeamFields, value)
    }

    // Updates the team state with the provided field and value.
    const handleTeamChange = (field: TeamFields, value: string) => {
        if (!renderTeam) return

        setRenderTeam({
            ...renderTeam,
            [field]: value
        })
    }

    // Saves the current team changes to the database.
    const handleSaveChanges = async () => {
        if (renderTeam) {
            const saveChanges = await saveTeamChanges(renderTeam, renderTeam.Organisation_ID)

            dispatch(setSnackMessage(
                saveChanges ? "Team changes saved successfully!" : "Failed to save team changes."
            ))
        }
    }

    // Handles the deletion of a team by invoking the removeTeam function.
    const handleDeleteTeam = async () => {
        if (!renderTeam || !renderTeam.Team_ID) return
        const removed = await removeTeam(
            renderTeam.Team_ID,
            renderTeam.Organisation_ID,
            `/organisation/${renderTeam.Organisation_ID}`
        )
    }

    // ---- Effects ----
    useEffect(() => { readTeamById(parseInt(teamId)) }, [teamId])
    useEffect(() => {
        if (teamId) {
            setRenderTeam(teamById)
            if (teamById) document.title = `Team: ${teamById.Team_Name} - GiveOrTake`
        }
    }, [teamById])

    // ---- Render ----
    return (
        <TeamDetailsView
            renderTeam={renderTeam}
            authUser={authUser}
            pathname={pathname}
            canModifyTeamSettings={canModifyTeamSettings}
            canManageTeamMembers={canManageTeamMembers}
            parsedPermissions={parsedPermissions}
            accessibleProjectsCount={accessibleProjectsCount}
            handleHTMLInputChange={handleHTMLInputChange}
            handleTeamChange={handleTeamChange}
            handleSaveChanges={handleSaveChanges}
            handleDeleteTeam={handleDeleteTeam}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    )
}

export interface TeamDetailsViewProps {
    renderTeam: TeamStates
    authUser: User | undefined
    pathname: string
    canModifyTeamSettings: boolean | undefined
    canManageTeamMembers: boolean | undefined
    parsedPermissions: string[] | undefined
    accessibleProjectsCount: number
    handleHTMLInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleTeamChange: (field: TeamFields, value: string) => void
    handleSaveChanges: () => Promise<void>
    handleDeleteTeam: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const TeamDetailsView: React.FC<TeamDetailsViewProps> = ({
    renderTeam,
    authUser,
    pathname,
    canModifyTeamSettings,
    canManageTeamMembers,
    parsedPermissions,
    accessibleProjectsCount,
    handleHTMLInputChange,
    handleTeamChange,
    handleSaveChanges,
    handleDeleteTeam,
    convertID_NameStringToURLFormat
}) => (
    <Block className="page-content">
        <FlexibleBox
            title="Team Settings"
            subtitle={renderTeam ? renderTeam.Team_Name : undefined}
            icon={faUsers}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
            titleAction={
                renderTeam && (
                    <Block className="flex flex-col sm:flex-row gap-2 w-full">
                        {canManageTeamMembers && (
                            <Link
                                href={`${pathname}/roles-seats`}
                                className="blue-link !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faUsers} />
                                <Text variant="span">Roles & Seats</Text>
                            </Link>
                        )}
                        {canModifyTeamSettings && (
                            <Link
                                href={`${pathname}/create-project`}
                                className="blue-link !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faLightbulb} />
                                <Text variant="span">Create Project</Text>
                            </Link>
                        )}

                        <Link
                            href={`/organisation/${convertID_NameStringToURLFormat(renderTeam.organisation?.Organisation_ID ?? 0, renderTeam.organisation?.Organisation_Name ?? "")}`}
                            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faBuilding} />
                            <Text variant="span">Go to Organisation</Text>
                        </Link>
                    </Block>
                )
            }
        >
            <LoadingState singular="Team" renderItem={renderTeam} permitted={undefined}>
                {renderTeam && (
                    <Card>
                        {canModifyTeamSettings ? (
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
            </LoadingState>
        </FlexibleBox>

        {/* Projects Overview Section */}
        {renderTeam && (
            <Box mb={4}>
                <FlexibleBox
                    title={`Projects Overview`}
                    icon={faLightbulb}
                    subtitle={
                        `${accessibleProjectsCount} project${accessibleProjectsCount === 1 ? '' : 's'}`
                    }
                    className="no-box w-auto inline-block"
                    numberOfColumns={2}
                >
                    <Grid container spacing={3}>
                        {renderTeam.projects?.map((project) => {
                            // Check if the authenticated user has access and modification rights for the project
                            // Skip rendering if the user lacks permissions
                            const canAccessAndModifyProjectWithId = (authUser && (
                                renderTeam.organisation?.User_ID === authUser.User_ID ||
                                parsedPermissions?.includes(`accessProject.${project.Project_ID}`)
                            ))
                            if (!canAccessAndModifyProjectWithId) return

                            const accessibleBacklogsCount = project.backlogs?.filter(
                                (backlog) =>
                                    authUser &&
                                    (
                                        backlog.project?.team?.organisation?.User_ID === authUser.User_ID ||
                                        parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`)
                                    )
                            ).length || 0

                            return (
                                <Grid item xs={12} sm={6} md={4} key={project.Project_ID}>
                                    <Card>
                                        <CardContent>
                                            <Block className="flex justify-between items-center flex-col sm:flex-row w-full">
                                                <Link
                                                    href={`/project/${convertID_NameStringToURLFormat(project.Project_ID ?? 0, project.Project_Name)}`}
                                                    className="blue-link-light"
                                                >
                                                    {project.Project_Name}
                                                </Link>
                                                <Link
                                                    href={`/backlogs/${convertID_NameStringToURLFormat(project.Project_ID ?? 0, project.Project_Name)}`}
                                                    className="blue-link !inline-flex gap-2 items-center"
                                                >
                                                    <FontAwesomeIcon icon={faList} />
                                                    All backlogs and tasks
                                                </Link>
                                            </Block>
                                            <Typography variant="body2" color="textSecondary" paragraph>
                                                <div dangerouslySetInnerHTML={{
                                                    __html: project.Project_Description || 'No description available'
                                                }} />
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Status: {project.Project_Status}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Accessible Backlogs: {accessibleBacklogsCount}
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
                            )
                        })}
                    </Grid>
                </FlexibleBox>
            </Box>
        )}
    </Block>
)
