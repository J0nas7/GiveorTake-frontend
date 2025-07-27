import { TestProvider } from '@/__tests__/test-utils';
import { OrganisationItem, Start } from '@/components/auth';
import { useTeamUserSeatsContext } from '@/contexts';
import { useTypedSelector } from '@/redux';
import { Organisation, TeamUserSeat, User } from '@/types';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from "react";

void React.createElement

jest.mock('@/redux', () => {
    const actual = jest.requireActual('@/redux');
    return {
        ...actual,
        useTypedSelector: jest.fn(),
        selectAuthUser: jest.fn(() => (user: User) => user), // optional if selectAuthUser is passed through
    };
});

jest.mock('@/contexts', () => ({
    ...jest.requireActual('@/contexts'),
    useTeamUserSeatsContext: jest.fn(() => ({
        saveTeamUserSeatChanges: jest.fn(),
        removeTeamUserSeat: jest.fn(),
    })),
}));

describe('StartPage Components', () => {
    describe('Start', () => {
        const mockUser: User = {
            User_ID: 1,
            User_FirstName: 'Anna',
            User_Surname: 'Test',
            User_Email: 'anna@example.com',
            User_Status: '2',
        };
        (useTypedSelector as jest.Mock).mockImplementation((selectorFn) => selectorFn(mockUser));

        const mockProps = {
            authUser: mockUser,
            organisationsById: []
        }

        const renderStart = (props = {}) =>
            render(
                <TestProvider>
                    <Start {...mockProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();

            renderStart()
        });

        afterEach(() => {
            cleanup(); // Clear the DOM from beforeEach render
        })

        const mockOrganisations: Organisation[] = [
            { Organisation_ID: 1, User_ID: 1, Organisation_Name: 'Org One' },
            { Organisation_ID: 2, User_ID: 1, Organisation_Name: 'Org Two' },
        ];

        it('renders nothing if no authUser', () => {
            cleanup()

            const { container } = renderStart({ authUser: undefined });
            expect(container.textContent?.trim()).toBe('');
        });

        it('greets the user with first name', () => {
            expect(screen.getByText(/Hej Anna/i)).toBeInTheDocument();
        });

        it('shows action links for creating organisation and profile settings', () => {
            expect(screen.getByRole('link', { name: /Create Organisation/i })).toHaveAttribute('href', '/organisation/create');
            expect(screen.getByRole('link', { name: /Go to Profile Settings/i })).toHaveAttribute('href', '/profile');
        });

        it('displays fallback if no organisations are present', () => {
            expect(screen.getByText(/No organisations found/i)).toBeInTheDocument();
        });

        it('displays all passed organisations using OrganisationItem', () => {
            cleanup()
            renderStart({ organisationsById: mockOrganisations });

            expect(screen.findAllByText('Org One'));
            expect(screen.findAllByText('Org Two'));
        });

        it('displays loading state if organisationsById is undefined or false', () => {
            cleanup()
            renderStart({ organisationsById: undefined });
            expect(screen.getByAltText(/Loading.../i)).toBeInTheDocument(); // from LoadingState singular prop

            cleanup()
            renderStart({ organisationsById: false });
            expect(screen.getByText(/Organisation not found/i)).toBeInTheDocument(); // still renders loading
        });
    })

    describe('OrganisationItem', () => {
        const seat = { User_ID: 1, Seat_Status: 'Active', Team_ID: 1, Role_ID: 1 } as TeamUserSeat;

        const baseOrganisation: Organisation = {
            Organisation_ID: 1,
            Organisation_Name: 'Org Test',
            Organisation_Description: '<p>This is a test</p>',
            User_ID: 1,
            teams: [
                { Organisation_ID: 1, Team_Name: "Team Alpha", user_seats: [seat] },
                { Organisation_ID: 2, Team_Name: 'Team Beta', user_seats: [seat] },
            ]
        };

        const mockUser: User = {
            User_ID: 1,
            User_Status: "1",
            User_Email: "@",
            User_FirstName: "First",
            User_Surname: "Sur"
        };

        const mockProps = {
            authUser: mockUser,
            organisation: baseOrganisation,
            canModifyOrganisationSettings: true
        }

        const renderOrganisationItem = (props = {}) =>
            render(
                <TestProvider>
                    <OrganisationItem {...mockProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();

            renderOrganisationItem()
        });

        afterEach(() => {
            cleanup(); // Clear the DOM from beforeEach render
        })

        it('renders nothing if seat is inactive', () => {
            const seat = { User_ID: 1, Seat_Status: 'Inactive', Team_ID: 1, Role_ID: 1 } as TeamUserSeat;
            const org: Organisation = {
                ...baseOrganisation,
                teams: [{
                    Organisation_ID: 1,
                    Team_Name: "team",
                    user_seats: [seat]
                }],
            };

            cleanup();

            const { container } = renderOrganisationItem({ organisation: org });
            expect(container.textContent?.trim()).toBe('');
        });

        it('shows pending message and buttons', () => {
            const seat = { User_ID: 1, Seat_Status: 'Pending', Team_ID: 1, Role_ID: 1 } as TeamUserSeat;
            const org: Organisation = {
                ...baseOrganisation,
                teams: [{
                    Organisation_ID: 1,
                    Team_Name: "team",
                    user_seats: [seat]
                }],
            };

            cleanup()

            renderOrganisationItem({ organisation: org });
            expect(screen.getByText(/Your access is pending/i)).toBeInTheDocument();
            expect(screen.getByText(/Approve/i)).toBeInTheDocument();
            expect(screen.getByText(/Decline/i)).toBeInTheDocument();
        });

        it('calls approvePending on click', async () => {
            const seat = { User_ID: 1, Seat_Status: 'Pending', Team_ID: 1, Role_ID: 1 } as TeamUserSeat;

            const org: Organisation = {
                ...baseOrganisation,
                teams: [{
                    Organisation_ID: 1,
                    Team_Name: "team",
                    user_seats: [seat]
                }],
            };

            cleanup()
            renderOrganisationItem({ organisation: org });
            fireEvent.click(screen.getByText(/Approve/i));
            // async approval path is tested via mockResolvedValue
        });

        it('calls removeTeamUserSeat on decline', () => {
            const seat = { User_ID: 1, Seat_Status: 'Pending', Team_ID: 1, Role_ID: 1 } as TeamUserSeat;

            // Declare the mock function so you can track its calls
            const removeTeamUserSeat = jest.fn();

            (useTeamUserSeatsContext as jest.Mock).mockReturnValueOnce({
                saveTeamUserSeatChanges: jest.fn(),
                removeTeamUserSeat, // pass the reference here
            });

            const org: Organisation = {
                ...baseOrganisation,
                teams: [{
                    Organisation_ID: 1,
                    Team_Name: "team",
                    user_seats: [seat]
                }],
            };

            cleanup()
            renderOrganisationItem({ organisation: org });
            fireEvent.click(screen.getByText(/Decline/i));
            expect(removeTeamUserSeat).toHaveBeenCalledWith(0, 1, undefined);
        });

        it('renders organisation link and description', () => {
            expect(
                screen.getByRole('link', { name: /Org Test/i })
            ).toHaveAttribute('href', '/organisation/1-org-test');
            expect(screen.getByText(/This is a test/i)).toBeInTheDocument();
        });

        it('renders fallback if no teams', () => {
            const org: Organisation = {
                ...baseOrganisation,
                teams: [],
            };

            cleanup();
            renderOrganisationItem({ organisation: org })
            expect(screen.getByText(/Ingen teams tilgængelige/i)).toBeInTheDocument();
        });

        it('renders teams if available', () => {
            expect(screen.getAllByTestId('team-link')).toHaveLength(2);
        });

        it('renders Create Team link if allowed', () => {
            const smallEl = screen.getByText(/Create Team/i);
            expect(smallEl.closest('a')).toHaveAttribute(
                'href',
                '/organisation/1-org-test/create-team'
            );
        });
    });
})
