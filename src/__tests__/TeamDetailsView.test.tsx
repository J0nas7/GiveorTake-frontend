// External
import { render, screen, fireEvent } from '@testing-library/react';

// Internal
import { Team, User } from '@/types'; // Ensure types are correct
import { TeamDetailsView } from '@/components/partials/team/TeamDetails';

// Mock data
const mockTeam: Team = {
    Team_ID: 1,
    Organisation_ID: 1,
    Team_Name: "Test Team",
    Team_Description: "Test Description",
    Team_CreatedAt: "2025-01-01",
    Team_UpdatedAt: "2025-03-01",
    organisation: {
        Organisation_ID: 1,
        User_ID: 123,
        Organisation_Name: "Test Organisation",
        Organisation_Description: "A sample organisation.",
        Organisation_CreatedAt: "2020-01-01",
        Organisation_UpdatedAt: "2025-01-01",
    },
    projects: [
        {
            Project_ID: 1,
            Team_ID: 1,
            Project_Name: "Test Project",
            Project_Description: "Test Project Description",
            Project_Status: "Active",
            Project_Start_Date: "2025-01-01",
            Project_End_Date: "2025-12-31",
        },
    ],
};

// Mocks for the event handlers
const mockHandleHTMLInputChange = jest.fn();
const mockHandleTeamChange = jest.fn();
const mockHandleSaveChanges = jest.fn();

// Mock authUser
const mockAuthUser: User = {
    User_ID: 123,
    User_Status: "Active",
    User_Email: "testuser@example.com",
    User_FirstName: "Test",
    User_Surname: "User",
    User_ImageSrc: "/path/to/image.jpg",
    User_CreatedAt: "2022-01-01",
    User_UpdatedAt: "2025-01-01",
};

describe('TeamDetailsView', () => {
    it('should render the TeamDetailsView with valid props', () => {
        render(
            <TeamDetailsView
                team={mockTeam}
                authUser={mockAuthUser}
                handleHTMLInputChange={mockHandleHTMLInputChange}
                handleTeamChange={mockHandleTeamChange}
                handleSaveChanges={mockHandleSaveChanges}
                pathname="/team/1"
            />
        );

        // Check if the team name is rendered
        expect(screen.getByText(/Test Team/)).toBeInTheDocument();
        // Check if the description is rendered
        expect(screen.getByText(/Test Description/)).toBeInTheDocument();
        // Check if the Save Changes button is rendered
        expect(screen.getByRole('button', { name: /Save Changes/ })).toBeInTheDocument();
    });

    it('should render Team Details when authUser is not the owner', () => {
        const mockAuthUserNotOwner: User = {
            User_ID: 999,
            User_Status: "Active",
            User_Email: "anotheruser@example.com",
            User_FirstName: "Another",
            User_Surname: "User",
            User_ImageSrc: "/path/to/image.jpg",
            User_CreatedAt: "2020-01-01",
            User_UpdatedAt: "2025-01-01",
        };

        render(
            <TeamDetailsView
                team={mockTeam}
                authUser={mockAuthUserNotOwner}
                handleHTMLInputChange={mockHandleHTMLInputChange}
                handleTeamChange={mockHandleTeamChange}
                handleSaveChanges={mockHandleSaveChanges}
                pathname="/team/1"
            />
        );

        // Expect the team name to be rendered
        expect(screen.getByText(/Test Team/)).toBeInTheDocument();
        // Expect the description to be rendered
        expect(screen.getByText(/Test Description/)).toBeInTheDocument();
        // Expect the "Edit Team Details" to not be present
        expect(screen.queryByText(/Edit Team Details/)).not.toBeInTheDocument();
    });

    it('should not crash if team is undefined or null', () => {
        render(
            <TeamDetailsView
                team={undefined as any}
                authUser={mockAuthUser}
                handleHTMLInputChange={mockHandleHTMLInputChange}
                handleTeamChange={mockHandleTeamChange}
                handleSaveChanges={mockHandleSaveChanges}
                pathname="/team/1"
            />
        );

        // Ensure no crashing or errors in console, you can check if loading state or fallback is rendered.
        expect(screen.queryByText(/Team Settings/)).toBeNull();
    });

    it('should not crash if authUser is undefined or null', () => {
        render(
            <TeamDetailsView
                team={mockTeam}
                authUser={undefined}
                handleHTMLInputChange={mockHandleHTMLInputChange}
                handleTeamChange={mockHandleTeamChange}
                handleSaveChanges={mockHandleSaveChanges}
                pathname="/team/1"
            />
        );

        // Expect team details to render without user-specific actions
        expect(screen.getByText(/Test Team/)).toBeInTheDocument();
        expect(screen.getByText(/Test Description/)).toBeInTheDocument();
        expect(screen.queryByText(/Handle Seats/)).toBeNull();
    });

    it('should handle Save Changes button click', () => {
        render(
            <TeamDetailsView
                team={mockTeam}
                authUser={mockAuthUser}
                handleHTMLInputChange={mockHandleHTMLInputChange}
                handleTeamChange={mockHandleTeamChange}
                handleSaveChanges={mockHandleSaveChanges}
                pathname="/team/1"
            />
        );

        // Simulate button click
        const saveButton = screen.getByRole('button', { name: /Save Changes/ });
        fireEvent.click(saveButton);

        // Expect handleSaveChanges to be called once
        expect(mockHandleSaveChanges).toHaveBeenCalledTimes(1);
    });

    it('should handle team name input change', () => {
        render(
            <TeamDetailsView
                team={mockTeam}
                authUser={mockAuthUser}
                handleHTMLInputChange={mockHandleHTMLInputChange}
                handleTeamChange={mockHandleTeamChange}
                handleSaveChanges={mockHandleSaveChanges}
                pathname="/team/1"
            />
        );

        // Simulate input change for team name
        const teamNameInput = screen.getByLabelText(/Team Name/);
        fireEvent.change(teamNameInput, { target: { value: 'New Team Name' } });

        // Expect handleHTMLInputChange to be called once
        expect(mockHandleHTMLInputChange).toHaveBeenCalledTimes(1);
    });

    it('should handle team description change', () => {
        render(
            <TeamDetailsView
                team={mockTeam}
                authUser={mockAuthUser}
                handleHTMLInputChange={mockHandleHTMLInputChange}
                handleTeamChange={mockHandleTeamChange}
                handleSaveChanges={mockHandleSaveChanges}
                pathname="/team/1"
            />
        );

        // Simulate Quill text editor change using querySelector to target the editor by its class
        const quillEditor = document.querySelector('.ql-editor');
        if (quillEditor) {
            fireEvent.input(quillEditor, { target: { value: 'New Team Description' } });

            // Expect handleTeamChange to be called once
            expect(mockHandleTeamChange).toHaveBeenCalledTimes(1);
        } else {
            throw new Error('Quill editor not found');
        }
    });
});
