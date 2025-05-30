"use client";

// External
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { faHouseChimney, faUser } from '@fortawesome/free-solid-svg-icons';
import { useQRCode } from 'next-qrcode';

// Internal
import { useUsersContext } from '@/contexts';
import { selectAuthUser, selectAuthUserOrganisation, selectAuthUserSeat, setSnackMessage, useAppDispatch, useTypedSelector } from '@/redux';
import { Organisation, TeamUserSeat, User } from '@/types';
import { Heading } from '@/components/ui/heading';
import styles from "@/core-ui/styles/modules/User.settings.module.scss";
import { Block, Text } from '@/components/ui/block-text';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { useCookies } from '@/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UserDetails: React.FC = () => {
    // Hooks
    const dispatch = useAppDispatch()
    const { saveUserChanges, removeUser } = useUsersContext()
    const authUserSeats = useTypedSelector(selectAuthUserSeat); // Redux
    
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

    return (
        <UserDetailsView
            user={renderUser}
            imagePreview={imagePreview}
            renderOrganisation={renderOrganisation}
            handleChange={handleChange}
            handleImageUpload={handleImageUpload}
            handleSaveChanges={handleSaveChanges}
            handleDeleteUser={handleDeleteUser}
        />
    );
};

export interface UserDetailsViewProps {
    user: User | undefined;
    imagePreview: string | undefined;
    renderOrganisation: Organisation | undefined
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSaveChanges: () => void;
    handleDeleteUser: () => void;
}

export const UserDetailsView: React.FC<UserDetailsViewProps> = ({
    user,
    imagePreview,
    renderOrganisation,
    handleChange,
    handleImageUpload,
    handleSaveChanges,
    handleDeleteUser,
}) => {
    const { Canvas } = useQRCode();
    const { getTheCookie } = useCookies()
    const accessToken = getTheCookie("accessToken")
    if (!user) return <p>Loading user details...</p>

    return (
        <Block className="page-content">
            <FlexibleBox
                title={`Profile Settings`}
                subtitle={`${user.User_FirstName} ${user.User_Surname}`}
                titleAction={
                    <Block className="flex gap-3 w-full">
                        {/* Home Link */}
                        <Link
                            href={`/`}
                            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
                        >
                            <FontAwesomeIcon icon={faHouseChimney} />
                            <Text variant="span">Go to Home</Text>
                        </Link>
                    </Block>
                }
                icon={faUser}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <div className={styles.userDetailsForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="firstName" className={styles.label}>First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="User_FirstName"
                            value={user.User_FirstName}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="surname" className={styles.label}>Surname</label>
                        <input
                            type="text"
                            id="surname"
                            name="User_Surname"
                            value={user.User_Surname}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="User_Email"
                            value={user.User_Email}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Profile Image</label>
                        <div className={styles.profileImageContainer}>
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="User Profile"
                                    className={styles.userProfileImage}
                                />
                            ) : (
                                <div className={styles.noImage}>No image</div>
                            )}
                            <input
                                type="file"
                                onChange={handleImageUpload}
                                className={styles.imageUploadInput}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <Canvas text={accessToken!.toString()} />
                    </div>

                    {user.User_DeletedAt ? (
                        <div className={styles.deletedMessage}>
                            <p>This user has been deleted.</p>
                        </div>
                    ) : (
                        <Block className={styles.formActions}>
                            <button onClick={handleSaveChanges} className="button-blue">
                                Save Changes
                            </button>
                            <button onClick={handleDeleteUser} className="blue-link-light red-link-light">
                                Delete User
                            </button>
                        </Block>
                    )}
                </div>
            </FlexibleBox>

            {/* Display the teams the user is a part of */}
            <div className={styles.userTeamsContainer}>
                <Heading variant="h3" className={styles.teamsHeading}>Organisation this user is a part of</Heading>
                {renderOrganisation ? (
                    <ul className={styles.teamsList}>
                        <li className={styles.teamItem}>
                            <p>
                                <strong>Organisation Name:</strong>{" "}
                                <Link
                                    href={`/organisation/${renderOrganisation.Organisation_ID}`}
                                    className="blue-link-light"
                                >
                                    {renderOrganisation.Organisation_Name}
                                </Link>
                            </p>
                        </li>
                    </ul>
                ) : (
                    <p>This user is not part of any organisation.</p>
                )}
            </div>
        </Block>
    );
};

export default UserDetails;
