import { ForgotPasswordView } from '@/components/auth'
import { useAuth } from '@/hooks'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React, { act } from 'react'

void React.createElement

jest.mock('@/hooks', () => ({
    useAuth: jest.fn()
}))

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key, // return the key as the "translation"
        i18n: { changeLanguage: () => new Promise(() => { }) },
    }),
}));

describe('ForgotPasswordView Components', () => {
    const mockHandleForgotRequest = jest.fn(() => Promise.resolve())

    beforeEach(() => {
        jest.clearAllMocks();

        (useAuth as jest.Mock).mockReturnValue({
            handleForgotRequest: mockHandleForgotRequest,
        })
    })

    describe('ForgotPasswordView - Casual Cases ✅', () => {
        it('renders heading', () => {
            render(<ForgotPasswordView />)
            expect(screen.getByRole('heading', { name: 'guest:h2:Forgot password' })).toBeInTheDocument()
        })

        it('renders email input', () => {
            render(<ForgotPasswordView />)
            expect(screen.getByLabelText(/guest:forms:Email/i)).toBeInTheDocument()
        })

        it('renders submit button', () => {
            render(<ForgotPasswordView />)
            expect(screen.getByRole('button', { name: 'guest:forms:buttons:Forgot' })).toBeInTheDocument()
        })

        it('renders help text and link', () => {
            render(<ForgotPasswordView />)
            expect(screen.getByText('guest:helptexts:Reset-link')).toBeInTheDocument()
            expect(screen.getByRole('link', { name: 'guest:links:Remember-your-password-again' })).toHaveAttribute('href', '/sign-in')
        })

        it('calls handleForgotRequest on form submit', async () => {
            render(<ForgotPasswordView />)
            fireEvent.change(screen.getByLabelText(/guest:forms:Email/i), {
                target: { value: 'test@example.com' },
            })

            await act(() => {
                fireEvent.click(screen.getByRole('button', { name: 'guest:forms:buttons:Forgot' }))
            })

            await waitFor(() => {
                expect(mockHandleForgotRequest).toHaveBeenCalledWith('test@example.com')
            })
        })

        it('calls handleForgotRequest on Enter key press', async () => {
            render(<ForgotPasswordView />)
            const input = screen.getByLabelText(/guest:forms:Email/i)
            fireEvent.change(input, { target: { value: 'enter@example.com' } })

            act(() => {
                fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
            })

            await waitFor(() => {
                expect(mockHandleForgotRequest).toHaveBeenCalledWith('enter@example.com')
            })
        })

        it('does not submit multiple times while pending', async () => {
            mockHandleForgotRequest.mockImplementation(() =>
                new Promise((resolve) => setTimeout(() => resolve(), 100))
            );

            render(<ForgotPasswordView />)

            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'forgot@site.com' } });

            const button = screen.getByTestId('forgot-submit');
            await act(async () => {
                fireEvent.click(button);
                fireEvent.click(button);
            })

            await waitFor(() => {
                expect(mockHandleForgotRequest).toHaveBeenCalledTimes(1);
            });
        });

        it('renders all elements with correct initial state', () => {
            render(<ForgotPasswordView />)
            expect(screen.getByLabelText(/guest:forms:Email/i)).toHaveValue('')
            expect(screen.getByRole('button', { name: 'guest:forms:buttons:Forgot' })).not.toBeDisabled()
        })
    })

    describe('ForgotPasswordView - Edge Cases 🚧', () => {
        it('does not submit if email is empty', () => {
            render(<ForgotPasswordView />)
            fireEvent.click(screen.getByRole('button', { name: 'guest:forms:buttons:Forgot' }))
            expect(mockHandleForgotRequest).toHaveBeenCalledTimes(0)
        })

        it('ignores non-Enter key presses', () => {
            render(<ForgotPasswordView />)
            const input = screen.getByLabelText(/guest:forms:Email/i)
            fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
            expect(mockHandleForgotRequest).not.toHaveBeenCalled()
        })

        it('does not call handleForgotRequest again if already pending', () => {
            let resolve: () => void
            const mockPromise = new Promise<void>((res) => (resolve = res))
            mockHandleForgotRequest.mockReturnValue(mockPromise)

            render(<ForgotPasswordView />)
            fireEvent.change(screen.getByLabelText(/guest:forms:Email/i), {
                target: { value: 'pending@example.com' },
            })

            const button = screen.getByRole('button', { name: 'guest:forms:buttons:Forgot' })
            fireEvent.click(button)
            fireEvent.click(button) // second click during pending

            expect(mockHandleForgotRequest).toHaveBeenCalledTimes(1)
            resolve!()
        })

        it('handles rapid Enter key spam gracefully', () => {
            render(<ForgotPasswordView />)

            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'spam@example.com' } });

            for (let i = 0; i < 5; i++) {
                fireEvent.keyDown(screen.getByLabelText(/Email/i), { key: 'Enter', code: 'Enter' })
            }

            expect(mockHandleForgotRequest).toHaveBeenCalledTimes(1)
        })
    })
})
