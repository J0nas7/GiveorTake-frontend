"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation";
import { useTranslation } from "next-i18next"

// External chart library
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Internal components and hooks
import styles from "@/core-ui/styles/modules/Dashboard.module.scss"
import { Block, Text, Heading } from "@/components"
import { useBacklogsContext, useProjectsContext, useTasksContext } from "@/contexts"
import { Backlog, BacklogStates, Project, Task } from "@/types"
import Link from "next/link";
import { FlexibleBox } from "@/components/ui/flexible-box";
import { faGauge, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const DashboardContainer = () => {
    const { backlogId } = useParams<{ backlogId: string }>(); // Get backlogId from URL
    const { t } = useTranslation(['dashboard']);
    const { tasksById, readTasksByBacklogId } = useTasksContext();
    const { backlogById, readBacklogById } = useBacklogsContext();

    const [renderBacklog, setRenderBacklog] = useState<BacklogStates>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)

    useEffect(() => {
        console.log("tasksByID changed")
        if (tasksById.length == 0 && renderTasks) {
            setRenderTasks(undefined)
        }
        if (tasksById.length) {
            console.log("renderTasks", renderTasks)
            setRenderTasks(tasksById)
        }
    }, [tasksById])
    useEffect(() => {
        readTasksByBacklogId(parseInt(backlogId))
        readBacklogById(parseInt(backlogId))
    }, [backlogId])
    useEffect(() => {
        if (backlogId) {
            setRenderBacklog(backlogById)
            if (backlogById) document.title = `Dashboard: ${backlogById?.Backlog_Name} - GiveOrTake`
        }
    }, [backlogById])

    // Ensure tasks is always an array
    const safeTasks = Array.isArray(renderTasks) ? renderTasks : [];

    // Grouping tasks by status
    const taskStatuses = useMemo(() => {
        return safeTasks.reduce((acc, task) => {
            if (!acc[task.Task_Status]) {
                acc[task.Task_Status] = [];
            }
            acc[task.Task_Status].push(task);
            return acc;
        }, {} as Record<Task["Task_Status"], Task[]>);
    }, [safeTasks]);

    // KPI Calculations
    const totalTasks = safeTasks.length;
    const completedTasks = taskStatuses["Done"]?.length || 0;
    const inProgressTasks = taskStatuses["In Progress"]?.length || 0;
    const todoTasks = taskStatuses["To Do"]?.length || 0;
    const reviewTasks = taskStatuses["Waiting for Review"]?.length || 0;

    // Task completion percentage
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Overdue Tasks Calculation
    const overdueTasks = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        return safeTasks.filter(task =>
            task.Task_Due_Date &&
            typeof task.Task_Due_Date === "string" &&
            task.Task_Due_Date < today &&
            task.Task_Status !== "Done"
        ).length;
    }, [safeTasks]);

    // Chart data for task status overview
    const chartData = useMemo(() => {
        const statusLabels: Task["Task_Status"][] = [
            t("dashboard.statusLabels.toDo"),
            t("dashboard.statusLabels.inProgress"),
            t("dashboard.statusLabels.waitingForReview"),
            t("dashboard.statusLabels.done"),
        ] as any;
        const statusCounts = statusLabels.map(status => taskStatuses[status]?.length || 0);

        return {
            labels: statusLabels,
            datasets: [
                {
                    data: statusCounts,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                }
            ]
        };
    }, [taskStatuses]);

    // Bar chart data for task completion over time (e.g., weeks)
    const barChartData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: t('dashboard.completedTasks'),
                data: [12, 19, 3, 5],
                backgroundColor: '#36A2EB',
                borderColor: '#36A2EB',
                borderWidth: 1
            },
            {
                label: t('dashboard.pendingTasks'),
                data: [7, 11, 5, 8],
                backgroundColor: '#FFCE56',
                borderColor: '#FFCE56',
                borderWidth: 1
            }
        ]
    };

    return (
        <Block className="page-content">
            <FlexibleBox
                title={`${t('dashboard.title')}`}
                subtitle={renderBacklog ? renderBacklog.Backlog_Name : undefined}
                titleAction={
                    renderBacklog && (
                        <Link
                            href={`/project/${renderBacklog?.Project_ID}`}
                            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faLightbulb} />
                            <Text variant="span">Go to Project</Text>
                        </Link>
                    )
                }
                icon={faGauge}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                {renderBacklog === false ? (
                    <Block className="text-center">
                        <Text className="text-gray-400">
                            Backlog not found
                        </Text>
                    </Block>
                ) : renderBacklog === undefined ? (
                    <Block className="flex justify-center">
                        <Image
                            src="/spinner-loader.gif"
                            alt="Loading..."
                            width={45}
                            height={45}
                        />
                    </Block>
                ) : (
                    <>
                        {/* KPI Metrics */}
                        <div className={styles.kpiSection}>
                            <Block className={styles.kpiCard}>
                                <Heading variant="h3">{t('dashboard.totalTasks')}</Heading>
                                <Text>{totalTasks}</Text>
                            </Block>
                            <Block className={styles.kpiCard}>
                                <Heading variant="h3">{t('dashboard.completedTasks')}</Heading>
                                <Text>{completedTasks} ({completionRate}%)</Text>
                            </Block>
                            <Block className={styles.kpiCard}>
                                <Heading variant="h3">{t('dashboard.overdueTasks')}</Heading>
                                <Text>{overdueTasks}</Text>
                            </Block>
                            <Block className={styles.kpiCard}>
                                <Heading variant="h3">{t('dashboard.tasksInProgress')}</Heading>
                                <Text>{inProgressTasks}</Text>
                            </Block>
                        </div>

                        {/* Progress Bar for Completed vs. In Progress */}
                        <div className={styles.progressSection}>
                            <Heading variant="h3">{t('dashboard.progress')}</Heading>
                            <ProgressBar completed={completionRate} />
                        </div>

                        <div className={styles.chartSection}>
                            {/* Task Distribution (Pie Chart) */}
                            <Block className={styles.chartBlock}>
                                <Heading variant="h2">{t('dashboard.analytics')}</Heading>
                                <Pie data={chartData} />
                            </Block>

                            {/* Task Completion Over Time (Bar Chart) */}
                            <Block className={styles.chartBlock}>
                                <Heading variant="h2">{t('dashboard.taskCompletionOverTime')}</Heading>
                                <Bar data={barChartData} options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        tooltip: {
                                            mode: 'index',
                                            intersect: false,
                                        },
                                    },
                                    scales: {
                                        x: {
                                            stacked: true,
                                        },
                                        y: {
                                            stacked: true,
                                        }
                                    }
                                }} />
                            </Block>
                        </div>
                    </>
                )}
            </FlexibleBox>
        </Block>
    );
};

interface ProgressBarProps {
    completed: number; // Completion percentage (0 - 100)
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed }) => {
    return (
        <div className={styles.progressBar}>
            <div
                className={styles.progressFill}
                style={{ width: `${completed}%` }}
            >
                <span className={styles.progressText}>{completed}%</span>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    return (
        <DashboardContainer />
    )
}