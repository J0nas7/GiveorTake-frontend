"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// Internal
import { BacklogCreate, BacklogCreateProps } from '@/components/backlog';
import { useBacklogsContext, useProjectsContext } from "@/contexts";
import { useURLLink } from "@/hooks";
import useRoleAccess from "@/hooks/useRoleAccess";
import { AppDispatch, selectAuthUser, setSnackMessage, useTypedSelector } from "@/redux";
import { Backlog, BacklogFields } from "@/types";
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

export const BacklogCreateView: React.FC = () => {
    // ---- Hooks ----
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter();
    const { projectLink } = useParams<{ projectLink: string }>();
    const { projectById, readProjectById } = useProjectsContext();
    const { addBacklog } = useBacklogsContext();
    const { linkId: projectId, convertID_NameStringToURLFormat } = useURLLink(projectLink)
    const { canManageProject } = useRoleAccess(
        projectById ? projectById.team?.organisation?.User_ID : undefined,
        "project",
        projectById ? projectById.Project_ID : 0
    )

    // ---- State ----
    const authUser = useTypedSelector(selectAuthUser);
    const [newBacklog, setNewBacklog] = useState<Backlog>({
        Project_ID: parseInt(projectId),
        Backlog_Name: "",
        Backlog_Description: "",
        Backlog_IsPrimary: false,
        Backlog_StartDate: "",
        Backlog_EndDate: "",
    })
    // const [createPending, setCreatePending] = useState<boolean>(false)
    const submittingRef = useRef<boolean>(false)

    // ---- Effects ----
    useEffect(() => {
        if (projectId) readProjectById(parseInt(projectId));
    }, [projectId]);

    useEffect(() => {
        if (projectById && authUser && !canManageProject) {
            router.push(`/project/${convertID_NameStringToURLFormat(parseInt(projectId), projectById.Project_Name)}`);
        }
    }, [projectById]);

    // ---- Methods ----
    const handleInputChange = (field: BacklogFields, value: string | boolean) => {
        setNewBacklog((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const { mutate: doCreateBacklog, isPending: createPending } = useMutation({
        mutationFn: () => addBacklog(parseInt(projectId), newBacklog),
    });

    const handleSubmit = async () => {
        if (submittingRef.current) return;
        if (!projectById) return;
        if (!newBacklog.Backlog_Name.trim()) {
            dispatch(setSnackMessage("Please enter a backlog name."));
            return;
        }

        submittingRef.current = true;
        doCreateBacklog(undefined, {
            onSuccess: () => {
                router.push(
                    `/project/${convertID_NameStringToURLFormat(
                        parseInt(projectId),
                        projectById.Project_Name
                    )}`
                );
            },
            onError: (error: any) => {
                console.error("Error creating backlog:", error);
            },
            onSettled: () => {
                submittingRef.current = false;
            },
        });
    };

    const backlogCreateProps: BacklogCreateProps = {
        projectById,
        canManageProject,
        newBacklog,
        createPending,
        handleInputChange,
        handleSubmit,
        convertID_NameStringToURLFormat
    }

    return <BacklogCreate {...backlogCreateProps} />
};
