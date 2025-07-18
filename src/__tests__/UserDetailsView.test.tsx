// External
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

// Internal
import { UserDetailsView, UserDetailsViewProps } from '@/components/auth/ProfilePage/ProfileView';
import { TeamUserSeat } from '@/types';

// Mock components used inside UserDetailsView
jest.mock('@/components/ui/heading', () => ({
    Heading: ({ variant, children }: { variant: string, children: React.ReactNode }) => <h1>{children}</h1>,
}));

const mockHandleChange = jest.fn();
const mockHandleImageUpload = jest.fn();
const mockHandleSaveChanges = jest.fn();
const mockHandleDeleteUser = jest.fn();

const defaultProps: UserDetailsViewProps = {
    user: {
        User_ID: 1,
        User_FirstName: 'John',
        User_Surname: 'Doe',
        User_Email: 'john.doe@example.com',
        User_ImageSrc: 'https://via.placeholder.com/150',
        User_Status: 'Active'
    },
    imagePreview: 'https://via.placeholder.com/150',
    userTeams: [
        {
            Seat_ID: 1,
            User_ID: 1,
            Seat_Role: 'Admin',
            Seat_Status: 'Active',
            team: { Team_ID: 1, Team_Name: 'Team A' },
        } as TeamUserSeat,
    ],
    handleChange: mockHandleChange,
    handleImageUpload: mockHandleImageUpload,
    handleSaveChanges: mockHandleSaveChanges,
    handleDeleteUser: mockHandleDeleteUser,
};

describe('UserDetailsView', () => {
    it('should render user details correctly when props are provided', () => {
        render(<UserDetailsView {...defaultProps} />);

        expect(screen.getByText('Edit User Details')).toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
        expect(screen.getByLabelText(/surname/i)).toHaveValue('Doe');
        expect(screen.getByLabelText(/email/i)).toHaveValue('john.doe@example.com');
        expect(screen.getByAltText('User Profile')).toHaveAttribute('src', 'https://via.placeholder.com/150');
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
        expect(screen.getByText('Delete User')).toBeInTheDocument();
    });

    it('should display "No image" if imagePreview is undefined', () => {
        const propsWithoutImagePreview = { ...defaultProps, imagePreview: undefined };
        render(<UserDetailsView {...propsWithoutImagePreview} />);

        expect(screen.getByText('No image')).toBeInTheDocument();
    });

    it('should display "This user has been deleted" if the user is deleted', () => {
        const deletedUserProps = {
            ...defaultProps
        };
        render(<UserDetailsView {...deletedUserProps} />);

        expect(screen.getByText('This user has been deleted.')).toBeInTheDocument();
        expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it('should call handleSaveChanges when Save Changes button is clicked', () => {
        render(<UserDetailsView {...defaultProps} />);

        fireEvent.click(screen.getByText('Save Changes'));
        expect(mockHandleSaveChanges).toHaveBeenCalled();
    });

    it('should call handleDeleteUser when Delete User button is clicked', () => {
        render(<UserDetailsView {...defaultProps} />);

        fireEvent.click(screen.getByText('Delete User'));
        expect(mockHandleDeleteUser).toHaveBeenCalled();
    });

    it('should render "This user is not part of any teams" when userTeams is empty', () => {
        const propsWithoutTeams = { ...defaultProps, userTeams: [] };
        render(<UserDetailsView {...propsWithoutTeams} />);

        expect(screen.getByText('This user is not part of any teams.')).toBeInTheDocument();
    });

    it('should render team information if userTeams are provided', () => {
        render(<UserDetailsView {...defaultProps} />);

        expect(screen.getByText('Team Role: Admin')).toBeInTheDocument();
        expect(screen.getByText('Status: Active')).toBeInTheDocument();
        expect(screen.getByText('Team Name: Team A')).toBeInTheDocument();
    });

    it('should handle undefined or null imagePreview', () => {
        const propsWithUndefinedUser = { ...defaultProps, imagePreview: undefined };
        render(<UserDetailsView {...propsWithUndefinedUser} />);

        expect(screen.getByText('Loading user details...')).toBeInTheDocument();
    });

    it('should render "This user is not part of any teams" when userTeams is an empty array', () => {
        const propsWithEmptyUserTeams = { ...defaultProps, userTeams: [] }; // userTeams is an empty array
        render(<UserDetailsView {...propsWithEmptyUserTeams} />);

        expect(screen.getByText('This user is not part of any teams.')).toBeInTheDocument();
    });

});

describe('UserDetailsView Edge Cases', () => {
    it('should render "Loading user details..." if user data is null or undefined', () => {
        const propsWithNullUser = { ...defaultProps, user: undefined };
        render(<UserDetailsView {...propsWithNullUser} />);

        expect(screen.getByText('Loading user details...')).toBeInTheDocument();
    });

    it('should handle malformed user data gracefully (missing required fields)', () => {
        const propsWithMissingFields = {
            ...defaultProps,
            user: {
                ...defaultProps.user,
                User_FirstName: '', // Empty first name
                User_Surname: '',   // Empty surname
                User_Status: '',
                User_Email: ''
            },
        };
        render(<UserDetailsView {...propsWithMissingFields} />);

        expect(screen.getByLabelText(/first name/i)).toHaveValue('');
        expect(screen.getByLabelText(/surname/i)).toHaveValue('');
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('should render "This user is not part of any teams" when userTeams is null', () => {
        const propsWithNullTeams = { ...defaultProps, userTeams: [] };
        render(<UserDetailsView {...propsWithNullTeams} />);

        expect(screen.getByText('This user is not part of any teams.')).toBeInTheDocument();
    });

    it('should render "No image" when imagePreview is undefined and no file is uploaded', () => {
        const propsWithUndefinedImagePreview = { ...defaultProps, imagePreview: undefined };
        render(<UserDetailsView {...propsWithUndefinedImagePreview} />);

        expect(screen.getByText('No image')).toBeInTheDocument();
    });

    it('should call handleSaveChanges even with invalid data (empty fields)', () => {
        const propsWithInvalidData = {
            ...defaultProps,
            user: {
                ...defaultProps.user,
                User_FirstName: '', // Empty first name
                User_Surname: '',   // Empty surname
                User_Status: '',
                User_Email: ''
            },
        };
        render(<UserDetailsView {...propsWithInvalidData} />);

        fireEvent.click(screen.getByText('Save Changes'));
        expect(mockHandleSaveChanges).toHaveBeenCalled();
    });
})
