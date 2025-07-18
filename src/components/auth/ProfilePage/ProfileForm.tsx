import { Block } from "@/components/ui/block-text";
import styles from "@/core-ui/styles/modules/User.settings.module.scss";
import React from "react";
import { ProfileProps } from "./Profile";

type ProfileFormProps = Pick<
    ProfileProps,
    "renderUser" |
    "handleChange" |
    "handleImageUpload" |
    "handleSaveChanges" |
    "handleDeleteUser" |
    "imagePreview" |
    "accessToken" |
    "Canvas"
>

export const ProfileForm: React.FC<ProfileFormProps> = (props) => (
    <div className={styles.userDetailsForm}>
        <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>First Name</label>
            <input type="text" id="firstName" name="User_FirstName" value={props.renderUser?.User_FirstName} onChange={props.handleChange} className={styles.input} />
        </div>

        <div className={styles.formGroup}>
            <label htmlFor="surname" className={styles.label}>Surname</label>
            <input type="text" id="surname" name="User_Surname" value={props.renderUser?.User_Surname} onChange={props.handleChange} className={styles.input} />
        </div>

        <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input type="email" id="email" name="User_Email" value={props.renderUser?.User_Email} onChange={props.handleChange} className={styles.input} />
        </div>

        <div className={styles.formGroup}>
            <label className={styles.label}>Profile Image</label>
            <div className={styles.profileImageContainer}>
                {props.imagePreview ? (
                    <img src={props.imagePreview} alt="User Profile" className={styles.userProfileImage} />
                ) : (
                    <div className={styles.noImage}>No image</div>
                )}
                <input type="file" onChange={props.handleImageUpload} className={styles.imageUploadInput} accept="image/*" />
            </div>
        </div>

        <div className={styles.formGroup}>
            <props.Canvas text={props.accessToken!.toString()} />
        </div>

        {props.renderUser?.User_DeletedAt ? (
            <div className={styles.deletedMessage}>
                <p>This user has been deleted.</p>
            </div>
        ) : (
            <Block className={styles.formActions}>
                <button onClick={props.handleSaveChanges} className="button-blue">Save Changes</button>
                <button onClick={props.handleDeleteUser} className="blue-link-light red-link-light">Delete User</button>
            </Block>
        )}
    </div>
);
