"use client" // Ensures this is a Client Component

// External
import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { useTranslation } from 'next-i18next'

// Internal
import { Block, Field, Heading, Text } from "@/components"
// TODO import { useUsers } from '@/hooks'

export default function ForgotPassword() {
    // Hooks
    // TODO const { resetUserPassword } = useUsers()
    
    // Internal variables
    const { t } = useTranslation(['guest'])
    const [userEmail, setUserEmail] = useState<string>('')
    const [forgotPending, setForgotPending] = useState<boolean>(false)

    // Methods
    const doForgot = (e?: FormEvent) => {
        e?.preventDefault()
        
        if (!forgotPending) {
            setForgotPending(true)
            // TODO resetUserPassword(userEmail) // Trigger password reset
            setTimeout(() => {
                setForgotPending(false) // Simulate async reset completion
            }, 1000)
        }
    }

    const ifEnter = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') doForgot(e as any)
    }

    return (
        <Block className="forgot-page">
            <Heading variant="h2">
                {t('guest:h2:Forgot password')}
            </Heading>
            <form onSubmit={doForgot} className="guest-form">
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
                />
                <input
                    type="submit"
                    value={t('guest:forms:buttons:Forgot')}
                    className="w-full text-center py-3 rounded bg-[#1ab11f] text-white focus:outline-none my-1"
                    disabled={forgotPending} // Disable during pending
                />
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
