"use client"

// External
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

// Internal
import { Card } from '@/components/task/taskdetails/TaskCard';
import { Block } from '@/components/ui/block-text';
import { Heading } from '@/components/ui/heading';
import { useProjectsContext, useTasksContext, useTaskTimeTrackContext } from '@/contexts';
import { CreatedAtToTimeSince, SecondsToTimeDisplay, TimeSpentDisplay } from '@/core-ui/components/TaskTimeTrackPlayer';
import styles from "@/core-ui/styles/modules/TaskDetail.module.scss";
import { selectAuthUser, selectAuthUserTaskTimeTrack, useTypedSelector } from '@/redux';
import { ProjectStates, Task, TaskTimeTracksStates } from '@/types';

export const TaskDetailsArea: React.FC<{ task: Task }> = ({ task }) => {
    const { readTasksByBacklogId, readTaskByKeys, taskDetail, setTaskDetail, saveTaskChanges } = useTasksContext()
    const { taskTimeTracksById, readTaskTimeTracksByTaskId, addTaskTimeTrack, saveTaskTimeTrackChanges, handleTaskTimeTrack } = useTaskTimeTrackContext()

    const [taskTimeSpent, setTaskTimeSpent] = useState<number>(0) // Total amount of seconds spend

    useEffect(() => {
        if (task.Task_ID) {
            readTaskTimeTracksByTaskId(task.Task_ID)
        }
    }, [task])

    useEffect(() => {
        if (Array.isArray(taskTimeTracksById)) {
            const totalTimeInSeconds = taskTimeTracksById.reduce((total, timeTrack) => {
                // If 'Time_Tracking_Duration' exists, add it to the total time in seconds
                if (timeTrack.Time_Tracking_Duration) {
                    return total + timeTrack.Time_Tracking_Duration;
                }
                return total;
            }, 0);

            // Update the taskTimeSpent state with the calculated total time in seconds
            setTaskTimeSpent(totalTimeInSeconds);
        }
    }, [taskTimeTracksById])

    // Handle status change
    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = event.target.value as unknown as Task["Status_ID"]
        handleTaskChanges("Status_ID", newStatus.toString())
    };

    const handleAssigneeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newAssigneeID = event.target.value as unknown as Task["Assigned_User_ID"]
        if (newAssigneeID) handleTaskChanges("Assigned_User_ID", newAssigneeID.toString())
    }

    const handleBacklogChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newBacklogID = event.target.value as unknown as Task["Backlog_ID"]
        if (newBacklogID) handleTaskChanges("Backlog_ID", newBacklogID.toString())
    }

    const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDueDate = event.target.value;
        handleTaskChanges("Task_Due_Date", newDueDate);
    }

    const handleHoursSpentLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newHoursSpentLimit = Math.round(Number(event.target.value) * 3600);
        handleTaskChanges("Task_Hours_Spent", newHoursSpentLimit.toString());
    }

    const handleTaskChanges = async (field: keyof Task, value: string) => {
        // Update the task change (this will update it in the database)
        await saveTaskChanges(
            { ...task, [field]: value },
            task.Backlog_ID
        )

        //// Task changed
        if (task) {
            if (task.Backlog_ID) readTasksByBacklogId(task.Backlog_ID, true)
            if (task.Task_Key && task.backlog?.project?.Project_Key) await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
        }

        if (taskDetail) {
            setTaskDetail({
                ...taskDetail,
                [field]: value
            })
        }
    }

    return (
        <TaskDetailsView
            task={task}
            taskDetail={taskDetail}
            taskTimeSpent={taskTimeSpent}
            taskTimeTracksById={taskTimeTracksById}
            setTaskDetail={setTaskDetail}
            saveTaskChanges={saveTaskChanges}
            handleStatusChange={handleStatusChange}
            handleAssigneeChange={handleAssigneeChange}
            handleBacklogChange={handleBacklogChange}
            handleDueDateChange={handleDueDateChange}
            handleHoursSpentLimitChange={handleHoursSpentLimitChange}
            handleTaskChanges={handleTaskChanges}
            handleTaskTimeTrack={handleTaskTimeTrack}
        />
    );
};

type TaskDetailsViewProps = {
    task: Task
    taskDetail: Task | undefined
    taskTimeSpent: number
    taskTimeTracksById: TaskTimeTracksStates
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    saveTaskChanges: (taskChanges: Task, parentId: number) => void
    handleStatusChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    handleAssigneeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    handleBacklogChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    handleDueDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleHoursSpentLimitChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleTaskChanges: (field: keyof Task, value: string) => void
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
}

