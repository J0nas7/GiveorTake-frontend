"use client"

// External
// import { TFunction } from "next-i18next"
import { useEffect, useState } from "react"

// Internal
import { GuestLayout, PrivateLayout, OnlyPublicRoutes, OnlyPrivateRoutes, TypeProvider } from "@/core-ui"
import { selectIsLoggedIn, useTypedSelector } from "@/redux"

export default function LayoutController(
    { children }: { children: React.ReactNode }
) {
    // Redux
    const isLoggedIn = useTypedSelector(selectIsLoggedIn)

    // Internal variables
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
            </TypeProvider>
        </div>
    )
}