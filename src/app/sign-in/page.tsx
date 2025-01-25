"use client"

// External
import Link from "next/link"
import { FormEvent, useState } from "react"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/navigation"

// Internal
import { Block, Text, Field, Heading } from "@/components"
import { useAuth } from "@/hooks"

export default function SignInPage() {
    // Hooks
    const { handleLoginSubmit } = useAuth()
    const router = useRouter()

    // Internal variables
    const { t } = useTranslation(['guest'])
    const [userEmail, setUserEmail] = useState<string>('')
    const [userPassword, setUserPassword] = useState<string>('')
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [loginPending, setLoginPending] = useState<boolean>(false)

    // Methods
    const doLogin = (e?: FormEvent) => {
        e?.preventDefault()

        if (loginPending) return
        setLoginPending(true)
        
        handleLoginSubmit(userEmail, userPassword)
            .then((loginResult) => {
                if (loginResult) router.push('/')
            })
            .finally(() => {
                setLoginPending(false)
            })
    }
    
    const ifEnter = (e: React.KeyboardEvent) => (e.key === 'Enter') ? doLogin() : null
    
    return (
        <Block className="login-page">
            <Heading variant="h2">
                {t('guest:h2:Login')}
            </Heading>
            <form onSubmit={doLogin} className="guest-form">
                <Field
                    type="text"
                    lbl={t('guest:forms:Email')}
                    innerLabel={true}
                    value={userEmail}
                    onChange={(e: string) => setUserEmail(e)}
                    onKeyDown={
                        (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                            ifEnter(event)
                    }
                    disabled={loginPending}
                    className="login-field"
                    required={true}
                />
                <Field
                    type={showPassword ? 'text' : 'password'}
                    lbl={t('guest:forms:Password')}
                    innerLabel={true}
                    value={userPassword}
                    onChange={(e: string) => setUserPassword(e)}
                    onKeyDown={
                        (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                            ifEnter(event)
                    }
                    endButton={() => { setShowPassword(!showPassword) }}
                    endContent={!showPassword ? t('guest:forms:Show') : t('guest:forms:Hide')}
                    disabled={loginPending}
                    className="login-field"
                    required={true}
                />
                <button
                    type="submit"
                    className="w-full text-center py-3 rounded bg-[#1ab11f] text-white focus:outline-none my-1 hover:cursor-pointer"
                >
                    {t('guest:forms:buttons:Login')}
                </button>
            </form>
            <p className="mt-2">
                <Link className="text-[#1ab11f] font-bold" href="/forgot-password">
                    {t('guest:links:Did-you-forget-your-password')}
                </Link>
            </p>
            <p className="mt-2">
                <Link className="text-[#1ab11f] font-bold" href="/register-account">
                    {t('guest:links:Create-a-new-account')}
                </Link>
            </p>
        </Block>
    )
}
