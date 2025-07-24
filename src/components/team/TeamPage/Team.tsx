"use client"

// External
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import React from 'react'

// Internal
import { Block, FlexibleBox } from '@/components'
import { TeamActions, TeamEditor, TeamProjectsOverview } from '@/components/team'
import { LoadingState } from '@/core-ui/components/LoadingState'
import { TeamFields, TeamStates, User } from '@/types'

export type TeamProps = {
    renderTeam: TeamStates
    authUser: User | undefined
    pathname: string
    canModifyTeamSettings: boolean | undefined
    canManageTeamMembers: boolean | undefined
    parsedPermissions: string[] | undefined
    accessibleProjectsCount: number
    handleHTMLInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleTeamChange: (field: TeamFields, value: string) => void
    handleSaveChanges: () => Promise<void>
    handleDeleteTeam: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
    showEditToggles: boolean
    setShowEditToggles: React.Dispatch<React.SetStateAction<boolean>>
}

export const Team: React.FC<TeamProps> = ({
    renderTeam,
    authUser,
    pathname,
    canModifyTeamSettings,
    canManageTeamMembers,
    parsedPermissions,
    accessibleProjectsCount,
    showEditToggles,
    setShowEditToggles,
    handleHTMLInputChange,
    handleTeamChange,
    handleSaveChanges,
    handleDeleteTeam,
    convertID_NameStringToURLFormat
}) => (
    <Block className="page-content">
        <FlexibleBox
            title="Team Details"
            subtitle={renderTeam ? renderTeam.Team_Name : undefined}
            icon={faUsers}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
            titleAction={
                <TeamActions
                    renderTeam={renderTeam}
                    canManageTeamMembers={canManageTeamMembers}
                    pathname={pathname}
                    canModifyTeamSettings={canModifyTeamSettings}
                    convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
                    showEditToggles={showEditToggles}
                    setShowEditToggles={setShowEditToggles}
                    handleSaveChanges={handleSaveChanges}
                />
            }
        >
            <LoadingState singular="Team" renderItem={renderTeam} permitted={undefined}>
                <TeamEditor
                    renderTeam={renderTeam}
                    canModifyTeamSettings={canModifyTeamSettings}
                    handleTeamChange={handleTeamChange}
                    handleSaveChanges={handleSaveChanges}
                    handleHTMLInputChange={handleHTMLInputChange}
                    handleDeleteTeam={handleDeleteTeam}
                    showEditToggles={showEditToggles}
                />
            </LoadingState>
        </FlexibleBox>

        {/* Projects Overview Section */}
        {renderTeam && (
            <TeamProjectsOverview
                renderTeam={renderTeam}
                accessibleProjectsCount={accessibleProjectsCount}
                parsedPermissions={parsedPermissions}
                authUser={authUser}
                convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
            />
        )}
    </Block>
)
