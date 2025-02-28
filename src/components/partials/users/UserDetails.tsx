"use client";

import React, { useState, useEffect } from 'react';
import { useTeamUserSeatsContext, useUsersContext } from '@/contexts';
import { selectAuthUser, useTypedSelector } from '@/redux';
import { TeamUserSeat, User } from '@/types';
import { Heading } from '@/components/ui/heading';
import styles from "@/core-ui/styles/modules/User.settings.module.scss";
import Link from 'next/link';

const UserDetails: React.FC = () => {
    // Get user data and the save function from context
    const { saveUserChanges, removeUser } = useUsersContext();
    const { teamUserSeatsById } = useTeamUserSeatsContext();
    const [user, setUser] = useState<User | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(user?.User_ImageSrc);

    // Redux
    const authUser = useTypedSelector(selectAuthUser);

    // Set initial user data when the component mounts
    useEffect(() => {
        if (authUser) {
            setUser(authUser);
            setImagePreview(authUser.User_ImageSrc);
        }
    }, [authUser]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (user) {
            const { name, value } = e.target;
            setUser((prevState) => ({
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
                if (user) {
                    setUser((prevState) => ({
                        ...prevState!,
                        User_ImageSrc: reader.result as string,
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission (saving user changes)
    const handleSaveChanges = () => {
        if (user) {
            saveUserChanges(user, 0)
        }
    };

    // Handle user deletion
    const handleDeleteUser = () => {
        if (user) {
            removeUser(user.User_ID, 0);
        }
    };

    // Get teams the user is a part of
    const userTeams: TeamUserSeat[] = Array.isArray(teamUserSeatsById)
        ? teamUserSeatsById.filter((seat) => seat.User_ID === user?.User_ID)
        : []

    if (!user) return <p>Loading user details...</p>;

    return (
        <div className={styles.userDetailsContainer}>
            <div className={styles.userDetailsForm}>
                <Heading variant="h2" className={styles.heading}>Edit User Details</Heading>

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

                {user.User_DeletedAt ? (
                    <div className={styles.deletedMessage}>
                        <p>This user has been deleted.</p>
                    </div>
                ) : (
                    <div className={styles.formActions}>
                        <button className={styles.saveButton} onClick={handleSaveChanges}>
                            Save Changes
                        </button>
                        <button className={styles.deleteButton} onClick={handleDeleteUser}>
                            Delete User
                        </button>
                    </div>
                )}
            </div>

            {/* Display the teams the user is a part of */}
            <div className={styles.userTeamsContainer}>
                <Heading variant="h3" className={styles.teamsHeading}>Teams/Organisations this user is a part of</Heading>
                {userTeams.length > 0 ? (
                    <ul className={styles.teamsList}>
                        {userTeams.map((seat) => (
                            <li key={seat.Seat_ID} className={styles.teamItem}>
                                <p><strong>Team Role:</strong> {seat.Seat_Role}</p>
                                <p><strong>Status:</strong> {seat.Seat_Status}</p>
                                {/* The team name is stored in `seat.team?.name` */}
                                <p>
                                    <strong>Team Name:</strong>{" "}
                                    <Link 
                                        href={`/team/${seat.team?.Team_ID}`}
                                        className="blue-link"
                                    >
                                        {seat.team?.Team_Name}
                                    </Link>
                                </p>
                                <p>
                                    <strong>Organisation Name:</strong>{" "}
                                    <Link 
                                        href={`/organisation/${seat.team?.organisation?.Organisation_ID}`}
                                        className="blue-link"
                                    >
                                        {seat.team?.organisation?.Organisation_Name}
                                    </Link>
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>This user is not part of any teams.</p>
                )}
            </div>
        </div>
    );
};

export default UserDetails;
