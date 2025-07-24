"use client"

// External
import { faLightbulb, faList } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import React from 'react'

// Internal
import { Block, FlexibleBox } from '@/components'
import { TeamProps } from '@/components/team'

type TeamProjectsOverviewProps = Pick<
    TeamProps,
    "renderTeam" |
    "accessibleProjectsCount" |
    "parsedPermissions" |
    "authUser" |
    "convertID_NameStringToURLFormat"
>

export const TeamProjectsOverview: React.FC<TeamProjectsOverviewProps> = (props) => props.renderTeam && (
    <Box mb={4}>
        <FlexibleBox
            title={`Projects Overview`}
            icon={faLightbulb}
            subtitle={
                `${props.accessibleProjectsCount} project${props.accessibleProjectsCount === 1 ? '' : 's'}`
            }
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <Grid container spacing={3}>
                {props.renderTeam.projects?.map((project) => {
                    if (!props.renderTeam) return
                    // Check if the authenticated user has access and modification rights for the project
                    // Skip rendering if the user lacks permissions
                    const canAccessAndModifyProjectWithId = (props.authUser && (
                        props.renderTeam.organisation?.User_ID === props.authUser.User_ID ||
                        props.parsedPermissions?.includes(`accessProject.${project.Project_ID}`)
                    ))
                    if (!canAccessAndModifyProjectWithId) return

                    const accessibleBacklogsCount = project.backlogs?.filter(
                        (backlog) =>
                            props.authUser &&
                            (
                                backlog.project?.team?.organisation?.User_ID === props.authUser.User_ID ||
                                props.parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`)
                            )
                    ).length || 0

                    return (
                        <Grid item xs={12} sm={6} md={4} key={project.Project_ID}>
                            <Card>
                                <CardContent>
                                    <Block className="actions-wrapper">
                                        <Link
                                            href={`/project/${props.convertID_NameStringToURLFormat(project.Project_ID ?? 0, project.Project_Name)}`}
                                            className="blue-link-light"
                                        >
                                            {project.Project_Name}
                                        </Link>
                                        <Link
                                            href={`/backlogs/${props.convertID_NameStringToURLFormat(project.Project_ID ?? 0, project.Project_Name)}`}
                                            className="blue-link action-button"
                                        >
                                            <FontAwesomeIcon icon={faList} />
                                            All backlogs and tasks
                                        </Link>
                                    </Block>

                                    <p className="my-2" dangerouslySetInnerHTML={{
                                        __html: project.Project_Description || 'No description available'
                                    }} />
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
)
