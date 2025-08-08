"use client"

import { Block, Field, FlexibleBox, Text } from '@/components';
import { BacklogEditProps } from '@/components/backlog';
import { LoadingButton } from '@/core-ui/components/LoadingState';
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { Status } from '@/types';
import { faArrowDown, faArrowUp, faCheckDouble, faHourglass, faLock, faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import React, { useState } from 'react';

type StatusListEditorProps = Pick<
    BacklogEditProps,
    "newStatus" |
    "setNewStatus" |
    "localBacklog" |
    "ifEnterCreateStatus" |
    "handleCreateStatus" |
    "ifEnterSaveStatus" |
    "saveStatusPending" |
    "moveStatusPending" |
    "handleSaveStatusChanges" |
    "removeStatus" |
    "convertID_NameStringToURLFormat" |
    "handleMoveStatusChanges" |
    "handleAssignDefaultStatus" |
    "handleAssignClosedStatus" |
    "showEditToggles" |
    "createStatusPending"
>

export const StatusListEditor: React.FC<StatusListEditorProps> = (props) => (
    <FlexibleBox
        title="Statuses"
        icon={faCheckDouble}
        className="no-box w-auto inline-block"
    >
        <Block className="overflow-x-scroll">
            <table className={styles.taskTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Order</th>
                        <th>Is Default?</th>
                        <th>Is Closed?</th>
                        <th>Number of Tasks</th>
                    </tr>
                </thead>
                <tbody>
                    {props.showEditToggles && (
                        <tr>
                            <td colSpan={6}>
                                <Block className="flex gap-2 items-center">
                                    <Field
                                        type="text"
                                        lbl="New status"
                                        innerLabel={true}
                                        value={props.newStatus.Status_Name}
                                        onChange={(e: string) => props.setNewStatus({
                                            ...props.newStatus,
                                            Status_Name: e
                                        })}
                                        onKeyDown={
                                            (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                                                props.ifEnterCreateStatus(event)
                                        }
                                        disabled={false}
                                        className="status-name-field"
                                    />
                                    <button
                                        onClick={props.handleCreateStatus}
                                        className={clsx(
                                            props.createStatusPending ? "button-blue" : "blue-link",
                                            "w-[118px] flex justify-center"
                                        )}
                                    >
                                        {props.createStatusPending ? (
                                            <LoadingButton />
                                        ) : (
                                            <>Create status</>
                                        )}
                                    </button>
                                </Block>
                            </td>
                        </tr>
                    )}
                    {props.localBacklog && props.localBacklog.statuses
                        // Status_Order low to high:
                        ?.sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))
                        .map((status: Status) => {
                            if (!props.localBacklog) return

                            const allTasks = props.localBacklog.tasks?.length
                            const numberOfTasks = props.localBacklog.tasks?.filter(task => task.Status_ID === status.Status_ID).length
                            const [statusName, setStatusName] = useState<string>(status.Status_Name)

                            return (
                                <tr key={status.Status_ID}>
                                    <td>
                                        {props.showEditToggles ? (
                                            <Block className="flex gap-2 items-center">
                                                <Field
                                                    type="text"
                                                    lbl=""
                                                    value={statusName}
                                                    onChange={(e: string) => setStatusName(e)}
                                                    onKeyDown={
                                                        (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                                                            props.ifEnterSaveStatus(event, {
                                                                ...status,
                                                                Status_Name: statusName
                                                            })
                                                    }
                                                    disabled={false}
                                                    className="status-name-field"
                                                    data-testid="status-name-field"
                                                />
                                                {statusName !== status.Status_Name ? (
                                                    <button
                                                        data-testid="save-status-button"
                                                        onClick={() => props.handleSaveStatusChanges(
                                                            {
                                                                ...status,
                                                                Status_Name: statusName
                                                            }
                                                        )}
                                                        className={clsx(
                                                            props.saveStatusPending === status.Status_ID ? "button-blue" : "blue-link",
                                                            "flex justify-center"
                                                        )}
                                                    >
                                                        {props.saveStatusPending && props.saveStatusPending === status.Status_ID ? (
                                                            <LoadingButton />
                                                        ) : (
                                                            <>
                                                                test
                                                                <FontAwesomeIcon
                                                                    icon={faPencil}
                                                                    color="green"
                                                                />
                                                            </>
                                                        )}
                                                    </button>
                                                ) : status.Status_ID && !status.Status_Is_Default && !status.Status_Is_Closed ? (
                                                    <button
                                                        onClick={() => props.removeStatus(
                                                            status.Status_ID!,
                                                            status.Backlog_ID,
                                                            `/backlog/${props.localBacklog && props.convertID_NameStringToURLFormat(props.localBacklog.Backlog_ID ?? 0, props.localBacklog.Backlog_Name)}/edit`
                                                        )}
                                                        className="blue-link flex justify-center"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTrashCan}
                                                            color="red"
                                                            size="xs"
                                                        />
                                                    </button>
                                                ) : null}
                                            </Block>

                                        ) : (
                                            <Block className="flex gap-2 items-center">
                                                {statusName}
                                            </Block>
                                        )}
                                    </td>
                                    <td>
                                        <Block className="flex gap-1 items-center">
                                            {props.showEditToggles ? (
                                                <>
                                                    {!status.Status_Is_Default && !status.Status_Is_Closed ? (
                                                        <>
                                                            <Text className="w-3">
                                                                {status.Status_ID && (status.Status_Order || 0) > 2 && (
                                                                    <button onClick={() => props.handleMoveStatusChanges(status.Status_ID!, "up")}>
                                                                        {props.moveStatusPending &&
                                                                            props.moveStatusPending === `up-${status.Status_ID}` ? (
                                                                            <FontAwesomeIcon icon={faHourglass} size="xs" />
                                                                        ) : (
                                                                            <FontAwesomeIcon icon={faArrowUp} size="xs" />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </Text>
                                                            <Text className="w-3">
                                                                {status.Status_ID && props.localBacklog.statuses && props.localBacklog.statuses.length > (status.Status_Order || 0) + 1 && (
                                                                    <button onClick={() => props.handleMoveStatusChanges(status.Status_ID!, "down")}>
                                                                        {props.moveStatusPending &&
                                                                            props.moveStatusPending === `down-${status.Status_ID}` ? (
                                                                            <FontAwesomeIcon icon={faHourglass} size="xs" />
                                                                        ) : (
                                                                            <FontAwesomeIcon icon={faArrowDown} size="xs" />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </Text>
                                                            <Text>{status.Status_Order}</Text>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Text>{status.Status_Order}</Text>
                                                            <FontAwesomeIcon icon={faLock} size="xs" color="lightgrey" />
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <Text>{status.Status_Order}</Text>
                                            )}
                                        </Block>
                                    </td>
                                    <td>{status.Status_Is_Default ? "Yes" : (
                                        <>
                                            {props.showEditToggles && (
                                                <input
                                                    type="radio"
                                                    onClick={() => props.handleAssignDefaultStatus(status.Status_ID ?? 0)}
                                                />
                                            )}
                                        </>
                                    )}</td>
                                    <td>{status.Status_Is_Closed ? "Yes" : (
                                        <>
                                            {props.showEditToggles && (
                                                <input
                                                    type="radio"
                                                    onClick={() => props.handleAssignClosedStatus(status.Status_ID ?? 0)}
                                                />
                                            )}
                                        </>
                                    )}</td>
                                    <td>
                                        {allTasks && numberOfTasks && (
                                            <>{numberOfTasks} ({((numberOfTasks / allTasks) * 100).toFixed(0)}%)</>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        </Block>
    </FlexibleBox>
)
