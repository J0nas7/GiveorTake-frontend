"use client"

// External
import React, { createContext, useContext, useState } from "react"

// Internal
import { Task, TaskFields, TasksContextType } from "@/types"

// More Demo Data
const demoTasks: Task[] = [
    // TODO
    { Task_ID: 1, Task_Number: 1, Task_Title: "Fix broken login page UI", Task_Status: "todo", Task_CreatedAt: "2024-02-01", Assigned_User_ID: 3, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-02-01" },
    { Task_ID: 2, Task_Number: 2, Task_Title: "Implement user profile page", Task_Status: "todo", Task_CreatedAt: "2024-02-02", Assigned_User_ID: 1, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-02-02" },
    { Task_ID: 3, Task_Number: 3, Task_Title: "Set up database schema for product inventory", Task_Status: "todo", Task_CreatedAt: "2024-02-03", Assigned_User_ID: 5, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-02-03" },
    { Task_ID: 4, Task_Number: 4, Task_Title: "Create API endpoints for user registration", Task_Status: "todo", Task_CreatedAt: "2024-02-04", Assigned_User_ID: 2, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-02-04" },
    { Task_ID: 5, Task_Number: 5, Task_Title: "Write unit tests for the order service", Task_Status: "todo", Task_CreatedAt: "2024-02-05", Assigned_User_ID: 4, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-02-05" },
    { Task_ID: 6, Task_Number: 6, Task_Title: "Design homepage layout", Task_Status: "todo", Task_CreatedAt: "2024-02-06", Assigned_User_ID: 1, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-02-06" },
    { Task_ID: 7, Task_Number: 7, Task_Title: "Update the README file with latest setup instructions", Task_Status: "todo", Task_CreatedAt: "2024-02-07", Assigned_User_ID: 2, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-02-07" },
    { Task_ID: 8, Task_Number: 8, Task_Title: "Integrate third-party payment gateway", Task_Status: "todo", Task_CreatedAt: "2024-02-08", Assigned_User_ID: 5, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-02-08" },
    { Task_ID: 9, Task_Number: 9, Task_Title: "Fix CSS issues in mobile view", Task_Status: "todo", Task_CreatedAt: "2024-02-09", Assigned_User_ID: 3, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-02-09" },
    { Task_ID: 10, Task_Number: 10, Task_Title: "Audit API performance for slow endpoints", Task_Status: "todo", Task_CreatedAt: "2024-02-10", Assigned_User_ID: 4, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-02-10" },

    // IN-PROGRESS
    { Task_ID: 11, Task_Number: 11, Task_Title: "Refactor authentication service", Task_Status: "inProgress", Task_CreatedAt: "2024-01-30", Assigned_User_ID: 2, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-30" },
    { Task_ID: 12, Task_Number: 12, Task_Title: "Add user role management", Task_Status: "inProgress", Task_CreatedAt: "2024-01-28", Assigned_User_ID: 1, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-28" },
    { Task_ID: 13, Task_Number: 13, Task_Title: "Optimize product search functionality", Task_Status: "inProgress", Task_CreatedAt: "2024-01-27", Assigned_User_ID: 5, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-27" },
    { Task_ID: 14, Task_Number: 14, Task_Title: "Integrate email notification service", Task_Status: "inProgress", Task_CreatedAt: "2024-01-26", Assigned_User_ID: 3, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-26" },
    { Task_ID: 15, Task_Number: 15, Task_Title: "Implement infinite scroll for product list", Task_Status: "inProgress", Task_CreatedAt: "2024-01-25", Assigned_User_ID: 4, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-25" },
    { Task_ID: 16, Task_Number: 16, Task_Title: "Add pagination to user management page", Task_Status: "inProgress", Task_CreatedAt: "2024-01-24", Assigned_User_ID: 2, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-24" },
    { Task_ID: 17, Task_Number: 17, Task_Title: "Refactor user profile API to support file uploads", Task_Status: "inProgress", Task_CreatedAt: "2024-01-23", Assigned_User_ID: 1, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-23" },
    { Task_ID: 18, Task_Number: 18, Task_Title: "Update product page to show dynamic pricing", Task_Status: "inProgress", Task_CreatedAt: "2024-01-22", Assigned_User_ID: 5, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-22" },

    // REVIEW
    { Task_ID: 19, Task_Number: 19, Task_Title: "Code review for new authentication service", Task_Status: "review", Task_CreatedAt: "2024-01-15", Assigned_User_ID: 3, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-15" },
    { Task_ID: 20, Task_Number: 20, Task_Title: "Test new product filtering feature", Task_Status: "review", Task_CreatedAt: "2024-01-14", Assigned_User_ID: 2, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-14" },
    { Task_ID: 21, Task_Number: 21, Task_Title: "Validate user role management security", Task_Status: "review", Task_CreatedAt: "2024-01-13", Assigned_User_ID: 4, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-13" },

    // DONE
    { Task_ID: 26, Task_Number: 26, Task_Title: "Launch beta version of user onboarding flow", Task_Status: "done", Task_CreatedAt: "2024-01-06", Assigned_User_ID: 4, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-06" },
    { Task_ID: 27, Task_Number: 27, Task_Title: "Implement password reset functionality", Task_Status: "done", Task_CreatedAt: "2024-01-05", Assigned_User_ID: 2, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-05" },
    { Task_ID: 28, Task_Number: 28, Task_Title: "Integrate social login for users (Google, Facebook)", Task_Status: "done", Task_CreatedAt: "2024-01-04", Assigned_User_ID: 5, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-01-04" },
    { Task_ID: 33, Task_Number: 33, Task_Title: "Refactor legacy code for better maintainability", Task_Status: "done", Task_CreatedAt: "2023-12-30", Assigned_User_ID: 2, Project_ID: 1, Team_ID: 0, Task_UpdatedAt: "2024-12-30" }
];

// Context API for Tasks
const TasksContext = createContext<TasksContextType | undefined>(undefined)

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [taskDetail, setTaskDetail] = useState<Task|undefined>(undefined)
    const [tasks, setTasks] = useState<Task[]>(demoTasks)
    const [newTask, setNewTask] = useState<Task | undefined>(undefined)

    const addTask = () => {
        if (newTask?.Task_Title.trim()) {
            setTasks([...tasks, newTask])
            setNewTask(undefined)
        }
    }
    
    const handleChangeNewTask = (field: TaskFields, value: string) => {
        setNewTask((prevState) => ({
            Task_ID: prevState?.Task_ID ?? 0,
            Task_Number: prevState?.Task_Number ?? 0,
            Project_ID: prevState?.Project_ID ?? 0, // Default value if not provided
            Team_ID: prevState?.Team_ID ?? 0, // Nullable field, defaults to null
            Assigned_User_ID: prevState?.Assigned_User_ID ?? undefined, // Nullable, defaults to undefined
            Task_Title: prevState?.Task_Title ?? "",
            Task_Description: prevState?.Task_Description ?? "", // Optional field, defaults to empty string if not provided
            Task_Status: prevState?.Task_Status ?? "todo", // Default to "todo"
            Task_Due_Date: prevState?.Task_Due_Date ?? "", // Optional field, default to empty string if not provided
            Task_CreatedAt: prevState?.Task_CreatedAt ?? new Date().toISOString(), // Defaults to current timestamp
            Task_UpdatedAt: new Date().toISOString(), // Always set to current timestamp
            [field]: value, // Dynamically update the field based on input
        }));
    }
    
    const removeTask = (id: number) => {
        setTasks(tasks.filter((task) => task.Task_ID !== id))
    }

    return (
        <TasksContext.Provider value={{ taskDetail, tasks, newTask, setTaskDetail, handleChangeNewTask, addTask, removeTask }}>
            {children}
        </TasksContext.Provider>
    )
}

export const useTasks = () => {
    const context = useContext(TasksContext)
    if (!context) {
        throw new Error("useTasks must be used within a TasksProvider")
    }
    return context
}