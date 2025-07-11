"use client";

// External
import { faArrowRight, faClock, faLightbulb, faSliders, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import clsx from "clsx";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Internal
import { Block, Text } from "@/components/ui/block-text";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { Heading } from "@/components/ui/heading";
import { useProjectsContext, useTasksContext, useTaskTimeTrackContext, useTeamUserSeatsContext } from "@/contexts";
import { LoadingState } from "@/core-ui/components/LoadingState";
import styles from "@/core-ui/styles/modules/TimeTracks.module.scss";
import { useURLLink } from "@/hooks";
import useRoleAccess from "@/hooks/useRoleAccess";
import { Backlog, Project, ProjectStates, Task, TaskTimeTrack, TeamUserSeat, TeamUserSeatsStates } from "@/types";
import { SecondsToTimeDisplay } from "../task/TaskTimeTrackPlayer";

export const TimeTracksContainer = () => {
    // ---- Hooks ----
    const { projectLink } = useParams<{ projectLink: string }>(); // Get projectLink from URL
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation(["timetrack"]);
    const { projectById, readProjectById } = useProjectsContext();
    const { taskTimeTracksByProjectId, getTaskTimeTracksByProject } = useTaskTimeTrackContext();
    const { teamUserSeatsById, readTeamUserSeatsByTeamId } = useTeamUserSeatsContext();
    const { setTaskDetail } = useTasksContext()
    const { linkId: projectId, linkName, convertID_NameStringToURLFormat } = useURLLink(projectLink)
    const { canAccessProject, canManageProject } = useRoleAccess(
        projectById ? projectById.team?.organisation?.User_ID : undefined,
        "project",
        projectById ? projectById.Project_ID : 0
    )

    // ---- State ----
    const urlBacklogIds = searchParams.get("backlogIds")
    const urlUserIds = searchParams.get("userIds")
    const urlTaskIds = searchParams.get("taskIds")
    const [filterTimeEntries, setFilterTimeEntries] = useState<boolean>(false)
    const [selectedBacklogIds, setSelectedBacklogIds] = useState<string[]>([])
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [renderProject, setRenderProject] = useState<ProjectStates>(undefined);
    const [renderTimeTracks, setRenderTimeTracks] = useState<TaskTimeTrack[] | undefined>(undefined)

    // Extract all tasks from the project's backlogs
    const allProjectTasks = renderProject && renderProject?.backlogs
        ?.flatMap((backlog) => backlog.tasks || []) || [];

    // Computed from renderTimeTracks
    const [sortedByDuration, setSortedByDuration] = useState<TaskTimeTrack[] | undefined>(undefined)
    const [sortedByLatest, setSortedByLatest] = useState<TaskTimeTrack[] | undefined>(undefined)

    const getPreviousWeekStartAndEnd = (): { startTime: string; endTime: string } => {
        const today = new Date();

        // Set time to midnight for accuracy
        today.setHours(0, 0, 0, 0);

        // Get current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const dayOfWeek = today.getDay();

        // Adjust so Monday is the first day of the week
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days; else go back (dayOfWeek - 1)

        // Start of previous week (last week's Monday)
        const startOfPreviousWeek = new Date(today);
        startOfPreviousWeek.setDate(today.getDate() - mondayOffset - 7); // Go back 7 days from this week's Monday

        // End of previous week (last week's Sunday)
        const endOfPreviousWeek = new Date(startOfPreviousWeek);
        endOfPreviousWeek.setDate(startOfPreviousWeek.getDate() + 6); // Move to Sunday of that week
        endOfPreviousWeek.setHours(23, 59, 59, 0);

        // Format function to YYYY-MM-DD HH:mm:ss
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            // return `${year}-${month}-${day}`;
        };

        return {
            startTime: formatDate(startOfPreviousWeek),
            endTime: formatDate(endOfPreviousWeek),
        };
    };

    // Get previous week’s start and end dates
    // Extract `startDate` and `endDate` from URL, or use defaults
    const { startTime: defaultStart, endTime: defaultEnd } = getPreviousWeekStartAndEnd();
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const [startDate, setStartDate] = useState(startDateParam || defaultStart);
    const [endDate, setEndDate] = useState(endDateParam || defaultEnd);

    // ---- Effects ----
    // Sync selected backlog IDs with URL or default to all backlogs
    useEffect(() => {
        if (!renderProject) return

        if (urlBacklogIds) {
            // If backlogIds exist in the URL, use them
            const backlogIdsFromURL = urlBacklogIds ? urlBacklogIds.split(",") : [];
            setSelectedBacklogIds(backlogIdsFromURL);
        } else if (renderProject?.backlogs?.length) {
            // If no backlogIds in URL, select all backlogs by default
            const allBacklogIds = renderProject.backlogs
                .map((backlog: Backlog) => backlog.Backlog_ID?.toString())
                .filter((backlogId) => backlogId !== undefined) // Remove undefined values
            setSelectedBacklogIds(allBacklogIds)
        }
    }, [urlBacklogIds, renderProject])

    // Sync selected user IDs with URL or default to all users
    useEffect(() => {
        if (urlUserIds) {
            // If userIds exist in the URL, use them
            const userIdsFromURL = urlUserIds ? urlUserIds.split(",") : [];
            setSelectedUserIds(userIdsFromURL);
        } else if (teamUserSeatsById && teamUserSeatsById.length) {
            // If no userIds in URL, select all users by default
            const allUserIds = teamUserSeatsById
                .map((userSeat: TeamUserSeat) => userSeat.user?.User_ID?.toString())
                .filter((userId) => userId !== undefined) // Remove undefined values
            setSelectedUserIds(allUserIds)
        }
    }, [urlUserIds, teamUserSeatsById])

    // Sync selected task IDs with URL or default to all tasks
    useEffect(() => {
        if (!renderProject) return

        if (urlTaskIds) {
            // If taskIds exist in the URL, use them
            const taskIdsFromURL = urlTaskIds ? urlTaskIds.split(",") : []
            setSelectedTaskIds(taskIdsFromURL)
        } else if (allProjectTasks.length) {
            // If no taskIds in URL, select all tasks by default
            const allTaskIds = allProjectTasks
                .map((task: Task) => task.Task_ID?.toString())
                .filter((taskId): taskId is string => taskId !== undefined) // Remove undefined values

            setSelectedTaskIds(allTaskIds);
        }
    }, [urlTaskIds, renderProject])

    // Fetch project data
    useEffect(() => {
        const loadRenders = async () => {
            console.log("loadRenders", selectedBacklogIds, selectedUserIds, selectedTaskIds)
            if (selectedBacklogIds.length && selectedUserIds.length && selectedTaskIds.length) {
                await getTaskTimeTracksByProject(
                    parseInt(projectId),
                    startDate,
                    endDate,
                    selectedBacklogIds,
                    selectedUserIds,
                    selectedTaskIds
                )
            }
        }
        loadRenders()
    }, [projectId, selectedBacklogIds, selectedUserIds, selectedTaskIds, startDate, endDate])

    useEffect(() => {
        const loadProject = async () => {
            await readProjectById(parseInt(projectId))
        }
        loadProject()
    }, [projectId])

    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById);
            if (projectById) document.title = `${t("timetrack.title")}: ${projectById?.Project_Name} - GiveOrTake`;
        }
    }, [projectById]);

    // Update renderTimeTracks when data is available
    useEffect(() => {
        if (taskTimeTracksByProjectId.length === 0 && renderTimeTracks) setRenderTimeTracks(undefined);

        if (taskTimeTracksByProjectId.length) setRenderTimeTracks(taskTimeTracksByProjectId)
    }, [taskTimeTracksByProjectId]);

    // Sort time tracks by duration and latest entry
    useEffect(() => {
        if (renderTimeTracks && renderTimeTracks.length > 0) {
            // Make a copy and sort by Time_Tracking_Duration in descending order
            setSortedByDuration([...renderTimeTracks].sort(
                (a, b) => (b.Time_Tracking_Duration || 0) - (a.Time_Tracking_Duration || 0)
            ))

            // Make a copy and sort by Time_Tracking_ID in descending order
            setSortedByLatest([...renderTimeTracks].sort(
                (a, b) => (b.Time_Tracking_ID || 0) - (a.Time_Tracking_ID || 0)
            ))
        } else {
            setSortedByDuration([])
            setSortedByLatest([])
        }
    }, [renderTimeTracks]);

    useEffect(() => {
        if (renderProject && renderProject.team?.Team_ID &&
            teamUserSeatsById && !teamUserSeatsById.length) {
            readTeamUserSeatsByTeamId(renderProject.team?.Team_ID)
        }
    }, [renderProject])

    // ---- Render ----
    return (
        <Block className="page-content">
            <FlexibleBox
                title={`${t("timetrack.title")}`}
                subtitle={renderProject ?
                    `${renderProject.Project_Name} (${renderTimeTracks?.length} timetracks) (${selectedTaskIds.length} selectedTaskIds) (${renderProject?.backlogs?.length} backlogs)` :
                    undefined}
                titleAction={
                    renderProject && (
                        <Block className="flex flex-col sm:flex-row gap-2 items-center w-full">
                            <button
                                className="blue-link !inline-flex gap-2 items-center"
                                onClick={() => setFilterTimeEntries(!filterTimeEntries)}
                            >
                                <FontAwesomeIcon icon={faSliders} />
                                <Text variant="span" className="text-sm font-semibold">Filter Time Entries</Text>
                            </button>
                            <Link
                                href={`/project/${convertID_NameStringToURLFormat(renderProject.Project_ID ?? 0, linkName)}`}
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
                <LoadingState singular="Project" renderItem={renderProject} permitted={canAccessProject}>
                    {renderProject && (
                        <Block className="w-full flex flex-col gap-3">
                            <Block className="w-full p-4 bg-white rounded-lg shadow-md">
                                <TimeSummary
                                    timeTracks={renderTimeTracks}
                                    startDate={startDate}
                                    endDate={endDate}
                                    setTaskDetail={setTaskDetail}
                                />
                            </Block>
                            <Block className="w-full p-4 bg-white rounded-lg shadow-md">
                                <TimeTracksPeriodSum
                                    timeTracks={sortedByLatest}
                                    setTaskDetail={setTaskDetail}
                                />
                            </Block>
                            <Block className="flex flex-col lg:flex-row gap-4">
                                <Block className="w-full lg:w-1/4 p-4 bg-white rounded-lg shadow-md">
                                    <TimeSpentPerTask
                                        renderProject={renderProject}
                                        sortedByDuration={sortedByDuration}
                                        setTaskDetail={setTaskDetail}
                                    />
                                </Block>

                                {/* List of Time Tracks */}
                                <Block className="w-full lg:w-3/4 p-4 bg-white rounded-lg shadow-md">
                                    <LatestTimeLogs
                                        sortedByLatest={sortedByLatest}
                                        setTaskDetail={setTaskDetail}
                                    />
                                </Block>
                            </Block>
                        </Block>
                    )}
                </LoadingState>
            </FlexibleBox>

            <FilterTimeEntries
                renderProject={renderProject}
                filterTimeEntries={filterTimeEntries}
                setFilterTimeEntries={setFilterTimeEntries}
                teamUserSeatsById={teamUserSeatsById}
                selectedBacklogIds={selectedBacklogIds}
                selectedUserIds={selectedUserIds}
                selectedTaskIds={selectedTaskIds}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                startDateParam={startDateParam}
                endDateParam={endDateParam}
                allProjectTasks={allProjectTasks}
            />
        </Block>
    );
}

interface FilterTimeEntriesProps {
    renderProject: ProjectStates
    filterTimeEntries: boolean
    setFilterTimeEntries: React.Dispatch<React.SetStateAction<boolean>>
    teamUserSeatsById: TeamUserSeatsStates
    selectedBacklogIds: string[]
    selectedUserIds: string[]
    selectedTaskIds: string[]
    startDate: string
    setStartDate: React.Dispatch<React.SetStateAction<string>>
    endDate: string
    setEndDate: React.Dispatch<React.SetStateAction<string>>
    startDateParam: string | null
    endDateParam: string | null
    allProjectTasks: Task[]
}

const FilterTimeEntries: React.FC<FilterTimeEntriesProps> = ({
    renderProject,
    filterTimeEntries,
    setFilterTimeEntries,
    teamUserSeatsById,
    selectedBacklogIds,
    selectedUserIds,
    selectedTaskIds,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startDateParam,
    endDateParam,
    allProjectTasks
}) => {
    const router = useRouter()
    const searchParams = useSearchParams();

    // Updates the URL parameters based on the provided filters.
    const updateURLParams = (
        newStartDate: string | null,
        newEndDate: string | null,
        newBacklogIds: string[] | undefined,
        newUserIds: string[] | undefined,
        newTaskIds: string[] | undefined | string,
        returnUrl?: boolean
    ) => {
        const url = new URL(window.location.href);

        // startDate
        if (newStartDate) {
            url.searchParams.set("startDate", newStartDate);
        } else {
            url.searchParams.delete("startDate")
        }

        // endDate
        if (newEndDate) {
            url.searchParams.set("endDate", newEndDate);
        } else {
            url.searchParams.delete("endDate")
        }

        // backlogIds
        if (newBacklogIds === undefined) {
            url.searchParams.delete("backlogIds")
        } else if (Array.isArray(newBacklogIds)) { // Handle backlogIds (convert array to a comma-separated string)
            if (newBacklogIds.length > 0) {
                if (renderProject && (renderProject.backlogs?.length ?? 0) > newBacklogIds.length) {
                    url.searchParams.set("backlogIds", newBacklogIds.join(",")); // Store as comma-separated values
                } else {
                    url.searchParams.delete("backlogIds"); // Remove if all are selected, as that is default
                }
            } else {
                url.searchParams.set("backlogIds", "");
            }
        }

        // userIds
        if (newUserIds === undefined) {
            url.searchParams.delete("userIds")
        } else if (Array.isArray(newUserIds)) { // Handle userIds (convert array to a comma-separated string)
            if (newUserIds.length > 0) {
                if (teamUserSeatsById && teamUserSeatsById.length > newUserIds.length) {
                    url.searchParams.set("userIds", newUserIds.join(",")); // Store as comma-separated values
                } else {
                    url.searchParams.delete("userIds"); // Remove if all are selected, as that is default
                }
            } else {
                url.searchParams.set("userIds", "");
            }
        }

        // taskIds
        if (newTaskIds === undefined) {
            url.searchParams.delete("taskIds")
        } else if (Array.isArray(newTaskIds)) { // Handle taskIds (convert array to a comma-separated string)
            if (newTaskIds.length > 0) {
                if (allProjectTasks && allProjectTasks.length > newTaskIds.length) {
                    url.searchParams.set("taskIds", newTaskIds.join(",")); // Store as comma-separated values
                } else {
                    url.searchParams.delete("taskIds"); // Remove if all are selected, as that is default
                }
            } else {
                url.searchParams.set("taskIds", "");
            }
        }

        if (returnUrl) {
            return url.toString()
        } else {
            router.push(url.toString(), { scroll: false }); // Prevent full page reload
        }
    }

    // Handles changes to the start date input field.
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = `${e.target.value} 00:00:00`;
        setStartDate(newStart);
        updateURLParams(newStart, endDate, selectedBacklogIds, selectedUserIds, selectedTaskIds);
    }

    // Handles changes to the end date input field.
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEnd = `${e.target.value} 23:59:59`;
        setEndDate(newEnd);
        updateURLParams(startDate, newEnd, selectedBacklogIds, selectedUserIds, selectedTaskIds);
    }

    // Toggles selection of all backlogs.
    const handleSelectAllBacklogsChange = () => {
        if (!renderProject) return
        const allSelected = selectedBacklogIds.length === renderProject?.backlogs?.length;
        updateURLParams(startDateParam, endDateParam, allSelected ? ["0"] : undefined, selectedUserIds, selectedTaskIds);
    }

    // Handles changes to the team member selection checkboxes.
    const handleCheckboxBacklogChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        let updatedBacklogIds = checked
            ? [...selectedBacklogIds, value] // Add new ID
            : selectedBacklogIds.filter(id => id !== value); // Remove unchecked ID

        if (selectedBacklogIds.length === 0 && renderProject) {
            updatedBacklogIds = (renderProject.backlogs || [])
                .filter((backlog) => backlog.Backlog_ID?.toString() !== value)
                .map((backlog) => backlog.Backlog_ID?.toString() || "")
                .filter((id): id is string => id !== "");
        }

        updateURLParams(startDate, endDate, updatedBacklogIds, selectedUserIds, selectedTaskIds);
    }

    // Toggles selection of all team members.
    const handleSelectAllTeamMembersChange = () => {
        const allSelected = teamUserSeatsById && selectedUserIds.length === teamUserSeatsById.length;
        updateURLParams(startDateParam, endDateParam, selectedBacklogIds, allSelected ? ["0"] : undefined, selectedTaskIds);
    }

    // Handles changes to the team member selection checkboxes.
    const handleCheckboxTeamMemberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        const updatedUserIds = checked
            ? [...selectedUserIds, value] // Add new ID
            : selectedUserIds.filter(id => id !== value); // Remove unchecked ID

        updateURLParams(startDate, endDate, selectedBacklogIds, updatedUserIds, selectedTaskIds);
    }

    // Toggles selection of all project tasks.
    const handleSelectAllProjectTasksChange = () => {
        const allSelected = selectedTaskIds.length === allProjectTasks.length;
        updateURLParams(startDateParam, endDateParam, selectedBacklogIds, selectedUserIds, allSelected ? ["0"] : undefined);
    }

    // Handles changes to the project task selection checkboxes.
    const handleCheckboxTaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        const updatedTaskIds = checked
            ? [...selectedTaskIds, value] // Add new ID
            : selectedTaskIds.filter(id => id !== value); // Remove unchecked ID

        updateURLParams(startDate, endDate, selectedBacklogIds, selectedUserIds, updatedTaskIds);
    }

    // Close filter panel on ESC key press
    useEffect(() => {
        // Effect to listen for the ESC key
        const handleEscPress = (event: KeyboardEvent) => {
            if (event.key === "Escape" && filterTimeEntries) setFilterTimeEntries(!filterTimeEntries)
        };

        // Attach event listener when component is visible
        window.addEventListener("keydown", handleEscPress)
    }, [])

    return (
        <Block
            className={clsx(
                styles["filter-time-entries"],
                { [styles.open]: filterTimeEntries }
            )}
        >
            <Block className="flex justify-between items-center">
                <Text className="font-bold">
                    Filter Time Entries
                </Text>
                <button>
                    <FontAwesomeIcon
                        icon={faXmark}
                        onClick={() => setFilterTimeEntries(!filterTimeEntries)}
                    />
                </button>
            </Block>
            {/* Entry period */}
            <Block>
                <Text className="text-sm font-semibold">Entry period</Text>

                <Block className="flex gap-3 items-center">
                    <input
                        type="date"
                        value={startDate.split(" ")[0]} // Show only YYYY-MM-DD
                        onChange={handleStartDateChange}
                        className="bg-transparent"
                    />
                    <FontAwesomeIcon icon={faArrowRight} />
                    <input
                        type="date"
                        value={endDate.split(" ")[0]} // Show only YYYY-MM-DD
                        onChange={handleEndDateChange}
                        className="bg-transparent"
                    />
                </Block>
            </Block>
            {/* Project backlogs */}
            {renderProject && (
                <Block>
                    <Text className="text-sm font-semibold">Project backlogs</Text>

                    {(renderProject.backlogs?.length && renderProject.backlogs.length > 1) && (
                        <Text
                            variant="span"
                            onClick={() => handleSelectAllBacklogsChange()}
                            className="cursor-pointer text-xs hover:underline"
                        >
                            Select/Deselect All
                        </Text>
                    )}

                    <Block className="flex flex-col mt-3">
                        {renderProject.backlogs?.length && renderProject.backlogs.map(backlog => {
                            return (
                                <Block variant="span" className="flex gap-2" key={backlog.Backlog_ID}>
                                    <input
                                        type="checkbox"
                                        value={backlog.Backlog_ID}
                                        checked={selectedBacklogIds.length === 0 || (backlog.Backlog_ID ? selectedBacklogIds.includes(backlog.Backlog_ID.toString()) : false)}
                                        onChange={handleCheckboxBacklogChange}
                                    />
                                    <Text>{backlog.Backlog_Name}</Text>
                                </Block>
                            )
                        })}
                    </Block>
                </Block>
            )}
            {/* Team members */}
            <Block>
                <Text className="text-sm font-semibold">Team members</Text>

                {teamUserSeatsById && (teamUserSeatsById.length > 1) && (
                    <Text
                        variant="span"
                        onClick={() => handleSelectAllTeamMembersChange()}
                        className="cursor-pointer text-xs hover:underline"
                    >
                        Select/Deselect All
                    </Text>
                )}

                <Block className="flex flex-col mt-3">
                    {teamUserSeatsById && teamUserSeatsById.length && teamUserSeatsById.map(userSeat => {
                        const userDetails = userSeat.user

                        if (!userDetails) return null

                        return (
                            <Block variant="span" className="flex gap-2" key={userSeat.Seat_ID}>
                                <input
                                    type="checkbox"
                                    value={userDetails.User_ID}
                                    checked={selectedUserIds.length === 0 || (userDetails.User_ID ? selectedUserIds.includes(userDetails.User_ID.toString()) : false)}
                                    onChange={handleCheckboxTeamMemberChange}
                                />
                                <Text>{userDetails?.User_FirstName} {userDetails?.User_Surname}</Text>
                            </Block>
                        )
                    })}
                </Block>
            </Block>
            {/* Project tasks */}
            <Block>
                <Text className="text-sm font-semibold">Project tasks</Text>

                {allProjectTasks.length > 1 && (
                    <Text
                        variant="span"
                        onClick={() => handleSelectAllProjectTasksChange()}
                        className="cursor-pointer text-xs hover:underline"
                    >
                        Select/Deselect All
                    </Text>
                )}

                <Block className="flex flex-col mt-3">
                    {allProjectTasks.length && allProjectTasks.map(task => {
                        return (
                            <Block variant="span" className="flex gap-2 items-center" key={task.Task_ID}>
                                <input
                                    type="checkbox"
                                    value={task.Task_ID}
                                    checked={selectedTaskIds.length === 0 || (task.Task_ID ? selectedTaskIds.includes(task.Task_ID.toString()) : false)}
                                    onChange={handleCheckboxTaskChange}
                                />
                                {renderProject && (
                                    <>
                                        <Text variant="small" className="text-xs">
                                            ({renderProject.Project_Key}-{task.Task_Key})
                                        </Text>{" "}
                                    </>
                                )}
                                <Text>{task.Task_Title}</Text>
                            </Block>
                        )
                    })}
                </Block>
            </Block>
        </Block>
    )
}

