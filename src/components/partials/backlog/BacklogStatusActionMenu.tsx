// External
import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Router } from 'next/router';
import clsx from 'clsx';

// Internal
import { Block, Text } from '@/components'
import { useAxios } from '@/hooks';
import { useBacklogsContext } from '@/contexts';
import { BacklogStates, Project, Status, Task } from '@/types';
import { selectSnackMessage, useTypedSelector } from '@/redux';

interface BacklogStatusActionMenuProps {
    statusUrlEditing: boolean
    renderBacklog: BacklogStates
    selectedStatusIds: string[]
    selectedTaskIds: string[]
    setSelectedStatusIds: React.Dispatch<React.SetStateAction<string[]>>
}

export const BacklogStatusActionMenu: React.FC<BacklogStatusActionMenuProps> = ({
    statusUrlEditing,
    renderBacklog,
    selectedStatusIds,
    selectedTaskIds,
    setSelectedStatusIds
}) => {
    // Hooks
    const router = useRouter()
    const { backlogId } = useParams<{ backlogId: string }>(); // Get backlogId from URL
    const searchParams = useSearchParams()
    const { backlogById, readBacklogById } = useBacklogsContext()

    // State
    const snackMessage = useTypedSelector(selectSnackMessage)
    const urlStatusIds = searchParams.get("statusIds")

    // Methods
    const updateURLParams = (
        newTaskIds: string[] | undefined | string,
        newStatusIds: string[] | undefined | string,
        returnUrl?: boolean
    ) => {
        if (!renderBacklog) return

        const url = new URL(window.location.href);

        // taskIds
        /*if (newTaskIds === undefined) {
            url.searchParams.delete("taskIds")
        } else if (Array.isArray(newTaskIds)) { // Handle taskIds (convert array to a comma-separated string)
            if (newTaskIds.length > 0) {
                if (renderBacklog.tasks && renderBacklog.tasks.length > newTaskIds.length) {
                    url.searchParams.set("taskIds", newTaskIds.join(",")); // Store as comma-separated values
                } else {
                    url.searchParams.delete("taskIds"); // Remove if all are selected, as that is default 
                }
            } else {
                url.searchParams.set("taskIds", "");
            }
        }*/

        // taskIds
        if (newStatusIds === undefined) {
            url.searchParams.delete("statusIds")
        } else if (Array.isArray(newStatusIds)) { // Handle statusIds (convert array to a comma-separated string)
            if (newStatusIds.length > 0) {
                if (renderBacklog.statuses && renderBacklog.statuses.length > newStatusIds.length) {
                    url.searchParams.set("statusIds", newStatusIds.join(",")); // Store as comma-separated values
                } else {
                    url.searchParams.delete("statusIds"); // Remove if all are selected, as that is default
                }
            } else {
                url.searchParams.set("statusIds", "");
            }
        }

        if (returnUrl) {
            return url.toString()
        } else {
            router.push(url.toString(), { scroll: false }); // Prevent full page reload
        }
    }

    // Handles changes to the status selection checkboxes.
    const handleCheckboxStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;

        let updatedStatusIds = checked
            ? [...selectedStatusIds, value] // Add new ID
            : selectedStatusIds.filter(id => id !== value); // Remove unchecked ID

        if (selectedStatusIds.length === 0 && renderBacklog) {
            updatedStatusIds = (renderBacklog.statuses || [])
                .filter((status) => status.Status_ID?.toString() !== value)
                .map((status) => status.Status_ID?.toString() || "")
                .filter((id): id is string => id !== "");
        }

        updateURLParams(selectedTaskIds, updatedStatusIds);
    }

    if (!statusUrlEditing) return null

    return (
        <Block
            className={clsx(
                "task-bulkedit-container",
                { ["task-bulkedit-container-open"]: statusUrlEditing }
            )}
        >
            {statusUrlEditing && renderBacklog && (
                <Block>
                    <Text className="text-sm font-semibold">Backlog statuses</Text>

                    {(renderBacklog.statuses?.length && renderBacklog.statuses.length > 1) && (
                        <Text
                            variant="span"
                            // onClick={() => handleSelectAllBacklogsChange()}
                            className="cursor-pointer text-xs hover:underline"
                        >
                            Select/Deselect All
                        </Text>
                    )}

                    <Block className="flex flex-col mt-3">
                        {renderBacklog.statuses?.length && renderBacklog.statuses
                            // Status_Order low to high:
                            .sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))
                            .map(status => {
                                return (
                                    <Block variant="span" className="flex gap-2" key={status.Status_ID}>
                                        <input
                                            type="checkbox"
                                            value={status.Status_ID}
                                            checked={selectedStatusIds.length === 0 || (status.Status_ID ? selectedStatusIds.includes(status.Status_ID.toString()) : false)}
                                            onChange={handleCheckboxStatusChange}
                                        />
                                        <Text>{status.Status_Name}</Text>
                                    </Block>
                                )
                            })}
                    </Block>
                </Block>
            )}
        </Block>
    )
}