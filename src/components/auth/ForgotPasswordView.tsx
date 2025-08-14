"use client"

import { Block, Field, Heading } from '@/components'
import { LoadingButton } from '@/core-ui/components/LoadingState'
import { useAuth } from '@/hooks'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ForgotPasswordView = () => {
    // Hooks
    const { handleForgotRequest } = useAuth()

    // Internal variables
    const { t } = useTranslation(['guest'])
    const [userEmail, setUserEmail] = useState<string>('')
    const [forgotPending, setForgotPending] = useState<boolean>(false)
    const submittingRef = useRef<boolean>(false) // Logic: Immediate update, avoids race condition

    // Methods
    const { mutate: doForgot, isPending: resetPending, error } = useMutation({
        mutationFn: () => handleForgotRequest(userEmail)
    });

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (submittingRef.current) return;
        submittingRef.current = true;
        doForgot(undefined, {
            onSettled: () => {
                submittingRef.current = false;
            },
        });
    };

    const ifEnter = (e: React.KeyboardEvent) => e.key === 'Enter' && handleSubmit(e as any)

    return (
        <Block className="forgot-page">
            <Heading variant="h2">
                {t('guest:h2:Forgot password')}
            </Heading>
            <form onSubmit={handleSubmit} className="guest-form">
                <Field
                    type="text"
                    lbl={t('guest:forms:Email')}
                    innerLabel={true}
                    value={userEmail}
                    onChange={(e: string) => setUserEmail(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        ifEnter(event)
                    }
                    disabled={forgotPending}
                    className="forgot-field"
                    required={true}
                    props={{ 'data-testid': 'email-input' }}
                />

                <button
                    type="submit"
                    data-testid="forgot-submit"
                    className="w-full flex justify-center h-12 text-center py-3 rounded bg-[#1ab11f] text-white focus:outline-none my-1 hover:cursor-pointer"
                >
                    {forgotPending ? (
                        <LoadingButton />
                    ) : (
                        <>{t('guest:forms:buttons:Forgot')}</>
                    )}
                </button>
            </form>
            <p className="mt-2 text-black">
                {t('guest:helptexts:Reset-link')}
            </p>
            <p className="mt-2">
                <Link className="text-[#1ab11f] font-bold" href="/sign-in">
                    {t('guest:links:Remember-your-password-again')}
                </Link>
            </p>
        </Block>
    )
}
