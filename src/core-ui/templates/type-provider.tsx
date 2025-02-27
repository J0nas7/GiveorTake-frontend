// External
import React from 'react';

// Internal
import { 
    UsersProvider, TeamsProvider, TasksProvider, 
    ProjectsProvider, OrganisationsProvider, TeamUserSeatsProvider
} from "@/contexts"

const providers = [
    UsersProvider,
    TeamsProvider,
    TasksProvider,
    ProjectsProvider,
    OrganisationsProvider,
    TeamUserSeatsProvider
]

export const TypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children)
}