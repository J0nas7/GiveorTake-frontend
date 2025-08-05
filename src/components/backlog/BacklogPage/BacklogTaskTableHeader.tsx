import { Text } from '@/components';
import { BacklogProps } from '@/components/backlog';
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

void React.createElement

type BacklogTaskTableHeaderProps = Pick<
    BacklogProps,
    'selectAll' |
    'handleSelectAllChange' |
    'currentSort' |
    'currentOrder' |
    'handleSort'
>

export const BacklogTaskTableHeader: React.FC<BacklogTaskTableHeaderProps> = (props) => (
    <thead>
        <tr>
            <th><input type="checkbox" checked={props.selectAll} onChange={props.handleSelectAllChange} /></th>
            {[
                { label: 'Task Key', col: '2' },
                { label: 'Task Title', col: '1' },
                { label: 'Status', col: '3' },
                { label: 'Assignee', col: '4' },
                { label: 'Created At', col: '5' },
            ].map(({ label, col }) => (
                <th key={col} onClick={() => props.handleSort(col)}>
                    <Text variant="span">{label}</Text>
                    {props.currentSort === col && (
                        <FontAwesomeIcon icon={props.currentOrder === 'asc' ? faSortUp : faSortDown} />
                    )}
                </th>
            ))}
        </tr>
    </thead>
);
