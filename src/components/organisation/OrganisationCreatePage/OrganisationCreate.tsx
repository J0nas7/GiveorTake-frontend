"use client"

// External
import React from "react";

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { Field } from "@/components/ui/input-field";
import { Organisation, OrganisationFields } from "@/types";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";

export type OrganisationCreateProps = {
    newOrganisation: Organisation
    handleInputChange: (field: OrganisationFields, value: string) => void
    handleCreateOrganisation: () => Promise<void>
}

export const OrganisationCreate: React.FC<OrganisationCreateProps> = (props) => (
    <Block className="page-content">
        <div className="mb-8">
            <FlexibleBox
                title="Create New Organisation"
                icon={faBuilding}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <div className="bg-white shadow-md rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Organisation Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                            lbl="Organisation Name"
                            value={props.newOrganisation.Organisation_Name}
                            onChange={(e: string) => props.handleInputChange("Organisation_Name", e)}
                            type="text"
                            disabled={false}
                            className="w-full"
                        />
                        <div className="col-span-1 sm:col-span-2">
                            <Text>Organisation Description</Text>
                            <ReactQuill
                                className="w-full mt-2 border border-gray-300 rounded-md"
                                theme="snow"
                                value={props.newOrganisation.Organisation_Description}
                                onChange={(value) => props.handleInputChange("Organisation_Description", value)}
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
                            onClick={props.handleCreateOrganisation}
                            className="button-blue"
                        >
                            Create Organisation
                        </button>
                    </div>
                </div>
            </FlexibleBox>
        </div>
    </Block>
)
