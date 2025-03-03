// External
import React from "react";

// Internal
import { Header, LeftNav, Footer } from "../";
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
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};
