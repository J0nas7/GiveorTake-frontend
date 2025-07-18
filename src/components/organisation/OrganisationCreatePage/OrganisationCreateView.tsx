"use client"

// External
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Internal
import { OrganisationCreate, OrganisationCreateProps } from '@/components/organisation';
import { useOrganisationsContext } from "@/contexts";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { Organisation, OrganisationFields } from "@/types";

export const OrganisationCreateView: React.FC = () => {
    // ---- Hooks ----
    const router = useRouter()
    const { addOrganisation } = useOrganisationsContext()

    // ---- State ----
    const [newOrganisation, setNewOrganisation] = useState<Organisation>({
        User_ID: 0, // This should be set based on the authenticated user
        Organisation_Name: "",
        Organisation_Description: "",
    })
    const authUser = useTypedSelector(selectAuthUser)

    // ---- Methods ----
    // Handle input field changes and update state
    const handleInputChange = (field: OrganisationFields, value: string) => {
        setNewOrganisation((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    // Handles the creation of a new organisation.
    const handleCreateOrganisation = async () => {
        if (!newOrganisation.Organisation_Name) {
            alert("Please enter an organisation name.")
            return
        }

        if (newOrganisation.User_ID === 0) {
            alert("An error happened, assigning the organisation to you. Please try again.")
            return
        }

        await addOrganisation(newOrganisation.User_ID, newOrganisation)
        router.push("/") // Redirect after successful creation
    }

    // ---- Effects ----
    useEffect(() => {
        if (authUser && authUser.User_ID) setNewOrganisation({
            ...newOrganisation,
            User_ID: authUser.User_ID
        })
    }, [authUser])

    // ---- Render ----
    const organisationCreateProps: OrganisationCreateProps = {
        newOrganisation,
        handleInputChange,
        handleCreateOrganisation
    }

    return <OrganisationCreate {...organisationCreateProps} />
}
