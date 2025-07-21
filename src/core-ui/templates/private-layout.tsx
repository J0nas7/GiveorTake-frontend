// External
import React from "react";

// Internal
import { TaskDetailWithModal } from "@/components/task/TaskView";
import { Footer, Header } from "@/core-ui/";
import { SnackBar } from "@/core-ui/components/SnackBar";
import { TaskTimeTrackPlayer } from "@/core-ui/components/TaskTimeTrackPlayer";

type PrivateLayoutProps = {
    children: React.ReactNode
}

export const PrivateLayout: React.FC<PrivateLayoutProps> = (props) => (
    <div className="layout-container">
        <TaskDetailWithModal />
        <TaskTimeTrackPlayer />
        <SnackBar />
        <Header />
        <div className="content-wrapper">
            <Footer />
            {/* <LeftNav /> */}
            <main className="main-content">
                {props.children}
            </main>
        </div>
    </div>
);
