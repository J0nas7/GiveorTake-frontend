// External
import React from "react";

// Internal
import { Header, LeftNav, Footer, MainContent } from "../";
import "../styles/global/Layout.scss"

export const PrivateLayout = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <div className="layout-container">
            <Header />
            <div className="content-wrapper">
                <LeftNav />
                <Footer />
                <MainContent>
                    {children}
                </MainContent>
            </div>
        </div>
    );
};
