"use client"

// External
import React, { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisV, faPlus, faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons"

// Internal
import styles from "@/core-ui/styles/modules/Backlog.module.scss"
import { Block, Text, Field, Heading } from "@/components"
import { useTasksContext } from "@/contexts"
import { Task } from "@/types";

const BacklogContainer = () => {
    const { projectId } = useParams<{ projectId: string }>(); // Get projectId from URL
    const router = useRouter();
    const searchParams = useSearchParams();

    const { t } = useTranslation(['backlog'])
    const { tasksById, readTasksByProjectId, newTask, setTaskDetail, handleChangeNewTask, addTask } = useTasksContext()

    const [showActionMenu, setShowActionMenu] = useState<number | null>(null);

    const setActionMenu = (taskId: number) => {
        setShowActionMenu(showActionMenu === taskId ? null : taskId);
    };

    const handleCreateTask = () => {
        addTask(parseInt(projectId), newTask)
    }
    
    useEffect(() => {
        if (projectId) readTasksByProjectId(parseInt(projectId))
    }, [projectId])

    const currentSort = searchParams.get("sort") || "Task_Title";
    const currentOrder = searchParams.get("order") || "asc";

    const SORT_KEYS: Record<number, keyof Task> = {
        1: "Task_Title",
        2: "Task_Status",
        3: "Assigned_User_ID",
        4: "Task_CreatedAt",
    };

    // Default sorting field if an invalid key is used
    const DEFAULT_SORT_KEY: keyof Task = "Task_CreatedAt";

    // Function to toggle sorting order
    const handleSort = (column: string) => {
        const newOrder = currentSort === column && currentOrder === "asc" ? "desc" : "asc";
        router.push(`?sort=${column}&order=${newOrder}`);
    };

    // Sorting logic based on URL query parameters
    const sortedTasks = useMemo(() => {
        if (!Array.isArray(tasksById)) return []; // Ensure tasks is an array

        const sortField = SORT_KEYS[Number(currentSort)] || DEFAULT_SORT_KEY; // Convert number to field name

        return [...tasksById].sort((a, b) => {
            const aValue = a[sortField] ?? "";
            const bValue = b[sortField] ?? "";

            if (typeof aValue === "string" && typeof bValue === "string") {
                return currentOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else if (typeof aValue === "number" && typeof bValue === "number") {
                return currentOrder === "asc" ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
    }, [tasksById, currentSort, currentOrder]);

    return (
        <Block className={styles.taskTableContainer}>
            <Heading variant="h1" className={styles.title}>Project Backlog</Heading>
            <table className={styles.taskTable}>
                <thead>
                    <tr>
                        <th onClick={() => handleSort("1")}>
                            Task Title {currentSort === "1" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                        </th>
                        <th onClick={() => handleSort("2")}>
                            Task Number {currentSort === "2" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                        </th>
                        <th onClick={() => handleSort("3")}>
                            Status {currentSort === "3" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                        </th>
                        <th onClick={() => handleSort("4")}>
                            Assignee {currentSort === "4" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                        </th>
                        <th onClick={() => handleSort("5")}>
                            Created At {currentSort === "5" && <FontAwesomeIcon icon={currentOrder === "asc" ? faSortUp : faSortDown} />}
                        </th>
                        <th></th> {/* Actions column */}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={5}>
                            <Block className={styles.inputContainer}>
                                <Field
                                    type="text"
                                    lbl={t('backlog:list:New task')}
                                    innerLabel={true}
                                    value={newTask?.Task_Title ?? ''}
                                    onChange={(e: string) => handleChangeNewTask("Task_Title", e)}
                                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => null}
                                    disabled={false}
                                />
                                <button
                                    type="submit"
                                    onClick={handleCreateTask}
                                    className={styles.addButton}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> Add
                                </button>
                            </Block>
                        </td>
                    </tr>
                    {sortedTasks.map((task) => (
                        <tr key={task.Task_ID}>
                            <td>{task.Task_Title}</td>
                            <td
                                onClick={() => setTaskDetail(task)}
                                className="cursor-pointer hover:underline"
                            >
                                GOT-{task.Task_Number}
                            </td>
                            <td className={styles.status}>{task.Task_Status}</td>
                            <td>{task.Assigned_User_ID ? `User ${task.Assigned_User_ID}` : "Unassigned"}</td>
                            <td>{task.Task_CreatedAt || "N/A"}</td>
                            <td className={styles.actions}>
                                <button onClick={() => setActionMenu(task.Task_ID)} className={styles.actionButton}>
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </button>
                                {showActionMenu === task.Task_ID && (
                                    <div className={styles.actionMenu}>
                                        <button>Edit</button>
                                        <button>Archive</button>
                                        <button>Details</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Block>
    )
}

export const Backlog = () => (
    <BacklogContainer />
)