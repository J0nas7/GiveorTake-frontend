import { Block, Heading, Text } from "@/components"
import { DashboardProps } from "@/components/backlog"
import styles from "@/core-ui/styles/modules/Dashboard.module.scss"
import React from 'react'

void React.createElement

export type DashboardKPISectionProps = Pick<
    DashboardProps,
    'totalTasks' |
    'completedTasks' |
    'completionRate' |
    'overdueTasks' |
    'inProgressTasks' |
    't'
>

export const DashboardKPISection: React.FC<DashboardKPISectionProps> = (props) => (
    <div className={styles.kpiSection}>
        <Block className={styles.kpiCard}>
            <Heading variant="h3">{props.t('dashboard.totalTasks')}</Heading>
            <Text>{props.totalTasks}</Text>
        </Block>
        <Block className={styles.kpiCard}>
            <Heading variant="h3">{props.t('dashboard.completedTasks')}</Heading>
            <Text>{props.completedTasks} ({props.completionRate}%)</Text>
        </Block>
        <Block className={styles.kpiCard}>
            <Heading variant="h3">{props.t('dashboard.overdueTasks')}</Heading>
            <Text>{props.overdueTasks}</Text>
        </Block>
        <Block className={styles.kpiCard}>
            <Heading variant="h3">{props.t('dashboard.tasksInProgress')}</Heading>
            <Text>{props.inProgressTasks}</Text>
        </Block>
    </div>
)
