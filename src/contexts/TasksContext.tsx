"use client"

// External
import React, { createContext, useContext, useState } from "react"

// Internal
import { Task, TasksContextType } from "@/types"

// More Demo Data
const demoTasks: Task[] = [
    // TODO
    { id: 1, text: "Fix broken login page UI", column: "todo" },
    { id: 2, text: "Implement user profile page", column: "todo" },
    { id: 3, text: "Set up database schema for product inventory", column: "todo" },
    { id: 4, text: "Create API endpoints for user registration", column: "todo" },
    { id: 5, text: "Write unit tests for the order service", column: "todo" },
    { id: 6, text: "Design homepage layout", column: "todo" },
    { id: 7, text: "Update the README file with latest setup instructions", column: "todo" },
    { id: 8, text: "Integrate third-party payment gateway", column: "todo" },
    { id: 9, text: "Fix CSS issues in mobile view", column: "todo" },
    { id: 10, text: "Audit API performance for slow endpoints", column: "todo" },

    // IN-PROGRESS
    { id: 11, text: "Refactor authentication service", column: "inProgress" },
    { id: 12, text: "Add user role management", column: "inProgress" },
    { id: 13, text: "Optimize product search functionality", column: "inProgress" },
    { id: 14, text: "Integrate email notification service", column: "inProgress" },
    { id: 15, text: "Implement infinite scroll for product list", column: "inProgress" },
    { id: 16, text: "Add pagination to user management page", column: "inProgress" },
    { id: 17, text: "Refactor user profile API to support file uploads", column: "inProgress" },
    { id: 18, text: "Update product page to show dynamic pricing", column: "inProgress" },

    // DONE
    { id: 19, text: "Fix security vulnerabilities in the API", column: "done" },
    { id: 20, text: "Completed basic design for dashboard layout", column: "done" },
    { id: 21, text: "Setup CI/CD pipeline for automatic deployment", column: "done" },
    { id: 22, text: "Write API documentation for public endpoints", column: "done" },
    { id: 23, text: "Launch beta version of user onboarding flow", column: "done" },
    { id: 24, text: "Implement password reset functionality", column: "done" },
    { id: 25, text: "Integrate social login for users (Google, Facebook)", column: "done" },
    { id: 26, text: "Optimize product image upload for faster speed", column: "done" },
    { id: 27, text: "Fix bug where user is redirected after submitting the form", column: "done" },
    { id: 28, text: "Upgrade dependencies to latest versions", column: "done" },
    { id: 29, text: "Fix email template rendering issue", column: "done" },
    { id: 30, text: "Refactor legacy code for better maintainability", column: "done" },
];

// Context API for Tasks
const TasksContext = createContext<TasksContextType | undefined>(undefined)

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>(demoTasks)
    const [newTask, setNewTask] = useState<Task | undefined>(undefined)

    const addTask = () => {
        if (newTask?.text.trim()) {
            setTasks([...tasks, newTask])
            setNewTask(undefined)
        }
    }
    
    const handleChangeNewTask = (field: "id" | "text" | "column", value: string) => {
        setNewTask((prevState) => ({
            id: prevState?.id ?? 0,
            text: prevState?.text ?? "",
            column: prevState?.column ?? "todo",
            [field]: value,
        }));
    }
    
    const removeTask = (id: number) => {
        setTasks(tasks.filter((task) => task.id !== id))
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