interface TimeTracksSubComponentsProps {
    timeTracks: TaskTimeTrack[] | undefined
    startDate?: string
    endDate?: string
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
}

export const TimeSummary: React.FC<TimeTracksSubComponentsProps> = ({ timeTracks, startDate, endDate, setTaskDetail }) => {
    const { t } = useTranslation(["timetrack"]);
    const startDateWithoutTime = new Date(startDate ? startDate : '')
    const endDateWithoutTime = new Date(endDate ? endDate : '')

    // Calculate total time tracked
    const totalTimeTracked = useMemo(() => {
        return timeTracks?.reduce((sum, track) => sum + (track.Time_Tracking_Duration || 0), 0) || 0;
    }, [timeTracks]);

    // Calculate average daily time spent
    const averageDailyTime = useMemo(() => {
        if (!timeTracks || timeTracks.length === 0) return 0;

        const uniqueDays = new Set(
            timeTracks.map((track: TaskTimeTrack) => new Date(track.Time_Tracking_Start_Time).toDateString())
        );

        return totalTimeTracked / uniqueDays.size;
    }, [timeTracks, totalTimeTracked]);

    return (
        <>
            <Block className="w-full flex flex-col items-center sm:flex-row gap-4 p-4">
                <Block className="w-2/5 flex flex-col items-center">
                    <FontAwesomeIcon icon={faClock} className="text-blue-500 text-2xl mb-2" />
                    <Heading variant="h3" className="text-sm font-medium">
                        {t("timetrack.timeSummary.totalTimeTracked")}
                    </Heading>
                    <Text variant="p" className="text-lg font-semibold text-center">
                        <SecondsToTimeDisplay totalSeconds={totalTimeTracked} />
                    </Text>
                </Block>

                <Block className="w-1/5 flex flex-col items-center text-sm font-semibold text-gray-400">
                    {startDateWithoutTime.toLocaleString()} - {endDateWithoutTime.toLocaleString()}
                </Block>

                <Block className="w-2/5 flex flex-col items-center">
                    <FontAwesomeIcon icon={faClock} className="text-green-500 text-2xl mb-2" />
                    <Heading variant="h3" className="text-sm font-medium">
                        {t("timetrack.timeSummary.avgDailyTimeSpent")}
                    </Heading>
                    <Text variant="p" className="text-lg font-semibold text-center">
                        <SecondsToTimeDisplay totalSeconds={averageDailyTime} />
                    </Text>
                </Block>
            </Block>
        </>
    );
};

