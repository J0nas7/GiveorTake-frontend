// External
import React from 'react'

// Internal
import { TasksProvider, TeamsProvider } from '@/contexts'

export const TypeProvider = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <TasksProvider>
            <TeamsProvider>
                {children}
            </TeamsProvider>
        </TasksProvider>
    )
}
