// External
import React from "react";

// Internal
import Header from "./Header";
import Footer from "./Footer";
import LeftNav from "./LeftNav";
import MainContent from "./MainContent"
import "../styles/Layout.module.scss"

export const Layout = (
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
