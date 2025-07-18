import { Field } from '@/components';
import { BacklogProps } from '@/components/backlog';
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type BacklogNewTaskRowProps = Pick<
    BacklogProps,
    'newTask' |
    'handleChangeNewTask' |
    'handleCreateTask' |
    'ifEnter' |
    'renderBacklog'
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
                disabled={false}
                className="w-full"
            />
        </td>
        <td>
            <select
                value={props.newTask?.Status_ID}
                onChange={(e) => props.handleChangeNewTask("Status_ID", e.target.value)}
                className="p-2 border rounded"
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
                value={props.newTask?.Assigned_User_ID}
                onChange={(e) => props.handleChangeNewTask("Assigned_User_ID", e.target.value)}
                className="p-2 border rounded"
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
            <button type="submit" onClick={props.handleCreateTask} className={styles.addButton}>
                <FontAwesomeIcon icon={faPlus} /> Create
            </button>
        </td>
    </tr>
);
