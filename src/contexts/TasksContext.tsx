"use client"

// External
import React, { createContext, useContext, useState } from "react"

// Internal
import { Task, TaskFields, TasksContextType } from "@/types"

// More Demo Data
const demoTasks: Task[] = [
    // TODO
    { Task_ID: 1, Task_Title: "Fix broken login page UI", Task_Status: "todo" },
    { Task_ID: 2, Task_Title: "Implement user profile page", Task_Status: "todo" },
    { Task_ID: 3, Task_Title: "Set up database schema for product inventory", Task_Status: "todo" },
    { Task_ID: 4, Task_Title: "Create API endpoints for user registration", Task_Status: "todo" },
    { Task_ID: 5, Task_Title: "Write unit tests for the order service", Task_Status: "todo" },
    { Task_ID: 6, Task_Title: "Design homepage layout", Task_Status: "todo" },
    { Task_ID: 7, Task_Title: "Update the README file with latest setup instructions", Task_Status: "todo" },
    { Task_ID: 8, Task_Title: "Integrate third-party payment gateway", Task_Status: "todo" },
    { Task_ID: 9, Task_Title: "Fix CSS issues in mobile view", Task_Status: "todo" },
    { Task_ID: 10, Task_Title: "Audit API performance for slow endpoints", Task_Status: "todo" },

    // IN-PROGRESS
    { Task_ID: 11, Task_Title: "Refactor authentication service", Task_Status: "inProgress" },
    { Task_ID: 12, Task_Title: "Add user role management", Task_Status: "inProgress" },
    { Task_ID: 13, Task_Title: "Optimize product search functionality", Task_Status: "inProgress" },
    { Task_ID: 14, Task_Title: "Integrate email notification service", Task_Status: "inProgress" },
    { Task_ID: 15, Task_Title: "Implement infinite scroll for product list", Task_Status: "inProgress" },
    { Task_ID: 16, Task_Title: "Add pagination to user management page", Task_Status: "inProgress" },
    { Task_ID: 17, Task_Title: "Refactor user profile API to support file uploads", Task_Status: "inProgress" },
    { Task_ID: 18, Task_Title: "Update product page to show dynamic pricing", Task_Status: "inProgress" },

    // REVIEW
    { Task_ID: 19, Task_Title: "Code review for new authentication service", Task_Status: "review" },
    { Task_ID: 20, Task_Title: "Test new product filtering feature", Task_Status: "review" },
    { Task_ID: 21, Task_Title: "Validate user role management security", Task_Status: "review" },

    // DONE
    { Task_ID: 22, Task_Title: "Fix security vulnerabilities in the API", Task_Status: "done" },
    { Task_ID: 23, Task_Title: "Completed basic design for dashboard layout", Task_Status: "done" },
    { Task_ID: 24, Task_Title: "Setup CI/CD pipeline for automatic deployment", Task_Status: "done" },
    { Task_ID: 25, Task_Title: "Write API documentation for public endpoints", Task_Status: "done" },
    { Task_ID: 26, Task_Title: "Launch beta version of user onboarding flow", Task_Status: "done" },
    { Task_ID: 27, Task_Title: "Implement password reset functionality", Task_Status: "done" },
    { Task_ID: 28, Task_Title: "Integrate social login for users (Google, Facebook)", Task_Status: "done" },
    { Task_ID: 29, Task_Title: "Optimize product image upload for faster speed", Task_Status: "done" },
    { Task_ID: 30, Task_Title: "Fix bug where user is redirected after submitting the form", Task_Status: "done" },
    { Task_ID: 31, Task_Title: "Upgrade dependencies to latest versions", Task_Status: "done" },
    { Task_ID: 32, Task_Title: "Fix email template rendering issue", Task_Status: "done" },
    { Task_ID: 33, Task_Title: "Refactor legacy code for better maintainability", Task_Status: "done" },
];

// Context API for Tasks
const TasksContext = createContext<TasksContextType | undefined>(undefined)

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
            Task_Title: prevState?.Task_Title ?? "",
            Task_Status: prevState?.Task_Status ?? "todo",
            [field]: value,
        }));
    }
    
    const removeTask = (id: number) => {
        setTasks(tasks.filter((task) => task.Task_ID !== id))
    }

    return (
        <TasksContext.Provider value={{ tasks, newTask, handleChangeNewTask, addTask, removeTask }}>
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