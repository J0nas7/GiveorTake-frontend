"use client";

// External
import React from "react";

// Internal
import { Start, StartProps } from '@/components/auth';
import { useOrganisationsContext } from "@/contexts";
import { selectAuthUser, useTypedSelector } from "@/redux";

export const StartView = () => {
    // Hooks
    const { organisationsById, readOrganisationsByUserId } = useOrganisationsContext();

    // State
    const authUser = useTypedSelector(selectAuthUser);

    // Effects
    React.useEffect(() => {
        if (authUser && authUser.User_ID) readOrganisationsByUserId(authUser.User_ID);
        document.title = "Welcome - GiveOrTake";
    }, [authUser]);

    const startProps: StartProps = {
        authUser,
        organisationsById
    }

    return <Start {...startProps} />
};
