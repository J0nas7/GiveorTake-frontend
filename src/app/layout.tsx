// External
import React from "react"
import type { Metadata } from "next"

// Internal
import Providers from "./providers"

// Global CSS
import "@/core-ui/styles/global/Tailwind.scss"
import "@/core-ui/styles/global/Global.scss"
import "@/core-ui/styles/global/Button.scss"
import "@/core-ui/styles/global/Layout.scss"
import "@/core-ui/styles/global/Guest.scss"
import "@/core-ui/styles/global/TaskPlayer.scss";
import "@/core-ui/styles/global/Flexible-Box.scss"

export const metadata: Metadata = {
    title: {
        default: "GiveOrTake - Project Management & Time Tracking",
        template: "GiveOrTake - %s", // Automatically adds "GiveOrTake | " as a prefix
    },
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
        <html lang={params.locale || "en-US"}>
            <body className={`font-sans`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
