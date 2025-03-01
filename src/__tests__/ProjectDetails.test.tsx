/*import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { useProjectsContext } from '@/contexts/';
import { selectAuthUser, useTypedSelector } from '@/redux';
import ProjectDetails from '@/components/partials/project/ProjectDetails';
import { ProjectsContextType } from '@/types';
import { useParams } from 'next/navigation';

// Mock the necessary context and redux hooks
jest.mock('@/contexts/', () => ({
    useProjectsContext: jest.fn()
}));

jest.mock('@/redux', () => ({
    useTypedSelector: jest.fn()
}));

describe('ProjectDetails logic tests', () => {
    let mockReadProjectById: jest.Mock;
    let mockSaveProjectChanges: jest.Mock;
    let mockSelectAuthUser: jest.Mock;
    let mockProjectById: any;

    beforeEach(() => {
        // Mock the context and selector hooks
        mockReadProjectById = jest.fn();
        mockSaveProjectChanges = jest.fn();
        mockSelectAuthUser = jest.fn();
        mockProjectById = {
            Project_ID: 1,
            Team_ID: 1,
            Project_Name: 'Test Project',
            Project_Status: 'Active',
            Project_Description: 'This is a test project',
            Project_Start_Date: '2025-01-01',
            Project_End_Date: '2025-12-31',
        };

        // Mock the return value of useProjectsContext with the correct structure
        useProjectsContext.mockReturnValue({
            projectById: mockProjectById,
            readProjectById: mockReadProjectById,
            saveProjectChanges: mockSaveProjectChanges,
        } as unknown as ProjectsContextType);

        // Mock the auth user selector from redux
        useTypedSelector.mockReturnValue({
            User_ID: 1, // Mock authenticated user
        });
    });

    it('should fetch and set project data on mount', async () => {
        render(<ProjectDetails />);

        // Assert that the project data is fetched
        expect(mockReadProjectById).toHaveBeenCalledWith(1);

        // Wait for project data to be rendered (you can assert based on the content or titles)
        await waitFor(() => {
            expect(screen.getByText('Test Project')).toBeInTheDocument();
        });
    });

    it('should update project state when input fields change', async () => {
        render(<ProjectDetails />);

        const projectNameInput = screen.getByLabelText('Project Name') as HTMLInputElement;
        fireEvent.change(projectNameInput, { target: { value: 'Updated Project Name' } });

        // Assert that the state is updated correctly
        await waitFor(() => {
            expect(screen.getByLabelText('Project Name').value).toBe('Updated Project Name');
        });

        // Ensure that save hasn't been called yet
        expect(mockSaveProjectChanges).not.toHaveBeenCalled();
    });

    it('should call saveProjectChanges when Save button is clicked', async () => {
        render(<ProjectDetails />);

        const saveButton = screen.getByRole('button', { name: /Save Changes/i });
        fireEvent.click(saveButton);

        // Ensure that saveProjectChanges is called with the correct parameters
        expect(mockSaveProjectChanges).toHaveBeenCalledWith(mockProjectById, mockProjectById.Team_ID);
    });

    it('should handle the effect when projectId changes', async () => {
        render(<ProjectDetails />);

        // Update the mock projectId value
        useParams.mockReturnValueOnce({ projectId: '2' });

        // Re-render and check if the project data is updated
        await waitFor(() => {
            expect(mockReadProjectById).toHaveBeenCalledWith(2);
        });
    });

    it('should handle loading state correctly when project is undefined', () => {
        // Simulate a case where the project is not found yet
        useProjectsContext.mockReturnValueOnce({
            projectById: undefined,
            readProjectById: mockReadProjectById,
            saveProjectChanges: mockSaveProjectChanges,
        });

        render(<ProjectDetails />);

        // Check for loading state
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
*/