// External
import React from 'react';

// Internal
import { 
    UsersProvider, TeamsProvider, ProjectsProvider, BacklogsProvider, StatusProvider,
    OrganisationsProvider, TeamUserSeatsProvider,
    TasksProvider, TaskTimeTracksProvider, TaskCommentsProvider, TaskMediaFilesProvider,
} from "@/contexts"

const providers = [
    UsersProvider,
    TeamsProvider,
    TasksProvider,
    TaskTimeTracksProvider,
    TaskCommentsProvider,
    TaskMediaFilesProvider,
    BacklogsProvider,
    StatusProvider,
    ProjectsProvider,
    OrganisationsProvider,
    TeamUserSeatsProvider
]

export const TypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children)
}