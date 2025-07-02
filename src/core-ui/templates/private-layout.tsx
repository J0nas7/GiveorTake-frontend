// External
import React from "react";

// Internal
import { TaskDetailWithModal } from "@/components/partials/task/TaskContainer";
import { TaskTimeTrackPlayer } from "@/components/partials/task/TaskTimeTrackPlayer";
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
