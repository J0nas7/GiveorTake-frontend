// External
import React from "react"

// Internal
import { TimeTracksContainer } from "@/components/partials/project/TimeTracks"

type Params = { slug: string };
type SearchParams = { userId?: string }; // SearchParams type

export default async function TimeTracksPage(props: {
    params: Params;
    searchParams: SearchParams;
}) {
    const { slug } = props.params;
    const { userId } = props.searchParams; // Extract userId from searchParams

    return (
        // Pass the userId to the container
        <TimeTracksContainer userId={userId} />
    );
}