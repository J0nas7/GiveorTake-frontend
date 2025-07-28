"use client";

import { faLightbulb, faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";

// Dynamically import ReactQuill
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { Heading } from "@/components/ui/heading";
import { Field } from "@/components/ui/input-field";
import { LoadingButton, LoadingState } from "@/core-ui/components/LoadingState";
import { Backlog, BacklogFields, ProjectStates } from "@/types";

export type BacklogCreateProps = {
    projectById: ProjectStates;
    canManageProject: boolean | undefined
    newBacklog: Backlog
    createPending: boolean
    handleInputChange: (field: BacklogFields, value: string | boolean) => void;
    handleCreateBacklog: () => Promise<void>;
    convertID_NameStringToURLFormat: (id: number, name: string) => string
};

export const BacklogCreate: React.FC<BacklogCreateProps> = (props) => (
    <Block className="page-content">
        <div className="mb-8">
            <FlexibleBox
                title="Create New Backlog"
                titleAction={
                    props.projectById && (
                        <Block className="actions-wrapper">
                            <Link
                                href={`/project/${props.convertID_NameStringToURLFormat(props.projectById.Project_ID ?? 0, props.projectById.Project_Name)}`}
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
                <LoadingState singular="Project" renderItem={props.projectById} permitted={props.canManageProject}>
                    <div className="bg-white shadow-md rounded-xl p-6">
                        <Heading variant="h2" className="mb-4">Backlog Details</Heading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                lbl="Backlog Name *"
                                value={props.newBacklog.Backlog_Name}
                                onChange={(e: string) => props.handleInputChange("Backlog_Name", e)}
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
                                    value={props.newBacklog.Backlog_IsPrimary ? "true" : "false"}
                                    onChange={(e) => props.handleInputChange("Backlog_IsPrimary", e.target.value === "true")}
                                >
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>

                            <Field
                                lbl="Start Date *"
                                value={props.newBacklog.Backlog_StartDate || ""}
                                onChange={(e: string) => props.handleInputChange("Backlog_StartDate", e)}
                                type="date"
                                className="w-full"
                                disabled={false}
                            />
                            <Field
                                lbl="End Date"
                                value={props.newBacklog.Backlog_EndDate || ""}
                                onChange={(e: string) => props.handleInputChange("Backlog_EndDate", e)}
                                type="date"
                                className="w-full"
                                disabled={false}
                            />

                            <div className="col-span-1 sm:col-span-2">
                                <Text>Backlog Description</Text>
                                <ReactQuill
                                    className="w-full mt-2 border border-gray-300 rounded-md"
                                    theme="snow"
                                    value={props.newBacklog.Backlog_Description || ""}
                                    onChange={(value) => props.handleInputChange("Backlog_Description", value)}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={props.handleCreateBacklog}
                                disabled={props.createPending}
                                className="button-blue w-32 flex justify-center"
                            >
                                {props.createPending ? (
                                    <LoadingButton />
                                ) : (
                                    <>Create Backlog</>
                                )}
                            </button>
                        </div>
                    </div>
                </LoadingState>
            </FlexibleBox>
        </div>
    </Block>
);
