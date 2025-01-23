// External
import React from "react"
import type { Metadata } from "next"

// Internal
import Providers from "./providers"

// CSS Modules
import '@/core-ui/styles/Tailwind.scss'
import '@/core-ui/styles/Global.scss'

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
