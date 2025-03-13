// External
import React from "react";

// Internal
import { Header, LeftNav, Footer } from "../";
import { TasksProvider } from "@/contexts";
import { TaskDetailWithModal } from "@/components/partials/task/TaskDetails";
import { TaskTimeTrackPlayer } from "@/components/partials/task/TaskTimeTrackPlayer";
import { TaskBulkActionMenu } from "@/components/partials/task/TaskBulkActionMenu";

export const PrivateLayout = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <div className="layout-container">
            <TaskDetailWithModal />
            <TaskTimeTrackPlayer />
            <TaskBulkActionMenu />
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
