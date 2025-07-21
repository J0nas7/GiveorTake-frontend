"use client"

import { Block, FlexibleBox } from '@/components';
import { BacklogEditEditor, BacklogHeaderLinks, StatusListEditor, TaskSummaryCard } from '@/components/backlog';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { Backlog, BacklogStates, Status, User } from '@/types';
import { faList } from '@fortawesome/free-solid-svg-icons';

export type BacklogEditProps = {
    localBacklog: BacklogStates;
    newStatus: Status
    authUser?: User
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    setNewStatus: React.Dispatch<React.SetStateAction<Status>>
    handleBacklogInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBacklogChange: (field: keyof Backlog, value: string) => void;
    handleSaveBacklogChanges: () => Promise<void>;
    handleSaveStatusChanges: (status: Status) => Promise<void>
    ifEnterSaveStatus: (e: React.KeyboardEvent, status: Status) => Promise<void> | null
    handleCreateStatus: () => Promise<void>
    ifEnterCreateStatus: (e: React.KeyboardEvent) => Promise<void> | null
    handleDeleteBacklog: () => Promise<void>;
    handleMoveStatusChanges: (statusId: number, direction: "up" | "down") => Promise<void>
    handleAssignDefaultStatus: (statusId: number) => Promise<void>
    handleAssignClosedStatus: (statusId: number) => Promise<void>
    removeStatus: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const BacklogEdit: React.FC<BacklogEditProps> = (props) => {
    const calculateTaskStats = (backlog: Backlog) => {
        if (!backlog.tasks || backlog.tasks.length === 0) return null;

        const total = backlog.tasks.length; 1
        const assigneeCount = backlog.tasks.reduce((acc, task) => {
            const key = task.Assigned_User_ID || "Unassigned";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string | number, number>);

        return { total, assigneeCount };
    };

    const stats = props.localBacklog ? calculateTaskStats(props.localBacklog) : null;

    return (
        <Block className="page-content">
            <FlexibleBox
                title="Backlog"
                subtitle={props.localBacklog ? props.localBacklog.Backlog_Name : ''}
                titleAction={
                    props.canAccessBacklog && props.localBacklog && (
                        <BacklogHeaderLinks {...props} />
                    )
                }
                icon={faList}
                className="no-box w-auto inline-block"
            >
                <LoadingState singular="Backlog" renderItem={props.localBacklog} permitted={props.canAccessBacklog}>
                    {props.localBacklog && (
                        <BacklogEditEditor {...props} />
                    )}
                </LoadingState>
            </FlexibleBox>

            {/* Statuses Section */}
            {props.canManageBacklog && props.localBacklog && props.localBacklog?.statuses && (
                <StatusListEditor {...props} />
            )}

            {/* Task Summary Section */}
            {props.canAccessBacklog && props.localBacklog && props.localBacklog?.tasks && stats && (
                <TaskSummaryCard stats={stats} />
            )}
        </Block>
    );
};
