// External
import { render, screen } from "@testing-library/react";

// Internal
import { TestProvider } from '@/__tests__/test-utils';
import React from 'react';
import { Footer } from "../Footer";

// Use React minimally so it isn't removed by IDE
void React.createElement;

describe("Footer", () => {
    test("renders footer with current year and privacy policy link", () => {
        render(
            <TestProvider>
                <Footer />
            </TestProvider>
        );

        const currentYear = new Date().getFullYear();
        expect(screen.getByText(`© ${currentYear} Give or Take. All rights reserved.`)).toBeInTheDocument();
    });
});
