import { Heading } from "@/components"
import { DashboardProps, ProgressBar } from "@/components/backlog"
import styles from "@/core-ui/styles/modules/Dashboard.module.scss"
import React from 'react'

void React.createElement

type DashboardProgressSectionProps = Pick<
    DashboardProps,
    'completionRate' | 't'
>

export const DashboardProgressSection: React.FC<DashboardProgressSectionProps> = (props) => (
    <div className={styles.progressSection}>
        <Heading variant="h3">{props.t('dashboard.progress')}</Heading>
        <ProgressBar completed={props.completionRate} />
    </div>
)
