"use client"

import { Team } from "@/types"
import { Card, CardContent, Grid, Typography } from "@mui/material"
import Link from "next/link"
import React from "react"
import { CreatedAtToTimeSince } from "../../../core-ui/components/TaskTimeTrackPlayer"

type OrganisationTeamsOverviewProps = {
    teams: Team[]
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const OrganisationTeamsOverview: React.FC<OrganisationTeamsOverviewProps> = (props) => (
    <div className="mb-4">
        <Typography variant="h5" gutterBottom>
            Teams Overview
        </Typography>
        <Grid container spacing={3}>
            {props.teams.map((team) => (
                <Grid item xs={12} sm={6} md={4} key={team.Team_ID}>
                    <Card>
                        <CardContent>
                            <Link
                                href={`/team/${props.convertID_NameStringToURLFormat(team.Team_ID ?? 0, team.Team_Name)}`}
                                className="blue-link-light"
                            >
                                {team.Team_Name}
                            </Link>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: team.Team_Description || "No description available",
                                    }}
                                />
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Created at:{" "}
                                {team.Team_CreatedAt && (
                                    <CreatedAtToTimeSince dateCreatedAt={team.Team_CreatedAt} />
                                )}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Team Members: {team.user_seats?.length || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    </div>
)
