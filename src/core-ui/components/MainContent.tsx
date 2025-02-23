import React from "react";

import styles from "../styles/modules/MainContent.module.scss";

export const MainContent = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <main className={styles.mainContent}>
            {children}
        </main>
    );
}
