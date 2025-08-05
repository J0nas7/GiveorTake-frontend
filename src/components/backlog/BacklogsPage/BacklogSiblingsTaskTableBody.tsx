import { BacklogSiblingsProps } from '@/components/backlog';
import { CreatedAtToTimeSince } from '@/core-ui/components/TaskTimeTrackPlayer';
import React from 'react';

void React.createElement

type BacklogSiblingsTaskTableBodyProps = Pick<
    BacklogSiblingsProps,
    'sortedTasks' |
    'selectedTaskIds' |
    'handleCheckboxChange' |
    'setTaskDetail' |
    'localBacklog'
>

export const BacklogSiblingsTaskTableBody: React.FC<BacklogSiblingsTaskTableBodyProps> = (props) => (
    <>
        {props.sortedTasks.map(task => {
            if (!props.localBacklog) return

            const status = props.localBacklog.statuses?.find(s => s.Status_ID === task.Status_ID);
            const assignee = props.localBacklog.project?.team?.user_seats?.find(u => u.User_ID === task.Assigned_User_ID)?.user;
            return (
                <tr key={task.Task_ID}>
                    <td>
                        <input
                            type="checkbox"
                            value={task.Task_ID}
                            checked={props.selectedTaskIds.includes(task.Task_ID?.toString() || '')}
                            onChange={props.handleCheckboxChange}
                        />
                    </td>
                    <td onClick={() => props.setTaskDetail(task)} className="cursor-pointer hover:underline">
                        {props.localBacklog.project?.Project_Key}-{task.Task_Key}
                    </td>
                    <td onClick={() => props.setTaskDetail(task)} className="cursor-pointer hover:underline">
                        {task.Task_Title}
                    </td>
                    <td>{status?.Status_Name}</td>
                    <td>{assignee ? `${assignee.User_FirstName} ${assignee.User_Surname}` : "Unassigned"}</td>
                    <td>{task.Task_CreatedAt && <CreatedAtToTimeSince dateCreatedAt={task.Task_CreatedAt} />}</td>
                </tr>
            );
        })}
    </>
);
