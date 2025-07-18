// External
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// Internal
import { OrganisationDetailsView } from '@/components/organisation/OrganisationEditPage/OrganisationEditView';
import { Organisation, User } from '@/types';

const mockOrganisation: Organisation = {
    Organisation_ID: 1,
    Organisation_Name: 'Test Org',
    Organisation_Description: '<p>Test Description</p>',
    User_ID: 2,
    teams: [{ Team_ID: 1, Organisation_ID: 1, Team_Name: 'Test Team', Team_Description: '<p>Team Description</p>', Team_CreatedAt: '2024-03-01', user_seats: [] }],
};

const mockUser: User = {
    User_ID: 2,
    User_FirstName: 'John',
    User_Surname: 'Doe',
    User_Status: '1',
    User_Email: 'mail@mail.mail'
};

describe('OrganisationDetailsView Component - As Expected', () => {
    test('renders organisation details for non-authenticated users', () => {
        render(
            <OrganisationDetailsView
                organisation={mockOrganisation}
                authUser={undefined}
                onOrganisationChange={jest.fn()}
                onSaveChanges={jest.fn()}
            />
        );

        expect(screen.getByText('Organisation Details')).toBeInTheDocument();
        expect(screen.getByText('Test Org')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });

    test('renders editable fields for authorised users', () => {
        render(
            <OrganisationDetailsView
                organisation={mockOrganisation}
                authUser={mockUser}
                onOrganisationChange={jest.fn()}
                onSaveChanges={jest.fn()}
            />
        );

        expect(screen.getByLabelText('Organisation Name')).toBeInTheDocument();
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    test('calls onOrganisationChange when editing fields', () => {
        const mockOnChange = jest.fn();

        render(
            <OrganisationDetailsView
                organisation={mockOrganisation}
                authUser={mockUser}
                onOrganisationChange={mockOnChange}
                onSaveChanges={jest.fn()}
            />
        );

        const input = screen.getByLabelText('Organisation Name');
        fireEvent.change(input, { target: { value: 'New Org Name' } });

        expect(mockOnChange).toHaveBeenCalledWith('Organisation_Name', 'New Org Name');
    });

    test('calls onSaveChanges when clicking save button', () => {
        const mockOnSave = jest.fn();

        render(
            <OrganisationDetailsView
                organisation={mockOrganisation}
                authUser={mockUser}
                onOrganisationChange={jest.fn()}
                onSaveChanges={mockOnSave}
            />
        );

        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalled();
    });
});

describe('OrganisationDetailsView Component - Edge Cases', () => {
    test('renders properly when organisation has no description', () => {
        const organisationWithoutDescription = { ...mockOrganisation, Organisation_Description: '' };

        render(
            <OrganisationDetailsView
                organisation={organisationWithoutDescription}
                authUser={mockUser}
                onOrganisationChange={jest.fn()}
                onSaveChanges={jest.fn()}
            />
        );

        expect(screen.getByText('Organisation Details')).toBeInTheDocument();
        expect(screen.getByText('No description available')).toBeInTheDocument();
    });

    test('renders properly for authenticated user who does not own the organisation', () => {
        const anotherUser: User = { ...mockUser, User_ID: 99 };

        render(
            <OrganisationDetailsView
                organisation={mockOrganisation}
                authUser={anotherUser}
                onOrganisationChange={jest.fn()}
                onSaveChanges={jest.fn()}
            />
        );

        expect(screen.getByText('Organisation Details')).toBeInTheDocument();
        expect(screen.getByText('Test Org')).toBeInTheDocument();
        expect(screen.queryByLabelText('Organisation Name')).not.toBeInTheDocument();
        expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });

    test('renders properly when organisation has no teams', () => {
        const organisationWithoutTeams = { ...mockOrganisation, teams: [] };

        render(
            <OrganisationDetailsView
                organisation={organisationWithoutTeams}
                authUser={mockUser}
                onOrganisationChange={jest.fn()}
                onSaveChanges={jest.fn()}
            />
        );

        expect(screen.getByText('Teams Overview')).toBeInTheDocument();
        expect(screen.getByText('Teams Overview').nextSibling).toBeNull(); // No team cards should be rendered
    });
});
