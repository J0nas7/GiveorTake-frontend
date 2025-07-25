// src/test-utils.tsx
import {
    OrganisationsContextType,
    OrganisationsProvider,
    UsersContextType,
    UsersProvider
} from "@/contexts";
import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

// Create mock store
const mockStore = configureStore([]);
const store = mockStore({
    auth: {
        user: { id: 1, name: "Test User" },
    },
});

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
    }),
    useParams: () => ({
        organisationLink: '1-test-org',
    }),
    useSearchParams: () => ({
        get: jest.fn().mockReturnValue(null),
    }),
}));

// Mock properties context value
const mockPropertiesContextValue: Partial<OrganisationsContextType> = {
    organisationsById: undefined,
    organisationById: undefined,
    organisationDetail: undefined
};
const mockUsersContextTypeValue: Partial<UsersContextType> = {
    usersById: undefined,
    userDetail: undefined,
    newUser: undefined
};

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Provider store={store}>
            <OrganisationsProvider> {/* Use the Provider instead of manually setting context */}
                <UsersProvider>
                    {children}
                </UsersProvider>
            </OrganisationsProvider>
        </Provider>
    );
};

// Custom render function
export const renderWithProviders = (ui: React.ReactElement) => {
    return render(<TestProvider>{ui}</TestProvider>);
};
