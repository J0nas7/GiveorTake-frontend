"use client";

// External
import { faArrowRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Internal
import { Block, Text } from "@/components";
import styles from "@/core-ui/styles/modules/TimeTracks.module.scss";
import { ProjectStates, Task, TeamUserSeatsStates } from "@/types";

type FilterTimeEntriesProps = {
    renderProject: ProjectStates
    filterTimeEntries: boolean
    setFilterTimeEntries: React.Dispatch<React.SetStateAction<boolean>>
    teamUserSeatsById: TeamUserSeatsStates
    selectedBacklogIds: string[]
    selectedUserIds: string[]
    selectedTaskIds: string[]
    startDate: string
    setStartDate: React.Dispatch<React.SetStateAction<string>>
    endDate: string
    setEndDate: React.Dispatch<React.SetStateAction<string>>
    startDateParam: string | null
    endDateParam: string | null
    allProjectTasks: Task[]
}

export const FilterTimeEntries: React.FC<FilterTimeEntriesProps> = (props) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateURLParams = (
        newStartDate: string | null,
        newEndDate: string | null,
        newBacklogIds: string[] | undefined,
        newUserIds: string[] | undefined,
        newTaskIds: string[] | undefined | string,
        returnUrl?: boolean
    ) => {
        const url = new URL(window.location.href);

        if (newStartDate) {
            url.searchParams.set("startDate", newStartDate);
        } else {
            url.searchParams.delete("startDate");
        }

        if (newEndDate) {
            url.searchParams.set("endDate", newEndDate);
        } else {
            url.searchParams.delete("endDate");
        }

        if (newBacklogIds === undefined) {
            url.searchParams.delete("backlogIds");
        } else if (Array.isArray(newBacklogIds)) {
            if (newBacklogIds.length > 0) {
                if (props.renderProject && (props.renderProject.backlogs?.length ?? 0) > newBacklogIds.length) {
                    url.searchParams.set("backlogIds", newBacklogIds.join(","));
                } else {
                    url.searchParams.delete("backlogIds");
                }
            } else {
                url.searchParams.set("backlogIds", "");
            }
        }

        if (newUserIds === undefined) {
            url.searchParams.delete("userIds");
        } else if (Array.isArray(newUserIds)) {
            if (newUserIds.length > 0) {
                if (props.teamUserSeatsById && props.teamUserSeatsById.length > newUserIds.length) {
                    url.searchParams.set("userIds", newUserIds.join(","));
                } else {
                    url.searchParams.delete("userIds");
                }
            } else {
                url.searchParams.set("userIds", "");
            }
        }

        if (newTaskIds === undefined) {
            url.searchParams.delete("taskIds");
        } else if (Array.isArray(newTaskIds)) {
            if (newTaskIds.length > 0) {
                if (props.allProjectTasks && props.allProjectTasks.length > newTaskIds.length) {
                    url.searchParams.set("taskIds", newTaskIds.join(","));
                } else {
                    url.searchParams.delete("taskIds");
                }
            } else {
                url.searchParams.set("taskIds", "");
            }
        }

        if (returnUrl) {
            return url.toString();
        } else {
            router.push(url.toString(), { scroll: false });
        }
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = `${e.target.value} 00:00:00`;
        props.setStartDate(newStart);
        updateURLParams(newStart, props.endDate, props.selectedBacklogIds, props.selectedUserIds, props.selectedTaskIds);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEnd = `${e.target.value} 23:59:59`;
        props.setEndDate(newEnd);
        updateURLParams(props.startDate, newEnd, props.selectedBacklogIds, props.selectedUserIds, props.selectedTaskIds);
    };

    const handleSelectAllBacklogsChange = () => {
        if (!props.renderProject) return;
        const allSelected = props.selectedBacklogIds.length === props.renderProject?.backlogs?.length;
        updateURLParams(props.startDateParam, props.endDateParam, allSelected ? ["0"] : undefined, props.selectedUserIds, props.selectedTaskIds);
    };

    const handleCheckboxBacklogChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        let updatedBacklogIds = checked
            ? [...props.selectedBacklogIds, value]
            : props.selectedBacklogIds.filter(id => id !== value);

        if (props.selectedBacklogIds.length === 0 && props.renderProject) {
            updatedBacklogIds = (props.renderProject.backlogs || [])
                .filter((backlog) => backlog.Backlog_ID?.toString() !== value)
                .map((backlog) => backlog.Backlog_ID?.toString() || "")
                .filter((id): id is string => id !== "");
        }

        updateURLParams(props.startDate, props.endDate, updatedBacklogIds, props.selectedUserIds, props.selectedTaskIds);
    };

    const handleSelectAllTeamMembersChange = () => {
        const allSelected = props.teamUserSeatsById && props.selectedUserIds.length === props.teamUserSeatsById.length;
        updateURLParams(props.startDateParam, props.endDateParam, props.selectedBacklogIds, allSelected ? ["0"] : undefined, props.selectedTaskIds);
    };

    const handleCheckboxTeamMemberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        const updatedUserIds = checked
            ? [...props.selectedUserIds, value]
            : props.selectedUserIds.filter(id => id !== value);

        updateURLParams(props.startDate, props.endDate, props.selectedBacklogIds, updatedUserIds, props.selectedTaskIds);
    };

    const handleSelectAllProjectTasksChange = () => {
        const allSelected = props.selectedTaskIds.length === props.allProjectTasks.length;
        updateURLParams(props.startDateParam, props.endDateParam, props.selectedBacklogIds, props.selectedUserIds, allSelected ? ["0"] : undefined);
    };

    const handleCheckboxTaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        const updatedTaskIds = checked
            ? [...props.selectedTaskIds, value]
            : props.selectedTaskIds.filter(id => id !== value);

        updateURLParams(props.startDate, props.endDate, props.selectedBacklogIds, props.selectedUserIds, updatedTaskIds);
    };

    useEffect(() => {
        const handleEscPress = (event: KeyboardEvent) => {
            if (event.key === "Escape" && props.filterTimeEntries) props.setFilterTimeEntries(!props.filterTimeEntries);
        };

        window.addEventListener("keydown", handleEscPress);
    }, []);

    return (
        <Block
            className={clsx(
                styles["filter-time-entries"],
                { [styles.open]: props.filterTimeEntries }
            )}
        >
            <Block className="flex justify-between items-center">
                <Text className="font-bold">Filter Time Entries</Text>
                <button>
                    <FontAwesomeIcon
                        icon={faXmark}
                        onClick={() => props.setFilterTimeEntries(!props.filterTimeEntries)}
                    />
                </button>
            </Block>

            {/* Entry period */}
            <Block>
                <Text className="text-sm font-semibold">Entry period</Text>
                <Block className="flex gap-3 items-center">
                    <input
                        type="date"
                        value={props.startDate.split(" ")[0]}
                        onChange={handleStartDateChange}
                        className="bg-transparent"
                    />
                    <FontAwesomeIcon icon={faArrowRight} />
                    <input
                        type="date"
                        value={props.endDate.split(" ")[0]}
                        onChange={handleEndDateChange}
                        className="bg-transparent"
                    />
                </Block>
            </Block>

            {/* Project backlogs */}
            {props.renderProject && (
                <Block>
                    <Text className="text-sm font-semibold">Project backlogs</Text>

                    {(props.renderProject.backlogs?.length ?? 0) > 1 && (
                        <Text
                            variant="span"
                            onClick={handleSelectAllBacklogsChange}
                            className="cursor-pointer text-xs hover:underline"
                        >
                            Select/Deselect All
                        </Text>
                    )}

                    <Block className="flex flex-col mt-3">
                        {props.renderProject.backlogs?.map(backlog => (
                            <Block variant="span" className="flex gap-2" key={backlog.Backlog_ID}>
                                <input
                                    type="checkbox"
                                    value={backlog.Backlog_ID}
                                    checked={
                                        props.selectedBacklogIds.length === 0 ||
                                        (backlog.Backlog_ID
                                            ? props.selectedBacklogIds.includes(backlog.Backlog_ID.toString())
                                            : false)
                                    }
                                    onChange={handleCheckboxBacklogChange}
                                />
                                <Text>{backlog.Backlog_Name}</Text>
                            </Block>
                        ))}
                    </Block>
                </Block>
            )}

            {/* Team members */}
            <Block>
                <Text className="text-sm font-semibold">Team members</Text>

                {(props.teamUserSeatsById && (props.teamUserSeatsById?.length ?? 0) > 1) && (
                    <Text
                        variant="span"
                        onClick={handleSelectAllTeamMembersChange}
                        className="cursor-pointer text-xs hover:underline"
                    >
                        Select/Deselect All
                    </Text>
                )}

                <Block className="flex flex-col mt-3">
                    {props.teamUserSeatsById && props.teamUserSeatsById?.map(userSeat => {
                        const user = userSeat.user;
                        if (!user) return null;

                        return (
                            <Block variant="span" className="flex gap-2" key={userSeat.Seat_ID}>
                                <input
                                    type="checkbox"
                                    value={user.User_ID}
                                    checked={
                                        props.selectedUserIds.length === 0 ||
                                        (user.User_ID ? props.selectedUserIds.includes(user.User_ID.toString()) : false)
                                    }
                                    onChange={handleCheckboxTeamMemberChange}
                                />
                                <Text>{user.User_FirstName} {user.User_Surname}</Text>
                            </Block>
                        );
                    })}
                </Block>
            </Block>

            {/* Project tasks */}
            <Block>
                <Text className="text-sm font-semibold">Project tasks</Text>

                {props.allProjectTasks.length > 1 && (
                    <Text
                        variant="span"
                        onClick={handleSelectAllProjectTasksChange}
                        className="cursor-pointer text-xs hover:underline"
                    >
                        Select/Deselect All
                    </Text>
                )}

                <Block className="flex flex-col mt-3">
                    {props.allProjectTasks.map(task => (
                        <Block variant="span" className="flex gap-2 items-center" key={task.Task_ID}>
                            <input
                                type="checkbox"
                                value={task.Task_ID}
                                checked={
                                    props.selectedTaskIds.length === 0 ||
                                    (task.Task_ID ? props.selectedTaskIds.includes(task.Task_ID.toString()) : false)
                                }
                                onChange={handleCheckboxTaskChange}
                            />
                            {props.renderProject && (
                                <Text variant="small" className="text-xs">
                                    ({props.renderProject.Project_Key}-{task.Task_Key})
                                </Text>
                            )}
                            <Text>{task.Task_Title}</Text>
                        </Block>
                    ))}
                </Block>
            </Block>
        </Block>
    );
};

