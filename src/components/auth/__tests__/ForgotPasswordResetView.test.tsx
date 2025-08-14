import { TestProvider } from '@/__tests__/test-utils'
import { ForgotPasswordResetView } from '@/components/auth'
import { useAuth } from '@/hooks'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React, { act } from 'react'

void React.createElement

jest.mock('@/hooks', () => ({
    useAuth: jest.fn()
}))

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { changeLanguage: () => new Promise(() => { }) }
    })
}))

describe('ForgotPasswordResetView Components', () => {
    const mockHandleResetRequest = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks();

        (useAuth as jest.Mock).mockReturnValue({
            handleResetRequest: mockHandleResetRequest
        })

        cleanup();

        render(
            <TestProvider>
                <ForgotPasswordResetView />
            </TestProvider>
        )
    })

    describe('ForgotPasswordResetView - Casual Cases ✅', () => {
        it('renders all input fields', () => {
            expect(screen.getByLabelText(/guest:forms:Email/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/guest:forms:Token/i)).toBeInTheDocument()
            expect(screen.getAllByLabelText(/Password/i)).toHaveLength(2)
        })

        it('renders submit button', () => {
            expect(
                screen.getByRole('button', { name: 'guest:forms:buttons:Reset' })
            ).toBeInTheDocument()
        })

        it('calls handleResetRequest on submit', async () => {
            fireEvent.change(screen.getByLabelText(/Email/i), {
                target: { value: 'user@example.com' }
            })
            fireEvent.change(screen.getByLabelText(/Token/i), {
                target: { value: 'token123' }
            })
            fireEvent.change(screen.getAllByLabelText(/Password/i)[0], {
                target: { value: 'pass1' }
            })
            fireEvent.change(screen.getAllByLabelText(/Password/i)[1], {
                target: { value: 'pass1' }
            })

            act(() => {
                fireEvent.click(screen.getByRole('button', { name: /Reset/i }))
            })

            await waitFor(() => {
                expect(mockHandleResetRequest).toHaveBeenCalledWith(
                    'user@example.com',
                    'token123',
                    'pass1',
                    'pass1'
                )
            })
        })

        it('disables form while pending', async () => {
            const slowMock = jest.fn(() => new Promise(() => { }));

            (useAuth as jest.Mock).mockReturnValue({
                handleResetRequest: slowMock
            })

            const email = screen.getByLabelText(/Email/i)
            const token = screen.getByLabelText(/Token/i)
            const passwordFields = screen.getAllByLabelText(/password/i);
            const button = screen.getByRole('button', { name: /Reset/i })

            expect(passwordFields.length).toBe(2)

            fireEvent.change(email, { target: { value: 'user@example.com' } })
            fireEvent.change(token, { target: { value: 'token123' } })
            fireEvent.change(passwordFields[0], { target: { value: "secret123" } }); // Password
            fireEvent.change(passwordFields[1], { target: { value: "secret123" } }); // Confirm-password

            act(() => {
                fireEvent.click(button)
            })

            await waitFor(() => {
                expect(email).toBeDisabled()
                expect(token).toBeDisabled()
                expect(passwordFields[0]).toBeDisabled()
                expect(passwordFields[1]).toBeDisabled()
                expect(button).toBeDisabled()
            })
        })

        it('handles Enter key submission', async () => {
            const email = screen.getByLabelText(/Email/i)
            fireEvent.change(email, { target: { value: 'user@example.com' } })
            fireEvent.keyDown(email, { key: 'Enter', code: 'Enter' })

            await waitFor(() => {
                expect(mockHandleResetRequest).toHaveBeenCalled()
            })
        })

        it('contains link to sign-in', () => {
            const link = screen.getByRole('link', {
                name: /guest:links:Remember-your-password-again/i
            })
            expect(link).toHaveAttribute('href', '/sign-in')
        })

        it('does not crash with empty fields', async () => {
            const email = screen.getByLabelText(/Email/i)
            fireEvent.change(email, { target: { value: '' } })
            fireEvent.change(screen.getByLabelText(/Token/i), { target: { value: '' } })
            const passwordFields = screen.getAllByLabelText(/Password/i)
            fireEvent.change(passwordFields[0], { target: { value: '' } })
            fireEvent.change(passwordFields[1], { target: { value: '' } })

            fireEvent.keyDown(email, { key: 'Enter', code: 'Enter' })

            await waitFor(() => {
                expect(mockHandleResetRequest).toHaveBeenCalledWith('', '', '', '')
            })
        })
    })

    describe('ForgotPasswordResetView - Edge Cases 🚧', () => {
        it('does not call handleResetRequest if already pending', async () => {
            const email = screen.getByLabelText(/Email/i)
            fireEvent.keyDown(email, { key: 'Enter', code: 'Enter' })

            fireEvent.change(email, { target: { value: 'user@example.com' } })

            await act(async () => {
                fireEvent.keyDown(email, { key: 'Enter', code: 'Enter' })
                fireEvent.keyDown(email, { key: 'Enter', code: 'Enter' })
            })

            await waitFor(() => {
                expect(mockHandleResetRequest).toHaveBeenCalledTimes(1)
            })
        })

        it('allows different passwords (validation happens elsewhere)', async () => {
            fireEvent.change(screen.getAllByLabelText(/Password/i)[0], { target: { value: 'one' } })
            fireEvent.change(screen.getAllByLabelText(/Password/i)[1], { target: { value: 'two' } })

            const email = screen.getByLabelText(/Email/i)
            fireEvent.keyDown(email, { key: 'Enter', code: 'Enter' })

            await waitFor(() => {
                expect(mockHandleResetRequest).toHaveBeenCalledWith(
                    '',
                    '',
                    'one',
                    'two'
                )
            })
        })

        it('gracefully handles empty Enter key press', async () => {
            fireEvent.keyDown(screen.getByLabelText(/Email/i), {
                key: 'Enter',
                code: 'Enter'
            })

            await waitFor(() => {
                expect(mockHandleResetRequest).toHaveBeenCalled()
            })
        })

        it('ignores non-Enter keys', async () => {
            fireEvent.keyDown(screen.getByLabelText(/Email/i), {
                key: 'Space',
                code: 'Space'
            })

            expect(mockHandleResetRequest).not.toHaveBeenCalled()
        })

        it('does not break when pressing Enter on password field', async () => {
            fireEvent.keyDown(screen.getAllByLabelText(/Password/i)[0], {
                key: 'Enter',
                code: 'Enter'
            })

            await waitFor(() => {
                expect(mockHandleResetRequest).toHaveBeenCalled()
            })
        })
    })
})
