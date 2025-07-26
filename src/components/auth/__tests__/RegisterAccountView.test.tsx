// Mock useAuth
const mockHandleRegister = jest.fn().mockResolvedValueOnce({});
const useAuthMock = jest.fn().mockReturnValue({ handleRegister: mockHandleRegister });

jest.mock('@/hooks', () => ({
    useAuth: useAuthMock,

    useTypeAPI: jest.fn(() => ({
        fetchItemsByParent: jest.fn(),
        fetchItem: jest.fn(),
        postItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
    })),
}));

import { TestProvider } from '@/__tests__/test-utils';
import { RegisterAccountView } from '@/components/auth';
import { useAuth } from '@/hooks';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { act } from 'react';

void React.createElement

describe('RegisterAccountView Components', () => {
    describe("RegisterAccountView - Casual Cases", () => {
        const renderRegisterView = () => {
            (useAuth as jest.Mock).mockReturnValue({ handleRegister: mockHandleRegister });
            RegisterAccountView
            return render(
                <TestProvider>
                    <RegisterAccountView />
                </TestProvider>
            );
        };

        beforeEach(() => {
            jest.clearAllMocks();
            renderRegisterView();
        });

        afterEach(() => {
            cleanup();
        });

        it("renders all required input fields", () => {
            expect(screen.getByLabelText(/Firstname/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Surname/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
            const passwordFields = screen.getAllByLabelText(/password/i);
            expect(passwordFields.length).toBe(2); // Password + Confirm-password
            expect(screen.getByLabelText(/Confirm-password/i)).toBeInTheDocument();
        });

        it("renders checkboxes for terms and marketing", () => {
            expect(screen.getByLabelText(/Accept-Terms-of-Service/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Sign-me-up-for-news-and-marketing/i)).toBeInTheDocument();
        });

        it("renders the submit button", () => {
            expect(screen.getByRole("button", { name: /Sign-up/i })).toBeInTheDocument();
        });

        it("renders the sign-in link", () => {
            expect(screen.getByRole("link", { name: /Already-have-an-account/i })).toHaveAttribute("href", "/sign-in");
        });

        it("submits form when required fields are filled and terms accepted", async () => {
            fireEvent.change(screen.getByLabelText(/Firstname/i), { target: { value: "Jane" } });
            fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: "Doe" } });
            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "jane@example.com" } });
            const passwordFields = screen.getAllByLabelText(/password/i);
            fireEvent.change(passwordFields[0], { target: { value: "secret123" } });
            fireEvent.change(passwordFields[1], { target: { value: "secret123" } });
            fireEvent.click(screen.getByLabelText(/Accept-Terms-of-Service/i));

            fireEvent.click(screen.getByRole("button", { name: /Sign-up/i }));

            await waitFor(() => {
                expect(mockHandleRegister).toHaveBeenCalledWith({
                    userFirstname: "Jane",
                    userSurname: "Doe",
                    userEmail: "jane@example.com",
                    userPassword: "secret123",
                    userPassword_confirmation: "secret123",
                    acceptTerms: true,
                });
            });
        });
    })

    describe("RegisterAccountView - Edge Cases", () => {
        const renderRegisterView = () => {
            (useAuth as jest.Mock).mockReturnValue({ handleRegister: mockHandleRegister });

            return render(
                <TestProvider>
                    <RegisterAccountView />
                </TestProvider>
            );
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        afterEach(() => {
            cleanup();
        });

        it("does not submit if terms are not accepted", () => {
            renderRegisterView();

            fireEvent.change(screen.getByLabelText(/Firstname/i), { target: { value: "NoTerms" } });
            fireEvent.click(screen.getByRole("button", { name: /Sign-up/i }));

            expect(mockHandleRegister).not.toHaveBeenCalled();
        });

        it("prevents submission when form is already pending", async () => {
            mockHandleRegister.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => resolve({}), 100); // 100ms delay
                    })
            );

            renderRegisterView();

            fireEvent.change(screen.getByLabelText(/Firstname/i), { target: { value: "Test" } });
            fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: "User" } });
            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@e.com" } });
            const passwordFields = screen.getAllByLabelText(/password/i);
            fireEvent.change(passwordFields[0], { target: { value: "secret123" } }); // Password
            fireEvent.change(passwordFields[1], { target: { value: "secret123" } }); // Confirm-password

            fireEvent.click(screen.getByLabelText(/Accept-Terms-of-Service/i));

            // Simulate pending by submitting twice
            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /Sign-up/i }));
                fireEvent.click(screen.getByRole("button", { name: /Sign-up/i }));
                // Wait a tick for promises/state updates to settle if needed
            });

            expect(mockHandleRegister).toHaveBeenCalledTimes(1);
        });

        it("toggles password visibility", () => {
            renderRegisterView();

            const toggleButton = screen.getByText(/Show/i);
            fireEvent.click(toggleButton);

            const passwordFields = screen.getAllByLabelText(/password/i);
            expect(passwordFields[0]).toHaveAttribute("type", "text");

            fireEvent.click(screen.getByText(/Hide/i));
            expect(passwordFields[0]).toHaveAttribute("type", "password");
        });

        it("submits on Enter key", () => {
            renderRegisterView();

            fireEvent.change(screen.getByLabelText(/Firstname/i), { target: { value: "Key" } });
            fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: "Press" } });
            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "key@press.com" } });
            const passwordFields = screen.getAllByLabelText(/password/i);
            expect(passwordFields.length).toBe(2); // Password + Confirm-password
            fireEvent.click(screen.getByLabelText(/Accept-Terms-of-Service/i));

            fireEvent.keyDown(screen.getByLabelText(/Email/i), { key: "Enter", code: "Enter" });

            expect(mockHandleRegister).toHaveBeenCalled();
        });

        it("renders safely with all empty fields and does not throw", () => {
            expect(() => renderRegisterView()).not.toThrow();
        });
    });
})
