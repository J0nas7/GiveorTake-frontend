// External
import React, { createContext, useContext, useState } from "react"

// Context API for Tasks
interface TasksContextType {
    tasks: string[]
    newTask: string
    setNewTask: (task: string) => void
    addTask: () => void
    removeTask: (index: number) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<string[]>([])
    const [newTask, setNewTask] = useState("")

    const addTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, newTask])
            setNewTask("")
        }
    }

    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index))
    }

    return (
        <TasksContext.Provider value={{ tasks, newTask, setNewTask, addTask, removeTask }}>
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