"use client"

// External
import { faChair } from '@fortawesome/free-solid-svg-icons';
import { TFunction } from 'next-i18next';
import React from 'react';

// Internal
import { Block } from '@/components';
import { InviteUserForm, NewRoleForm, RolesOverview, RolesSeatsHeader, SeatsOverview, SelectedRoleForm, SelectedSeatForm } from '@/components/team';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { Role, RoleFields, TeamStates, TeamUserSeat, TeamUserSeatFields, User } from '@/types';

export type RolesSeatsProps = {
    renderUserSeats: TeamUserSeat[];
    renderTeam: TeamStates;
    authUser: User | undefined;
    selectedSeat: TeamUserSeat | undefined;
    displayInviteForm: string | undefined
    selectedRole: Role | undefined
    teamId: string
    t: TFunction
    availablePermissions: string[]
    canManageTeamMembers: boolean | undefined
    rolesAndPermissionsByTeamId: Role[] | undefined
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<false | TeamUserSeat>
    addRole: (parentId: number, object?: Role | undefined) => Promise<void>
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    readRolesAndPermissionsByTeamId: (teamId: number) => Promise<boolean>
    handleSelectSeat: (seat: TeamUserSeat) => void;
    handleSelectRole: (role: Role) => void
    handleRemoveSeat: (seatId: number) => void;
    handleRemoveRole: (roleId: number) => void
    handleSeatChanges: () => void;
    handleRoleChanges: () => Promise<void>
    handleSeatChange: (field: TeamUserSeatFields, value: string) => void;
    handleRoleChange: (field: RoleFields, value: string) => void
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<string | undefined>>
    setSelectedRole: React.Dispatch<React.SetStateAction<Role | undefined>>
    displayNewRoleForm: boolean
    setDisplayNewRoleForm: React.Dispatch<React.SetStateAction<boolean>>
    togglePermission: (permission: string, isChecked: boolean) => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const RolesSeats: React.FC<RolesSeatsProps> = (props) => (
    <Block className="page-content">
        <FlexibleBox
            title={props.t('team:rolesSeatsManager:manageTeamRolesSeats')}
            subtitle={props.renderTeam ? props.renderTeam.Team_Name : undefined}
            titleAction={
                <RolesSeatsHeader {...props} />
            }
            icon={faChair}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        ></FlexibleBox>

        {!props.selectedSeat && !props.displayInviteForm && !props.selectedRole && !props.displayNewRoleForm && (
            <LoadingState singular="Team" renderItem={props.renderTeam} permitted={props.canManageTeamMembers}>
                <RolesOverview {...props} />

                <SeatsOverview {...props} />
            </LoadingState>
        )}

        {props.canManageTeamMembers && props.renderTeam && (
            <>
                {props.selectedSeat ? (
                    <SelectedSeatForm {...props} />
                ) : props.displayInviteForm && props.displayInviteForm !== "" ? (
                    <InviteUserForm {...props} />
                ) : props.selectedRole ? (
                    <SelectedRoleForm {...props} />
                ) : props.displayNewRoleForm ? (
                    <NewRoleForm {...props} />
                ) : null}
            </>
        )}
    </Block>
)
