import { Block, Heading } from "@/components"
import { DashboardProps } from "@/components/backlog"
import styles from "@/core-ui/styles/modules/Dashboard.module.scss"
import React from 'react'
import { Bar, Pie } from "react-chartjs-2"

void React.createElement

export type DashboardChartsProps = Pick<
    DashboardProps,
    'chartData' |
    'barChartData' |
    't'
>

export const DashboardCharts: React.FC<DashboardChartsProps> = (props) => (
    <div className={styles.chartSection}>
        <Block className={styles.chartBlock}>
            <Heading variant="h2">{props.t('dashboard.analytics')}</Heading>
            <Pie data={props.chartData} />
        </Block>
        <Block className={styles.chartBlock}>
            <Heading variant="h2">{props.t('dashboard.taskCompletionOverTime')}</Heading>
            <Bar
                data={props.barChartData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index', intersect: false },
                    },
                    scales: {
                        x: { stacked: true },
                        y: { stacked: true },
                    },
                }}
            />
        </Block>
    </div>
)
