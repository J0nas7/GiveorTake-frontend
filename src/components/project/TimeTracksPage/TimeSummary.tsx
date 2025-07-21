"use client";

// External
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Internal
import { Block, Heading, Text } from "@/components";
import { TimeTracksSubComponentsProps } from '@/components/project';
import { SecondsToTimeDisplay } from "@/core-ui/components/TaskTimeTrackPlayer";
import { TaskTimeTrack } from "@/types";

export const TimeSummary: React.FC<TimeTracksSubComponentsProps> = (props) => {
    const { t } = useTranslation(["timetrack"]);
    const startDateWithoutTime = new Date(props.startDate ? props.startDate : '')
    const endDateWithoutTime = new Date(props.endDate ? props.endDate : '')

    // Calculate total time tracked
    const totalTimeTracked = useMemo(() => {
        return props.timeTracks?.reduce((sum, track) => sum + (track.Time_Tracking_Duration || 0), 0) || 0;
    }, [props.timeTracks]);

    // Calculate average daily time spent
    const averageDailyTime = useMemo(() => {
        if (!props.timeTracks || props.timeTracks.length === 0) return 0;

        const uniqueDays = new Set(
            props.timeTracks.map((track: TaskTimeTrack) => new Date(track.Time_Tracking_Start_Time).toDateString())
        );

        return totalTimeTracked / uniqueDays.size;
    }, [props.timeTracks, totalTimeTracked]);

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
