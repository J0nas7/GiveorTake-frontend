"use client";

// External
import { faLightbulb, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { Heading } from "@/components/ui/heading";
import { Field } from "@/components/ui/input-field";
import { LoadingState } from "@/core-ui/components/LoadingState";
import { Project, ProjectFields, TeamStates } from "@/types";

export type CreateProjectProps = {
    teamById: TeamStates
    canModifyTeamSettings: boolean | undefined
    newProject: Project
    handleInputChange: (field: ProjectFields, value: string) => void
    handleCreateProject: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const CreateProject: React.FC<CreateProjectProps> = (props) => (
    <Block className="page-content">
        <div className="mb-8">
            <FlexibleBox
                title="Create New Project"
                titleAction={
                    props.teamById && (
                        <Block className="flex gap-2 w-full">
                            <Link
                                href={`/team/${props.convertID_NameStringToURLFormat(props.teamById.Team_ID ?? 0, props.teamById.Team_Name)}`}
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
                <LoadingState singular="Team" renderItem={props.teamById} permitted={props.canModifyTeamSettings}>
                    <div className="bg-white shadow-md rounded-xl p-6">
                        <Heading variant="h2" className="mb-4">
                            Project Details
                        </Heading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                lbl="Project Name *"
                                value={props.newProject.Project_Name}
                                onChange={(e: string) => props.handleInputChange("Project_Name", e)}
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
                                        value={props.newProject.Project_Status}
                                        onChange={(e) => props.handleInputChange("Project_Status", e.target.value)}
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
                                        value={props.newProject.Project_Key}
                                        onChange={(e: string) => props.handleInputChange("Project_Key", e)}
                                        disabled={false}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <Field
                                lbl="Start Date *"
                                value={props.newProject.Project_Start_Date || ""}
                                onChange={(e: string) => props.handleInputChange("Project_Start_Date", e)}
                                type="date"
                                className="w-full"
                                disabled={false}
                            />
                            <Field
                                lbl="End Date"
                                value={props.newProject.Project_End_Date || ""}
                                onChange={(e: string) => props.handleInputChange("Project_End_Date", e)}
                                type="date"
                                className="w-full"
                                disabled={false}
                            />
                            <div className="col-span-1 sm:col-span-2">
                                <Text>Project Description</Text>
                                <ReactQuill
                                    className="w-full mt-2 border border-gray-300 rounded-md"
                                    theme="snow"
                                    value={props.newProject.Project_Description || ""}
                                    onChange={(value) => props.handleInputChange("Project_Description", value)}
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
                                onClick={props.handleCreateProject}
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
