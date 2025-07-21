import { Block, Text } from '@/components';
import { RolesSeatsProps } from '@/components/team/RolesSeatsManager/RolesSeats';
import { faShield, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

export const RolesSeatsHeader: React.FC<RolesSeatsProps> = (props) => props.renderTeam && (
    <Block className="flex gap-2 items-center w-full">
        {props.canManageTeamMembers && (
            <>
                <Link
                    className="blue-link !inline-flex gap-2 items-center"
                    href="?seatId=new"
                >
                    <FontAwesomeIcon icon={faUser} />
                    <Text variant="span">New Invite</Text>
                </Link>
                <Link
                    className="blue-link !inline-flex gap-2 items-center"
                    href="?roleId=new"
                >
                    <FontAwesomeIcon icon={faShield} />
                    <Text variant="span">New Role</Text>
                </Link>
            </>
        )}
        <Link
            href={`/team/${props.convertID_NameStringToURLFormat(props.renderTeam.Team_ID ?? 0, props.renderTeam.Team_Name)}`}
            className="blue-link sm:ml-auto !inline-flex gap-2 items-center"
        >
            <FontAwesomeIcon icon={faUsers} />
            <Text variant="span">Go to Team</Text>
        </Link>
    </Block>
)
