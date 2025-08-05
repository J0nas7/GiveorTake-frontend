import { Field } from '@/components';
import { BacklogProps } from '@/components/backlog';
import { LoadingButton } from '@/core-ui/components/LoadingState';
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

void React.createElement

export type BacklogNewTaskRowProps = Pick<
    BacklogProps,
    'newTask' |
    'handleChangeNewTask' |
    'handleCreateTask' |
    'ifEnter' |
    'renderBacklog' |
    'createTaskPending'
>

export const BacklogNewTaskRow: React.FC<BacklogNewTaskRowProps> = (props) => (
    <tr>
        <td colSpan={2}></td>
        <td>
            <Field
                type="text"
                lbl="New Task"
                innerLabel={true}
                value={props.newTask?.Task_Title ?? ''}
                onChange={(e: string) => props.handleChangeNewTask("Task_Title", e)}
                onKeyDown={
                    (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        props.ifEnter(event)}
                disabled={props.createTaskPending}
                className="w-full"
            />
        </td>
        <td>
            <select
                aria-label="Status"
                value={props.newTask?.Status_ID}
                onChange={(e) => props.handleChangeNewTask("Status_ID", e.target.value)}
                className="p-2 border rounded"
                disabled={props.createTaskPending}
            >
                {props.renderBacklog && props.renderBacklog.statuses
                    ?.sort((a, b) => (a.Status_Order ?? 0) - (b.Status_Order ?? 0))
                    .map(status => (
                        <option key={status.Status_ID} value={status.Status_ID}>{status.Status_Name}</option>
                    ))}
            </select>
        </td>
        <td>
            <select
                aria-label="Assignee"
                value={props.newTask?.Assigned_User_ID}
                onChange={(e) => props.handleChangeNewTask("Assigned_User_ID", e.target.value)}
                className="p-2 border rounded"
                disabled={props.createTaskPending}
            >
                <option value="">Assignee</option>
                {props.renderBacklog && props.renderBacklog.project?.team?.user_seats?.map(userSeat => (
                    <option key={userSeat.user?.User_ID} value={userSeat.user?.User_ID}>
                        {userSeat.user?.User_FirstName} {userSeat.user?.User_Surname}
                    </option>
                ))}
            </select>
        </td>
        <td>
            <button
                type="submit"
                data-testid="create-task-button"
                onClick={() => {
                    if (!props.createTaskPending) props.handleCreateTask()
                }}
                className={styles.addButton}
            >
                {props.createTaskPending ? (
                    <LoadingButton />
                ) : (
                    <><FontAwesomeIcon icon={faPlus} /> Create</>
                )}
            </button>
        </td>
    </tr>
);
