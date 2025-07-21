"use client";

// External
import { faClock, faLightbulb, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Dispatch, SetStateAction } from "react";

// Internal
import { Block, FlexibleBox, Text } from "@/components";
import { FilterTimeEntries, LatestTimeLogs, TimeSpentPerTask, TimeSummary, TimeTracksPeriodSum } from '@/components/project';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { ProjectStates, Task, TaskTimeTrack, TeamUserSeatsStates } from "@/types";
import { TFunction } from 'next-i18next';
import Link from 'next/link';

export type TimeTracksProps = {
    t: TFunction
    renderProject: ProjectStates
    teamUserSeatsById: TeamUserSeatsStates
    allProjectTasks: Task[]
    canAccessProject: boolean | undefined
    startDate: string
    setStartDate: Dispatch<SetStateAction<string>>
    startDateParam: string | null
    endDateParam: string | null
    endDate: string
    setEndDate: Dispatch<SetStateAction<string>>
    setTaskDetail: Dispatch<SetStateAction<Task | undefined>>


    renderTimeTracks: TaskTimeTrack[] | undefined
    sortedByLatest: TaskTimeTrack[] | undefined
    sortedByDuration: TaskTimeTrack[] | undefined
    selectedTaskIds: string[]
    selectedBacklogIds: string[]
    selectedUserIds: string[]
    filterTimeEntries: boolean
    setFilterTimeEntries: Dispatch<SetStateAction<boolean>>


    linkName: string
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export type TimeTracksSubComponentsProps = {
    timeTracks: TaskTimeTrack[] | undefined
    startDate?: string
    endDate?: string
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
}

export const TimeTracks: React.FC<TimeTracksProps> = (props) => (
    <Block className="page-content">
        <FlexibleBox
            title={`${props.t("timetrack.title")}`}
            subtitle={props.renderProject ?
                `${props.renderProject.Project_Name} (${props.renderTimeTracks?.length} timetracks) (${props.selectedTaskIds.length} selectedTaskIds) (${props.renderProject?.backlogs?.length} backlogs)` :
                undefined}
            titleAction={
                props.renderProject && (
                    <Block className="flex flex-col sm:flex-row gap-2 items-center w-full">
                        <button
                            className="blue-link !inline-flex gap-2 items-center"
                            onClick={() => props.setFilterTimeEntries(!props.filterTimeEntries)}
                        >
                            <FontAwesomeIcon icon={faSliders} />
                            <Text variant="span" className="text-sm font-semibold">Filter Time Entries</Text>
                        </button>
                        <Link
                            href={`/project/${props.convertID_NameStringToURLFormat(props.renderProject.Project_ID ?? 0, props.linkName)}`}
                            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faLightbulb} />
                            <Text variant="span">Go to Project</Text>
                        </Link>
                    </Block>
                )
            }
            icon={faClock}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <LoadingState singular="Project" renderItem={props.renderProject} permitted={props.canAccessProject}>
                {props.renderProject && (
                    <Block className="w-full flex flex-col gap-3">
                        <Block className="w-full p-4 bg-white rounded-lg shadow-md">
                            <TimeSummary
                                timeTracks={props.renderTimeTracks}
                                startDate={props.startDate}
                                endDate={props.endDate}
                                setTaskDetail={props.setTaskDetail}
                            />
                        </Block>
                        <Block className="w-full p-4 bg-white rounded-lg shadow-md">
                            <TimeTracksPeriodSum
                                timeTracks={props.sortedByLatest}
                                setTaskDetail={props.setTaskDetail}
                            />
                        </Block>
                        <Block className="flex flex-col lg:flex-row gap-4">
                            <Block className="w-full lg:w-1/4 p-4 bg-white rounded-lg shadow-md">
                                <TimeSpentPerTask
                                    renderProject={props.renderProject}
                                    sortedByDuration={props.sortedByDuration}
                                    setTaskDetail={props.setTaskDetail}
                                />
                            </Block>

                            {/* List of Time Tracks */}
                            <Block className="w-full lg:w-3/4 p-4 bg-white rounded-lg shadow-md">
                                <LatestTimeLogs
                                    sortedByLatest={props.sortedByLatest}
                                    setTaskDetail={props.setTaskDetail}
                                />
                            </Block>
                        </Block>
                    </Block>
                )}
            </LoadingState>
        </FlexibleBox>

        <FilterTimeEntries
            renderProject={props.renderProject}
            filterTimeEntries={props.filterTimeEntries}
            setFilterTimeEntries={props.setFilterTimeEntries}
            teamUserSeatsById={props.teamUserSeatsById}
            selectedBacklogIds={props.selectedBacklogIds}
            selectedUserIds={props.selectedUserIds}
            selectedTaskIds={props.selectedTaskIds}
            startDate={props.startDate}
            endDate={props.endDate}
            setStartDate={props.setStartDate}
            setEndDate={props.setEndDate}
            startDateParam={props.startDateParam}
            endDateParam={props.endDateParam}
            allProjectTasks={props.allProjectTasks}
        />
    </Block>
);
