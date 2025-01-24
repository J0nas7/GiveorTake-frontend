// External
import React from "react";
import clsx from "clsx";

// Internal
import styles from "../styles/modules/LeftNav.module.scss";

export const LeftNav: React.FC = () => {
    return (
        <aside className={styles.leftNav}>
            <ul className={styles.navList}>
                <li>
                    <a href="#" className={clsx(styles.navLink)}>Dashboard</a>
                </li>
                <li>
                    <a href="#" className={clsx(styles.navLink)}>Settings</a>
                </li>
                <li>
                    <a href="#" className={clsx(styles.navLink)}>Profile</a>
                </li>
                <li>
                    <a href="#" className={clsx(styles.navLink)}>Help</a>
                </li>
            </ul>
        </aside>
    );
};
