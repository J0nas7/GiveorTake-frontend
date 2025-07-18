"use client";

// External
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { CookieValueTypes } from 'cookies-next';
import { IQRCode } from 'next-qrcode/dist/useQRCode';
import React from 'react';

// Internal
import { ProfileForm, ProfileHeader, ProfileOrganisation } from '@/components/auth';
import { Block } from '@/components/ui/block-text';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { Organisation, User } from '@/types';

export type ProfileProps = {
    renderUser: User | undefined;
    imagePreview: string | undefined;
    renderOrganisation: Organisation | undefined
    accessToken: CookieValueTypes
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSaveChanges: () => void;
    handleDeleteUser: () => void;
    Canvas: <T_1 extends HTMLCanvasElement>({ text, options, logo, }: IQRCode) => React.JSX.Element
}

export const Profile: React.FC<ProfileProps> = (props) => props.renderUser && (
    <Block className="page-content">
        <FlexibleBox
            title={`Profile Settings`}
            subtitle={`${props.renderUser.User_FirstName} ${props.renderUser.User_Surname}`}
            titleAction={
                <ProfileHeader />
            }
            icon={faUser}
            className="no-box w-auto inline-block"
            numberOfColumns={2}
        >
            <ProfileForm {...props} />
        </FlexibleBox>

        <ProfileOrganisation renderOrganisation={props.renderOrganisation} />
    </Block>
);
