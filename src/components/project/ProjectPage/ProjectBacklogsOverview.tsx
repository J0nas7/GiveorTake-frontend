"use client"

// External
import { faClock, faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Grid } from '@mui/material';
import Link from 'next/link';
import React from 'react';

// Internal
import { Block, Text } from '@/components';
import { BacklogItem, ProjectProps } from '@/components/project';
import { FlexibleBox } from '@/components/ui/flexible-box';

type ProjectBacklogsOverviewProps = Pick<
    ProjectProps,
    "renderProject" |
    "accessibleBacklogsCount" |
    "authUser" |
    "convertID_NameStringToURLFormat"
>

export const ProjectBacklogsOverview: React.FC<ProjectBacklogsOverviewProps> = (props) => props.renderProject && (
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
)
