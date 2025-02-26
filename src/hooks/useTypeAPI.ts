// External
import React, { useState } from "react";

// Internal
import { useAxios } from "."; // Assuming you have a custom hook for Axios requests

interface APIResponse<T> {
    data: T;
    message?: string;
}

// Define the ID field constraint with a dynamic key
type HasIDField<T, IDKey extends string> = T & {
    [key in IDKey]: number; // Define the dynamic ID field based on the resource
};

// A generic hook for handling API operations on different resources
export const useTypeAPI = <T extends { [key: string]: any }, IDKey extends keyof T>(
    resource: string,
    idFieldName: IDKey
) => {
    // Hooks
    const { httpGetRequest, httpPostWithData, httpPutWithData, httpDeleteRequest } = useAxios();

    // State
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all items (R in CRUD)
    const fetchItems = async () => {
        try {
            const data: APIResponse<T[]> = await httpGetRequest(resource);

            if (data) return data.data;

            throw new Error(`Failed to fetch ${resource}`);
        } catch (error: any) {
            setError(error.message || `An error occurred while fetching ${resource}.`);
            console.log(error.message || `An error occurred while fetching ${resource}.`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Fetch a single item (R in CRUD)
    const fetchItem = async (itemId: number) => {
        try {
            const response: APIResponse<T> = await httpGetRequest(`${resource}/${itemId}`);

            if (response.data) return response.data;

            throw new Error(`Failed to fetch ${resource}`);
        } catch (error: any) {
            setError(error.message || `An error occurred while fetching the ${resource}.`);
            return false;
        }
    };

    // Create a new item (C in CRUD)
    const postItem = async (newItem: Omit<T, IDKey>) => {
        try {
            const response: APIResponse<T> = await httpPostWithData(resource, newItem);
            if (response.data) return true;

            throw new Error(`Failed to add ${resource}`);
        } catch (error: any) {
            setError(error.message || `An error occurred while adding the ${resource}.`);
            return false;
        }
    };

    // Update an existing item (U in CRUD)
    const updateItem = async (updatedItem: T) => {
        try {
            const response: APIResponse<T> = await httpPutWithData(`${resource}/${updatedItem[idFieldName]}`, updatedItem);

            if (response.data) return true;

            throw new Error(`Failed to update ${resource}`);
        } catch (error: any) {
            setError(error.message || `An error occurred while updating the ${resource}.`);
            return false;
        }
    };

    // Delete an item (D in CRUD)
    const deleteItem = async (itemId: number) => {
        if (!confirm(`Are you sure you want to delete this ${resource}?`)) return;

        try {
            const response = await httpDeleteRequest(`${resource}/${itemId}`);
            if (!response.message) {
                throw new Error(`Failed to delete ${resource}`);
            }

            return true;
        } catch (error: any) {
            setError(error.message || `An error occurred while deleting the ${resource}.`);
            return false;
        }
    };

    return {
        loading,
        error,
        fetchItems,
        fetchItem,
        postItem,
        updateItem,
        deleteItem,
    };
};
