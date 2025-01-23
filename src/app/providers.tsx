"use client"

// External
import { Provider } from 'react-redux'

// Internal
import { LayoutController } from "@/core-ui/"

// Providers
import appStore from '@/redux/store'
// import { I18nProvider } from '@/contexts/i18n-context'

export function Providers(
    { children }: { children: React.ReactNode }
) {
    return (
        <>
            <Provider store={appStore(undefined)}>
                <LayoutController>
                    {children}
                </LayoutController>
            </Provider>
        </>
    )
}

export default Providers;