// External
import React, { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

// Internal
import styles from "../styles/modules/LeftNav.module.scss";
import { Organisation, Project } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faUser, faChevronDown, faChevronRight, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import { Block, Text } from "@/components";
import { selectAuthUser, selectAuthUserOrganisation, selectAuthUserSeat, useTypedSelector } from "@/redux";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks";
import { useOrganisationsContext } from "@/contexts";
import { render } from "@testing-library/react";

export const LeftNav: React.FC = () => {
    const { t } = useTranslation('leftnav')
    const { handleLogoutSubmit } = useAuth()

    const { organisationsById, readOrganisationsByUserId } = useOrganisationsContext()
    const authUser = useTypedSelector(selectAuthUser); // Redux
    const authUserSeats = useTypedSelector(selectAuthUserSeat); // Redux
    const authUserOrganisation = useTypedSelector(selectAuthUserOrganisation); // Redux

    const [renderOrganisation, setRenderOrganisation] = useState<Organisation|undefined>(undefined)

    // Toggle state for each project
    const [visibleProject, setVisibleProject] = useState<string | null>(null);

    const handleToggle = (projectId: string) => {
        setVisibleProject(visibleProject === projectId ? null : projectId);
    };

    const navLinks: Record<string, string> = {
        [`/project/dashboard/`]: "Dashboard",
        [`/backlog/`]: "Backlog",
        [`/kanban/`]: "Kanban Board",
        [`/time-tracks/project/`]: "Time Entries",
    }

    useEffect(() => {
        if (authUserSeats && authUserSeats.team?.projects?.[0]?.Project_ID) {
            setVisibleProject(authUserSeats.team?.projects?.[0].Project_ID.toString())
            setRenderOrganisation(authUserSeats.team?.organisation)
        } else if (authUserOrganisation && authUserOrganisation.teams?.[0].projects?.[0].Project_ID) {
            setVisibleProject(authUserOrganisation.teams?.[0].projects?.[0].Project_ID.toString())
            setRenderOrganisation(authUserOrganisation)
        }
    }, [authUserSeats, authUserOrganisation])

    useEffect(() => {
        if (authUser?.User_ID) {
            readOrganisationsByUserId(authUser.User_ID)
        }
    }, [authUser])

    if (!authUser) return null

    return (
        <aside className={styles.leftNav}>
            <ul className={styles.navList}>
                {!authUserSeats &&
                    authUser && organisationsById.length &&
                    organisationsById[0].User_ID === authUser.User_ID ? (
                    <Text variant="span">
                        {t('leftnav:noseats')}
                    </Text>
                ) : renderOrganisation ? (
                    <>
                        <li>
                            <Block variant="span" className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faBuilding} />
                                <Block variant="span">
                                    <Link
                                        href={`/organisation/${renderOrganisation.Organisation_ID}`}
                                        className={`inline-block text-xs`}
                                    >
                                        <strong>{renderOrganisation.Organisation_Name}</strong>
                                    </Link>
                                    <Link
                                        href={`/team/${renderOrganisation.teams?.[0].Team_ID}`}
                                        className={`inline-block text-sm`}
                                    >
                                        {renderOrganisation.teams?.[0].Team_Name}
                                    </Link>
                                </Block>
                            </Block>
                        </li>

                        {/* Projects Links */}
                        {renderOrganisation.teams?.[0].projects?.map((project: Project) => (
                            <ul
                                key={project.Project_ID}
                                className="ml-4 pl-2"
                            >
                                <li className="ml-[-1.5rem]">
                                    <Block
                                        className="flex gap-2 items-center cursor-pointer"
                                        onClick={() => handleToggle(project.Project_ID.toString())}
                                    >
                                        <FontAwesomeIcon
                                            icon={visibleProject === project.Project_ID.toString() ? faChevronDown : faChevronRight}
                                            className="button-link !px-0"
                                        />
                                        <Link
                                            href={`/project/${project.Project_ID}`}
                                            className={clsx(
                                                "button-link",
                                                `inline-block text-sm`
                                            )}
                                        >
                                            <Block variant="span" className="flex items-center gap-2">
                                                {project.Project_Name}
                                            </Block>
                                        </Link>
                                    </Block>
                                </li>

                                {/* Rendering Navigation Links */}
                                {visibleProject === project.Project_ID.toString() && (
                                    <ul>
                                        {Object.entries(navLinks).map(([url, title]) => (
                                            <li key={url}>
                                                <Link href={url + project.Project_ID} className={clsx("button-link")}>
                                                    {title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </ul>
                        ))}
                    </>
                ) : null} {/* Default case: Render nothing */}

                <li>
                    <Block variant="span" className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} />
                        <Block variant="span">
                            <Link
                                href="/profile"
                                className={clsx(
                                    "button-link",
                                    `inline-block text-sm`
                                )}
                            >
                                Profile
                            </Link>
                        </Block>
                    </Block>
                </li>
                <li>
                    <Block variant="span" className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faDoorOpen} />
                        <Block
                            variant="span"
                            className={clsx(
                                "button-link",
                                `inline-block text-sm cursor-pointer`
                            )}
                            onClick={handleLogoutSubmit}
                        >
                            Log out
                        </Block>
                    </Block>
                </li>
            </ul>
        </aside>
    );
};
