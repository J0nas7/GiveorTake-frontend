"use client"

// External
import { useParams, usePathname, useRouter } from "next/navigation"
import React, { useEffect, useState } from 'react'

// Internal
import { Team, TeamProps } from '@/components/team'
import { useTeamsContext } from '@/contexts/'
import { useURLLink } from '@/hooks'
import useRoleAccess from '@/hooks/useRoleAccess'
import { selectAuthUser, selectAuthUserSeatPermissions, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux'
import { TeamFields, TeamStates } from '@/types'

export const TeamView = () => {
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
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions) // Redux
    const [renderTeam, setRenderTeam] = useState<TeamStates>(undefined)
    const [showEditToggles, setShowEditToggles] = useState<boolean>(false)

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
    const teamProps: TeamProps = {
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
        convertID_NameStringToURLFormat,
        showEditToggles,
        setShowEditToggles
    }

    return <Team {...teamProps} />
}
