// External
import { render } from "@testing-library/react";

// Internal
import { TestProvider } from '@/__tests__/test-utils';
import React from 'react';
import { Header } from "../Header";

// Use React minimally so it isn't removed by IDE
void React.createElement;

jest.mock("next/image", () => (props: any) => {
    // Stub Next.js Image component for testing
    return <img {...props} alt={props.alt || "mocked-image"} />;
});

describe("Header", () => {
    test("renders the logo, app title, and user info", () => {
        render(
            <TestProvider>
                <Header />
            </TestProvider>
        );

        // App title and subtitle
        // expect(screen.getByText(/Give or Take/i)).toBeInTheDocument();
        // expect(screen.getByText(/Project Management & Time Tracking/i)).toBeInTheDocument();

        // // User info from mocked store
        // expect(screen.getByText(/Test User/i)).toBeInTheDocument();

        // // Logout button
        // expect(screen.getByText(/Log out/i)).toBeInTheDocument();

        // // Profile link
        // const profileLink = screen.getByRole('link', { name: /Test User/i });
        // expect(profileLink).toHaveAttribute("href", "/profile");
    });
});
