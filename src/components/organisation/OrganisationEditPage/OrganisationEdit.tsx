"use client"

// External
import React from 'react';

// Internal
import { OrganisationDetailsCard, OrganisationEditActions, OrganisationTeamsOverview } from '@/components/organisation';
import { Block } from '@/components/ui/block-text';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { OrganisationFields, OrganisationStates } from '@/types';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';

export type OrganisationEditProps = {
    renderOrganisation: OrganisationStates;
    canModifyOrganisationSettings: boolean | undefined
    handleOrganisationChange: (field: OrganisationFields, value: string) => void;
    handleSaveChanges: () => Promise<void>
    handleDeleteOrganisation: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const OrganisationEdit: React.FC<OrganisationEditProps> = (props) => (
    <Block className="page-content">
        <FlexibleBox
            title="Organisation Settings"
            subtitle={props.renderOrganisation ? props.renderOrganisation?.Organisation_Name : "-"}
            icon={faBuilding}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
            titleAction={
                props.renderOrganisation && (
                    <OrganisationEditActions
                        organisationId={props.renderOrganisation.Organisation_ID}
                        organisationName={props.renderOrganisation.Organisation_Name}
                        canModify={props.canModifyOrganisationSettings}
                        convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
                    />
                )
            }
        >
            <LoadingState
                singular="Organisation"
                renderItem={props.renderOrganisation}
                permitted={undefined}
            >
                {props.renderOrganisation && (
                    <OrganisationDetailsCard {...props} />
                )}
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
