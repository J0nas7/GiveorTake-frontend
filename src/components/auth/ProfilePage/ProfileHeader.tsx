import { Block, Text } from "@/components/ui/block-text";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";

export const ProfileHeader: React.FC = () => (
    <Block className="actions-wrapper">
        <Link
            href={`/`}
            className="blue-link action-button button-right"
        >
            <FontAwesomeIcon icon={faHouseChimney} />
            <Text variant="span">Go to Home</Text>
        </Link>
    </Block>
);
