"use client"

import { Block, Text } from '@/components';
import { BacklogEditProps } from '@/components/backlog';
import { LoadingButton } from '@/core-ui/components/LoadingState';
import { faCheck, faLightbulb, faList, faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import Link from 'next/link';

type BacklogActionsProps = Pick<
    BacklogEditProps,
    "localBacklog" |
    "canAccessBacklog" |
    "convertID_NameStringToURLFormat" |
    "editPending" |
    "showEditToggles" |
    "setShowEditToggles" |
    "handleSaveBacklogChanges"
>

export const BacklogActions: React.FC<BacklogActionsProps> = (props) => props.canAccessBacklog && props.localBacklog && (
    <Block className="actions-wrapper justify-between">
        <Text
            variant="button"
            className={clsx(
                props.showEditToggles ? `button-blue` : `blue-link`,
                `action-button`
            )}
            onClick={() => {
                if (props.showEditToggles) props.handleSaveBacklogChanges()

                props.setShowEditToggles(!props.showEditToggles)
            }}
        >
            {props.editPending ? (
                <LoadingButton />
            ) : (
                <FontAwesomeIcon icon={
                    props.showEditToggles ? faCheck : faPencil
                } />
            )}
        </Text>

        <Block className="actions-wrapper w-auto">
            <Link
                href={`/backlog/${props.convertID_NameStringToURLFormat(props.localBacklog.Backlog_ID ?? 0, props.localBacklog.Backlog_Name)}`}
                className="blue-link action-button"
            >
                <FontAwesomeIcon icon={faList} />
                <Text variant="span">Go to Backlog</Text>
            </Link>
            <Link
                href={`/project/${props.convertID_NameStringToURLFormat(props.localBacklog?.Project_ID ?? 0, props.localBacklog.project?.Project_Name ?? "")}`}
                className="blue-link action-button"
            >
                <FontAwesomeIcon icon={faLightbulb} />
                <Text variant="span">Go to Project</Text>
            </Link>
        </Block>
    </Block>
);
