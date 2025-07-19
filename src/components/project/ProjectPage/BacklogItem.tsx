"use client"

// External
import { faGauge, faList, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { Block, Text } from '@/components';
import { useURLLink } from '@/hooks';
import useRoleAccess from '@/hooks/useRoleAccess';
import { BacklogStates, Project, User } from '@/types';

export interface BacklogItemProps {
    backlog: BacklogStates
    renderProject: Project
    authUser: User | undefined
}

export const BacklogItem: React.FC<BacklogItemProps> = ({
    backlog,
    renderProject,
    authUser
}) => {
    // Hooks
    const { convertID_NameStringToURLFormat } = useURLLink("-")
    const { canAccessBacklog, canManageBacklog } = useRoleAccess(
        renderProject.team?.organisation?.User_ID,
        "backlog",
        backlog ? backlog.Backlog_ID : 0
    )

    // State
    const [calculateStatusCounter, setCalculateStatusCounter] = useState<{
        name: string;
        counter: number | undefined;
    }[] | undefined>(undefined)

    const mapStatusCounters = async () => {
        if (!backlog) return

        const statuses = backlog.statuses
        const tasks = backlog.tasks

        const calculateStatusCounter = statuses?.map(status => {
            const numberOfSuchTasks = tasks?.filter(task => task.Status_ID === status.Status_ID).length

            return {
                name: status.Status_Name,
                counter: numberOfSuchTasks
            }
        })
        setCalculateStatusCounter(calculateStatusCounter)
    }

    useEffect(() => {
        if (backlog) mapStatusCounters()
    }, [backlog])

    return (
        <>
            {backlog && canAccessBacklog && (
                <Grid item xs={12} sm={6} md={4} key={backlog ? backlog.Backlog_ID : 0}>
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
                                    href={`/backlog/${convertID_NameStringToURLFormat(backlog.Backlog_ID ?? 0, backlog.Backlog_Name)}`}
                                    className="blue-link !inline-flex gap-2 items-center"
                                >
                                    <FontAwesomeIcon icon={faList} />
                                    Backlog
                                </Link>
                                <Link
                                    href={`/kanban/${convertID_NameStringToURLFormat(backlog.Backlog_ID ?? 0, backlog.Backlog_Name)}`}
                                    className="blue-link !inline-flex gap-2 items-center"
                                >
                                    <FontAwesomeIcon icon={faWindowRestore} />
                                    Kanban Board
                                </Link>
                                <Link
                                    href={`/dashboard/${convertID_NameStringToURLFormat(backlog.Backlog_ID ?? 0, backlog.Backlog_Name)}`}
                                    className="blue-link !inline-flex gap-2 items-center"
                                >
                                    <FontAwesomeIcon icon={faGauge} />
                                    <Text variant="span">Dashboard</Text>
                                </Link>
                            </Block>

                            <Block className="bg-gray-100 p-2 my-2 rounded-lg">
                                <Text variant="span">Number of Tasks: {backlog.tasks?.length || 0}</Text>
                                <Block className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                                    {Array.isArray(backlog.tasks ?? []) && Array.isArray(calculateStatusCounter) && calculateStatusCounter.map(({ name, counter }) => {
                                        const totalTasks = (backlog.tasks ?? []).length;
                                        const percentage = counter && (totalTasks > 0 ? ((counter / totalTasks) * 100).toFixed(0) : 0);
                                        return (
                                            <Text variant="span" key={name}>
                                                {name}: {counter} ({percentage}%)
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

                                {canManageBacklog && (
                                    <Block className="mt-2 flex flex-col items-end">
                                        <Link
                                            href={`/backlog/${convertID_NameStringToURLFormat(backlog.Backlog_ID ?? 0, backlog.Backlog_Name)}/edit`}
                                            className="blue-link-light"
                                        >
                                            Edit Backlog
                                        </Link>
                                        {backlog.Backlog_IsPrimary ? (
                                            <Text className="text-gray-400">
                                                Primary Backlog
                                            </Text>
                                        ) : (
                                            <Link
                                                href={`/finish-backlog/${convertID_NameStringToURLFormat(backlog.Backlog_ID ?? 0, backlog.Backlog_Name)}`}
                                                className="blue-link-light red-link-light"
                                            >
                                                Finish Backlog
                                            </Link>
                                        )}
                                    </Block>
                                )}
                            </Block>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </>
    )
}
