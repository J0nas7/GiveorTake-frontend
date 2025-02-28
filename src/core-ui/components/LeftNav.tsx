// External
import React, { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

// Internal
import styles from "../styles/modules/LeftNav.module.scss";
import { useTeamUserSeatsContext } from "@/contexts";
import { Organisation, Project, Team, TeamUserSeat } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import { Block } from "@/components";
import { selectAuthUser, selectAuthUserSeat, useTypedSelector } from "@/redux";

export const LeftNav: React.FC = () => {
    const authUser = useTypedSelector(selectAuthUser) // Redux
    const authUserSeats = useTypedSelector(selectAuthUserSeat) // Redux

    if (!authUser || !authUserSeats) return null

    const navLinks: Record<string, string> = {
        [`/project/${authUserSeats.team?.projects?.[0].Project_ID}`]: "Dashboard",
        [`/backlog/${authUserSeats.team?.projects?.[0].Project_ID}`]: "Backlog",
        [`/kanban/${authUserSeats.team?.projects?.[0].Project_ID}`]: "Kanban Board",
        [`/organisation/${authUserSeats.team?.organisation?.Organisation_ID}`]: "Settings",
        "/profile": "Profile"
    };
    
    return (
        <aside className={styles.leftNav}>
            <ul className={styles.navList}>
                <li>
                    <Block variant="span" className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBuilding} />
                        <Block variant="span">
                            <Link 
                                href={`/organisation/${authUserSeats.team?.organisation?.Organisation_ID}`} 
                                className={`inline-block text-xs`}
                            >
                                <strong>{authUserSeats.team?.organisation?.Organisation_Name}</strong>
                            </Link>
                            <Link 
                                href={`/team/${authUserSeats.team?.Team_ID}`} 
                                className={`inline-block text-sm`}
                            >
                                {authUserSeats.team?.Team_Name}
                            </Link>
                        </Block>
                    </Block>
                </li>
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