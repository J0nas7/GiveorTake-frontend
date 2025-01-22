import React from "react";

import styles from "../styles/MainContent.module.scss";

const MainContent = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <main className={styles.mainContent}>
            <h1 className={styles.heading}>Welcome to the Main Content</h1>
            <div className={styles.paragraph}>
                {children}
            </div>
        </main>
    );
};

export default MainContent;
