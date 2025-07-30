import { Field } from '@/components';
import { BacklogSiblingsProps } from '@/components/backlog';
import { LoadingButton } from '@/core-ui/components/LoadingState';
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type BacklogSiblingsNewTaskRowProps = Pick<
    BacklogSiblingsProps,
    'localNewTask' |
    'localBacklog' |
    'handleChangeLocalNewTask' |
    'handleCreateTask' |
    'ifEnter' |
    'createTaskPending'
>

export const BacklogSiblingsNewTaskRow: React.FC<BacklogSiblingsNewTaskRowProps> = (props) => (
    <tr>
        <td colSpan={2}></td>
        <td>
            <Field
                type="text"
                lbl="New Task"
                innerLabel
                value={props.localNewTask?.Task_Title ?? ''}
                onChange={(e: string) => props.handleChangeLocalNewTask("Task_Title", e)}
                onKeyDown={
                    (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        props.ifEnter(event)
                }
                disabled={false}
                className="w-full"
            />
        </td>
        <td>
            <select
                value={props.localNewTask?.Status_ID}
                onChange={(e) => props.handleChangeLocalNewTask("Status_ID", e.target.value)}
                className="p-2 border rounded"
            >
                <option value="">-</option>
                {props.localBacklog && props.localBacklog.statuses?.sort((a, b) => (a.Status_Order ?? 0) - (b.Status_Order ?? 0)).map(status => (
                    <option key={status.Status_ID} value={status.Status_ID}>{status.Status_Name}</option>
                ))}
            </select>
        </td>
        <td>
            <select
                value={props.localNewTask?.Assigned_User_ID}
                onChange={(e) => props.handleChangeLocalNewTask("Assigned_User_ID", e.target.value)}
                className="p-2 border rounded"
            >
                <option value="">Assignee</option>
                {props.localBacklog && props.localBacklog.project?.team?.user_seats?.map(seat => (
                    <option key={seat.Seat_ID} value={seat.user?.User_ID}>
                        {seat.user?.User_FirstName} {seat.user?.User_Surname}
                    </option>
                ))}
            </select>
        </td>
        <td>
            <button
                type="submit"
                onClick={() => !props.createTaskPending && props.handleCreateTask}
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
