"use client"

// External
import React, { createContext, useContext, useState, useEffect } from "react"

// Internal
import { Team, TeamFields, TeamsContextType } from "@/types"
import { useTypeAPI } from "@/hooks"

// Context API for Teams
const TeamsContext = createContext<TeamsContextType | undefined>(undefined)

export const TeamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Using useTypeAPI for teams
    const { 
        loading, 
        error, 
        fetchItems: fetchTeams, 
        postItem: postTeam, 
        updateItem: updateTeam, 
        deleteItem: deleteTeam 
    } = useTypeAPI<Team, "Team_ID">("teams", "Team_ID")
    
    const [teams, setTeams] = useState<Team[]>([])
    const [newTeam, setNewTeam] = useState<Team | undefined>(undefined)
    const [teamDetail, setTeamDetail] = useState<Team | undefined>(undefined)

    // Fetch all teams on mount
    useEffect(() => {
        const fetchOnMount = async () => {
            const data = await fetchTeams()
            if (data) setTeams(data)
        }
        fetchOnMount()
    }, [fetchTeams])

    // Add a new team
    const addTeam = async () => {
        if (newTeam?.Team_Name.trim()) {
            const createdTeam = await postTeam(newTeam)
            if (createdTeam) {
                const data = await fetchTeams() // Refresh teams from API
                if (data) {
                    setTeams(data)
                    setNewTeam(undefined)
                }
            }
        }
    }

    // Handle change in new team form
    const handleChangeNewTeam = (field: TeamFields, value: string) => {
        setNewTeam((prevState) => ({
            ...prevState,
            [field]: value,
            Team_UpdatedAt: new Date().toISOString(), // Ensure update timestamp is refreshed
        } as Team))
    }

    // Save team changes (update)
    const saveTeamChanges = async (teamChanges: Team) => {
        const updatedTeam = await updateTeam(teamChanges)
        if (updatedTeam) {
            const data = await fetchTeams() // Refresh teams from API
            if (data) {
                setTeams(data)
            }
        }
    }

    // Remove a team
    const removeTeam = async (id: number) => {
        const success = await deleteTeam(id)
        if (success) {
            const data = await fetchTeams() // Refresh teams after deletion
            if (data) setTeams(data)
        }
    }

    return (
        <TeamsContext.Provider 
            value={{
                teamDetail,
                teams,
                newTeam,
                handleChangeNewTeam,
                addTeam,
                saveTeamChanges,
                removeTeam
            }}
        >
            {children}
        </TeamsContext.Provider>
    )
}

export const useTeamsContext = () => {
    const context = useContext(TeamsContext)
    if (!context) {
        throw new Error("useTeamsContext must be used within a TeamsProvider")
    }
    return context
}
