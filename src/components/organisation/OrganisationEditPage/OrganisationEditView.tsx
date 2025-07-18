"use client"

// External
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react';

// Dynamically import ReactQuill with SSR disabled
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { OrganisationEdit, OrganisationEditProps } from '@/components/organisation';
import { useOrganisationsContext } from '@/contexts/'; // Ensure this is correctly set up
import { useURLLink } from '@/hooks';
import useRoleAccess from '@/hooks/useRoleAccess';
import { OrganisationFields, OrganisationStates } from '@/types';

export const OrganisationEditView: React.FC = () => {
    // ---- Hooks ----
    const router = useRouter()
    const { organisationById, readOrganisationById, saveOrganisationChanges, removeOrganisation } = useOrganisationsContext()
    const { organisationLink } = useParams<{ organisationLink: string }>() // Get organisationLink from URL
    const { linkId: organisationId, convertID_NameStringToURLFormat } = useURLLink(organisationLink)
    const { canModifyOrganisationSettings } = useRoleAccess(organisationById ? organisationById.User_ID : undefined)

    // ---- State ----
    const [renderOrganisation, setRenderOrganisation] = useState<OrganisationStates>(undefined)

    // ---- Methods ----
    // Handles changes to HTML input fields and updates the organisation state.
    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        handleOrganisationChange(name as OrganisationFields, value)
    };

    // Updates the organisation state with changes to a specific field.
    const handleOrganisationChange = (field: OrganisationFields, value: string) => {
        if (!renderOrganisation) return

        setRenderOrganisation({
            ...renderOrganisation,
            [field]: value
        });
    }

    // Handles saving changes made to the organisation details.
    const handleSaveChanges = async () => {
        if (renderOrganisation) await saveOrganisationChanges(renderOrganisation, renderOrganisation.User_ID)
    }

    // Handles deleting the organisation.
    const handleDeleteOrganisation = async () => {
        if (!renderOrganisation || !renderOrganisation.Organisation_ID) return
        const removed = await removeOrganisation(
            renderOrganisation.Organisation_ID,
            renderOrganisation.User_ID,
            `/`
        )
    }

    // ---- Effects ----
    useEffect(() => { readOrganisationById(parseInt(organisationId)); }, [organisationId])
    useEffect(() => {
        if (organisationId) {
            setRenderOrganisation(organisationById)

            if (organisationById) document.title = `Organisation: ${organisationById?.Organisation_Name} - GiveOrTake`
        }
    }, [organisationById])

    // ---- Render ----
    const organisationEditProps: OrganisationEditProps = {
        renderOrganisation,
        canModifyOrganisationSettings,
        handleOrganisationChange,
        handleSaveChanges,
        handleDeleteOrganisation,
        convertID_NameStringToURLFormat
    }

    return <OrganisationEdit {...organisationEditProps} />
};
