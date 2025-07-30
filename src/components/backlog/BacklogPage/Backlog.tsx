import { Block, FlexibleBox } from '@/components';
import { BacklogHeader, BacklogNewTaskRow, BacklogStatusActionMenu, BacklogTaskRow, BacklogTaskTableHeader, TaskBulkActionMenu } from '@/components/backlog';
import { LoadingState } from '@/core-ui/components/LoadingState';
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { BacklogStates, Task, TaskFields } from '@/types';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { TFunction } from 'next-i18next';

export type BacklogProps = {
    renderBacklog?: BacklogStates;
    sortedTasks: Task[];
    newTask: Task | undefined;
    currentSort: string;
    currentOrder: string;
    t: TFunction
    selectedTaskIds: string[]
    selectedStatusIds: string[]
    selectAll: boolean
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    createTaskPending: boolean
    handleSort: (column: string) => void;
    handleCreateTask: () => void;
    ifEnter: (e: React.KeyboardEvent) => Promise<void> | null
    handleChangeNewTask: (field: TaskFields, value: string) => Promise<void>
    setTaskDetail: (task: Task) => void;
    handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    statusUrlEditing: boolean
    setStatusUrlEditing: React.Dispatch<React.SetStateAction<boolean>>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const Backlog: React.FC<BacklogProps> = (props) => props.renderBacklog && (
    <>
        <BacklogStatusActionMenu {...props} />

        <TaskBulkActionMenu project={props.renderBacklog.project} />

        <Block className="page-content">
            <FlexibleBox
                title="Backlog"
                subtitle={props.renderBacklog?.Backlog_Name}
                titleAction={
                    <BacklogHeader
                        renderBacklog={props.renderBacklog}
                        setStatusUrlEditing={props.setStatusUrlEditing}
                        statusUrlEditing={props.statusUrlEditing}
                        convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
                    />
                }
                icon={faList}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <LoadingState singular="Backlog" renderItem={props.renderBacklog} permitted={props.canAccessBacklog}>
                    {props.renderBacklog && (
                        <Block className="overflow-x-auto">
                            <table className={styles.taskTable}>
                                <BacklogTaskTableHeader {...props} />
                                <tbody>
                                    <BacklogNewTaskRow
                                        newTask={props.newTask}
                                        handleChangeNewTask={props.handleChangeNewTask}
                                        handleCreateTask={props.handleCreateTask}
                                        ifEnter={props.ifEnter}
                                        renderBacklog={props.renderBacklog}
                                        createTaskPending={props.createTaskPending}
                                    />

                                    {props.sortedTasks.map(task => (
                                        <BacklogTaskRow
                                            key={task.Task_ID}
                                            task={task}
                                            {...props}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </Block>
                    )}
                </LoadingState>
            </FlexibleBox>
        </Block>
    </>
);
