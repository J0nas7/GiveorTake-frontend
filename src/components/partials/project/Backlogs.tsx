"use client"

// External
import { faLightbulb, faList } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

// Internal
import { Block, FlexibleBox, Text } from '@/components'
import { TaskBulkActionMenu } from '@/components/partials/task/TaskBulkActionMenu'
import { useProjectsContext } from '@/contexts'
import { LoadingState } from '@/core-ui/components/LoadingState'
import { useURLLink } from '@/hooks'
import useRoleAccess from '@/hooks/useRoleAccess'
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from '@/redux'
import { Backlog, ProjectStates, User } from '@/types'
import { useParams } from 'next/navigation'
import { BacklogWithSiblingsContainer } from './BacklogWithSiblings'

export const BacklogsContainer = () => {
    // ---- Hooks ----
    const { projectLink } = useParams<{ projectLink: string }>(); // Get projectId from URL
    const { projectById, readProjectById } = useProjectsContext()
    const { linkId: projectId, convertID_NameStringToURLFormat } = useURLLink(projectLink)
    const { canAccessProject, canManageProject } = useRoleAccess(
        projectById ? projectById.team?.organisation?.User_ID : undefined,
        "project",
        projectById ? projectById.Project_ID : 0
    )

    // ---- State ----
    const authUser = useTypedSelector(selectAuthUser)
    const [renderProject, setRenderProject] = useState<ProjectStates>(undefined)
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions) // Redux
    // Calculate the number of accessible backlogs for the authenticated user
    const accessibleBacklogsCount = renderProject && renderProject.backlogs?.filter(
        (backlog) =>
            authUser &&
            (
                renderProject.team?.organisation?.User_ID === authUser.User_ID ||
                parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`)
            )
    ).length || 0;

    // ---- Effects ----
    useEffect(() => { readProjectById(parseInt(projectId)) }, [projectId])
    useEffect(() => {
        console.log("renderProject", renderProject)
    }, [renderProject])
    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById)
            if (projectById) document.title = `Backlogs: ${projectById.Project_Name} - GiveOrTake`
        }
    }, [projectById])

    // ---- Render ----
    return (
        <BacklogsView
            renderProject={renderProject}
            authUser={authUser}
            canAccessProject={canAccessProject}
            parsedPermissions={parsedPermissions}
            accessibleBacklogsCount={accessibleBacklogsCount}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    )
}

type BacklogsViewProps = {
    renderProject: ProjectStates
    authUser: User | undefined
    canAccessProject: boolean | undefined
    parsedPermissions: string[] | undefined
    accessibleBacklogsCount: number
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

const BacklogsView: React.FC<BacklogsViewProps> = ({
    renderProject,
    authUser,
    canAccessProject,
    parsedPermissions,
    accessibleBacklogsCount,
    convertID_NameStringToURLFormat
}) => (
    <Block className="page-content">
        <FlexibleBox
            title={`Project backlogs`}
            subtitle={
                renderProject ?
                    `${renderProject.Project_Name} (${accessibleBacklogsCount} backlog${accessibleBacklogsCount === 1 ? '' : 's'})`
                    : undefined
            }
            titleAction={
                renderProject && (
                    <Link
                        href={`/project/${convertID_NameStringToURLFormat(renderProject?.Project_ID ?? 0, renderProject.Project_Name)}`}
                        className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                    >
                        <FontAwesomeIcon icon={faLightbulb} />
                        <Text variant="span">Go to Project</Text>
                    </Link>
                )
            }
            icon={faList}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <LoadingState singular="Project" renderItem={renderProject} permitted={canAccessProject}>
                {renderProject && (
                    <>
                        <TaskBulkActionMenu
                            renderProject={renderProject}
                        />
                        {renderProject.backlogs && renderProject.backlogs.map((backlog: Backlog) => (
                            <React.Fragment key={backlog.Backlog_ID}>
                                {/* Backlog rendered if the user has the necessary permissions. */}
                                {authUser &&
                                    (
                                        renderProject.team?.organisation?.User_ID === authUser.User_ID ||
                                        parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`)
                                    ) && (
                                        <Block className="mb-7" key={backlog.Backlog_ID}>
                                            <BacklogWithSiblingsContainer backlogId={backlog.Backlog_ID} />
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
