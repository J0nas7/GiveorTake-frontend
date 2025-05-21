"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { faBarsProgress, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Internal
import { useBacklogsContext, useProjectsContext } from "@/contexts";
import { Backlog, BacklogFields, ProjectStates } from "@/types";
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { Heading } from "@/components/ui/heading";
import { Field } from "@/components/ui/input-field";
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from "@/redux";
import { LoadingState } from "@/core-ui/components/LoadingState";

// Dynamically import ReactQuill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export const CreateBacklog: React.FC = () => {
    const router = useRouter();
    const { projectId } = useParams<{ projectId: string }>();
    const { projectById, readProjectById } = useProjectsContext();
    const { addBacklog } = useBacklogsContext();

    const authUser = useTypedSelector(selectAuthUser);
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions);

    const [newBacklog, setNewBacklog] = useState<Backlog>({
        Project_ID: parseInt(projectId),
        Backlog_Name: "",
        Backlog_Description: "",
        Backlog_IsPrimary: false,
        Backlog_StartDate: "",
        Backlog_EndDate: "",
    });

    const canModifyProject = (authUser && projectById && (
        projectById?.team?.organisation?.User_ID === authUser.User_ID ||
        parsedPermissions?.includes("Modify Team Settings")
    ));

    const handleInputChange = (field: BacklogFields, value: string | boolean) => {
        setNewBacklog((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCreateBacklog = async () => {
        if (!newBacklog.Backlog_Name.trim()) {
            alert("Please enter a backlog name.");
            return;
        }

        await addBacklog(parseInt(projectId), newBacklog);
        router.push(`/project/${projectId}`);
    };

    useEffect(() => {
        if (projectId) readProjectById(parseInt(projectId));
    }, [projectId]);

    useEffect(() => {
        if (projectById && authUser && !canModifyProject) {
            router.push(`/project/${projectId}`);
        }
    }, [projectById]);

    return (
        <CreateBacklogView
            projectById={projectById}
            canModifyProject={canModifyProject}
            newBacklog={newBacklog}
            handleInputChange={handleInputChange}
            handleCreateBacklog={handleCreateBacklog}
        />
    );
};

type CreateBacklogViewProps = {
    projectById: ProjectStates;
    canModifyProject: boolean | undefined;
    newBacklog: Backlog;
    handleInputChange: (field: BacklogFields, value: string | boolean) => void;
    handleCreateBacklog: () => Promise<void>;
};

export const CreateBacklogView: React.FC<CreateBacklogViewProps> = ({
    projectById, canModifyProject, newBacklog,
    handleInputChange, handleCreateBacklog
}) => (
    <Block className="page-content">
        <div className="mb-8">
            <FlexibleBox
                title="Create New Backlog"
                titleAction={
                    projectById && (
                        <Block className="flex gap-2 w-full">
                            <Link
                                href={`/project/${projectById.Project_ID}`}
                                className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faFolderOpen} />
                                <Text variant="span">Go to Project</Text>
                            </Link>
                        </Block>
                    )
                }
                icon={faBarsProgress}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <LoadingState singular="Project" renderItem={projectById} permitted={canModifyProject}>
                    <div className="bg-white shadow-md rounded-xl p-6">
                        <Heading variant="h2" className="mb-4">Backlog Details</Heading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                lbl="Backlog Name *"
                                value={newBacklog.Backlog_Name}
                                onChange={(e: string) => handleInputChange("Backlog_Name", e)}
                                type="text"
                                className="w-full"
                                disabled={false}
                            />

                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Is Primary Backlog?
                                </label>
                                <select
                                    className="border rounded w-full p-2"
                                    value={newBacklog.Backlog_IsPrimary ? "true" : "false"}
                                    onChange={(e) => handleInputChange("Backlog_IsPrimary", e.target.value === "true")}
                                >
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>

                            <Field
                                lbl="Start Date *"
                                value={newBacklog.Backlog_StartDate || ""}
                                onChange={(e: string) => handleInputChange("Backlog_StartDate", e)}
                                type="date"
                                className="w-full"
                                disabled={false}
                            />
                            <Field
                                lbl="End Date"
                                value={newBacklog.Backlog_EndDate || ""}
                                onChange={(e: string) => handleInputChange("Backlog_EndDate", e)}
                                type="date"
                                className="w-full"
                                disabled={false}
                            />

                            <div className="col-span-1 sm:col-span-2">
                                <Text>Backlog Description</Text>
                                <ReactQuill
                                    className="w-full mt-2 border border-gray-300 rounded-md"
                                    theme="snow"
                                    value={newBacklog.Backlog_Description || ""}
                                    onChange={(value) => handleInputChange("Backlog_Description", value)}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button onClick={handleCreateBacklog} className="button-blue">
                                Create Backlog
                            </button>
                        </div>
                    </div>
                </LoadingState>
            </FlexibleBox>
        </div>
    </Block>
);
