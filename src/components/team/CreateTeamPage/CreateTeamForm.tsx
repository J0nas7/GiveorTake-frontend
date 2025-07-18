"use client"

import { Block, Field, Heading, Text } from "@/components";
import React from "react";
import { CreateTeamProps } from "./CreateTeam";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type CreateTeamFormProps = Pick<
    CreateTeamProps,
    "newTeam" |
    "handleInputChange" |
    "handleCreateTeam"
>

export const CreateTeamForm: React.FC<CreateTeamFormProps> = (props) => (
    <Block className="bg-white shadow-md rounded-xl p-6">
        <Heading variant="h2" className="mb-4">
            Team Details
        </Heading>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
                lbl="Team Name"
                value={props.newTeam.Team_Name}
                onChange={(e: string) => props.handleInputChange("Team_Name", e)}
                type="text"
                disabled={false}
                className="w-full"
            />

            <div className="col-span-1 sm:col-span-2">
                <Text>Team Description</Text>
                <ReactQuill
                    className="w-full mt-2 border border-gray-300 rounded-md"
                    theme="snow"
                    value={props.newTeam.Team_Description || ""}
                    onChange={(value) =>
                        props.handleInputChange("Team_Description", value)
                    }
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
                onClick={props.handleCreateTeam}
                className="button-blue"
            >
                Create Team
            </button>
        </div>
    </Block>
)
