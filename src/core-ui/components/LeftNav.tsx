// External
import React from "react";
import Link from "next/link";
import clsx from "clsx";

// Internal
import styles from "../styles/modules/LeftNav.module.scss";

const navLinks: Record<string, string> = {
    "/": "Dashboard",
    "/backlog": "Backlog",
    "/kanban": "Kanban Board",
    "/settings": "Settings",
    "/profile": "Profile",
    "/help": "Help",
};

export const LeftNav: React.FC = () => {
    return (
        <aside className={styles.leftNav}>
            <ul className={styles.navList}>
                {Object.entries(navLinks).map(([url, title]) => (
                    <li key={url}>
                        <Link href={url} className={clsx(styles.navLink)}>
                            {title}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};