// External
import React from "react";

// Internal
import { Header, LeftNav, Footer } from "../";
import { TaskDetailWithModal } from "@/components/partials/task/TaskDetails";
import { TaskTimeTrackPlayer } from "@/components/partials/task/TaskTimeTrackPlayer";
import { SnackBar } from "../components/SnackBar";

export const PrivateLayout = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <div className="layout-container">
            <TaskDetailWithModal />
            <TaskTimeTrackPlayer />
            <SnackBar />
            <Header />
            <div className="content-wrapper">
                <Footer />
                {/* <LeftNav /> */}
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};
