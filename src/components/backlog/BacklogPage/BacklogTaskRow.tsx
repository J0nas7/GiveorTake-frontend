import { BacklogProps } from '@/components/backlog';
import { CreatedAtToTimeSince } from '@/components/partials/task/TaskTimeTrackPlayer';
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { Task } from '@/types';

type BacklogTaskRowProps = Pick<
    BacklogProps,
    'selectedTaskIds' |
    'selectedStatusIds' |
    'handleCheckboxChange' |
    'renderBacklog' |
    'setTaskDetail'
> & { task: Task };

export const BacklogTaskRow: React.FC<BacklogTaskRowProps> = (props) => {
    if (props.selectedStatusIds.length && !props.selectedStatusIds.includes(props.task.Status_ID.toString())) {
        return null;
    }

    if (!props.renderBacklog) return null

    const status = props.renderBacklog.statuses?.find(s => s.Status_ID === props.task.Status_ID);
    const assignee = props.renderBacklog.project?.team?.user_seats?.find(s => s.User_ID === props.task.Assigned_User_ID)?.user;

    return (
        <tr key={props.task.Task_ID}>
            <td>
                <input
                    type="checkbox"
                    value={props.task.Task_ID}
                    checked={props.task.Task_ID ? props.selectedTaskIds.includes(
                        props.task.Task_ID.toString()
                    ) : false}
                    onChange={props.handleCheckboxChange}
                />
            </td>
            <td onClick={() => props.setTaskDetail(props.task)} className="cursor-pointer hover:underline">
                {props.renderBacklog?.project?.Project_Key}-{props.task.Task_Key}
            </td>
            <td onClick={() => props.setTaskDetail(props.task)} className="cursor-pointer hover:underline">
                {props.task.Task_Title}
            </td>
            <td className={styles.status}>{status?.Status_Name}</td>
            <td>{assignee ? `${assignee.User_FirstName} ${assignee.User_Surname}` : "Unassigned"}</td>
            <td>{props.task.Task_CreatedAt && <CreatedAtToTimeSince dateCreatedAt={props.task.Task_CreatedAt} />}</td>
        </tr>
    );
};
