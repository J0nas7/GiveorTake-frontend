import React from "react"
import type { Metadata } from "next"
import "@/core-ui/styles/globals.scss"
import { Layout } from "@/core-ui/"

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
                <Layout>
                    {children}
                </Layout>
            </body>
        </html>
    )
}
