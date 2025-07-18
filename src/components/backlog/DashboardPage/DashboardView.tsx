"use client"

import { useTranslation } from "next-i18next"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

// External chart library
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'

// Internal components and hooks
import { Dashboard, DashboardProps } from '@/components/backlog'
import { useBacklogsContext, useTasksContext } from "@/contexts"
import { useURLLink } from "@/hooks"
import useRoleAccess from "@/hooks/useRoleAccess"
import { Task } from "@/types"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export const DashboardView = () => {
    // ---- Hooks ----
    const { t } = useTranslation(['dashboard'])
    const { tasksById, readTasksByBacklogId } = useTasksContext()
    const { backlogById: renderBacklog, readBacklogById } = useBacklogsContext()
    const { backlogLink } = useParams<{ backlogLink: string }>(); // Get backlogLink from URL
    const { linkId: backlogId, convertID_NameStringToURLFormat } = useURLLink(backlogLink)
    const { canAccessBacklog, canManageBacklog } = useRoleAccess(
        renderBacklog ? renderBacklog.project?.team?.organisation?.User_ID : undefined,
        "backlog",
        renderBacklog ? renderBacklog.Backlog_ID : 0
    )

    // ---- State ----
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined)

    // ---- Effects ----
    // Sync renderTasks state with tasksById changes
    useEffect(() => {
        console.log("tasksByID changed")
        if (tasksById && tasksById.length == 0 && renderTasks) {
            setRenderTasks(undefined)
        }
        if (tasksById && tasksById.length) {
            console.log("renderTasks", renderTasks)
            setRenderTasks(tasksById)
        }
    }, [tasksById])
    useEffect(() => {
        readTasksByBacklogId(parseInt(backlogId))
        readBacklogById(parseInt(backlogId))
    }, [backlogId])
    useEffect(() => {
        if (backlogId && renderBacklog) document.title = `Dashboard: ${renderBacklog?.Backlog_Name} - GiveOrTake`
    }, [renderBacklog])

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
        const statuses: { [key: string]: string } | undefined = renderBacklog ?
            renderBacklog.statuses?.reduce((acc, status) => {
                acc[status.Status_ID ?? 0] = status.Status_Name
                return acc
            }, {} as { [key: string]: string }) : undefined

        const statusLabels = statuses ? Object.entries(statuses).map(([id, name]) => name) : []
        const statusCounts = statuses ? Object.entries(statuses).map(([id, name]) =>
            (renderBacklog && renderBacklog.tasks?.filter(task => task.Status_ID === parseInt(id)).length) || 0
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

    const dashboardProps: DashboardProps = {
        renderBacklog,
        canAccessBacklog,
        totalTasks,
        completedTasks,
        completionRate,
        overdueTasks,
        inProgressTasks,
        chartData,
        barChartData,
        t,
        convertID_NameStringToURLFormat
    }

    return <Dashboard {...dashboardProps} />
}
