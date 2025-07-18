"use client";

// External
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Internal
import { CreateTeam, CreateTeamProps } from '@/components/team';
import { useOrganisationsContext, useTeamsContext } from "@/contexts";
import { useURLLink } from "@/hooks";
import useRoleAccess from "@/hooks/useRoleAccess";
import { Team, TeamFields } from "@/types";

export const CreateTeamView = () => {
    // ---- Hooks ----
    const router = useRouter();
    const { addTeam } = useTeamsContext()
    const { organisationById, readOrganisationById } = useOrganisationsContext()
    const { organisationLink } = useParams<{ organisationLink: string }>() // Get organisationLink from URL
    const { linkId: organisationId, convertID_NameStringToURLFormat } = useURLLink(organisationLink)
    const { canModifyOrganisationSettings } = useRoleAccess(organisationById ? organisationById.User_ID : undefined)

    // ---- State ----
    // State to hold the new team details:
    const [newTeam, setNewTeam] = useState<Team>({
        Organisation_ID: parseInt(organisationId), // Associate the team with the current organisation
        Team_Name: "",
        Team_Description: "",
    })

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
    const createTeamProps: CreateTeamProps = {
        organisationById,
        canModifyOrganisationSettings,
        newTeam,
        handleInputChange,
        handleCreateTeam,
        convertID_NameStringToURLFormat
    }

    return <CreateTeam {...createTeamProps} />
};
