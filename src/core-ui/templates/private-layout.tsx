// External
import React from "react";

// Internal
import { Header, LeftNav, Footer, MainContent } from "../";
import "../styles/global/Layout.scss"
import { TasksProvider } from "@/contexts";
import { TaskDetailWithModal } from "@/components/partials/task/TaskDetails";

export const PrivateLayout = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <div className="layout-container">
            <TaskDetailWithModal />
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
