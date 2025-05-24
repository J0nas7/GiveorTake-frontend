"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { TextField, Card, CardContent, Typography, Grid, Box } from '@mui/material';

// Dynamically import ReactQuill with SSR disabled
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { useOrganisationsContext } from '@/contexts/'; // Ensure this is correctly set up
import { Organisation, OrganisationFields, OrganisationStates, User } from '@/types';
import Link from 'next/link';
import { Block, Text } from '@/components/ui/block-text';
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from '@/redux';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { faBuilding, faHouseChimney, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CreatedAtToTimeSince } from '../task/TaskTimeTrackPlayer';
import Image from 'next/image';
import { LoadingState } from '@/core-ui/components/LoadingState';
import { useURLLink } from '@/hooks';

const OrganisationDetails: React.FC = () => {
    // ---- Hooks ----
    const router = useRouter()
    const { organisationById, readOrganisationById, saveOrganisationChanges, removeOrganisation } = useOrganisationsContext()
    const { organisationLink } = useParams<{ organisationLink: string }>() // Get organisationLink from URL
    const { linkId: organisationId, convertID_NameStringToURLFormat } = useURLLink(organisationLink)

    // ---- State ----
    const authUser = useTypedSelector(selectAuthUser) // Redux
    const [renderOrganisation, setRenderOrganisation] = useState<OrganisationStates>(undefined)
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions)
    // Determine if the authenticated user can modify organisation settings:
    const canModifyOrganisationSettings = (authUser && renderOrganisation && (
        renderOrganisation.User_ID === authUser.User_ID ||
        parsedPermissions?.includes("Modify Organisation Settings")
    ))

    // ---- Methods ----
    // Handles changes to HTML input fields and updates the organisation state.
    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        handleOrganisationChange(name as OrganisationFields, value)
    };

    // Updates the organisation state with changes to a specific field.
    const handleOrganisationChange = (field: OrganisationFields, value: string) => {
        if (!renderOrganisation) return

        setRenderOrganisation({
            ...renderOrganisation,
            [field]: value
        });
    }

    // Handles saving changes made to the organisation details.
    const handleSaveChanges = async () => {
        if (renderOrganisation) await saveOrganisationChanges(renderOrganisation, renderOrganisation.User_ID)
    }

    // Handles deleting the organisation.
    const handleDeleteOrganisation = async () => {
        if (!renderOrganisation || !renderOrganisation.Organisation_ID) return
        const removed = await removeOrganisation(
            renderOrganisation.Organisation_ID,
            renderOrganisation.User_ID,
            `/`
        )
    }
    
    // ---- Effects ----
    useEffect(() => { readOrganisationById(parseInt(organisationId)); }, [organisationId])
    useEffect(() => {
        if (organisationId) {
            setRenderOrganisation(organisationById)

            if (organisationById) document.title = `Organisation: ${organisationById?.Organisation_Name} - GiveOrTake`
        }
    }, [organisationById])

    // ---- Render ----
    return (
        <OrganisationDetailsView
            renderOrganisation={renderOrganisation}
            canModifyOrganisationSettings={canModifyOrganisationSettings}
            handleOrganisationChange={handleOrganisationChange}
            handleSaveChanges={handleSaveChanges}
            handleDeleteOrganisation={handleDeleteOrganisation}
            convertID_NameStringToURLFormat={convertID_NameStringToURLFormat}
        />
    );
};

type OrganisationDetailsViewProps = {
    renderOrganisation: OrganisationStates;
    canModifyOrganisationSettings: boolean | undefined
    handleOrganisationChange: (field: OrganisationFields, value: string) => void;
    handleSaveChanges: () => Promise<void>
    handleDeleteOrganisation: () => Promise<void>
    convertID_NameStringToURLFormat: (id: number, name: string) => string
}

