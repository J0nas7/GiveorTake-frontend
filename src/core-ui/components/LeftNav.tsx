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
import { selectAuthUser, useTypedSelector } from "@/redux";

const navLinks: Record<string, string> = {
    "/": "Dashboard",
    "/backlog": "Backlog",
    "/kanban": "Kanban Board",
    "/organisation/1": "Settings",
    "/profile": "Profile"
};

export const LeftNav: React.FC = () => {
    const { teamUserSeats } = useTeamUserSeatsContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    if (!authUser) return null

    // Get teams the user is a part of
    const userTeam: TeamUserSeat|undefined = Array.isArray(teamUserSeats)
        ? teamUserSeats.filter((seat) => seat.User_ID === authUser.User_ID)[0]
        : undefined

    if (!userTeam) return null

    return (
        <aside className={styles.leftNav}>
            <ul className={styles.navList}>
                <li>
                    <Block variant="span" className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBuilding} />
                        <Block variant="span">
                            <Link 
                                href={`/organisation/${userTeam.team?.organisation?.Organisation_ID}`} 
                                className={`inline-block text-xs`}
                            >
                                <strong>{userTeam.team?.organisation?.Organisation_Name}</strong>
                            </Link>
                            <Link 
                                href={`/team/${userTeam.team?.Team_ID}`} 
                                className={`inline-block text-sm`}
                            >
                                {userTeam.team?.Team_Name}
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