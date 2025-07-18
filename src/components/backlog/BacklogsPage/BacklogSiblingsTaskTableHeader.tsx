import { Text } from '@/components';
import { BacklogSiblingsProps } from '@/components/backlog';
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type BacklogSiblingsTaskTableHeaderProps = Pick<
    BacklogSiblingsProps,
    'selectAll' |
    'currentSort' |
    'currentOrder' |
    'handleSort' |
    'handleSelectAllChange'
>

export const BacklogSiblingsTaskTableHeader: React.FC<BacklogSiblingsTaskTableHeaderProps> = (props) => (
    <thead>
        <tr>
            <th><input type="checkbox" checked={props.selectAll} onChange={props.handleSelectAllChange} /></th>
            {[
                { label: "Task Key", sortKey: "2" },
                { label: "Task Title", sortKey: "1" },
                { label: "Status", sortKey: "3" },
                { label: "Assignee", sortKey: "4" },
                { label: "Created At", sortKey: "5" },
            ].map(({ label, sortKey }) => (
                <th key={sortKey} onClick={() => props.handleSort(sortKey)}>
                    <Text variant="span">{label}</Text>
                    {props.currentSort === sortKey && (
                        <FontAwesomeIcon icon={props.currentOrder === "asc" ? faSortUp : faSortDown} />
                    )}
                </th>
            ))}
        </tr>
    </thead>
);
