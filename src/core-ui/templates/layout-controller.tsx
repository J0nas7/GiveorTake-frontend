"use client"

// External
// import { TFunction } from "next-i18next"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from "react"

// Internal
import { GuestLayout, OnlyPrivateRoutes, OnlyPublicRoutes, PrivateLayout, TypeProvider } from "@/core-ui"
import { selectIsLoggedIn, useTypedSelector } from "@/redux"

export default function LayoutController(
    { children }: { children: React.ReactNode }
) {
    // Redux
    const isLoggedIn = useTypedSelector(selectIsLoggedIn)

    // Internal variables
    const [queryClient] = useState(() => new QueryClient())
    const [isLoading, setIsLoading] = useState<boolean>(true)

    // Effects
    useEffect(() => {
        setIsLoading(false)
    }, [])

    if (isLoading) return null

    // If authorized, show the PrivateLayout
    // If not authorized, show the GuestLayout
    return (
        <div className="giveortake-wrapper">
            <TypeProvider>
                <QueryClientProvider client={queryClient}>
                    {
                        isLoggedIn === true ?
                            (
                                <OnlyPrivateRoutes>
                                    <PrivateLayout>
                                        {children}
                                    </PrivateLayout>
                                </OnlyPrivateRoutes>
                            ) : (
                                <OnlyPublicRoutes>
                                    <GuestLayout>
                                        {children}
                                    </GuestLayout>
                                </OnlyPublicRoutes>
                            )
                    }
                </QueryClientProvider>
            </TypeProvider>
        </div>
    )
}
