"use client"

import { FlexibleBox } from '@/components';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import React from 'react';

void React.createElement

export const TaskSummaryCard: React.FC<{
    stats: {
        total: number;
        assigneeCount: Record<string | number, number>;
    } | null
}> = ({
    stats
}) => stats && (
    <FlexibleBox
        title="Task Summary"
        icon={undefined}
        className="no-box w-auto inline-block"
    >
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Total Tasks</Typography>
                        <Typography>{stats.total}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Assignee Distribution</Typography>
                        {Object.entries(stats.assigneeCount).map(([assignee, count]) => (
                            <Typography key={assignee}>
                                {assignee === "Unassigned" ? "Unassigned" : `User #${assignee}`}:
                                {((count / stats.total) * 100).toFixed(1)}%
                            </Typography>
                        ))}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </FlexibleBox>
)
