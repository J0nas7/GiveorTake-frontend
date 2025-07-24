import { Block, FlexibleBox, Text } from '@/components'
import { BacklogWithSiblings, TaskBulkActionMenu } from '@/components/backlog'
import { LoadingState } from '@/core-ui/components/LoadingState'
import { Backlog, ProjectStates, User } from '@/types'
import { faLightbulb, faList } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React from 'react'

export type BacklogsProps = {
    renderProject: ProjectStates
    authUser: User | undefined
    canAccessProject: boolean | undefined
    parsedPermissions: string[] | undefined
    accessibleBacklogsCount: number
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const Backlogs: React.FC<BacklogsProps> = (props) => (
    <Block className="page-content overflow-x-visible">
        <FlexibleBox
            title={`Project backlogs`}
            subtitle={
                props.renderProject ?
                    `${props.renderProject.Project_Name} (${props.accessibleBacklogsCount} backlog${props.accessibleBacklogsCount === 1 ? '' : 's'})`
                    : undefined
            }
            titleAction={
                props.renderProject && (
                    <Block className="actions-wrapper">
                        <Link
                            href={`/project/${props.convertID_NameStringToURLFormat(props.renderProject?.Project_ID ?? 0, props.renderProject.Project_Name)}`}
                            className="blue-link action-button button-right"
                        >
                            <FontAwesomeIcon icon={faLightbulb} />
                            <Text variant="span">Go to Project</Text>
                        </Link>
                    </Block>
                )
            }
            icon={faList}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <LoadingState singular="Project" renderItem={props.renderProject} permitted={props.canAccessProject}>
                {props.renderProject && (
                    <>
                        <TaskBulkActionMenu project={props.renderProject} />

                        {props.renderProject.backlogs && props.renderProject.backlogs.map((backlog: Backlog) => (
                            <React.Fragment key={backlog.Backlog_ID}>
                                {/* Backlog rendered if the user has the necessary permissions. */}
                                {props.authUser && props.renderProject &&
                                    (
                                        props.renderProject.team?.organisation?.User_ID === props.authUser.User_ID ||
                                        props.parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`)
                                    ) && (
                                        <Block className="mb-7" key={backlog.Backlog_ID}>
                                            <BacklogWithSiblings backlogId={backlog.Backlog_ID} />
                                        </Block>
                                    )
                                }
                            </React.Fragment>
                        ))}
                    </>
                )}
            </LoadingState>
        </FlexibleBox>
    </Block>
)
