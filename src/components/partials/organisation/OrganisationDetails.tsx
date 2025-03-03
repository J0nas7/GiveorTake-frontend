"use client"

// External
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { TextField, Card, CardContent, Typography, Grid, Box } from '@mui/material';

// Dynamically import ReactQuill with SSR disabled
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Internal
import { useOrganisationsContext } from '@/contexts/'; // Ensure this is correctly set up
import { Organisation, OrganisationFields, User } from '@/types';
import Link from 'next/link';
import { Block, Text } from '@/components/ui/block-text';
import { selectAuthUser, useTypedSelector } from '@/redux';
import { Heading } from '@/components/ui/heading';
import { FlexibleBox } from '@/components/ui/flexible-box';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';

const OrganisationDetails: React.FC = () => {
    const { organisationId } = useParams<{ organisationId: string }>(); // Get organisationId from URL
    const { organisationById, readOrganisationById, saveOrganisationChanges } = useOrganisationsContext()
    const authUser = useTypedSelector(selectAuthUser) // Redux

    const [renderOrganisation, setRenderOrganisation] = useState<Organisation | undefined>(undefined)

    useEffect(() => { readOrganisationById(parseInt(organisationId)); }, [organisationId])
    useEffect(() => {
        if (organisationId) {
            setRenderOrganisation(organisationById)
            document.title = `Organisation: ${organisationById?.Organisation_Name} - GiveOrTake`
        }
    }, [organisationById])

    const handleHTMLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        handleOrganisationChange(name as OrganisationFields, value)
    };

    // Handle input changes for text fields
    const handleOrganisationChange = (field: OrganisationFields, value: string) => {
        if (!renderOrganisation) return

        setRenderOrganisation((prev) => ({
            ...prev!,
            [field]: value
        }));
    }

    const handleSaveChanges = () => {
        if (renderOrganisation) {
            saveOrganisationChanges(renderOrganisation, renderOrganisation.User_ID)
        }
    };

    if (!renderOrganisation) {
        return <div>Loading...</div>; // Add loading state for when data is still fetching
    }

    return (
        <OrganisationDetailsView
            organisation={renderOrganisation}
            authUser={authUser}
            onOrganisationChange={handleOrganisationChange}
            onSaveChanges={handleSaveChanges}
        />
    );
};

type OrganisationDetailsViewProps = {
    organisation: Organisation;
    authUser: User | undefined;
    onOrganisationChange: (field: OrganisationFields, value: string) => void;
    onSaveChanges: () => void;
}

export const OrganisationDetailsView: React.FC<OrganisationDetailsViewProps> = ({
    organisation,
    authUser,
    onOrganisationChange,
    onSaveChanges,
}) => {
    return (
        <Block className="page-content">
            <Box mb={4}>
                {/* <Heading variant="h1">Organisation Settings</Heading> */}
                <FlexibleBox
                    title="Organisation Settings"
                    icon={faBuilding}
                    className="no-box w-auto inline-block"
                    numberOfColumns={2}
                >
                    <Card>
                        {authUser && organisation.User_ID === authUser.User_ID ? (
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
                                            value={organisation.Organisation_Name}
                                            onChange={(e) => onOrganisationChange('Organisation_Name', e.target.value)}
                                            name="Organisation_Name"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Text>Organisation Description</Text>
                                        <ReactQuill
                                            className="w-full"
                                            theme="snow"
                                            value={organisation.Organisation_Description}
                                            onChange={(value) => onOrganisationChange('Organisation_Description', value)}
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
                                <Box mt={2}>
                                    <button onClick={onSaveChanges} className="button-blue">
                                        Save Changes
                                    </button>
                                </Box>
                            </CardContent>
                        ) : (
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Organisation Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <strong>Organisation Name:</strong><br />
                                        {organisation.Organisation_Name}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <strong>Organisation Description:</strong><br />
                                        <div className="bg-gray-100 p-2" dangerouslySetInnerHTML={{
                                            __html: organisation.Organisation_Description || 'No description available'
                                        }} />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        )}
                    </Card>
                </FlexibleBox>
            </Box>
            <Box mb={4}>
                <Typography variant="h5" gutterBottom>
                    Teams Overview
                </Typography>
                <Grid container spacing={3}>
                    {organisation.teams?.map((team) => (
                        <Grid item xs={12} sm={6} md={4} key={team.Team_ID}>
                            <Card>
                                <CardContent>
                                    <Link href={`/team/${team.Team_ID}`} className="blue-link-light">
                                        {team.Team_Name}
                                    </Link>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        <div dangerouslySetInnerHTML={{
                                            __html: team.Team_Description || 'No description available'
                                        }} />
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Created at: {team.Team_CreatedAt || 'N/A'}
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
        </Block>
    );
}

export default OrganisationDetails;
