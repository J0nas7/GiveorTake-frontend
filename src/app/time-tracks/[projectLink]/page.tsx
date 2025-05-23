// External
import React from "react"

// Internal
import { TimeTracksContainer } from "@/components/partials/project/TimeTracks"

// type Params = { slug: string };
// type SearchParams = { userId?: string }; // SearchParams type

type Params = { slug: string };

export default function TimeTracksPage({ params }: { params: Params }) {

    return (
        // Pass the userId to the container
        <TimeTracksContainer />
    );
}