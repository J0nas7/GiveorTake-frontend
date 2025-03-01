// External
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Internal
import { TeamUserSeatsView, TeamUserSeatsViewProps } from '@/components/partials/team/TeamUserSeatsManager';
import { TeamUserSeat, User, Team, Organisation } from '@/types';

// Mocks for props
const mockHandleSelectSeat = jest.fn();
const mockHandleRemoveSeat = jest.fn();
const mockHandleSaveChanges = jest.fn();
const mockHandleSeatChange = jest.fn();
const mockHandleUserInputChange = jest.fn();
const mockHandleCreateNewUser = jest.fn();
const mockSetNewUserDetails = jest.fn();

// Mock data for the props
const mockUser: User = {
    User_ID: 1,
    User_Status: 'active',
    User_Email: 'john.doe@example.com',
    User_FirstName: 'John',
    User_Surname: 'Doe',
    User_ImageSrc: 'imageSrc',
    User_CreatedAt: '2021-01-01',
    User_UpdatedAt: '2021-01-02',
};

const mockAuthUser: User = {
    User_ID: 1,
    User_Status: 'active',
    User_Email: 'authuser@example.com',
    User_FirstName: 'Auth',
    User_Surname: 'User',
    User_ImageSrc: 'authImageSrc',
    User_CreatedAt: '2021-02-01',
    User_UpdatedAt: '2021-02-02',
};

const mockTeam: Team = {
    Team_ID: 1,
    Organisation_ID: 1,
    Team_Name: 'Team A',
    Team_Description: 'This is Team A.',
    Team_CreatedAt: '2021-01-01',
    Team_UpdatedAt: '2021-01-02',
    organisation: {
        Organisation_ID: 1,
        User_ID: 1,
        Organisation_Name: 'Org A',
        Organisation_CreatedAt: '2021-01-01',
        Organisation_UpdatedAt: '2021-01-02',
    },
    user_seats: [],
    projects: [],
    tasks: [],
};

const mockOrganisation: Organisation = {
    Organisation_ID: 1,
    User_ID: 1,
    Organisation_Name: 'Org A',
    Organisation_CreatedAt: '2021-01-01',
    Organisation_UpdatedAt: '2021-01-02',
    teams: [mockTeam],
};

const mockTeamUserSeat: TeamUserSeat = {
    Seat_ID: 1,
    Team_ID: 1,
    User_ID: 1,
    Seat_Role: 'user',
    Seat_Status: 'active',
    Seat_Role_Description: 'A regular user',
    Seat_Permissions: ['view', 'edit'],
    Seat_CreatedAt: '2021-01-01',
    Seat_UpdatedAt: '2021-01-02',
    team: mockTeam,
    user: mockUser,
};

const selectedSeat: TeamUserSeat = {
    Seat_ID: 1,
    Team_ID: 1,
    User_ID: 1,
    Seat_Role: 'user',
    Seat_Status: 'active',
    Seat_Role_Description: 'A regular user',
    Seat_Permissions: ['view', 'edit'],
    Seat_CreatedAt: '2021-01-01',
    Seat_UpdatedAt: '2021-01-02',
    team: mockTeam,
    user: mockUser,
};

// Default props with a complete mock setup
const defaultProps: TeamUserSeatsViewProps = {
    renderUserSeats: [mockTeamUserSeat],
    renderTeam: mockTeam,
    authUser: mockAuthUser,  // Here we pass the mockAuthUser as the authUser
    selectedSeat: undefined,  // Default empty seat
    newUserDetails: { email: '', firstName: '', lastName: '', role: 'user', status: 'active' },
    handleSelectSeat: mockHandleSelectSeat,
    handleRemoveSeat: mockHandleRemoveSeat,
    handleSaveChanges: mockHandleSaveChanges,
    handleSeatChange: mockHandleSeatChange,
    handleUserInputChange: mockHandleUserInputChange,
    handleCreateNewUser: mockHandleCreateNewUser,
    setNewUserDetails: mockSetNewUserDetails,
};

