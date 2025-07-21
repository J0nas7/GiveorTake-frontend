"use client";

// External
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Internal
import { Block, Heading, Text } from "@/components";
import { SecondsToTimeDisplay } from "@/core-ui/components/TaskTimeTrackPlayer";
import { Project, Task, TaskTimeTrack } from "@/types";

type TimeSpentPerTaskProps = {
    renderProject: Project | undefined
    sortedByDuration: TaskTimeTrack[] | undefined
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
}

export const TimeSpentPerTask: React.FC<TimeSpentPerTaskProps> = (props) => {
    const { t } = useTranslation(["timetrack"]);
    const [chartData, setChartData] = useState<{ labels: string[]; taskKeys: string[]; datasets: any[] }>({
        labels: [],
        taskKeys: [],
        datasets: [],
    });

    useEffect(() => {
        if (!props.sortedByDuration) return;

        const taskTimeMap = new Map<string, { Task_Key: string; Hours_Spent: number }>();

        props.sortedByDuration.forEach((track) => {
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
    }, [props.sortedByDuration, t]);

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
                            const taskTrack = props.sortedByDuration?.find((track) => {
                                return (track.task?.Task_Key ?? "") === taskKey
                            });
                            const task = taskTrack?.task;

                            return (
                                <li key={index} className="flex flex-col">
                                    <div className="flex justify-between text-sm font-medium">
                                        <Text variant="span">
                                            <Block
                                                // href={`/task/${renderProject?.Project_Key}/${taskKey}`}
                                                onClick={() => task && props.setTaskDetail(task)}
                                                className="blue-link-light inline cursor-pointer"
                                            >
                                                <Text variant="small" className="text-xs">
                                                    ({props.renderProject?.Project_Key}-{taskKey})
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
