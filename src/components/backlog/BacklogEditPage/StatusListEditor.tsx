"use client"

import { Block, Field, FlexibleBox, Text } from '@/components';
import { BacklogEditProps } from '@/components/backlog';
import styles from "@/core-ui/styles/modules/Backlog.module.scss";
import { Status } from '@/types';
import { faArrowDown, faArrowUp, faCheckDouble, faLock, faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

export const StatusListEditor: React.FC<BacklogEditProps> = (props) => (
    <FlexibleBox
        title="Statuses"
        icon={faCheckDouble}
        className="no-box w-auto inline-block"
    >
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
                            <button className="blue-link" onClick={props.handleCreateStatus}>
                                Create status
                            </button>
                        </Block>
                    </td>
                </tr>
                {props.localBacklog && props.localBacklog.statuses
                    // Status_Order low to high:
                    ?.sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))
                    .map((status: Status) => {
                        if (!props.localBacklog) return

                        const allTasks = props.localBacklog.tasks?.length
                        const numberOfTasks = props.localBacklog.tasks?.filter(task => task.Status_ID === status.Status_ID).length
                        const [statusName, setStatusName] = useState<string>(status.Status_Name)

                        return (
                            <tr>
                                <td>
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
                                        />
                                        {statusName !== status.Status_Name ? (
                                            <button>
                                                <FontAwesomeIcon icon={faPencil} color="green"
                                                    onClick={() => props.handleSaveStatusChanges(
                                                        {
                                                            ...status,
                                                            Status_Name: statusName
                                                        }
                                                    )}
                                                />
                                            </button>
                                        ) : status.Status_ID && !status.Status_Is_Default && !status.Status_Is_Closed ? (
                                            <button>
                                                <FontAwesomeIcon icon={faTrashCan} color="red" size="xs"
                                                    onClick={() => props.removeStatus(
                                                        status.Status_ID!,
                                                        status.Backlog_ID,
                                                        `/backlog/${props.localBacklog && props.convertID_NameStringToURLFormat(props.localBacklog.Backlog_ID ?? 0, props.localBacklog.Backlog_Name)}/edit`
                                                    )}
                                                />
                                            </button>
                                        ) : null}
                                    </Block>
                                </td>
                                <td>
                                    <Block className="flex gap-1 items-center">
                                        {!status.Status_Is_Default && !status.Status_Is_Closed ? (
                                            <>
                                                <Text className="w-3">
                                                    {status.Status_ID && (status.Status_Order || 0) > 2 && (
                                                        <button>
                                                            <FontAwesomeIcon icon={faArrowUp} size="xs"
                                                                onClick={() => props.handleMoveStatusChanges(status.Status_ID!, "up")}
                                                            />
                                                        </button>
                                                    )}
                                                </Text>
                                                <Text className="w-3">
                                                    {status.Status_ID && props.localBacklog.statuses && props.localBacklog.statuses.length > (status.Status_Order || 0) + 1 && (
                                                        <button>
                                                            <FontAwesomeIcon icon={faArrowDown} size="xs"
                                                                onClick={() => props.handleMoveStatusChanges(status.Status_ID!, "down")}
                                                            />
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
                                    </Block>
                                </td>
                                <td>{status.Status_Is_Default ? "Yes" : (
                                    <input
                                        type="radio"
                                        onClick={() => props.handleAssignDefaultStatus(status.Status_ID ?? 0)}
                                    />
                                )}</td>
                                <td>{status.Status_Is_Closed ? "Yes" : (
                                    <input
                                        type="radio"
                                        onClick={() => props.handleAssignClosedStatus(status.Status_ID ?? 0)}
                                    />
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
    </FlexibleBox>
)
