// External
import React, { useState } from "react";

// Internal
import { useAxios } from ".";
import { useAppDispatch } from "@/redux";
import { Organisation } from "@/types";

export const useOrganisationsAPI = () => {
    // Hooks
    const { httpGetRequest, httpPostWithData, httpPutWithData, httpDeleteRequest } = useAxios();
    const dispatch = useAppDispatch();
    
    // State
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all organisations (R in CRUD)
    const fetchOrganisations = async () => {
        try {
            const data = await httpGetRequest("organisations");
            
            if (data) return data;
            
            throw new Error("Failed to fetch organisations");
        } catch (error: any) {
            setError(error.message || "An error occurred while fetching organisations.");
            console.log(error.message || "An error occurred while fetching organisations.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Fetch a single organisation (R in CRUD)
    const fetchOrganisation = async (organisationId: number) => {
        try {
            const response = await httpGetRequest(`organisations/${organisationId}`);
            
            if (response.data) return response.data;
            
            throw new Error("Failed to fetch organisation");
        } catch (error: any) {
            setError(error.message || "An error occurred while fetching the organisation.");
            return false;
        }
    };

    // Create a new organisation (C in CRUD)
    const postOrganisation = async (newOrganisation: Omit<Organisation, "Organisation_ID">) => {
        try {
            const response = await httpPostWithData("organisations", newOrganisation);
            if (response.data) return true;

            throw new Error("Failed to add organisation");
        } catch (error: any) {
            setError(error.message || "An error occurred while adding the organisation.");
            return false;
        }
    };

    // Update an organisation (U in CRUD)
    const updateOrganisation = async (updatedOrganisation: Organisation) => {
        try {
            const response = await httpPutWithData(`organisations/${updatedOrganisation.Organisation_ID}`, updatedOrganisation);
            
            if (response.data) return true;

            throw new Error("Failed to update organisation");
        } catch (error: any) {
            setError(error.message || "An error occurred while updating the organisation.");
            return false;
        }
    };

    // Delete an organisation (D in CRUD)
    const deleteOrganisation = async (organisationId: number) => {
        if (!confirm("Are you sure you want to delete this organisation?")) return;
        
        try {
            const response = await httpDeleteRequest(`organisations/${organisationId}`);
            if (!response.message) {
                throw new Error("Failed to delete organisation");
            }

            return true;
        } catch (error: any) {
            setError(error.message || "An error occurred while deleting the organisation.");
            return false;
        }
    };

    return {
        loading,
        error,
        fetchOrganisations,
        fetchOrganisation,
        postOrganisation,
        updateOrganisation,
        deleteOrganisation,
    };
};
