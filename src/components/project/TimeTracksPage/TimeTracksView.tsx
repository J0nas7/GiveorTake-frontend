"use client";

// External
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Internal
import { TimeTracks, TimeTracksProps } from '@/components/project';
import { useProjectsContext, useTasksContext, useTaskTimeTrackContext, useTeamUserSeatsContext } from "@/contexts";
import { useURLLink } from "@/hooks";
import useRoleAccess from "@/hooks/useRoleAccess";
import { Backlog, ProjectStates, Task, TaskTimeTrack, TeamUserSeat } from "@/types";

export const TimeTracksView = () => {
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
    const timeTracksProps: TimeTracksProps = {
        t,
        renderProject,
        teamUserSeatsById,
        allProjectTasks,
        canAccessProject,
        startDate,
        setStartDate,
        startDateParam,
        endDateParam,
        endDate,
        setEndDate,
        setTaskDetail,

        renderTimeTracks,
        sortedByLatest,
        sortedByDuration,
        selectedTaskIds,
        selectedBacklogIds,
        selectedUserIds,
        filterTimeEntries,
        setFilterTimeEntries,

        linkName,
        convertID_NameStringToURLFormat
    }

    return <TimeTracks {...timeTracksProps} />
}
