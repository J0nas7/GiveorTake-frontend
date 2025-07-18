import { Block, Text } from '@/components';
import { BacklogSiblingsProps } from '@/components/backlog';
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { faGauge, faList, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

type BacklogSiblingsHeaderProps = Pick<
    BacklogSiblingsProps,
    'localBacklog' |
    'convertID_NameStringToURLFormat'
>

export const BacklogSiblingsHeader: React.FC<BacklogSiblingsHeaderProps> = (props) => props.localBacklog && (
    <Block className={styles.taskTable}>
        <Block className="flex justify-between">
            <Block className="flex gap-4 items-center">
                <Text>{props.localBacklog.Backlog_Name}</Text>
                <Text className="text-sm text-gray-600">{props.localBacklog.tasks?.length} tasks</Text>
            </Block>
            <Block className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 my-2">
                {[
                    { label: "Backlog", icon: faList, path: "backlog" },
                    { label: "Kanban Board", icon: faWindowRestore, path: "kanban" },
                    { label: "Dashboard", icon: faGauge, path: "dashboard" }
                ].map(({ label, icon, path }) => (
                    <Link
                        key={path}
                        href={`/${path}/${props.localBacklog && props.convertID_NameStringToURLFormat(props.localBacklog.Backlog_ID ?? 0, props.localBacklog.Backlog_Name)}`}
                        className="blue-link !inline-flex gap-2 items-center"
                    >
                        <FontAwesomeIcon icon={icon} />
                        <Text variant="span">{label}</Text>
                    </Link>
                ))}
            </Block>
        </Block>
    </Block>
);
