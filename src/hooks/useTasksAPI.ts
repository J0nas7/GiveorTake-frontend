// External
import React, { useState } from "react";

// Internal
import { useAxios } from ".";
import { useAppDispatch } from "@/redux";
import { Task } from "@/types";

export const useTasksAPI = () => {
    // Hooks
    const { httpGetRequest, httpPostWithData, httpPutWithData, httpDeleteRequest } = useAxios();
    const dispatch = useAppDispatch();
    
    // State
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all tasks (R in CRUD)
    const fetchTasks = async () => {
        try {
            const data = await httpGetRequest("tasks");
            
            if (data) return data
            
            throw new Error("Failed to fetch tasks")
        } catch (error: any) {
            setError(error.message || "An error occurred while fetching tasks.");
            console.log(error.message || "An error occurred while fetching tasks.");
            return false
        } finally {
            setLoading(false);
        }
    };

    // Fetch a single task (R in CRUD)
    const fetchTask = async (taskId: number) => {
        try {
            const response = await httpGetRequest(`tasks/${taskId}`);
            
            if (response.data) return response.data
            
            throw new Error("Failed to fetch task");
        } catch (error: any) {
            setError(error.message || "An error occurred while fetching the task.");
            return false
        }
    };

    // Create a new task (C in CRUD)
    const postTask = async (newTask: Omit<Task, "Task_ID">) => {
        try {
            const response = await httpPostWithData("tasks", newTask);
            if (response.data) return true

            throw new Error("Failed to add task");
        } catch (error: any) {
            setError(error.message || "An error occurred while adding the task.");
            return false
        }
    };

    // Update a task (U in CRUD)
    const updateTask = async (updatedTask: Task) => {
        try {
            const response = await httpPutWithData(`tasks/${updatedTask.Task_ID}`, updatedTask);
            
            if (response.data) return true;

            throw new Error("Failed to update task");
        } catch (error: any) {
            setError(error.message || "An error occurred while updating the task.");
            return false;
        }
    };

    // Delete a task (D in CRUD)
    const deleteTask = async (taskId: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        
        try {
            const response = await httpDeleteRequest(`tasks/${taskId}`);
            if (!response.message) {
                throw new Error("Failed to delete task");
            }

            return true;
        } catch (error: any) {
            setError(error.message || "An error occurred while deleting the task.");
            return false;
        }
    };

    return {
        loading,
        error,
        fetchTasks,
        fetchTask,
        postTask,
        updateTask,
        deleteTask,
    };
};
