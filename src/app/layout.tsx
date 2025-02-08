// External
import React from "react"
import type { Metadata } from "next"

// Internal
import Providers from "./providers"
import { getTranslations } from "./lib/getTranslations"

// Global CSS
import "@/core-ui/styles/global/Tailwind.scss"
import "@/core-ui/styles/global/Global.scss"
import "@/core-ui/styles/global/Layout.scss"
import "@/core-ui/styles/global/Guest.scss"

export const metadata: Metadata = {
    title: "GiveOrTake - Project Management & Time Tracking",
    description: "Project Management & Time Tracking",
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode,
    params: { locale: string }
}>) {
    return (
        <html lang={params.locale || "en"}>
            <body className={`font-sans`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
