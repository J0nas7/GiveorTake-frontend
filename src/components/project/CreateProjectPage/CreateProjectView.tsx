"use client";

// External
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Internal
import { CreateProject, CreateProjectProps } from '@/components/project';
import { useProjectsContext, useTeamsContext } from "@/contexts";
import { useURLLink } from "@/hooks";
import useRoleAccess from "@/hooks/useRoleAccess";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { Project, ProjectFields } from "@/types";

export const CreateProjectView: React.FC = () => {
    // ---- Hooks ----
    const router = useRouter();
    const { addProject } = useProjectsContext();
    const { teamById, readTeamById } = useTeamsContext()
    const { teamLink } = useParams<{ teamLink: string }>(); // Get teamId from URL
    const { linkId: teamId, convertID_NameStringToURLFormat } = useURLLink(teamLink)
    const { canModifyTeamSettings } = useRoleAccess(teamById ? teamById.organisation?.User_ID : undefined)

    // ---- State ----
    const [newProject, setNewProject] = useState<Project>({
        Team_ID: parseInt(teamId),
        Project_Name: "",
        Project_Key: "",
        Project_Description: "",
        Project_Status: "Planned",
        Project_Start_Date: "",
        Project_End_Date: "",
    });
    const authUser = useTypedSelector(selectAuthUser)

    // ---- Methods ----
    // Handle input changes
    const handleInputChange = (field: ProjectFields, value: string) => {
        setNewProject((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle form submission
    const handleCreateProject = async () => {
        if (!teamById) return
        if (!newProject.Project_Name.trim()) {
            alert("Please enter a project name.");
            return;
        }

        await addProject(parseInt(teamId), newProject);
        router.push(`/team/${convertID_NameStringToURLFormat(parseInt(teamId), teamById.Team_Name)}`); // Redirect to team page
    };

    // ---- Effects ----
    useEffect(() => {
        if (teamId) readTeamById(parseInt(teamId))
    }, [teamId])

    useEffect(() => {
        if (teamById && authUser && !canModifyTeamSettings) {
            router.push(`/team/${convertID_NameStringToURLFormat(parseInt(teamId), teamById.Team_Name)}`); // Redirect to team page
        }
    }, [teamById])

    // ---- Render ----
    const createProjectProps: CreateProjectProps = {
        teamById,
        canModifyTeamSettings,
        newProject,
        handleInputChange,
        handleCreateProject,
        convertID_NameStringToURLFormat
    }

    return <CreateProject {...createProjectProps} />
}
