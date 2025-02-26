// External
import React from "react";

// Internal
import { Header, LeftNav, Footer, MainContent } from "../";
import "../styles/global/Layout.scss"
import { TaskDetail } from "@/components/partials/TaskDetails";
import { TasksProvider } from "@/contexts";

export const PrivateLayout = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <TasksProvider>
            <div className="layout-container">
                <TaskDetail />
                <Header />
                <div className="content-wrapper">
                    <LeftNav />
                    <Footer />
                    <MainContent>
                        {children}
                    </MainContent>
                </div>
            </div>
        </TasksProvider>
    );
};
