"use client"

import { Block, Field, Heading } from '@/components'
import { useAuth } from '@/hooks'
import Link from 'next/link'
import React, { FormEvent, useState } from 'react'
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

    // Methods
    const doReset = (e?: FormEvent) => {
        e?.preventDefault()

        if (!resetPending) {
            setResetPending(true)

            handleResetRequest(userEmail, rememberToken, password1, password2) // Trigger password reset

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
                    lbl={t('guest:forms:Password')}
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
                <input
                    type="submit"
                    value={t('guest:forms:buttons:Reset')}
                    className="w-full text-center py-3 rounded bg-[#1ab11f] text-white focus:outline-none my-1"
                    disabled={resetPending} // Disable during pending
                />
            </form>
            <p className="mt-2">
                <Link className="text-[#1ab11f] font-bold" href="/sign-in">
                    {t('guest:links:Remember-your-password-again')}
                </Link>
            </p>
        </Block>
    )
}