export const TimeTracksCalendar: React.FC<TimeTracksSubComponentsProps> = ({ timeTracks, setTaskDetail }) => {
    const { t } = useTranslation(["timetrack"]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState<string[]>([])

    useEffect(() => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDayOfWeek = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1; // Handle Sunday correctly
        const days = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1);
        const placeholders = new Array(startDayOfWeek).fill(null).map((_, index) => `0-${35 + index}`);

        // Generate "month-day" format
        const daysWithMonthDay = [
            ...placeholders,
            ...days.map(day => {
                const month = currentDate.getMonth();
                return `${month}-${day}`
            })
        ]

        setDaysInMonth(daysWithMonthDay);
    }, [currentDate]);

    const groupTimeTracksByDate = (timeTracks: TaskTimeTrack[] | undefined) => {
        if (!timeTracks) return {};

        return timeTracks.reduce((acc: { [key: string]: TaskTimeTrack[] }, curr) => {
            const date = new Date(curr.Time_Tracking_Start_Time);
            const month = date.getMonth(); // Get the month (0-11)
            const day = date.getDate(); // Get the day of the month (1-31)

            // Generate a unique key for each month and day combination
            const key = `${month}-${day}`;

            // Initialize an array for each unique key if it doesn't exist
            if (!acc[key]) acc[key] = [];

            // Push the current time track to the corresponding group
            acc[key].push(curr);

            return acc;
        }, {});
    };

    const getWeekNumber = (date: Date) => {
        const tempDate = new Date(date);
        tempDate.setHours(0, 0, 0, 0);
        tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
        const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
        return Math.ceil(((tempDate.getTime() - firstThursday.getTime()) / (1000 * 60 * 60 * 24) + firstThursday.getDay() + 1) / 7);
    };

    if (!timeTracks) return null;

    const timeTracksByDate = groupTimeTracksByDate(timeTracks);
    const rows = [];
    for (let i = 0; i < daysInMonth.length; i += 7) {
        rows.push(daysInMonth.slice(i, i + 7));
    }

    return (
        <div className={styles["calendar-container"]}>
            <div className={styles["calendar-header"]}>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                    &lt;
                </button>
                <span>
                    {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
                </span>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                    &gt;
                </button>
            </div>

            {/* Weekdays Section (Mon-Sun) */}
            <div className={styles["calendar-week-days"]}>
                <Block className="w-16 p-3">{t("timetrack.timeTracksCalendar.week")}</Block>
                <div className={styles["calendar-day"]}>{t("timetrack.timeTracksCalendar.monday")}</div>
                <div className={styles["calendar-day"]}>{t("timetrack.timeTracksCalendar.tuesday")}</div>
                <div className={styles["calendar-day"]}>{t("timetrack.timeTracksCalendar.wednesday")}</div>
                <div className={styles["calendar-day"]}>{t("timetrack.timeTracksCalendar.thursday")}</div>
                <div className={styles["calendar-day"]}>{t("timetrack.timeTracksCalendar.friday")}</div>
                <div className={styles["calendar-day"]}>{t("timetrack.timeTracksCalendar.saturday")}</div>
                <div className={styles["calendar-day"]}>{t("timetrack.timeTracksCalendar.sunday")}</div>
            </div>

            {/* Calendar Grid */}
            <div className={styles["calendar-grid"]}>
                {rows.map((week, weekIndex) => {
                    const first0 = week[0]
                    const [month, day] =
                        first0 && typeof first0 === 'string' && first0.includes('-')
                            ? first0.split('-') : [null, null];

                    const dayNum = Number(day) // Convert the day string to a number
                    const isNotPlaceholder = dayNum > 0 && dayNum < 32
                    const theDay = isNotPlaceholder ? day : "1"
                    const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(theDay || "1"))
                    const weekNumber = getWeekNumber(firstDayOfWeek)

                    return (
                        <div key={dayNum} className={styles["calendar-row"]}>
                            <div className={styles["week-number"]}>{weekNumber}</div>

                            {week.map((dateKey) => {
                                const [month, day] =
                                    dateKey && typeof dateKey === 'string' && dateKey.includes('-')
                                        ? dateKey.split('-') : [null, null];

                                if (month === null || day === null) return null // Handle invalid or missing dateKey (don't render it)

                                const dayNum = Number(day) // Convert the day string to a number
                                const isNotPlaceholder = dayNum > 0 && dayNum < 32

                                return (
                                    <div key={dateKey} className={clsx(
                                        [isNotPlaceholder && styles["calendar-date"]]
                                    )}>
                                        <div className={styles["day-number"]}>{isNotPlaceholder && dayNum}</div>

                                        {timeTracksByDate[dateKey]?.slice(0, 3).map((track, index) => (
                                            <>
                                                <Text variant="small" className="text-xs">
                                                    ({track.task?.backlog?.project?.Project_Key}-{track.task?.Task_Key})
                                                </Text>{" "}
                                                <Text
                                                    key={index}
                                                    // href={`/task/${track.task?.backlog?.project?.Project_Key}/${track.task?.Task_Key}`}
                                                    onClick={() => setTaskDetail(track.task)}
                                                    className={clsx(styles["time-entry"], "inline blue-link-light cursor-pointer")}
                                                >
                                                    {track.task?.Task_Title}
                                                </Text>
                                            </>
                                        ))}

                                        {timeTracksByDate[dateKey]?.length > 3 && (
                                            <div className={clsx(styles["time-entry"], styles["x-more-entries"])}>
                                                <span>{t("timetrack.timeTracksCalendar.andOthers", { count: timeTracksByDate[dateKey].length - 3 })}</span>
                                            </div>
                                        )}

                                        {(isNotPlaceholder && (!timeTracksByDate[dateKey] || timeTracksByDate[dateKey].length === 0)) && (
                                            <div className={styles["no-time-tracks"]}>{t("timetrack.timeTracksCalendar.noEntries")}</div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const TimeTracksPeriodSum: React.FC<TimeTracksSubComponentsProps> = ({ timeTracks, setTaskDetail }) => {
    const { t } = useTranslation(["timetrack"]);

    if (!timeTracks || timeTracks.length === 0) {
        return <p className="text-gray-500">{t("timetrack.noTimeTracks")}</p>;
    }

    // Group time tracks by day (YYYY-MM-DD format)
    const groupedByDay = timeTracks.reduce<Record<string, TaskTimeTrack[]>>((acc, track) => {
        const date = new Date(track.Time_Tracking_Start_Time).toISOString().split("T")[0]; // Extract YYYY-MM-DD
        if (!acc[date]) acc[date] = [];
        acc[date].push(track);
        return acc;
    }, {});

    const sortedGroupedByDay = Object.entries(groupedByDay)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, tracks]) => ({ date, tracks }));

    return (
        <>
            <Heading variant="h3" className="text-lg font-semibold mb-2">
                {t("timetrack.timeTracksPeriodSum.title")}
            </Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(sortedGroupedByDay).map(([date, data]) => {
                    // Format date with weekday name
                    const dateObj = new Date(data.tracks[0].Time_Tracking_Start_Time);
                    const formattedDate = dateObj.toLocaleDateString(undefined, {
                        weekday: "long", // e.g., Monday
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });

                    // Calculate total time spent that day
                    const totalDayTime = data.tracks.reduce((sum, track) => sum + (track.Time_Tracking_Duration || 0), 0);

                    return (
                        <div key={date} className="p-4 bg-white shadow rounded-lg">
                            {/* 📅 Display Date */}
                            <h3 className="text-lg font-semibold">{formattedDate}</h3>
                            <p className="text-sm text-gray-600">
                                {t("timetrack.timeTracksPeriodSum.totalTimeTracked")}: <SecondsToTimeDisplay totalSeconds={totalDayTime} />
                            </p>

                            {/* 📝 List of Tasks for that Day */}
                            <ul className="mt-3 space-y-2">
                                {data.tracks.map((track) => (
                                    <li
                                        key={track.Time_Tracking_ID}
                                        className="flex flex-col lg:flex-row justify-between items-center bg-gray-100 p-2 rounded-md"
                                    >
                                        {/* Link to Task */}
                                        <Text variant="small" className="text-xs">
                                            ({track.task?.backlog?.project?.Project_Key}-{track.task?.Task_Key})
                                        </Text>{" "}
                                        <Text
                                            // href={`/task/${track.task?.backlog?.project?.Project_Key}/${track.task?.Task_Key}`}
                                            onClick={() => setTaskDetail(track.task)}
                                            className="blue-link-light inline text-gray-700 cursor-pointer"
                                        >
                                            {track.task?.Task_Title}
                                        </Text>
                                        {/* ⏳ Time Spent */}
                                        <SecondsToTimeDisplay totalSeconds={track.Time_Tracking_Duration || 0} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

interface TimeSpentPerTaskProps {
    renderProject: Project | undefined
    sortedByDuration: TaskTimeTrack[] | undefined
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
}

export const TimeSpentPerTask: React.FC<TimeSpentPerTaskProps> = ({ renderProject, sortedByDuration, setTaskDetail }) => {
    const { t } = useTranslation(["timetrack"]);
    const [chartData, setChartData] = useState<{ labels: string[]; taskKeys: string[]; datasets: any[] }>({
        labels: [],
        taskKeys: [],
        datasets: [],
    });

    useEffect(() => {
        if (!sortedByDuration) return;

        const taskTimeMap = new Map<string, { Task_Key: string; Hours_Spent: number }>();

        sortedByDuration.forEach((track) => {
            const taskName = track.task?.Task_Title || t("timetrack.timeSpentPerTask.unknownTask");
            const taskKey = track.task?.Task_Key || 0;
            const hours = track.Time_Tracking_Duration ? track.Time_Tracking_Duration / 3600 : 0;

            if (taskTimeMap.has(taskName)) {
                taskTimeMap.get(taskName)!.Hours_Spent += hours;
            } else {
                taskTimeMap.set(taskName, { Task_Key: taskKey.toString(), Hours_Spent: hours });
            }
        });

        const sortedTaskTimeEntries = [...taskTimeMap.entries()].sort((a, b) => b[1].Hours_Spent - a[1].Hours_Spent);
        const sortedTaskTimeMap = new Map(sortedTaskTimeEntries);

        setChartData({
            labels: Array.from(sortedTaskTimeMap.keys()),
            taskKeys: Array.from(sortedTaskTimeMap.values()).map((item) => item.Task_Key),
            datasets: [
                {
                    label: t("timetrack.timeSpentPerTask.hoursPerTask"),
                    data: Array.from(sortedTaskTimeMap.values()).map((item) => item.Hours_Spent),
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
                    hoverOffset: 4,
                },
            ],
        });
    }, [sortedByDuration, t]);

    return (
        <>
            <Heading variant="h3" className="text-lg font-semibold mb-2">
                {t("timetrack.timeSpentPerTask.title")}
            </Heading>

            {chartData.labels.length > 0 ? (
                <div className="w-full h-[300px] flex justify-center items-center">
                    <Pie data={chartData} />
                </div>
            ) : (
                <Text variant="p" className="text-gray-500">
                    {t("timetrack.timeSpentPerTask.noData")}
                </Text>
            )}

            <div className="mt-4">
                {chartData.labels.length > 0 && chartData.datasets[0].data.length > 0 && (
                    <ul className="space-y-2">
                        {chartData.labels.map((label, index) => {
                            const totalHours = (chartData.datasets[0].data as number[]).reduce((acc, curr) => acc + curr, 0);
                            const taskHours = chartData.datasets[0].data[index] as number;
                            const percentage = ((taskHours / totalHours) * 100).toFixed(2);
                            const taskKey = chartData.taskKeys[index]
                            const taskTrack = sortedByDuration?.find((track) => {
                                return (track.task?.Task_Key ?? "") === taskKey
                            });
                            const task = taskTrack?.task;

                            return (
                                <li key={index} className="flex flex-col">
                                    <div className="flex justify-between text-sm font-medium">
                                        <Text variant="span">
                                            <Block
                                                // href={`/task/${renderProject?.Project_Key}/${taskKey}`}
                                                onClick={() => task && setTaskDetail(task)}
                                                className="blue-link-light inline cursor-pointer"
                                            >
                                                <Text variant="small" className="text-xs">
                                                    ({renderProject?.Project_Key}-{taskKey})
                                                </Text>{" "}
                                                {label}{" "}
                                                <Text variant="span" className="text-gray-400 inline">
                                                    <SecondsToTimeDisplay totalSeconds={taskHours * 3600} />
                                                </Text>
                                            </Block>
                                        </Text>
                                        <Text variant="span">{percentage}%</Text>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                                        <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }} />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </>
    );
};

interface LatestTimeLogsProps {
    sortedByLatest: TaskTimeTrack[] | undefined
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
}

export const LatestTimeLogs: React.FC<LatestTimeLogsProps> = ({
    sortedByLatest, setTaskDetail
}) => {
    const { t } = useTranslation(["timetrack"]);

    if (!sortedByLatest || sortedByLatest.length === 0) {
        return <Text variant="p" className="text-gray-500">{t("timetrack.latestTimeLogs.noTimeTracks")}</Text>;
    }

    const categorizeEntry = (date: Date): string => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start of the week

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday as end of the week

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        const startOfPreviousWeek = new Date(startOfWeek);
        startOfPreviousWeek.setDate(startOfWeek.getDate() - 7); // Previous week start date

        const endOfPreviousWeek = new Date(endOfWeek);
        endOfPreviousWeek.setDate(endOfPreviousWeek.getDate() - 7); // Previous week end date

        // Categorizing based on different time frames
        if (date >= today) return t("timetrack.latestTimeLogs.today");
        if (date >= yesterday) return t("timetrack.latestTimeLogs.yesterday");
        if (date >= startOfWeek && date <= endOfWeek) return t("timetrack.latestTimeLogs.thisWeek");
        if (date >= startOfPreviousWeek && date <= endOfPreviousWeek) return t("timetrack.latestTimeLogs.previousWeek");
        if (date >= startOfMonth && date < startOfLastMonth) return t("timetrack.latestTimeLogs.thisMonth");
        if (date >= startOfLastMonth && date <= endOfLastMonth) return t("timetrack.latestTimeLogs.lastMonth");
        return t("timetrack.latestTimeLogs.earlier");
    };

    const groupedLogs = sortedByLatest.reduce((acc, track) => {
        if (!track.Time_Tracking_Start_Time) return acc;

        const startTime = new Date(track.Time_Tracking_Start_Time);
        const category = categorizeEntry(startTime);

        if (!acc[category]) acc[category] = [];
        acc[category].push(track);
        return acc;
    }, {} as Record<string, TaskTimeTrack[]>);

    const sectionOrder = [
        t("timetrack.latestTimeLogs.today"),
        t("timetrack.latestTimeLogs.yesterday"),
        t("timetrack.latestTimeLogs.thisWeek"),
        t("timetrack.latestTimeLogs.previousWeek"),
        t("timetrack.latestTimeLogs.thisMonth"),
        t("timetrack.latestTimeLogs.lastMonth"),
        t("timetrack.latestTimeLogs.earlier")
    ];

    return (
        <>
            <Heading variant="h3" className="text-lg font-semibold mb-2">
                {t("timetrack.latestTimeLogs.title")}
            </Heading>
            <ul className="divide-y divide-gray-300">
                {sectionOrder.map((section) =>
                    groupedLogs[section] ? (
                        <React.Fragment key={section}>
                            <li className="py-2 font-bold text-gray-700">{section}</li>
                            {groupedLogs[section].map((track) => (
                                <li key={track.Time_Tracking_ID} className="py-2">
                                    {track.user?.User_FirstName} {track.user?.User_Surname}{" "}
                                    logged work on{" "}
                                    <Text variant="small">
                                        ({track.task?.backlog?.project?.Project_Key}-{track.task?.Task_Key})
                                    </Text>{" "}
                                    <Text
                                        // href={`/task/${track.task?.backlog?.project?.Project_Key}/${track.task?.Task_Key}`}
                                        onClick={() => setTaskDetail(track.task)}
                                        className="inline blue-link cursor-pointer"
                                    >
                                        {track.task?.Task_Title}
                                    </Text>{" "}
                                    lasting{" "}
                                    {track.Time_Tracking_Duration ? (
                                        <SecondsToTimeDisplay totalSeconds={track.Time_Tracking_Duration} />
                                    ) : (
                                        t("timetrack.latestTimeLogs.ongoing")
                                    )}
                                    <br />
                                    <Text variant="small" className="text-gray-400">
                                        {new Date(track.Time_Tracking_Start_Time).toLocaleString()} -{" "}
                                        {track.Time_Tracking_End_Time ? (
                                            <>{new Date(track.Time_Tracking_End_Time).toLocaleString()}</>
                                        ) : (
                                            t("timetrack.latestTimeLogs.endTimeNotAvailable")
                                        )}
                                    </Text>
                                </li>
                            ))}
                        </React.Fragment>
                    ) : null
                )}
            </ul>
        </>
    );
}
