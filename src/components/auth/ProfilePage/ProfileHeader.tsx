import { Block, Text } from "@/components/ui/block-text";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";

export const ProfileHeader: React.FC = () => (
    <Block className="flex gap-3 w-full">
        <Link
            href={`/`}
            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
        >
            <FontAwesomeIcon icon={faHouseChimney} />
            <Text variant="span">Go to Home</Text>
        </Link>
    </Block>
);
