"use client";

// External
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Internal
import { useOrganisationsContext, useTeamsContext } from "@/contexts";
import { OrganisationStates, Team, TeamFields } from "@/types";
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { faBuilding, faUsers } from "@fortawesome/free-solid-svg-icons";
import { Heading } from "@/components/ui/heading";
import { Field } from "@/components/ui/input-field";
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from "@/redux";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { LoadingState } from "@/core-ui/components/LoadingState";
import { useURLLink } from "@/hooks";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const CreateTeam = () => {
    // ---- Hooks ----
    const router = useRouter();
    const authUser = useTypedSelector(selectAuthUser)
    const { addTeam } = useTeamsContext()
    const { organisationById, readOrganisationById } = useOrganisationsContext()
    const { organisationLink } = useParams<{ organisationLink: string }>() // Get organisationLink from URL
    const { linkId: organisationId, convertID_NameStringToURLFormat } = useURLLink(organisationLink)

    // ---- State ----
    // State to hold the new team details:
    const [newTeam, setNewTeam] = useState<Team>({
        Organisation_ID: parseInt(organisationId), // Associate the team with the current organisation
        Team_Name: "",
        Team_Description: "",
    })
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions)
    // Determine if the authenticated user can modify organisation settings:
    const canModifyOrganisationSettings = (authUser && organisationById && (
        organisationById.User_ID === authUser.User_ID ||
        parsedPermissions?.includes("Modify Organisation Settings")
    ))

    // ---- Methods ----
    // Updates the state of the new team object with the provided field and value
    const handleInputChange = (field: TeamFields, value: string) => {
        setNewTeam((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle form submission
    const handleCreateTeam = async () => {
        if (!newTeam.Team_Name.trim()) {
            alert("Please enter a team name.");
            return;
        }

        await addTeam(parseInt(organisationId), newTeam);
        router.push(`/organisation/${organisationId}`); // Redirect to organisation page
    };

    // ---- Effects ----
    useEffect(() => {
        if (organisationId) readOrganisationById(parseInt(organisationId))
    }, [organisationId])

    useEffect(() => {
        if (organisationById && !canModifyOrganisationSettings) {
            router.push(`/organisation/${organisationById.Organisation_ID}`)
        }
    }, [organisationById])

    // ---- Render ----
    return (
        <CreateTeamView
            organisationById={organisationById}
            canModifyOrganisationSettings={canModifyOrganisationSettings}
            newTeam={newTeam}
            handleInputChange={handleInputChange}
            handleCreateTeam={handleCreateTeam}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    );
};

type CreateTeamViewProps = {
    organisationById: OrganisationStates
    canModifyOrganisationSettings: boolean | undefined
    newTeam: Team
    handleInputChange: (field: TeamFields, value: string) => void
    handleCreateTeam: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const CreateTeamView: React.FC<CreateTeamViewProps> = ({
    organisationById, canModifyOrganisationSettings, newTeam,
    handleInputChange, handleCreateTeam, convertID_NameStringToURLFormat
}) => (
    <Block className="page-content">
        <Block className="mb-8">
            <FlexibleBox
                title="Create New Team"
                titleAction={
                    organisationById && (
                        <Link
                            href={`/organisation/${convertID_NameStringToURLFormat(organisationById.Organisation_ID ?? 0, organisationById.Organisation_Name)}`}
                            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faBuilding} />
                            <Text variant="span">Go to Organisation</Text>
                        </Link>
                    )
                }
                icon={faUsers}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <LoadingState singular="Organisation" renderItem={organisationById} permitted={canModifyOrganisationSettings}>
                    <Block className="bg-white shadow-md rounded-xl p-6">
                        <Heading variant="h2" className="mb-4">
                            Team Details
                        </Heading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                lbl="Team Name"
                                value={newTeam.Team_Name}
                                onChange={(e: string) => handleInputChange("Team_Name", e)}
                                type="text"
                                disabled={false}
                                className="w-full"
                            />
                            <div className="col-span-1 sm:col-span-2">
                                <Text>Team Description</Text>
                                <ReactQuill
                                    className="w-full mt-2 border border-gray-300 rounded-md"
                                    theme="snow"
                                    value={newTeam.Team_Description || ""}
                                    onChange={(value) => handleInputChange("Team_Description", value)}
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
                                onClick={handleCreateTeam}
                                className="button-blue"
                            >
                                Create Team
                            </button>
                        </div>
                    </Block>
                </LoadingState>
            </FlexibleBox>
        </Block >
    </Block >
)
