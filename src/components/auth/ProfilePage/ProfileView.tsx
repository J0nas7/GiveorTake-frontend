"use client";

// External
import { useQRCode } from 'next-qrcode';
import React, { useEffect, useState } from 'react';

// Internal
import { Profile, ProfileProps } from '@/components/auth';
import { useUsersContext } from '@/contexts';
import { useCookies } from '@/hooks';
import { selectAuthUser, selectAuthUserOrganisation, selectAuthUserSeat, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux';
import { Organisation, User } from '@/types';

export const ProfileView: React.FC = () => {
    // Hooks
    const dispatch = useAppDispatch()
    const { saveUserChanges, removeUser } = useUsersContext()
    const authUserSeats = useTypedSelector(selectAuthUserSeat); // Redux
    const { Canvas } = useQRCode();
    const { getTheCookie } = useCookies()
    const accessToken = getTheCookie("accessToken")

    // State
    const authUserOrganisation = useTypedSelector(selectAuthUserOrganisation); // Redux
    const authUser = useTypedSelector(selectAuthUser); // Redux
    const [renderUser, setRenderUser] = useState<User | undefined>(undefined)
    const [renderOrganisation, setRenderOrganisation] = useState<Organisation | undefined>(undefined)
    const [imagePreview, setImagePreview] = useState<string | undefined>(renderUser?.User_ImageSrc);

    // Effects
    useEffect(() => {
        if (authUserSeats && authUserSeats.team?.projects?.[0]?.Project_ID) {
            setRenderOrganisation(authUserSeats.team?.organisation)
        } else if (authUserOrganisation && authUserOrganisation.teams?.[0].projects?.[0].Project_ID) {
            setRenderOrganisation(authUserOrganisation)
        }
    }, [authUserSeats, authUserOrganisation])

    // Set initial user data when the component mounts
    useEffect(() => {
        if (authUser) {
            setRenderUser(authUser);
            setImagePreview(authUser.User_ImageSrc);
        }
    }, [authUser]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (renderUser) {
            const { name, value } = e.target;
            setRenderUser((prevState) => ({
                ...prevState!,
                [name]: value,
            }));
        }
    };

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                if (renderUser) {
                    setRenderUser((prevState) => ({
                        ...prevState!,
                        User_ImageSrc: reader.result as string,
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission (saving user changes)
    const handleSaveChanges = async () => {
        if (renderUser) {
            const saveChanges = await saveUserChanges(renderUser, 0)

            dispatch(setSnackMessage(
                saveChanges ? "User changes saved successfully!" : "Failed to save user changes."
            ))
        }
    };

    // Handle user deletion
    const handleDeleteUser = () => {
        if (renderUser && renderUser.User_ID) {
            removeUser(renderUser.User_ID, 0, "/");
        }
    }

    // Render
    const profileProps: ProfileProps = {
        renderUser,
        imagePreview,
        renderOrganisation,
        accessToken,
        handleChange,
        handleImageUpload,
        handleSaveChanges,
        handleDeleteUser,
        Canvas
    }

    return <Profile {...profileProps} />
};
