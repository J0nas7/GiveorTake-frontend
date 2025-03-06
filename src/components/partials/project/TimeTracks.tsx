"use client";

// External
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Internal
import styles from "@/core-ui/styles/modules/TimeTracks.module.scss"
import { Block, Text } from "@/components/ui/block-text";
import { useProjectsContext, useTaskTimeTrackContext } from "@/contexts";
import { Project, TaskTimeTrack } from "@/types";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { SecondsToTimeDisplay } from "../task/TaskTimeTrackPlayer";
import { Heading } from "@/components/ui/heading";
import clsx from "clsx";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Component
export const TimeTracks = () => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const { t } = useTranslation(["timetrack"]);
    const { projectById, readProjectById } = useProjectsContext();
    const { taskTimeTracksByProjectId, getTaskTimeTracksByProject } = useTaskTimeTrackContext();

    const [renderProject, setRenderProject] = useState<Project | undefined>(undefined);
    const [renderTimeTracks, setRenderTimeTracks] = useState<TaskTimeTrack[] | undefined>(undefined);
    const [chartData, setChartData] = useState<{ labels: string[]; datasets: any[] }>({
        labels: [],
        datasets: [],
    });

    // Fetch project data
    useEffect(() => {
        getTaskTimeTracksByProject(parseInt(projectId));
        readProjectById(parseInt(projectId));
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            setRenderProject(projectById);
            document.title = `${t("timetrack.title")}: ${projectById?.Project_Name} - GiveOrTake`;
        }
    }, [projectById]);

    // Update renderTimeTracks when data is available
    useEffect(() => {
        if (taskTimeTracksByProjectId.length === 0 && renderTimeTracks) {
            setRenderTimeTracks(undefined);
        }
        if (taskTimeTracksByProjectId.length && !renderTimeTracks) {
            setRenderTimeTracks(taskTimeTracksByProjectId);
        }
    }, [taskTimeTracksByProjectId]);

    // Prepare data for the Pie chart
    useEffect(() => {
        if (renderTimeTracks && renderTimeTracks.length > 0) {
            // Make a copy and sort by Time_Tracking_Duration in descending order
            const sortedTimeTracks = [...renderTimeTracks].sort(
                (a, b) => (b.Time_Tracking_Duration || 0) - (a.Time_Tracking_Duration || 0)
            );

            // Aggregate total hours per task
            const taskTimeMap = new Map<string, number>();

            sortedTimeTracks.forEach((track) => {
                const taskName = track.task?.Task_Title || "Unknown Task";
                const hours = track.Time_Tracking_Duration ? track.Time_Tracking_Duration / 3600 : 0; // Convert from seconds to hours
                taskTimeMap.set(taskName, (taskTimeMap.get(taskName) || 0) + hours);
            });

            setChartData({
                labels: Array.from(taskTimeMap.keys()),
                datasets: [
                    {
                        label: "Hours per Task",
                        data: Array.from(taskTimeMap.values()),
                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                        ],
                        hoverOffset: 4,
                    },
                ],
            });
        }
    }, [renderTimeTracks]);

    return (
        <Block className="page-content">
            <Link href={`/project/${renderProject?.Project_ID}`} className="page-back-navigation">
                &laquo; Go to Project
            </Link>

            <FlexibleBox
                title={`${t("timetrack.title")}: ${renderProject?.Project_Name}`}
                icon={faClock}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <Block className="w-full flex flex-col gap-3">
                    <Block className="w-full p-4 bg-white rounded-lg shadow-md">
                        <TimeTracksCalendarView timeTracks={renderTimeTracks} />
                    </Block>
                    <Block className="flex gap-4">
                        <Block className="w-1/4 p-4 bg-white rounded-lg shadow-md">
                            <Heading variant="h3" className="text-lg font-semibold mb-2">Time Spent per Task</Heading>
                            {/* Pie Chart - Time Spent per Task */}
                            {chartData.labels.length > 0 ? (
                                <div className="w-full h-[300px] flex justify-center items-center">
                                    <Pie data={chartData} />
                                </div>
                            ) : (
                                <Text variant="p" className="text-gray-500">No data available</Text>
                            )}

                            {/* Percentages List */}
                            <div className="mt-4">
                                {chartData.labels.length > 0 && chartData.datasets[0].data.length > 0 && (
                                    <ul className="space-y-2">
                                        {chartData.labels.map((label, index) => {
                                            const totalHours: number = (chartData.datasets[0].data as number[]).reduce(
                                                (acc: number, curr: number) => acc + curr,
                                                0
                                            );

                                            const taskHours: number = chartData.datasets[0].data[index] as number;
                                            const percentage: string = ((taskHours / totalHours) * 100).toFixed(1); // Round to 1 decimal

                                            return (
                                                <li key={index} className="flex flex-col">
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span>{label}</span>
                                                        <span>{percentage}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                                                        <div
                                                            className="h-full bg-blue-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </Block>

                        {/* List of Time Tracks */}
                        <Block className="w-3/4 p-4 bg-white rounded-lg shadow-md">
                            <Heading variant="h3" className="text-lg font-semibold mb-2">Latest Time Logs</Heading>
                            {renderTimeTracks && renderTimeTracks.length > 0 ? (
                                <ul className="divide-y divide-gray-300">
                                    {renderTimeTracks.map((track) => (
                                        <li key={track.Time_Tracking_ID} className="py-2">
                                            <Text variant="span" className="inline">
                                                {track.user?.User_FirstName} {track.user?.User_Surname}
                                            </Text> -{" "}
                                            <Text variant="span" className="inline">{track.task?.Task_Title}</Text> -{" "}
                                            {track.Time_Tracking_Duration ? (
                                                <SecondsToTimeDisplay totalSeconds={track.Time_Tracking_Duration} />
                                            ) : (
                                                "Ongoing"
                                            )}
                                            <br />
                                            <Text variant="small" className="text-gray-400">
                                                {track.Time_Tracking_Start_Time &&
                                                    track.Time_Tracking_End_Time ? (
                                                    <>
                                                        {new Date(track.Time_Tracking_Start_Time).toLocaleString()} -{" "}
                                                        {new Date(track.Time_Tracking_End_Time).toLocaleString()}
                                                    </>
                                                ) : (
                                                    "Start time not available"
                                                )}
                                            </Text>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <Text variant="p" className="text-gray-500">No time tracks found.</Text>
                            )}
                        </Block>
                    </Block>
                </Block>
            </FlexibleBox>
        </Block>
    );
};

interface TimeTracksCalendarViewProps {
    timeTracks: TaskTimeTrack[] | undefined
}

export const TimeTracksCalendarView: React.FC<TimeTracksCalendarViewProps> = ({ timeTracks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

    useEffect(() => {
        // Calculate the start and end dates of the current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Get the day of the week for the first day of the month (0: Sunday, 1: Monday, ...)
        const startDayOfWeek = startOfMonth.getDay() - 1;

        // Create an array for all days of the current month
        const days = [];
        for (let i = 1; i <= endOfMonth.getDate(); i++) {
            days.push(i);
        }

        // Add placeholder days to the start, based on the startDayOfWeek
        const placeholders = new Array(startDayOfWeek).fill(null); // Empty placeholders for the start of the month
        setDaysInMonth([...placeholders, ...days]); // Combine placeholders and actual days
    }, [currentDate]);

    // Group time tracks by date (day of the month)
    const groupTimeTracksByDate = (timeTracks: TaskTimeTrack[] | undefined) => {
        if (!timeTracks) return {}; // Return an empty object if no timeTracks

        return timeTracks.reduce((acc: { [key: number]: TaskTimeTrack[] }, curr) => {
            const date = new Date(curr.Time_Tracking_Start_Time);
            const day = date.getDate(); // Get the day of the month

            // If this day is not yet in the accumulator, create an empty array
            if (!acc[day]) acc[day] = [];

            // Push the current track into the array for the respective day
            acc[day].push(curr);

            return acc;
        }, {}); // Start with an empty object to accumulate the result
    };

    // Function to get the week number for a given date
    const getWeekNumber = (date: Date) => {
        const startDate = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return Math.ceil((days + 1) / 7);
    };

    // Get the day of the week (0: Sunday, 1: Monday, ..., 6: Saturday)
    const getDayOfWeek = (date: Date) => {
        return date.getDay();
    };

    if (!timeTracks) return null; // If no time tracks, render nothing

    const timeTracksByDate = groupTimeTracksByDate(timeTracks);

    // Create rows of days (weeks)
    const rows = [];
    const daysInRow = 7; // 7 days per week
    for (let i = 0; i < daysInMonth.length; i += daysInRow) {
        rows.push(daysInMonth.slice(i, i + daysInRow));
    }

    return (
        <div className={styles["calendar-container"]}>
            <div className={styles["calendar-header"]}>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                    &lt;
                </button>
                <span>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</span>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                    &gt;
                </button>
            </div>

            {/* Weekdays Section (Mon-Sun) */}
            <div className={styles["calendar-week-days"]}>
                <Block className="w-[30px p-3">Week</Block>
                <div className={styles["calendar-day"]}>Mon</div>
                <div className={styles["calendar-day"]}>Tue</div>
                <div className={styles["calendar-day"]}>Wed</div>
                <div className={styles["calendar-day"]}>Thu</div>
                <div className={styles["calendar-day"]}>Fri</div>
                <div className={styles["calendar-day"]}>Sat</div>
                <div className={styles["calendar-day"]}>Sun</div>
            </div>

            {/* Calendar Grid */}
            <div className={styles["calendar-grid"]}>
                {rows.map((week, weekIndex) => {
                    // Calculate the week number for the first day in each week
                    const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), week[0]);

                    // Get the weekday of the first day in the current week (Mon-Sun)
                    const dayOfWeek = getDayOfWeek(firstDayOfWeek);

                    const weekNumber = getWeekNumber(firstDayOfWeek); // Get week number

                    return (
                        <div key={weekIndex} className={styles["calendar-row"]}>
                            {/* Week number column */}
                            <div className={styles["week-number"]}>{weekNumber}</div>

                            {/* Days of the week */}
                            {week.map((day, dayIndex) => {
                                const currentDateForDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

                                // Create empty cells for the first week (when the first day of the month doesn't start on Monday)
                                const offset = dayIndex === 0 ? dayOfWeek : 0;
                                const adjustedDay = day - offset;

                                return (
                                    <div key={adjustedDay} className={styles["calendar-date"]}>
                                        <div className={styles["day-number"]}>{adjustedDay > 0 ? adjustedDay : ''}</div>

                                        {/* Show the first 3 entries and then "and x others" */}
                                        {timeTracksByDate[adjustedDay]?.slice(0, 3).map((track: TaskTimeTrack, index: number) => (
                                            <div key={index} className={styles["time-entry"]}>
                                                <span>{track.task?.Task_Title}</span>
                                            </div>
                                        ))}

                                        {/* Show "and x others" for the remaining entries */}
                                        {timeTracksByDate[adjustedDay]?.length > 3 && (
                                            <div className={clsx(styles["time-entry"], styles["x-more-entries"])}>
                                                <span>and {timeTracksByDate[adjustedDay].length - 3} others</span>
                                            </div>
                                        )}

                                        {/* Show message when no time tracks for the day */}
                                        {(!timeTracksByDate[adjustedDay] || timeTracksByDate[adjustedDay].length === 0) && (
                                            <div className={styles["no-time-tracks"]}>No time entries</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
