"use client"

// External
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

// Internal
import { Block } from '@/components';
import { ProjectActions, ProjectBacklogsOverview, ProjectEditor } from '@/components/project';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { ProjectFields, ProjectStates, User } from '@/types';

export type ProjectProps = {
    renderProject: ProjectStates;
    parsedPermissions: string[] | undefined
    canAccessProject: boolean | undefined
    canManageProject: boolean | undefined
    accessibleBacklogsCount: number
    authUser: User | undefined
    handleProjectChange: (field: ProjectFields, value: string) => void;
    handleSaveChanges: () => Promise<void>
    handleDeleteProject: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
    showEditToggles: boolean
    setShowEditToggles: React.Dispatch<React.SetStateAction<boolean>>
}

export const Project: React.FC<ProjectProps> = (props) => (
    <Block className="page-content">
        <FlexibleBox
            title={`Project Details`}
            subtitle={props.renderProject ? props.renderProject.Project_Name : undefined}
            titleAction={
                <ProjectActions
                    renderProject={props.renderProject}
                    canManageProject={props.canManageProject}
                    showEditToggles={props.showEditToggles}
                    setShowEditToggles={props.setShowEditToggles}
                    handleSaveChanges={props.handleSaveChanges}
                    convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
                />
            }
            icon={faLightbulb}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <LoadingState singular="Project" renderItem={props.renderProject} permitted={props.canAccessProject}>
                <ProjectEditor
                    renderProject={props.renderProject}
                    canManageProject={props.canManageProject}
                    showEditToggles={props.showEditToggles}
                    handleProjectChange={props.handleProjectChange}
                    handleDeleteProject={props.handleDeleteProject}
                />
            </LoadingState>
        </FlexibleBox>

        {/* Backlogs Overview Section */}
        {props.canAccessProject && props.renderProject && (
            <ProjectBacklogsOverview
                renderProject={props.renderProject}
                accessibleBacklogsCount={props.accessibleBacklogsCount}
                authUser={props.authUser}
                convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
            />
        )}
    </Block>
)
