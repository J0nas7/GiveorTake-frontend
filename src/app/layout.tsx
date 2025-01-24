// External
import React from "react"
import type { Metadata } from "next"

// Internal
import Providers from "./providers"

// Global CSS
import "@/core-ui/styles/global/Tailwind.scss"
import "@/core-ui/styles/global/Global.scss"
import "@/core-ui/styles/global/Layout.scss"
import "@/core-ui/styles/global/Guest.scss"

export const metadata: Metadata = {
    title: "GiveOrTake - Project Management & Time Tracking",
    description: "Project Management & Time Tracking",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`font-sans`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
