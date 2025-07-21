"use client";

// External
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React from "react";
import { useTranslation } from "react-i18next";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Internal
import { Heading, Text } from "@/components";
import { TimeTracksSubComponentsProps } from '@/components/project';
import { SecondsToTimeDisplay } from "@/core-ui/components/TaskTimeTrackPlayer";
import { TaskTimeTrack } from "@/types";

export const TimeTracksPeriodSum: React.FC<TimeTracksSubComponentsProps> = (props) => {
    const { t } = useTranslation(["timetrack"]);

    if (!props.timeTracks || props.timeTracks.length === 0) {
        return <p className="text-gray-500">{t("timetrack.noTimeTracks")}</p>;
    }

    // Group time tracks by day (YYYY-MM-DD format)
    const groupedByDay = props.timeTracks.reduce<Record<string, TaskTimeTrack[]>>((acc, track) => {
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
                                            onClick={() => props.setTaskDetail(track.task)}
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
