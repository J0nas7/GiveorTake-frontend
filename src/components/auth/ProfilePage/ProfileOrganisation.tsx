import { Heading } from "@/components/ui/heading";
import styles from "@/core-ui/styles/modules/User.settings.module.scss";
import Link from "next/link";
import React from "react";
import { ProfileProps } from "./Profile";

type ProfileOrganisationProps = Pick<
    ProfileProps,
    "renderOrganisation"
>

export const ProfileOrganisation: React.FC<ProfileOrganisationProps> = (props) => (
    <div className={styles.userTeamsContainer}>
        <Heading variant="h3" className={styles.teamsHeading}>Organisation this user is a part of</Heading>
        {props.renderOrganisation ? (
            <ul className={styles.teamsList}>
                <li className={styles.teamItem}>
                    <p>
                        <strong>Organisation Name:</strong>{" "}
                        <Link
                            href={`/organisation/${props.renderOrganisation.Organisation_ID}`}
                            className="blue-link-light"
                        >
                            {props.renderOrganisation.Organisation_Name}
                        </Link>
                    </p>
                </li>
            </ul>
        ) : (
            <p>This user is not part of any organisation.</p>
        )}
    </div>
);
