"use client"

// External
import { useParams, usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from 'react';

// Internal
import { BacklogEdit, BacklogEditProps } from '@/components/backlog';
import { useBacklogsContext, useStatusContext } from '@/contexts';
import { useURLLink } from '@/hooks';
import useRoleAccess from '@/hooks/useRoleAccess';
import { selectAuthUser, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux';
import { Backlog, BacklogStates, Status } from '@/types';

export const BacklogEditView = () => {
    // ---- Hooks ----
    const dispatch = useAppDispatch()
    const { backlogLink } = useParams<{ backlogLink: string }>(); // Get backlogLink from URL
    const pathname = usePathname();
    const { readBacklogById, backlogById, saveBacklogChanges, removeBacklog } = useBacklogsContext();
    const { moveOrder, assignDefault, assignClosed, addStatus, saveStatusChanges, removeStatus } = useStatusContext()
    const { linkId: backlogId, convertID_NameStringToURLFormat } = useURLLink(backlogLink)
    const { canAccessBacklog, canManageBacklog } = useRoleAccess(
        backlogById ? backlogById.project?.team?.organisation?.User_ID : undefined,
        "backlog",
        backlogById ? backlogById.Backlog_ID : 0
    )

    // ---- State ----
    const authUser = useTypedSelector(selectAuthUser);
    const [newStatus, setNewStatus] = useState<Status>({
        Backlog_ID: 0,
        Status_Name: '',
        Status_Order: 0,
        Status_Is_Default: false,
        Status_Is_Closed: false,
        Status_Color: '',
    });
    const [localBacklog, setLocalBacklog] = useState<BacklogStates>(undefined);
    const [showEditToggles, setShowEditToggles] = useState<boolean>(false)
    const [editPending, setEditPending] = useState<boolean>(false)
    const submittingRef = useRef<boolean>(false)
    const [createStatusPending, setCreateStatusPending] = useState<boolean>(false)
    const createStatusRef = useRef<boolean>(false)
    const [saveStatusPending, setSaveStatusPending] = useState<undefined | number>(undefined)
    const saveStatusRef = useRef<undefined | number>(undefined)
    const [moveStatusPending, setMoveStatusPending] = useState<undefined | string>(undefined)
    const moveStatusRef = useRef<undefined | string>(undefined)

    // ---- Effects ----
    useEffect(() => {
        if (backlogId) readBacklogById(parseInt(backlogId));
    }, [backlogId]);

    useEffect(() => {
        if (backlogById) {
            setLocalBacklog(backlogById);
            setNewStatus({
                ...newStatus,
                Backlog_ID: backlogById.Backlog_ID ?? 0
            })
            document.title = `Backlog: ${backlogById.Backlog_Name}`;
        }
    }, [backlogById]);

    // ---- Methods ----
    // Handle Input Change for text fields
    const handleBacklogInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!localBacklog) return
        const { name, value } = e.target;

        setLocalBacklog({
            ...localBacklog,
            [name]: value,
        });
    };

    // Handle Rich Text or other field changes
    const handleBacklogChange = (field: keyof Backlog, value: string) => {
        if (!localBacklog) return

        setLocalBacklog({
            ...localBacklog,
            [field]: value,
        });
    };

    // Save backlog changes to backend
    const handleSaveBacklogChanges = async () => {
        if (!localBacklog) return
        if (submittingRef.current) return
        submittingRef.current = true
        setEditPending(true)

        try {
            const saveChanges = await saveBacklogChanges(localBacklog, localBacklog.Project_ID);

            dispatch(setSnackMessage(
                saveChanges ? "Backlog updated successfully." : "Failed to update backlog."
            ));
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to update backlog."));
        } finally {
            submittingRef.current = false
            setEditPending(false)
        }
    };

    // Handles the 'Enter' key press event to trigger update status name.
    const ifEnterSaveStatus = (e: React.KeyboardEvent, status: Status) => (e.key === 'Enter') ? handleSaveStatusChanges(status) : null

    // Save status changes to backend
    const handleSaveStatusChanges = async (status: Status) => {
        if (!localBacklog) return;
        if (saveStatusRef.current) return
        saveStatusRef.current = status.Status_ID
        setSaveStatusPending(status.Status_ID)

        try {
            const saveChanges = await saveStatusChanges(status, localBacklog.Project_ID)

            dispatch(setSnackMessage(
                saveChanges ? "Status changes saved successfully!" : "Failed to save status changes."
            ))

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to save update status."))
        } finally {
            saveStatusRef.current = undefined
            setSaveStatusPending(undefined)
        }
    };

    // Handles the movement of a status within the backlog by changing its order.
    const handleMoveStatusChanges = async (statusId: number, direction: "up" | "down") => {
        if (!localBacklog) return;
        if (moveStatusRef.current) return
        moveStatusRef.current = `${direction}-${statusId}`
        setMoveStatusPending(`${direction}-${statusId}`)

        try {
            const saveChanges = await moveOrder(statusId, direction)

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to update status order."))
        } finally {
            moveStatusRef.current = undefined
            setMoveStatusPending(undefined)
        }
    };

    // Handles the assignment of a default status to a backlog item.
    const handleAssignDefaultStatus = async (statusId: number) => {
        if (!localBacklog) return;
        try {
            const saveChanges = await assignDefault(statusId)

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to assign default status."))
        }
    };

    // Handles the assignment of a default status to a backlog item.
    const handleAssignClosedStatus = async (statusId: number) => {
        if (!localBacklog) return;
        try {
            const saveChanges = await assignClosed(statusId)

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to assign closed status."))
        }
    };

    // Handles the 'Enter' key press event to trigger status creation
    const ifEnterCreateStatus = (e: React.KeyboardEvent) => (e.key === 'Enter') ? handleCreateStatus() : null

    // Handles the creation of a new status for the backlog.
    const handleCreateStatus = async () => {
        if (!newStatus.Status_Name.trim()) {
            dispatch(setSnackMessage("Please enter a status name."))
            return;
        }

        if (createStatusRef.current) return
        createStatusRef.current = true
        setCreateStatusPending(true)

        await addStatus(parseInt(backlogId), newStatus)
        setNewStatus({
            ...newStatus,
            Status_Name: ""
        })
        setLocalBacklog(undefined)
        readBacklogById(parseInt(backlogId))

        createStatusRef.current = false
        setCreateStatusPending(false)
    };

    // Delete backlog from backend
    const handleDeleteBacklog = async () => {
        if (!localBacklog || !localBacklog.Backlog_ID) return

        try {
            await removeBacklog(
                localBacklog.Backlog_ID,
                localBacklog.Project_ID,
                `/project/${convertID_NameStringToURLFormat(localBacklog.Project_ID, localBacklog.project?.Project_Name ?? "")}`
            );
            dispatch(setSnackMessage("Backlog deleted."))
            // optionally redirect or clear state
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to delete backlog."))
        }
    };

    // ---- Render ----
    const backlogEditProps: BacklogEditProps = {
        localBacklog,
        newStatus,
        authUser,
        canAccessBacklog,
        canManageBacklog,
        editPending,
        createStatusPending,
        saveStatusPending,
        moveStatusPending,
        setNewStatus,
        handleBacklogInputChange,
        handleBacklogChange,
        handleSaveBacklogChanges,
        handleSaveStatusChanges,
        ifEnterSaveStatus,
        handleCreateStatus,
        ifEnterCreateStatus,
        handleDeleteBacklog,
        handleMoveStatusChanges,
        handleAssignDefaultStatus,
        handleAssignClosedStatus,
        removeStatus,
        convertID_NameStringToURLFormat,
        showEditToggles,
        setShowEditToggles
    }

    return <BacklogEdit {...backlogEditProps} />
};
