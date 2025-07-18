"use client"

// External
import { useEffect, useState } from 'react'

// Internal
import { Backlogs } from '@/components/backlog'
import { useProjectsContext } from '@/contexts'
import { useURLLink } from '@/hooks'
import useRoleAccess from '@/hooks/useRoleAccess'
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from '@/redux'
import { ProjectStates } from '@/types'
import { useParams } from 'next/navigation'

export const BacklogsView = () => {
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
        <Backlogs
            renderProject={renderProject}
            authUser={authUser}
            canAccessProject={canAccessProject}
            parsedPermissions={parsedPermissions}
            accessibleBacklogsCount={accessibleBacklogsCount}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    )
}