describe('TeamUserSeatsView', () => {
    it('renders with complete props', () => {
        render(<TeamUserSeatsView {...defaultProps} />);
        
        // Check if the page elements render correctly
        expect(screen.getByText('Manage Team User Seats')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('user')).toBeInTheDocument();
        expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('renders a message when no seats are available (empty renderUserSeats)', () => {
        render(<TeamUserSeatsView {...defaultProps} renderUserSeats={[]} />);

        // Should render a message indicating no user seats
        expect(screen.getByText('No seats available')).toBeInTheDocument();
    });

    it('does not render the edit form when selectedSeat is undefined', () => {
        render(<TeamUserSeatsView {...defaultProps} selectedSeat={undefined} />);
        
        // Should not render the seat edit form since selectedSeat is undefined
        expect(screen.queryByText('Edit User Seat')).not.toBeInTheDocument();
    });

    it('renders seat edit form when selectedSeat is defined', () => {
        render(<TeamUserSeatsView {...defaultProps} selectedSeat={selectedSeat} />);
        
        // Should render the edit form when selectedSeat is provided
        expect(screen.getByText('Edit User Seat')).toBeInTheDocument();
        expect(screen.getByLabelText('User Role')).toHaveValue('user');
    });

    it('handles incomplete newUserDetails (email missing)', () => {
        render(<TeamUserSeatsView {...defaultProps} newUserDetails={{ email: '', firstName: '', lastName: '', role: 'user', status: 'active' }} />);
        
        // Check if the input fields render and are editable, even if email is empty
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    });

    it('handles incomplete newUserDetails (first name missing)', () => {
        render(<TeamUserSeatsView {...defaultProps} newUserDetails={{ email: 'john@example.com', firstName: '', lastName: 'Doe', role: 'user', status: 'active' }} />);
        
        // Check if the first name input field is rendered as empty
        expect(screen.getByLabelText('First Name')).toHaveValue('');
    });

    it('calls handleSaveChanges when Save Changes button is clicked', () => {
        render(<TeamUserSeatsView {...defaultProps} selectedSeat={selectedSeat} />);
        
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);

        expect(mockHandleSaveChanges).toHaveBeenCalledTimes(1);
    });

    it('calls handleCreateNewUser when Create and Assign Seat button is clicked', () => {
        render(<TeamUserSeatsView {...defaultProps} />);
        
        const createButton = screen.getByText('Create and Assign Seat');
        fireEvent.click(createButton);

        expect(mockHandleCreateNewUser).toHaveBeenCalledTimes(1);
    });

    it('calls handleSeatChange when seat role is modified', () => {
        render(<TeamUserSeatsView {...defaultProps} selectedSeat={selectedSeat} />);
        
        const roleInput = screen.getByLabelText('User Role');
        fireEvent.change(roleInput, { target: { value: 'admin' } });

        expect(mockHandleSeatChange).toHaveBeenCalledWith('Seat_Role', 'admin');
    });

    it('handles seat removal properly', () => {
        const seat = { Seat_ID: 1, Seat_Role: 'user', Seat_Status: 'active' };
        render(<TeamUserSeatsView {...defaultProps} />);
        
        const removeButton = screen.getByText('Remove');
        fireEvent.click(removeButton);

        expect(mockHandleRemoveSeat).toHaveBeenCalledWith(seat.Seat_ID);
    });
});

describe('TeamUserSeatsView - Edge Cases', () => {

    it('handles a user with no image source', () => {
        const mockUserWithoutImage: User = {
            User_ID: 1,
            User_Status: 'active',
            User_Email: 'jane.doe@example.com',
            User_FirstName: 'Jane',
            User_Surname: 'Doe',
            User_ImageSrc: undefined,  // No image source
            User_CreatedAt: '2021-01-01',
            User_UpdatedAt: '2021-01-02',
        };

        render(<TeamUserSeatsView {...defaultProps} authUser={mockUserWithoutImage} />);

        // Should render the user name correctly even if no image is present
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.queryByAltText('User Image')).toBeNull(); // No image should be displayed
    });

    it('handles a user with an invalid role', () => {
        const mockUserWithInvalidRole: TeamUserSeat = {
            ...mockTeamUserSeat,
            Seat_Role: 'invalid_role', // Invalid role
        };

        render(<TeamUserSeatsView {...defaultProps} renderUserSeats={[mockUserWithInvalidRole]} />);

        // Should render the invalid role and show a warning/error message
        expect(screen.getByText('invalid_role')).toBeInTheDocument();
    });

    it('renders with no user seats (empty user_seats array)', () => {
        render(<TeamUserSeatsView {...defaultProps} renderUserSeats={[]} />);
        
        // Should render a message saying no user seats are available
        expect(screen.getByText('No seats available')).toBeInTheDocument();
    });

    it('handles edge case with user seat having no role description', () => {
        const mockSeatWithoutRoleDescription: TeamUserSeat = {
            ...mockTeamUserSeat,
            Seat_Role_Description: undefined, // No role description
        };

        render(<TeamUserSeatsView {...defaultProps} renderUserSeats={[mockSeatWithoutRoleDescription]} />);
        
        // Should render the seat without a role description, but still show the role
        expect(screen.getByText('user')).toBeInTheDocument();
        expect(screen.queryByText('A regular user')).toBeNull(); // No role description
    });

    it('handles edge case when no teams are available in the organisation', () => {
        const mockOrganisationWithoutTeams: Organisation = {
            Organisation_ID: 1,
            User_ID: 1,
            Organisation_Name: 'Org A',
            Organisation_CreatedAt: '2021-01-01',
            Organisation_UpdatedAt: '2021-01-02',
            teams: [], // No teams available
        };

        render(<TeamUserSeatsView {...defaultProps} renderTeam={undefined} />);

        // Should render a message saying no teams are available
        expect(screen.getByText('No teams available')).toBeInTheDocument();
    });

});
