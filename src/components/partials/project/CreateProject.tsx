"use client";

// External
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { faLightbulb, faUsers } from "@fortawesome/free-solid-svg-icons";

// Internal
import { useProjectsContext, useTeamsContext } from "@/contexts";
import { Project, ProjectFields, TeamStates } from "@/types";
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { Heading } from "@/components/ui/heading";
import { Field } from "@/components/ui/input-field";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from "@/redux";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingState } from "@/core-ui/components/LoadingState";
import { useURLLink } from "@/hooks";

export const CreateProject: React.FC = () => {
    // ---- Hooks ----
    const router = useRouter();
    const { addProject } = useProjectsContext();
    const { teamById, readTeamById } = useTeamsContext()
    const { teamLink } = useParams<{ teamLink: string }>(); // Get teamId from URL
    const { linkId: teamId, convertID_NameStringToURLFormat } = useURLLink(teamLink)

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
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions)
    // Determines if the authenticated user has permission to modify team settings.
    const canModifyTeamSettings = (authUser && teamById && (
        teamById.organisation?.User_ID === authUser.User_ID ||
        parsedPermissions?.includes("Modify Team Settings")
    ))

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
    return (
        <CreateProjectView
            teamById={teamById}
            canModifyTeamSettings={canModifyTeamSettings}
            newProject={newProject}
            handleInputChange={handleInputChange}
            handleCreateProject={handleCreateProject}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    )
}

type CreateProjectViewProps = {
    teamById: TeamStates
    canModifyTeamSettings: boolean | undefined
    newProject: Project
    handleInputChange: (field: ProjectFields, value: string) => void
    handleCreateProject: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const CreateProjectView: React.FC<CreateProjectViewProps> = ({
    teamById, canModifyTeamSettings, newProject,
    handleInputChange, handleCreateProject, convertID_NameStringToURLFormat
}) => (
    <Block className="page-content">
        <div className="mb-8">
            <FlexibleBox
                title="Create New Project"
                titleAction={
                    teamById && (
                        <Block className="flex gap-2 w-full">
                            <Link
                                href={`/team/${convertID_NameStringToURLFormat(teamById.Team_ID ?? 0, teamById.Team_Name)}`}
                                className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faUsers} />
                                <Text variant="span">Go to Team</Text>
                            </Link>
                        </Block>
                    )
                }
                icon={faLightbulb}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <LoadingState singular="Team" renderItem={teamById} permitted={canModifyTeamSettings}>
                    <div className="bg-white shadow-md rounded-xl p-6">
                        <Heading variant="h2" className="mb-4">
                            Project Details
                        </Heading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                lbl="Project Name *"
                                value={newProject.Project_Name}
                                onChange={(e: string) => handleInputChange("Project_Name", e)}
                                type="text"
                                disabled={false}
                                className="w-full"
                            />

                            {/* Classic HTML Select for Project Status */}
                            <div className="w-full flex flex-col sm:flex-row gap-2">
                                <div className="w-full">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Project Status *
                                    </label>
                                    <select
                                        className="border rounded w-full p-2"
                                        value={newProject.Project_Status}
                                        onChange={(e) => handleInputChange("Project_Status", e.target.value)}
                                    >
                                        <option value="Planned">Planned</option>
                                        <option value="Active">Active</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>
                                <div className="w-full">
                                    <Field
                                        type="text"
                                        lbl="Project Key"
                                        displayLabel={false}
                                        placeholder="(3-5 letters)"
                                        value={newProject.Project_Key}
                                        onChange={(e: string) => handleInputChange("Project_Key", e)}
                                        disabled={false}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <Field
                                lbl="Start Date *"
                                value={newProject.Project_Start_Date || ""}
                                onChange={(e: string) => handleInputChange("Project_Start_Date", e)}
                                type="date"
                                className="w-full"
                                disabled={false}
                            />
                            <Field
                                lbl="End Date"
                                value={newProject.Project_End_Date || ""}
                                onChange={(e: string) => handleInputChange("Project_End_Date", e)}
                                type="date"
                                className="w-full"
                                disabled={false}
                            />
                            <div className="col-span-1 sm:col-span-2">
                                <Text>Project Description</Text>
                                <ReactQuill
                                    className="w-full mt-2 border border-gray-300 rounded-md"
                                    theme="snow"
                                    value={newProject.Project_Description || ""}
                                    onChange={(value) => handleInputChange("Project_Description", value)}
                                    modules={{
                                        toolbar: [
                                            [{ header: "1" }, { header: "2" }, { font: [] }],
                                            [{ list: "ordered" }, { list: "bullet" }],
                                            ["bold", "italic", "underline", "strike"],
                                            [{ align: [] }],
                                            ["link"],
                                            ["blockquote"],
                                        ],
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={handleCreateProject}
                                className="button-blue"
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </LoadingState>
            </FlexibleBox>
        </div>
    </Block>
)
