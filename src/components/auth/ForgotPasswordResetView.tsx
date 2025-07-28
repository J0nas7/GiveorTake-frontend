"use client"

import { Block, Field, Heading } from '@/components'
import { LoadingButton } from '@/core-ui/components/LoadingState'
import { useAuth } from '@/hooks'
import Link from 'next/link'
import React, { FormEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ForgotPasswordResetView = () => {
    // Hooks
    const { handleResetRequest } = useAuth()

    // Internal variables
    const { t } = useTranslation(['guest'])
    const [userEmail, setUserEmail] = useState<string>('')
    const [rememberToken, setRememberToken] = useState<string>('')
    const [password1, setPassword1] = useState<string>('')
    const [password2, setPassword2] = useState<string>('')
    const [resetPending, setResetPending] = useState<boolean>(false)
    const submittingRef = useRef<boolean>(false)

    // Methods
    const doReset = async (e?: FormEvent) => {
        e?.preventDefault()

        if (submittingRef.current) return
        submittingRef.current = true
        setResetPending(true)

        try {
            await handleResetRequest(userEmail, rememberToken, password1, password2) // Trigger password reset
        } finally {
            submittingRef.current = false
            setResetPending(false)
        }
    }

    const ifEnter = (e: React.KeyboardEvent) => e.key === 'Enter' && doReset(e as any)

    return (
        <Block className="forgot-page">
            <Heading variant="h2">
                {t('guest:h2:Reset password')}
            </Heading>
            <form onSubmit={doReset} className="guest-form">
                <Field
                    type="text"
                    lbl={t('guest:forms:Email')}
                    innerLabel={true}
                    value={userEmail}
                    onChange={(e: string) => setUserEmail(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        ifEnter(event)
                    }
                    disabled={resetPending}
                    className="forgot-field"
                    required={true}
                />
                <Field
                    type="text"
                    lbl={t('guest:forms:Token')}
                    innerLabel={true}
                    value={rememberToken}
                    onChange={(e: string) => setRememberToken(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        ifEnter(event)
                    }
                    disabled={resetPending}
                    className="forgot-field"
                    required={true}
                />
                <Field
                    type="password"
                    lbl={t('guest:forms:Password')}
                    innerLabel={true}
                    value={password1}
                    onChange={(e: string) => setPassword1(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        ifEnter(event)
                    }
                    disabled={resetPending}
                    className="forgot-field"
                    required={true}
                />
                <Field
                    type="password"
                    lbl={t('guest:forms:Confirm-password')}
                    innerLabel={true}
                    value={password2}
                    onChange={(e: string) => setPassword2(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        ifEnter(event)
                    }
                    disabled={resetPending}
                    className="forgot-field"
                    required={true}
                />

                <button
                    type="submit"
                    data-testid="reset-submit"
                    disabled={resetPending}
                    className="w-full flex justify-center h-12 text-center py-3 rounded bg-[#1ab11f] text-white focus:outline-none my-1 hover:cursor-pointer"
                >
                    {resetPending ? (
                        <LoadingButton />
                    ) : (
                        <>{t('guest:forms:buttons:Reset')}</>
                    )}
                </button>
            </form>
            <p className="mt-2">
                <Link className="text-[#1ab11f] font-bold" href="/sign-in">
                    {t('guest:links:Remember-your-password-again')}
                </Link>
            </p>
        </Block>
    )
}
