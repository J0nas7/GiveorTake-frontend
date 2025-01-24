// External
import clsx from "clsx"
import React from "react"

// Internal
import styles from "../styles/modules/Header.module.scss";

export const Header: React.FC = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>MyLogo</div>
                <nav>
                    <ul className={styles.navList}>
                        <li>
                            <a href="#" className={clsx(styles.navLink)}>
                                Home
                            </a>
                        </li>
                        <li>
                            <a href="#" className={clsx(styles.navLink)}>
                                About
                            </a>
                        </li>
                        <li>
                            <a href="#" className={clsx(styles.navLink)}>
                                Contact
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};