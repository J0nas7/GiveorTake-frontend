// External
import React from "react";

// Internal
import { TaskTimeTrackPlayer } from "@/components/partials/task/TaskTimeTrackPlayer";
import { TaskDetailWithModal } from "@/components/task/TaskView";
import { Footer, Header } from "../";
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