export const TaskDetailsView: React.FC<TaskDetailsViewProps> = ({
    task,
    taskDetail,
    taskTimeSpent,
    taskTimeTracksById,
    setTaskDetail,
    saveTaskChanges,
    handleStatusChange,
    handleAssigneeChange,
    handleBacklogChange,
    handleDueDateChange,
    handleHoursSpentLimitChange,
    handleTaskChanges,
    handleTaskTimeTrack,
}) => {
    const { projectById, readProjectById } = useProjectsContext();

    useEffect(() => {
        if (task.backlog?.Project_ID) {
            readProjectById(task.backlog?.Project_ID);
        }
    }, [task]);

    return (
        <Card className={styles.detailsSection}>
            <Heading variant="h2" className="font-bold">Task Details</Heading>

            <TaskProgress task={task} />
            <TimeSpent taskTimeSpent={taskTimeSpent} task={task} />
            <TaskStatusDropdown task={task} handleStatusChange={handleStatusChange} projectById={projectById} />
            <TaskAssigneeDropdown task={task} handleAssigneeChange={handleAssigneeChange} />
            <TaskTeamDisplay task={task} />
            <TaskProjectDisplay task={task} />
            <TaskBacklogDropdown task={task} handleBacklogChange={handleBacklogChange} projectById={projectById} />
            <TaskCreatedAtDisplay task={task} />
            <TaskDueDateInput task={task} handleDueDateChange={handleDueDateChange} />
            <TaskTimeTrackingDisplay task={task} handleTaskTimeTrack={handleTaskTimeTrack} />
            <TaskTimeLimitInput task={task} handleHoursSpentLimitChange={handleHoursSpentLimitChange} />
        </Card>
    );
};

