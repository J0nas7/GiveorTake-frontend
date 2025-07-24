"use client"

// External
import React from 'react';

// Internal
import { OrganisationActions, OrganisationEditor, OrganisationTeamsOverview } from '@/components/organisation';
import { Block } from '@/components/ui/block-text';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { OrganisationFields, OrganisationStates } from '@/types';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';

export type OrganisationProps = {
    renderOrganisation: OrganisationStates;
    canModifyOrganisationSettings: boolean | undefined
    handleOrganisationChange: (field: OrganisationFields, value: string) => void;
    handleSaveChanges: () => Promise<void>
    handleDeleteOrganisation: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
    showEditToggles: boolean
    setShowEditToggles: React.Dispatch<React.SetStateAction<boolean>>
}

export const Organisation: React.FC<OrganisationProps> = (props) => (
    <Block className="page-content">
        <FlexibleBox
            title="Organisation Details"
            subtitle={props.renderOrganisation ? props.renderOrganisation?.Organisation_Name : "-"}
            icon={faBuilding}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
            titleAction={
                props.renderOrganisation && (
                    <OrganisationActions
                        renderOrganisation={props.renderOrganisation}
                        canModifyOrganisationSettings={props.canModifyOrganisationSettings}
                        convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
                        handleSaveChanges={props.handleSaveChanges}
                        showEditToggles={props.showEditToggles}
                        setShowEditToggles={props.setShowEditToggles}
                    />
                )
            }
        >
            <LoadingState singular="Organisation" renderItem={props.renderOrganisation} permitted={undefined}>
                <OrganisationEditor {...props} />
            </LoadingState>
        </FlexibleBox>

        {props.renderOrganisation && (
            <OrganisationTeamsOverview
                teams={props.renderOrganisation.teams || []}
                convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
            />
        )}
    </Block>
)
