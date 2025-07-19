"use client"

// External
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from 'react';

// Internal
import { Project, ProjectProps } from '@/components/project';
import { useProjectsContext } from '@/contexts/';
import { useURLLink } from '@/hooks';
import useRoleAccess from '@/hooks/useRoleAccess';
import { selectAuthUser, selectAuthUserSeatPermissions, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux';
import { ProjectFields, ProjectStates } from '@/types';

export const ProjectView: React.FC = () => {
    // ---- Hooks ----
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { projectLink } = useParams<{ projectLink: string }>(); // Get projectLink from URL
    const { projectById, readProjectById, saveProjectChanges, removeProject } = useProjectsContext()
    const { linkId: projectId, convertID_NameStringToURLFormat } = useURLLink(projectLink)
    const { canAccessProject, canManageProject } = useRoleAccess(
        projectById ? projectById.team?.organisation?.User_ID : undefined,
        "project",
        parseInt(projectId)
    )
    console.log("projectById", projectById)

    // ---- State ----
    const [renderProject, setRenderProject] = useState<ProjectStates>(undefined)
    const authUser = useTypedSelector(selectAuthUser)
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions) // Redux
    // Calculate the number of accessible backlogs for the authenticated user using useMemo
    const accessibleBacklogsCount = useMemo(() => {
        if (!renderProject || !renderProject.backlogs) return 0;
        return renderProject.backlogs.filter(
            (backlog) =>
                authUser &&
                (
                    renderProject.team?.organisation?.User_ID === authUser.User_ID || // Check if the user owns the organisation
                    parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`) // Check if the user has access permissions
                )
        ).length;
    }, [renderProject, authUser, parsedPermissions]);

    // ---- Effects ----
    useEffect(() => { readProjectById(parseInt(projectId)); }, [projectId]);
    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById)
            if (projectById) document.title = `Project: ${projectById.Project_Name} - GiveOrTake`
        }
    }, [projectById])

    // ---- Methods ----
    // Handles changes to HTML input elements and updates the project state accordingly.
    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        handleProjectChange(name as ProjectFields, value)
    };

    // Updates the specified field of the renderProject state with a new value.
    const handleProjectChange = (field: ProjectFields, value: string) => {
        if (!renderProject) return

        setRenderProject({
            ...renderProject,
            [field]: value
        });
    }

    // Handles saving changes to the project by invoking the saveProjectChanges function.
    const handleSaveChanges = async () => {
        if (renderProject) {
            const saveChanges = await saveProjectChanges(renderProject, renderProject.Team_ID)

            dispatch(setSnackMessage(
                saveChanges ? "Project changes saved successfully!" : "Failed to save project changes."
            ))
        }
    }

    // Handles deleting the current project.
    const handleDeleteProject = async () => {
        if (!renderProject || !renderProject.Project_ID) return
        const removed = await removeProject(
            renderProject.Project_ID,
            renderProject.Team_ID,
            `/team/${renderProject.Team_ID}`
        )
    }

    // ---- Render ----
    const projectProps: ProjectProps = {
        renderProject,
        parsedPermissions,
        canAccessProject,
        canManageProject,
        accessibleBacklogsCount,
        authUser,
        handleProjectChange,
        handleSaveChanges,
        handleDeleteProject,
        convertID_NameStringToURLFormat
    }

    return <Project {...projectProps} />
};