export const TaskProgress: React.FC<{ task: Task; }> = ({ task }) => {
    if (!task.Task_Due_Date || !task.Task_CreatedAt) return null;

    const due = new Date(task.Task_Due_Date);
    const created = new Date(task.Task_CreatedAt);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffCreatedMs = due.getTime() - created.getTime();
    const diffCreatedDays = Math.ceil(diffCreatedMs / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    const progress = task.status?.Status_Is_Closed ? 100 : Math.floor((daysElapsed / diffCreatedDays) * 100);

    const diffNowMs = due.getTime() - now.getTime();
    const diffNowDays = Math.ceil(diffNowMs / (1000 * 60 * 60 * 24));

    const getProgressText = () => {
        if (task.status?.Status_Is_Closed) return "Task is closed!";
        if (due < now) return "Task is overdue!";
        return `${diffNowDays} out of ${diffCreatedDays} day${diffNowDays !== 1 ? "s" : ""} left`;
    };

    return (
        <Block className="mb-4 text-xs font-semibold">
            <p>Progress:</p>
            <Block className="relative w-full bg-yellow-400 rounded-lg">
                <Block
                    className="absolute bg-yellow-500 rounded-lg h-6"
                    style={{
                        width: `${progress}%`,
                        maxWidth: "100%",
                    }}
                />
                <Block className="relative z-10 text-black text-center py-1 px-2">
                    {getProgressText()}
                </Block>
            </Block>
        </Block>
    );
};

interface TimeSpentProps {
    taskTimeSpent: number;
    task: Task;
}

export const TimeSpent: React.FC<TimeSpentProps> = ({
    taskTimeSpent,
    task
}) => taskTimeSpent > 0 && (
    <Block className="mb-4 text-xs font-semibold">
        <p>Time Spent:</p>
        <Block className="relative w-full bg-blue-400 rounded-lg">
            <Block
                className="absolute bg-blue-500 rounded-lg h-6"
                style={{
                    width: `${(taskTimeSpent / (task.Task_Hours_Spent || 1)) * 100}%`,
                    maxWidth: "100%",
                }}
            />
            <Block className="relative z-10 text-black text-center py-1 px-2">
                <SecondsToTimeDisplay totalSeconds={taskTimeSpent} /> /{" "}
                <SecondsToTimeDisplay totalSeconds={task.Task_Hours_Spent || 0} />
            </Block>
        </Block>
    </Block>
);

interface TaskStatusDropdownProps {
    task: Task;
    handleStatusChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    projectById: ProjectStates;
}

export const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({
    task,
    handleStatusChange,
    projectById
}) => projectById && (
    <p>
        <strong>Status:</strong>{" "}
        <select value={task.Status_ID} onChange={handleStatusChange} className="p-2 border rounded">
            <option value="">-</option>
            {projectById.backlogs?.find(backlog => backlog.Backlog_ID === task.Backlog_ID)?.statuses?.map(status => (
                <option key={status.Status_ID} value={status.Status_ID}>{status.Status_Name}</option>
            ))}
        </select>
    </p>
);

interface TaskAssigneeDropdownProps {
    task: Task;
    handleAssigneeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const TaskAssigneeDropdown: React.FC<TaskAssigneeDropdownProps> = ({
    task,
    handleAssigneeChange
}) => (
    <p>
        <strong>Assigned To:</strong>{" "}
        <select value={task.Assigned_User_ID || ""} onChange={handleAssigneeChange} className="p-2 border rounded">
            <option value="">Unassigned</option>
            {task.backlog?.project?.team?.user_seats?.map(userSeat => (
                <option key={userSeat.user?.User_ID} value={userSeat.user?.User_ID}>
                    {userSeat.user?.User_FirstName} {userSeat.user?.User_Surname}
                </option>
            ))}
        </select>
    </p>
);

export const TaskTeamDisplay: React.FC<{ task: Task; }> = ({ task }) => (
    <p><strong>Team:</strong> {task.backlog?.project?.team?.Team_Name}</p>
);

export const TaskProjectDisplay: React.FC<{ task: Task; }> = ({ task }) => (
    <p><strong>Project:</strong> {task.backlog?.project?.Project_Name}</p>
);

interface TaskBacklogDropdownProps {
    task: Task;
    handleBacklogChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    projectById: ProjectStates;
}

export const TaskBacklogDropdown: React.FC<TaskBacklogDropdownProps> = ({
    task,
    handleBacklogChange,
    projectById
}) => projectById && (
    <p>
        <strong>Backlog:</strong>{" "}
        <select value={task.Backlog_ID || ""} onChange={handleBacklogChange} className="p-2 border rounded">
            <option value="">-</option>
            {projectById.backlogs?.map(backlog => (
                <option key={backlog.Backlog_ID} value={backlog.Backlog_ID}>
                    {backlog.Backlog_Name}
                </option>
            ))}
        </select>
    </p>
);

export const TaskCreatedAtDisplay: React.FC<{ task: Task; }> = ({ task }) => (
    <p>
        <strong>Created At:</strong>{" "}
        {task.Task_CreatedAt && <CreatedAtToTimeSince dateCreatedAt={task.Task_CreatedAt} />}
    </p>
);

interface TaskDueDateInputProps {
    task: Task;
    handleDueDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TaskDueDateInput: React.FC<TaskDueDateInputProps> = ({
    task,
    handleDueDateChange
}) => (
    <p>
        <strong>Due Date:</strong>{" "}
        <input
            type="date"
            onChange={handleDueDateChange}
            className="p-2 border rounded"
            value={task.Task_Due_Date || ""}
        />
    </p>
);

interface TaskTimeTrackingDisplayProps {
    task: Task;
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>;
}

export const TaskTimeTrackingDisplay: React.FC<TaskTimeTrackingDisplayProps> = ({ task, handleTaskTimeTrack }) => (
    <p className="timetrack-metric">
        <strong>Time Tracking:</strong>
        <TimeSpentDisplayView task={task} handleTaskTimeTrack={handleTaskTimeTrack} />
    </p>
);

interface TaskTimeLimitInputProps {
    task: Task;
    handleHoursSpentLimitChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TaskTimeLimitInput: React.FC<TaskTimeLimitInputProps> = ({ task, handleHoursSpentLimitChange }) => (
    <p>
        <strong>Time Limit:</strong> <small>(hours)</small>{" "}
        <input
            type="number"
            className="p-2 border rounded"
            value={(task.Task_Hours_Spent || 0) / 3600}
            onChange={handleHoursSpentLimitChange}
        />
    </p>
);

interface TimeSpentDisplayViewProps {
    task: Task
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
}

const TimeSpentDisplayView: React.FC<TimeSpentDisplayViewProps> = ({
    task,
    handleTaskTimeTrack
}) => {
    const authUser = useTypedSelector(selectAuthUser)
    const taskTimeTrack = useTypedSelector(selectAuthUserTaskTimeTrack)

    return (
        <>
            {(taskTimeTrack && taskTimeTrack.Task_ID === task.Task_ID) ? (
                <Block variant="span" className="flex gap-2 items-center">
                    <button className={clsx("timetrack-button", "timetrack-stopbutton")} onClick={() => handleTaskTimeTrack("Stop", task)}>
                        <FontAwesomeIcon icon={faStop} />
                    </button>
                    <Block variant="span">
                        {/* Calculate and display time spent since start */}
                        {taskTimeTrack.Time_Tracking_Start_Time ? (
                            <TimeSpentDisplay startTime={taskTimeTrack.Time_Tracking_Start_Time} />
                        ) : null}
                    </Block>
                </Block>
            ) : (
                <button className={clsx("timetrack-button", "timetrack-playbutton")} onClick={() => handleTaskTimeTrack("Play", task)}>
                    <FontAwesomeIcon icon={faPlay} />
                </button>
            )}
        </>
    )
}
