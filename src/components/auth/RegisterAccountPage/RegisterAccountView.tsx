"use client"

// External
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { useRef, useState } from 'react'

// Internal
import { Block, Field, Heading } from "@/components"
import { LoadingButton } from '@/core-ui/components/LoadingState'
import { useAuth } from '@/hooks'

export const RegisterAccountView = () => {
    // Hooks
    const { handleRegister } = useAuth()

    // Internal variables
    const { t } = useTranslation(['guest'])
    const [userFirstname, setUserFirstname] = useState<string>('')
    const [userSurname, setUserSurname] = useState<string>('')
    const [userEmail, setUserEmail] = useState<string>('')
    const [userPassword, setUserPassword] = useState<string>('')
    const [userPassword_confirmation, setUserPassword_confirmation] = useState<string>('')
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [acceptTerms, setAcceptTerms] = useState<boolean>(false)
    const [createPending, setCreatePending] = useState<boolean>(false) // UI: Reactive
    const submittingRef = useRef(false) // Logic: Immediate update, avoids race condition

    // Methods
    const doRegister = async (e?: React.FormEvent) => {
        e?.preventDefault()

        if (submittingRef.current) return;
        submittingRef.current = true;
        setCreatePending(true)

        const formData = {
            userFirstname,
            userSurname,
            userEmail,
            userPassword,
            userPassword_confirmation,
            acceptTerms
        }

        try {
            await handleRegister(formData);
        } finally {
            submittingRef.current = false; // Reset pending state
            setCreatePending(false)
        }
    }

    const ifEnter = (e: React.KeyboardEvent) => (e.key === 'Enter') && doRegister(e as any)

    return (
        <Block className="register-page">
            <Heading variant="h2">
                {t('guest:h2:Register')} {t('guest:h2:account')}
            </Heading>
            <form onSubmit={doRegister} className="guest-form">
                <Field
                    type="text"
                    lbl={t('guest:forms:Firstname')}
                    innerLabel={true}
                    value={userFirstname}
                    onChange={(e: string) => setUserFirstname(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        ifEnter(event)
                    }
                    disabled={createPending}
                    className="register-field"
                    required={true}
                />
                <Field
                    type="text"
                    lbl={t('guest:forms:Surname')}
                    innerLabel={true}
                    value={userSurname}
                    onChange={(e: string) => setUserSurname(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        ifEnter(event)
                    }
                    disabled={createPending}
                    className="register-field"
                    required={true}
                />
                <Field
                    type="text"
                    lbl={t('guest:forms:Email')}
                    innerLabel={true}
                    value={userEmail}
                    onChange={(e: string) => setUserEmail(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        ifEnter(event)
                    }
                    disabled={createPending}
                    className="register-field"
                    required={true}
                />
                <Field
                    type={showPassword ? 'text' : 'password'}
                    lbl={t('guest:forms:Password')}
                    innerLabel={true}
                    value={userPassword}
                    onChange={(e: string) => setUserPassword(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        ifEnter(event)
                    }
                    endButton={() => setShowPassword(!showPassword)}
                    endContent={!showPassword ? t('guest:forms:Show') : t('guest:forms:Hide')}
                    disabled={createPending}
                    className="register-field"
                    required={true}
                />
                <Field
                    type="password"
                    lbl={t('guest:forms:Confirm-password')}
                    innerLabel={true}
                    value={userPassword_confirmation}
                    onChange={(e: string) => setUserPassword_confirmation(e)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                        ifEnter(event)
                    }
                    disabled={createPending}
                    className="register-field"
                    required={true}
                />
                <div className="flex items-center mb-4">
                    <input
                        id="acceptTerms"
                        type="checkbox"
                        name="acceptTerms"
                        checked={acceptTerms}
                        onChange={() => setAcceptTerms(!acceptTerms)}
                        required={true}
                        className="checkbox appearance-none rounded text-[#1ab11f] mr-2 h-4 w-4 border border-solid border-gray-300 checked:bg-[#1ab11f]"
                    />
                    <label htmlFor="acceptTerms" className="text-black">
                        {t('guest:forms:Accept-Terms-of-Service')}
                    </label>
                </div>
                <div className="flex items-center mb-4">
                    <input
                        id="confirmnewsletter"
                        type="checkbox"
                        name="confirmMarketing"
                        value="1"
                        className="checkbox appearance-none rounded text-[#1ab11f] mr-2 h-4 w-4 border border-solid border-gray-300 checked:bg-[#1ab11f]"
                    />
                    <label htmlFor="confirmnewsletter" className="text-black">
                        {t('guest:forms:Sign-me-up-for-news-and-marketing')}
                    </label>
                </div>
                <button
                    type="submit"
                    data-testid="register-submit"
                    className="w-full flex justify-center h-12 text-center py-3 rounded bg-[#1ab11f] text-white focus:outline-none my-1 hover:cursor-pointer"
                >
                    {createPending ? (
                        <LoadingButton />
                    ) : (
                        <>{t('guest:forms:buttons:Sign-up')}</>
                    )}
                </button>
            </form>
            <p className="mt-2">
                <Link className="text-[#1ab11f] font-bold" href="/sign-in">
                    {t('guest:links:Already-have-an-account')}
                </Link>
            </p>
        </Block>
    )
}
