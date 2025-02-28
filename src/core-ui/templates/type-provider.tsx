// External
import React from 'react';

// Internal
import { 
    UsersProvider, TeamsProvider, ProjectsProvider, 
    OrganisationsProvider, TeamUserSeatsProvider,
    TasksProvider, TaskCommentsProvider, TaskMediaFilesProvider
} from "@/contexts"

const providers = [
    UsersProvider,
    TeamsProvider,
    TasksProvider,
    TaskCommentsProvider,
    TaskMediaFilesProvider,
    ProjectsProvider,
    OrganisationsProvider,
    TeamUserSeatsProvider
]

export const TypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children)
}