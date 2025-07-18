"use client"

import { Block } from "@/components"
import { FlexibleBox } from "@/components/ui/flexible-box"
import { LoadingState } from "@/core-ui/components/LoadingState"
import { BacklogStates } from "@/types"
import { faGauge } from "@fortawesome/free-solid-svg-icons"
import { TFunction } from "next-i18next"
import React from "react"

import {
    DashboardCharts,
    DashboardHeaderLink,
    DashboardKPISection,
    DashboardProgressSection
} from "@/components/backlog"

export type DashboardProps = {
    renderBacklog: BacklogStates
    canAccessBacklog: boolean | undefined
    totalTasks: number
    completedTasks: number
    completionRate: number
    overdueTasks: number
    inProgressTasks: number
    chartData: {
        labels: string[]
        datasets: { data: number[]; backgroundColor: string[] }[]
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
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const Dashboard: React.FC<DashboardProps> = (props) => props.renderBacklog && (
    <Block className="page-content">
        <FlexibleBox
            title={props.t("dashboard.title")}
            subtitle={props.renderBacklog.Backlog_Name}
            icon={faGauge}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
            titleAction={
                <DashboardHeaderLink
                    renderBacklog={props.renderBacklog}
                    convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
                />
            }
        >
            <LoadingState
                singular="Backlog"
                renderItem={props.renderBacklog}
                permitted={props.canAccessBacklog}
            >
                {props.renderBacklog && (
                    <>
                        <DashboardKPISection {...props} />
                        <DashboardProgressSection {...props} />
                        <DashboardCharts {...props} />
                    </>
                )}
            </LoadingState>
        </FlexibleBox>
    </Block>
)
