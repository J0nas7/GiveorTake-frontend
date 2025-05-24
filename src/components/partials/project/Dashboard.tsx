"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { TFunction, useTranslation } from "next-i18next"

// External chart library
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

// Internal components and hooks
import styles from "@/core-ui/styles/modules/Dashboard.module.scss"
import { Block, Text, Heading } from "@/components"
import { useBacklogsContext, useProjectsContext, useTasksContext } from "@/contexts"
import { Backlog, BacklogStates, Project, Status, Task } from "@/types"
import Link from "next/link"
import { FlexibleBox } from "@/components/ui/flexible-box"
import { faGauge, faLightbulb } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { LoadingState } from "@/core-ui/components/LoadingState"
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from "@/redux"
import { useURLLink } from "@/hooks"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const DashboardContainer = () => {
    // ---- Hooks ----
    const { t } = useTranslation(['dashboard'])
    const { tasksById, readTasksByBacklogId } = useTasksContext()
    const { backlogById, readBacklogById } = useBacklogsContext()
    const { backlogLink } = useParams<{ backlogLink: string }>(); // Get backlogLink from URL
    const { linkId: backlogId, convertID_NameStringToURLFormat } = useURLLink(backlogLink)

    // ---- State ----
    const [renderBacklog, setRenderBacklog] = useState<BacklogStates>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)

    const authUser = useTypedSelector(selectAuthUser)
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions)
    // Determine if the authenticated user can access the backlog:
    const canAccessBacklog = (authUser && renderBacklog && (
        renderBacklog.project?.team?.organisation?.User_ID === authUser.User_ID ||
        parsedPermissions?.includes(`accessBacklog.${renderBacklog.Backlog_ID}`)
    ))
    // Determine if the authenticated user can manage the backlog:
    const canManageBacklog = (authUser && renderBacklog && (
        renderBacklog.project?.team?.organisation?.User_ID === authUser.User_ID ||
        parsedPermissions?.includes(`manageBacklog.${renderBacklog.Backlog_ID}`)
    ))

    // ---- Effects ----
    // Sync renderTasks state with tasksById changes
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

    // ---- Special: Dashboard Calculations ----
    // Ensure tasks is always an array
    const safeTasks = Array.isArray(renderTasks) ? renderTasks : []

    // Categorize tasks based on their related status properties
    const taskStatuses = {
        todo: safeTasks.filter(task => task.status?.Status_Is_Default),
        inProgress: safeTasks.filter(
            task =>
                !task.status?.Status_Is_Default &&
                !task.status?.Status_Is_Closed
        ),
        done: safeTasks.filter(task => task.status?.Status_Is_Closed),
    }

    // KPI Calculations
    const totalTasks = safeTasks.length
    const todoTasks = taskStatuses.todo.length
    const inProgressTasks = taskStatuses.inProgress.length
    const completedTasks = taskStatuses.done.length

    // Task completion percentage
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Overdue Tasks Calculation
    const overdueTasks = useMemo(() => {
        const today = new Date().toISOString().split("T")[0]
        return safeTasks.filter(task =>
            task.Task_Due_Date &&
            typeof task.Task_Due_Date === "string" &&
            task.Task_Due_Date < today &&
            task.status?.Status_Is_Closed !== true
        ).length
    }, [safeTasks])

    // Chart data for task status overview
    const chartData = useMemo(() => {
        const statuses: { [key: string]: string } | undefined = backlogById ?
            backlogById.statuses?.reduce((acc, status) => {
                acc[status.Status_ID ?? 0] = status.Status_Name
                return acc
            }, {} as { [key: string]: string }) : undefined

        const statusLabels = statuses ? Object.entries(statuses).map(([id, name]) => name) : []
        const statusCounts = statuses ? Object.entries(statuses).map(([id, name]) =>
            (backlogById && backlogById.tasks?.filter(task => task.Status_ID === parseInt(id)).length) || 0
        ) : []

        return {
            labels: statusLabels,
            datasets: [
                {
                    data: statusCounts,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                }
            ]
        }
    }, [taskStatuses])

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
    }

    // ---- Render ----
    return (
        <DashboardContainerView
            renderBacklog={renderBacklog}
            canAccessBacklog={canAccessBacklog}
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            completionRate={completionRate}
            overdueTasks={overdueTasks}
            inProgressTasks={inProgressTasks}
            chartData={chartData}
            barChartData={barChartData}
            t={t}
        />
    )
}

type DashboardContainerViewProps = {
    renderBacklog: BacklogStates
    canAccessBacklog: boolean | undefined
    totalTasks: number
    completedTasks: number
    completionRate: number
    overdueTasks: number
    inProgressTasks: number
    chartData: {
        labels: string[]
        datasets: {
            data: number[]
            backgroundColor: string[]
        }[]
    }
    barChartData: {
        labels: string[]
        datasets: {
            label: string
            data: number[]
            backgroundColor: string
            borderColor: string
            borderWidth: number
        }[]
    }
    t: TFunction
}

const DashboardContainerView: React.FC<DashboardContainerViewProps> = ({
    renderBacklog, canAccessBacklog, totalTasks, completedTasks, completionRate,
    overdueTasks, inProgressTasks, chartData, barChartData, t
}) => (
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
            <LoadingState singular="Backlog" renderItem={renderBacklog} permitted={canAccessBacklog}>
                {renderBacklog && (
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
            </LoadingState>
        </FlexibleBox>
    </Block>
)

interface ProgressBarProps {
    completed: number // Completion percentage (0 - 100)
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
    )
}

export const Dashboard = () => (
    <DashboardContainer />
)