// src/test-utils.tsx
import { mockHandleLoginSubmit } from '@/components/auth/__tests__/SignInView.test';
import {
    OrganisationsProvider,
    TeamUserSeatsProvider,
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
    usePathname: () => '/',
    useParams: () => ({
        organisationLink: '1-test-org',
    }),
    useSearchParams: () => ({
        get: jest.fn().mockReturnValue(null),
    }),
}));

jest.mock('@/hooks', () => ({
    useRoleAccess: jest.fn(() => ({
        canModifyOrganisationSettings: true,
    })),
    useAxios: jest.fn(() => ({
        httpGetRequest: jest.fn()
    })),
    useAuth: jest.fn(() => ({
        handleLoginSubmit: mockHandleLoginSubmit,
    })),
    useURLLink: jest.fn(() => ({
        convertID_NameStringToURLFormat: (id: number, name: string) => `${id}-${name.toLowerCase().replace(/\s+/g, '-')}`
    })),
    useTypeAPI: jest.fn(() => ({
        fetchItemsByParent: jest.fn(),
        fetchItem: jest.fn(),
        postItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
    })),
}));

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Provider store={store}>
            <OrganisationsProvider> {/* Use the Provider instead of manually setting context */}
                <UsersProvider>
                    <TeamUserSeatsProvider>
                        {children}
                    </TeamUserSeatsProvider>
                </UsersProvider>
            </OrganisationsProvider>
        </Provider>
    );
};

// Custom render function
export const renderWithProviders = (ui: React.ReactElement) => {
    return render(<TestProvider>{ui}</TestProvider>);
};
