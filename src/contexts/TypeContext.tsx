// External
import React, { createContext, useContext, useState, useEffect } from "react"

// Internal
import { useTypeAPI } from "@/hooks"
import { selectIsLoggedIn, useTypedSelector } from "@/redux"

// Generic context and provider to handle different resources like teams, tasks, organisations, etc.
export const useResourceContext = <T extends { [key: string]: any }, IDKey extends keyof T>(
    resource: string,
    idFieldName: IDKey
) => {
    // Redux
    const isLoggedIn = useTypedSelector(selectIsLoggedIn)

    const { loading, error, fetchItems, postItem, updateItem, deleteItem } = useTypeAPI<T, IDKey>(resource, idFieldName)

    const [items, setItems] = useState<T[]>([])
    const [newItem, setNewItem] = useState<T | undefined>(undefined)
    const [itemDetail, setItemDetail] = useState<T | undefined>(undefined)
    
    useEffect(() => {
        const fetchOnMount = async () => {
            const data = await fetchItems() // Fetch all items on mount
            if (data) setItems(data)
        }

        if (isLoggedIn === true) fetchOnMount()
    }, [isLoggedIn])

    const addItem = async () => {
        if (newItem) {
            const createdItem = await postItem(newItem)
            if (createdItem) {
                const data = await fetchItems() // Refresh items from API
                if (data) {
                    setItems(data)
                    setNewItem(undefined)
                }
            }
        }
    }

    const handleChangeNewItem = (field: keyof T, value: string) => {
        setNewItem((prevState) => ({
            ...prevState,
            [field]: value,
        } as T))
    }

    const saveItemChanges = async (itemChanges: T) => {
        const updatedItem = await updateItem(itemChanges)
        if (updatedItem) {
            const data = await fetchItems() // Refresh items from API
            if (data) {
                setItems(data)
            }
        }
    }

    const removeItem = async (id: number) => {
        const success = await deleteItem(id)
        if (success) {
            const data = await fetchItems() // Refresh items after deletion
            if (data) setItems(data)
        }
    }

    return {
        loading,
        error,
        items,
        newItem,
        itemDetail,
        setItemDetail,
        handleChangeNewItem,
        addItem,
        saveItemChanges,
        removeItem,
    }
}

// Generic Provider for any resource
export const ResourceProvider = <T extends { [key: string]: any }, IDKey extends keyof T>({
    resource,
    idFieldName,
    children,
}: {
    resource: string
    idFieldName: IDKey
    children: React.ReactNode
}) => {
    const resourceContext = useResourceContext<T, IDKey>(resource, idFieldName)

    return <ResourceContext.Provider value={resourceContext}>{children}</ResourceContext.Provider>
}

// Create a context for any resource
export const ResourceContext = createContext<any>(undefined)

// Custom hook to use resource context
export const useResource = () => {
    const context = useContext(ResourceContext)
    if (!context) {
        throw new Error("useResource must be used within a ResourceProvider")
    }
    return context
}
