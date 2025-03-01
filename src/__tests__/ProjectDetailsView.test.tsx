// External
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Internal
import { Project, User } from '@/types';
import { ProjectDetailsView } from '@/components/partials/project/ProjectDetails';

// Mock props
const mockProject: Project = {
    Project_ID: 1,
    Team_ID: 1,
    Project_Name: 'Test Project',
    Project_Status: 'Active',
    Project_Description: 'This is a test project',
    Project_Start_Date: '2025-01-01',
    Project_End_Date: '2025-12-31',
    // Assuming there are relationships, such as `team` and `organisation`:
    team: {
        Team_ID: 1,
        Organisation_ID: 1,
        Team_Name: 'Test Team',
        Team_Description: 'Test team description',
        Team_CreatedAt: '2023-01-01',
        Team_UpdatedAt: '2023-01-01'
    },
};

const mockAuthUser: User = {
    User_ID: 1,
    User_Status: 'Active',
    User_Email: 'john.doe@example.com',
    User_FirstName: 'John',
    User_Surname: 'Doe',
    User_ImageSrc: 'path_to_image.jpg',
};

// Mock the functions
const mockOnProjectChange = jest.fn();
const mockOnSaveChanges = jest.fn();

describe('ProjectDetailsView', () => {

    it('should render loading state when project is undefined', () => {
        render(<ProjectDetailsView project={undefined} authUser={mockAuthUser} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render loading state when authUser is undefined', () => {
        render(<ProjectDetailsView project={mockProject} authUser={undefined} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render editable project details for the authenticated user', async () => {
        render(<ProjectDetailsView project={mockProject} authUser={mockAuthUser} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        // Assert that the inputs are displayed
        expect(screen.getByLabelText('Project Name')).toHaveValue('Test Project');
        expect(screen.getByLabelText('Start Date')).toHaveValue('2025-01-01');
        expect(screen.getByLabelText('End Date')).toHaveValue('2025-12-31');

        // Assert that the "Save Changes" button is present
        const saveButton = screen.getByRole('button', { name: /Save Changes/i });
        expect(saveButton).toBeInTheDocument();
    });

    it('should call onProjectChange when project name is changed', async () => {
        render(<ProjectDetailsView project={mockProject} authUser={mockAuthUser} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        const projectNameInput = screen.getByLabelText('Project Name') as HTMLInputElement;
        fireEvent.change(projectNameInput, { target: { value: 'Updated Project Name' } });

        await waitFor(() => {
            expect(mockOnProjectChange).toHaveBeenCalledWith('Project_Name', 'Updated Project Name');
        });
    });

    it('should call onSaveChanges when Save button is clicked', async () => {
        render(<ProjectDetailsView project={mockProject} authUser={mockAuthUser} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        const saveButton = screen.getByRole('button', { name: /Save Changes/i });
        fireEvent.click(saveButton);

        // Assert that the onSaveChanges function was called
        await waitFor(() => {
            expect(mockOnSaveChanges).toHaveBeenCalled();
        });
    });

    it('should render non-editable project details for non-authenticated user', () => {
        const mockAuthUserNonOwner: User = { // A user who is not the project owner
            User_ID: 2,
            User_Status: 'Active',
            User_Email: 'jane.doe@example.com',
            User_FirstName: 'Jane',
            User_Surname: 'Doe',
            User_ImageSrc: 'path_to_image.jpg',
        };

        render(<ProjectDetailsView project={mockProject} authUser={mockAuthUserNonOwner} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        // Assert that the project details are displayed but not editable
        expect(screen.getByText('Project Name:')).toBeInTheDocument();
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.queryByLabelText('Project Name')).toBeNull(); // No input field
        expect(screen.queryByRole('button', { name: /Save Changes/i })).toBeNull(); // No Save button
    });

    it('should handle null project and undefined authUser gracefully', () => {
        render(<ProjectDetailsView project={undefined} authUser={undefined} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        // Ensure it still handles cases where props are null/undefined
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not call onSaveChanges when the Save Changes button is clicked and the project is undefined', async () => {
        render(<ProjectDetailsView project={undefined} authUser={mockAuthUser} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        const saveButton = screen.queryByRole('button', { name: /Save Changes/i });
        if (saveButton) fireEvent.click(saveButton);

        // Ensure onSaveChanges is not called if the project is undefined
        expect(mockOnSaveChanges).not.toHaveBeenCalled();
    });
});

describe('ProjectDetailsView - Edge Cases', () => {
    it('should handle undefined fields in the project data gracefully', async () => {
        const mockProjectWithMissingFields = {
            ...mockProject,
            Project_Description: undefined,
            Project_Start_Date: undefined,
            Project_End_Date: undefined,
        };

        render(<ProjectDetailsView project={mockProjectWithMissingFields} authUser={mockAuthUser} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        expect(screen.getByText('Project Name:')).toBeInTheDocument();
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('No description available')).toBeInTheDocument();
        expect(screen.queryByLabelText('Start Date')).toBeNull(); // No start date input
        expect(screen.queryByLabelText('End Date')).toBeNull(); // No end date input
    });

    it('should handle invalid date formats gracefully', async () => {
        const mockProjectWithInvalidDates = {
            ...mockProject,
            Project_Start_Date: 'invalid-date',
            Project_End_Date: 'invalid-date',
        };

        render(<ProjectDetailsView project={mockProjectWithInvalidDates} authUser={mockAuthUser} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.queryByText('invalid-date')).toBeNull(); // Invalid dates should not be displayed
    });

    it('should render empty description properly when the project description is empty', () => {
        const mockProjectEmptyDescription = { ...mockProject, Project_Description: '' };

        render(<ProjectDetailsView project={mockProjectEmptyDescription} authUser={mockAuthUser} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('No description available')).toBeInTheDocument(); // Handle empty description
    });

    it('should handle missing or undefined project fields gracefully', () => {
        // Creating a mock project where some fields are missing (e.g., no description, no end date)
        const incompleteProject: Project = {
            Project_ID: 1,
            Team_ID: 1,
            Project_Name: 'Incomplete Project',
            Project_Status: 'Active',
            Project_Description: undefined,  // Missing description
            Project_Start_Date: '2025-01-01',
            Project_End_Date: undefined, // Missing end date
            team: {
                Team_ID: 1,
                Organisation_ID: 1,
                Team_Name: 'Test Team',
                Team_Description: 'Test team description',
                Team_CreatedAt: '2023-01-01',
                Team_UpdatedAt: '2023-01-01',
            },
        };

        render(<ProjectDetailsView project={incompleteProject} authUser={mockAuthUser} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        // Assert that the project details are displayed correctly even with missing fields
        expect(screen.getByText('Incomplete Project')).toBeInTheDocument(); // Project name should still be rendered
        expect(screen.queryByText('Test Team')).toBeInTheDocument(); // Team name should be rendered
        expect(screen.getByText('Project Name:')).toBeInTheDocument(); // Project name label should be present

        // Assert that missing fields don't break the UI (should handle gracefully)
        expect(screen.queryByText('Project Description:')).toBeInTheDocument(); // Project description label should still exist
        expect(screen.queryByText('No description available')).toBeInTheDocument(); // No description should be shown, instead of breaking the layout

        expect(screen.queryByText('End Date')).toBeInTheDocument(); // End date label should still exist
        expect(screen.queryByText('No end date available')).toBeInTheDocument(); // Missing end date should not cause an issue
    });

    it('should call onSaveChanges even when the project fields are unchanged', async () => {
        render(<ProjectDetailsView project={mockProject} authUser={mockAuthUser} onProjectChange={mockOnProjectChange} onSaveChanges={mockOnSaveChanges} />);

        const saveButton = screen.getByRole('button', { name: /Save Changes/i });
        fireEvent.click(saveButton);

        // Assert that the onSaveChanges function was called even if no fields were changed
        await waitFor(() => {
            expect(mockOnSaveChanges).toHaveBeenCalled();
        });
    });
});