// External
import React, { useState } from "react";

// Internal
import { useAxios } from ".";
import { useAppDispatch } from "@/redux";
import { Team } from "@/types";

export const useTeamsAPI = () => {
    // Hooks
    const { httpGetRequest, httpPostWithData, httpPutWithData, httpDeleteRequest } = useAxios();
    const dispatch = useAppDispatch();
    
    // State
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all teams (R in CRUD)
    const fetchTeams = async () => {
        try {
            const data = await httpGetRequest("teams");
            
            if (data) return data;
            
            throw new Error("Failed to fetch teams");
        } catch (error: any) {
            setError(error.message || "An error occurred while fetching teams.");
            console.log(error.message || "An error occurred while fetching teams.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Fetch a single team (R in CRUD)
    const fetchTeam = async (teamId: number) => {
        try {
            const response = await httpGetRequest(`teams/${teamId}`);
            
            if (response.data) return response.data;
            
            throw new Error("Failed to fetch team");
        } catch (error: any) {
            setError(error.message || "An error occurred while fetching the team.");
            return false;
        }
    };

    // Create a new team (C in CRUD)
    const postTeam = async (newTeam: Omit<Team, "Team_ID">) => {
        try {
            const response = await httpPostWithData("teams", newTeam);
            if (response.data) return true;

            throw new Error("Failed to add team");
        } catch (error: any) {
            setError(error.message || "An error occurred while adding the team.");
            return false;
        }
    };

    // Update a team (U in CRUD)
    const updateTeam = async (updatedTeam: Team) => {
        try {
            const response = await httpPutWithData(`teams/${updatedTeam.Team_ID}`, updatedTeam);
            
            if (response.data) return true;

            throw new Error("Failed to update team");
        } catch (error: any) {
            setError(error.message || "An error occurred while updating the team.");
            return false;
        }
    };

    // Delete a team (D in CRUD)
    const deleteTeam = async (teamId: number) => {
        if (!confirm("Are you sure you want to delete this team?")) return;
        
        try {
            const response = await httpDeleteRequest(`teams/${teamId}`);
            if (!response.message) {
                throw new Error("Failed to delete team");
            }

            return true;
        } catch (error: any) {
            setError(error.message || "An error occurred while deleting the team.");
            return false;
        }
    };

    return {
        loading,
        error,
        fetchTeams,
        fetchTeam,
        postTeam,
        updateTeam,
        deleteTeam,
    };
};