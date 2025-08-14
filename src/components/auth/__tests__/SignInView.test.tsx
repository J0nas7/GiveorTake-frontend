import { TestProvider } from '@/__tests__/test-utils';
import { SignInView } from '@/components/auth';

import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { act } from 'react';

void React.createElement

export const mockHandleLoginSubmit = jest.fn().mockResolvedValue({});

describe('SignInView Components', () => {
    const renderSignInView = () =>
        render(
            <TestProvider>
                <SignInView />
            </TestProvider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('SignInView - Casual Cases', () => {
        it('renders all form fields and button', () => {
            renderSignInView();
            expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
        });

        it('renders forgot password and register links', () => {
            renderSignInView();
            expect(screen.getByRole('link', { name: /Did-you-forget-your-password/i })).toHaveAttribute('href', '/forgot-password');
            expect(screen.getByRole('link', { name: /Create-a-new-account/i })).toHaveAttribute('href', '/register-account');
        });

        it('submits form when fields are filled', async () => {
            renderSignInView();

            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret123' } });

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: /Login/i }));
            })

            await waitFor(() => {
                expect(mockHandleLoginSubmit).toHaveBeenCalledWith('test@example.com', 'secret123');
            });
        });

        it('submits form on Enter key press in email field', async () => {
            renderSignInView();

            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'enter@test.com' } });
            fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'mypassword' } });

            await act(async () => {
                fireEvent.keyDown(screen.getByLabelText(/Email/i), {
                    key: 'Enter',
                    code: 'Enter',
                });
            })

            expect(mockHandleLoginSubmit).toHaveBeenCalled();
        });

        it('toggles password visibility correctly', () => {
            renderSignInView();

            const passwordInput = screen.getByLabelText(/Password/i);
            const toggleButton = screen.getByText(/Show/i);

            expect(passwordInput).toHaveAttribute('type', 'password');

            fireEvent.click(toggleButton);
            expect(passwordInput).toHaveAttribute('type', 'text');

            fireEvent.click(screen.getByText(/Hide/i));
            expect(passwordInput).toHaveAttribute('type', 'password');
        });

        it('displays loading indicator when login is pending', async () => {
            let resolveLogin: (value?: unknown) => void;
            mockHandleLoginSubmit.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveLogin = resolve;
                    })
            );

            renderSignInView();

            fireEvent.change(screen.getByLabelText(/Email/i), {
                target: { value: 'loading@test.com' },
            });
            fireEvent.change(screen.getByLabelText(/Password/i), {
                target: { value: 'pending123' },
            });

            await act(async () => {
                fireEvent.click(screen.getByTestId('login-submit'));
            });

            // Wait for React to update the DOM
            await waitFor(() => {
                expect(screen.getByTestId('login-submit')).toContainElement(screen.getByAltText(/Loading/i));
            })

            // Clean up: resolve to avoid act warning
            await act(async () => {
                resolveLogin();
            });
        });

        it('shows "Login" text again after login resolves', async () => {
            let resolveLogin: (value?: unknown) => void;
            mockHandleLoginSubmit.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveLogin = resolve;
                    })
            );

            renderSignInView();

            fireEvent.change(screen.getByLabelText(/Email/i), {
                target: { value: 'finished@test.com' },
            });
            fireEvent.change(screen.getByLabelText(/Password/i), {
                target: { value: 'done123' },
            });

            await act(async () => {
                fireEvent.click(screen.getByTestId('login-submit'));
            });

            await act(async () => {
                resolveLogin();
            });

            await waitFor(() => {
                expect(screen.getByTestId('login-submit')).toHaveTextContent(/Login/i);
            });
        });
    });

    describe('SignInView - Edge Cases', () => {
        it('does not submit multiple times while pending', async () => {
            mockHandleLoginSubmit.mockImplementation(() =>
                new Promise((resolve) => setTimeout(() => resolve({}), 100))
            );

            renderSignInView();

            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@site.com' } });
            fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'securepass' } });

            const loginButton = screen.getByTestId('login-submit');
            await act(async () => {
                fireEvent.click(loginButton);
                fireEvent.click(loginButton);
            })

            await waitFor(() => {
                expect(mockHandleLoginSubmit).toHaveBeenCalledTimes(1);
            });
        });

        it('ignores Enter key if fields are empty', () => {
            renderSignInView();

            fireEvent.keyDown(screen.getByLabelText(/Email/i), {
                key: 'Enter',
                code: 'Enter',
            });

            expect(mockHandleLoginSubmit).not.toHaveBeenCalled();
        });

        it('does not crash when rendered with no input', () => {
            expect(() => renderSignInView()).not.toThrow();
        });

        it('disables fields while loginPending is true', async () => {
            let resolveLogin: (value?: unknown) => void;
            mockHandleLoginSubmit.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveLogin = resolve;
                    })
            );
            renderSignInView();
            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'busy@test.com' } });
            fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'lockedout' } });

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: /Login/i }));
            });

            // Wait for React to update the DOM
            await waitFor(() => {
                expect(screen.getByDisplayValue('busy@test.com')).toBeDisabled();
                expect(screen.getByDisplayValue('lockedout')).toBeDisabled();
            });

            await act(async () => {
                resolveLogin!(); // resolve pending login
            });
        });

        it('preserves state during rapid toggles of password visibility', () => {
            renderSignInView();

            const passwordInput = screen.getByLabelText(/Password/i);
            const toggleBtn = screen.getByText(/Show/i);

            fireEvent.click(toggleBtn); // Show
            fireEvent.click(screen.getByText(/Hide/i)); // Hide
            fireEvent.click(screen.getByText(/Show/i)); // Show again

            expect(passwordInput).toHaveAttribute('type', 'text');
        });
    });
});
