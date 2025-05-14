"use client"

// External
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb, faList } from '@fortawesome/free-solid-svg-icons'

// Internal
import { Block, FlexibleBox, Text } from '@/components'
import { Backlog, ProjectStates } from '@/types'
import { useProjectsContext } from '@/contexts'
import { useParams } from 'next/navigation'
import { BacklogWithSiblingsContainer } from './BacklogWithSiblings'
import Image from 'next/image'
import { LoadingState } from '@/core-ui/components/LoadingState'

export const BacklogsContainer = () => {
    // Hooks
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { projectById, readProjectById } = useProjectsContext()

    // State
    const [renderProject, setRenderProject] = useState<ProjectStates>(undefined)

    // Effects
    useEffect(() => { readProjectById(parseInt(projectId)) }, [projectId])
    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById)
            if (projectById) document.title = `Backlogs: ${projectById.Project_Name} - GiveOrTake`
        }
    }, [projectById])

    // Render
    return (
        <BacklogsView
            renderProject={renderProject}
        />
    )
}

type BacklogsViewProps = {
    renderProject: ProjectStates
}

const BacklogsView: React.FC<BacklogsViewProps> = ({
    renderProject
}) => (
    <Block className="page-content">
        <FlexibleBox
            title={`Project backlogs`}
            subtitle={
                renderProject ?
                    `${renderProject.Project_Name} (${renderProject.backlogs?.length} backlogs)`
                    : undefined
            }
            titleAction={
                renderProject && (
                    <Link
                        href={`/project/${renderProject?.Project_ID}`}
                        className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                    >
                        <FontAwesomeIcon icon={faLightbulb} />
                        <Text variant="span">Go to Project</Text>
                    </Link>
                )
            }
            icon={faList}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <LoadingState singular="Project" renderItem={renderProject}>
                {renderProject && (
                    <>
                        {renderProject.backlogs && renderProject.backlogs.map((backlog: Backlog) => (
                            <Block className="mb-7" key={backlog.Backlog_ID}>
                                <BacklogWithSiblingsContainer backlogId={backlog.Backlog_ID} />
                            </Block>
                        ))}
                    </>
                )}
            </LoadingState>
        </FlexibleBox>
    </Block>
)