export const OrganisationDetailsView: React.FC<OrganisationDetailsViewProps> = ({
    renderOrganisation,
    canModifyOrganisationSettings,
    handleOrganisationChange,
    handleSaveChanges,
    handleDeleteOrganisation,
    convertID_NameStringToURLFormat
}) => {
    return (
        <Block className="page-content">
            <FlexibleBox
                title="Organisation Settings"
                subtitle={renderOrganisation ? renderOrganisation.Organisation_Name : undefined}
                titleAction={
                    <Block className="flex gap-3 w-full">
                        {renderOrganisation && canModifyOrganisationSettings && (
                            <Link 
                                href={`/organisation/${convertID_NameStringToURLFormat(renderOrganisation.Organisation_ID ?? 0, renderOrganisation.Organisation_Name)}/create-team`} 
                                className="blue-link !inline-flex gap-2 items-center"
                            >
                                <FontAwesomeIcon icon={faUsers} />
                                <Text variant="span">Create Team</Text>
                            </Link>
                        )}

                        {/* Home Link */}
                        <Link href={`/`} className="blue-link sm:ml-auto !inline-flex gap-2 items-center">
                            <FontAwesomeIcon icon={faHouseChimney} />
                            <Text variant="span">Go to Home</Text>
                        </Link>
                    </Block>
                }
                icon={faBuilding}
                className="no-box w-auto inline-block"
                numberOfColumns={2}
            >
                <LoadingState singular="Organisation" renderItem={renderOrganisation} permitted={undefined}>
                    {renderOrganisation && (
                        <Card>
                            {canModifyOrganisationSettings ? (
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Edit Organisation Details
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Organisation Name"
                                                variant="outlined"
                                                fullWidth
                                                value={renderOrganisation.Organisation_Name}
                                                onChange={(e) => handleOrganisationChange('Organisation_Name', e.target.value)}
                                                name="Organisation_Name"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Text>Organisation Description</Text>
                                            <ReactQuill
                                                className="w-full"
                                                theme="snow"
                                                value={renderOrganisation.Organisation_Description}
                                                onChange={(value) => handleOrganisationChange('Organisation_Description', value)}
                                                modules={{
                                                    toolbar: [
                                                        [{ header: "1" }, { header: "2" }, { font: [] }],
                                                        [{ list: "ordered" }, { list: "bullet" }],
                                                        ["bold", "italic", "underline", "strike"],
                                                        [{ align: [] }],
                                                        ["link"],
                                                        ["blockquote"],
                                                    ],
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Block className="mt-2 flex justify-between">
                                        <button onClick={handleSaveChanges} className="button-blue">
                                            Save Changes
                                        </button>
                                        <button onClick={handleDeleteOrganisation} className="blue-link-light red-link-light">
                                            Delete Organisation
                                        </button>
                                    </Block>
                                </CardContent>
                            ) : (
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Organisation Details
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <strong>Organisation Name:</strong><br />
                                            {renderOrganisation.Organisation_Name}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <strong>Organisation Description:</strong><br />
                                            <div className="bg-gray-100 p-2" dangerouslySetInnerHTML={{
                                                __html: renderOrganisation.Organisation_Description || 'No description available'
                                            }} />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            )}
                        </Card>
                    )}
                </LoadingState>
            </FlexibleBox>

            {renderOrganisation && (
                <Box mb={4}>
                    <Typography variant="h5" gutterBottom>
                        Teams Overview
                    </Typography>
                    <Grid container spacing={3}>
                        {renderOrganisation.teams?.map((team) => (
                            <Grid item xs={12} sm={6} md={4} key={team.Team_ID}>
                                <Card>
                                    <CardContent>
                                        <Link href={`/team/${convertID_NameStringToURLFormat(team.Team_ID ?? 0, team.Team_Name)}`} className="blue-link-light">
                                            {team.Team_Name}
                                        </Link>
                                        <Typography variant="body2" color="textSecondary" paragraph>
                                            <div dangerouslySetInnerHTML={{
                                                __html: team.Team_Description || 'No description available'
                                            }} />
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Created at:{" "}
                                            {team.Team_CreatedAt && (
                                                <CreatedAtToTimeSince dateCreatedAt={team.Team_CreatedAt} />
                                            )}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Team Members: {team.user_seats?.length || 0}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Block >
    );
}

export default OrganisationDetails;
