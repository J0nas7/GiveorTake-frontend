// src/test-utils.tsx
import { mockHandleLoginSubmit } from '@/components/auth/__tests__/SignInView.test';
import {
    BacklogsProvider,
    OrganisationsProvider,
    ProjectsProvider,
    TeamUserSeatsProvider,
    UsersProvider
} from "@/contexts";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

// Shared mock functions
export const mockConvertID_NameStringToURLFormat = jest.fn(
    (id: number, name: string) => {
        const safeName = name?.toLowerCase().replace(/\s+/g, '-') ?? 'unknown';
        return `${id}-${safeName}`;
    }
);
export const pushMock = jest.fn();

// Create mock store
const mockStore = configureStore([]);
const store = mockStore({
    auth: {
        user: { id: 1, name: "Test User" },
    },
});

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: pushMock,
        replace: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
    })),
    usePathname: () => '/',
    useParams: jest.fn(() => ({
        organisationLink: '1-test-org',
    })),
    useSearchParams: jest.fn(() => ({
        get: jest.fn().mockReturnValue(null),
    })),
}));

jest.mock('@/hooks', () => ({
    useRoleAccess: jest.fn(() => ({
        canModifyOrganisationSettings: true,
    })),
    useAxios: jest.fn(() => ({
        httpGetRequest: jest.fn(),
        httpPostWithData: jest.fn(() => Promise.resolve({ success: true })),
    })),
    useAuth: jest.fn(() => ({
        handleLoginSubmit: mockHandleLoginSubmit,
        // handleForgotRequest: mockHandleForgotRequest,
    })),
    useURLLink: jest.fn(() => ({
        convertID_NameStringToURLFormat: mockConvertID_NameStringToURLFormat
    })),
    useTypeAPI: jest.fn(() => ({
        fetchItemsByParent: jest.fn(),
        fetchItem: jest.fn(),
        postItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
    })),
}));

jest.mock('react-dnd', () => ({
    useDrag: jest.fn(),
    useDrop: jest.fn(),
}));

jest.mock('react-dnd-html5-backend', () => ({
    HTML5Backend: jest.fn(),
}));

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = new QueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <OrganisationsProvider> {/* Use the Provider instead of manually setting context */}
                    <UsersProvider>
                        <TeamUserSeatsProvider>
                            <ProjectsProvider>
                                <BacklogsProvider>
                                    {children}
                                </BacklogsProvider>
                            </ProjectsProvider>
                        </TeamUserSeatsProvider>
                    </UsersProvider>
                </OrganisationsProvider>
            </Provider>
        </QueryClientProvider>
    );
};

// Custom render function
export const renderWithProviders = (ui: React.ReactElement) => {
    return render(<TestProvider>{ui}</TestProvider>);
};
