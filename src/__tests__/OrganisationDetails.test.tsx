// External
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Internal
import { TestProvider } from '@/__tests__/test-utils';
import { OrganisationActions } from '@/components/organisation';
import { Organisation as OrganisationType, User } from '@/types';

void React.createElement

const mockOrganisation: OrganisationType = {
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

const dummyConvertID_NameStringToURLFormat = (id: number, name: string) =>
    `${id}-${name.toLowerCase().replace(/\s+/g, '-')}`;

const mockHandleSaveChanges = jest.fn();
const mockSetShowEditToggles = jest.fn();

describe('OrganisationDetailsView Component', () => {
    test('renders properly when organisation has no teams', () => {
        render(
            <TestProvider>
                <OrganisationActions
                    renderOrganisation={mockOrganisation}
                    canModifyOrganisationSettings={true}
                    convertID_NameStringToURLFormat={dummyConvertID_NameStringToURLFormat}
                    handleSaveChanges={mockHandleSaveChanges}
                    showEditToggles={false}
                    setShowEditToggles={mockSetShowEditToggles}
                />
            </TestProvider>
        );

        expect(screen.getByText('Create Team')).toBeInTheDocument();
        expect(screen.getByText('Go to Home')).toBeInTheDocument();
    });
});
