"use client";

// External
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React from "react";
import { useTranslation } from "react-i18next";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Internal
import { Heading, Text } from "@/components";
import { SecondsToTimeDisplay } from "@/core-ui/components/TaskTimeTrackPlayer";
import { Task, TaskTimeTrack } from "@/types";

type LatestTimeLogsProps = {
    sortedByLatest: TaskTimeTrack[] | undefined
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
}

export const LatestTimeLogs: React.FC<LatestTimeLogsProps> = (props) => {
    const { t } = useTranslation(["timetrack"]);

    if (!props.sortedByLatest || props.sortedByLatest.length === 0) {
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

    const groupedLogs = props.sortedByLatest.reduce((acc, track) => {
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
                                        onClick={() => props.setTaskDetail(track.task)}
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
