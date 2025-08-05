import { Block, Text } from '@/components';
import { BacklogProps, ProjectBacklogNavigation } from '@/components/backlog';
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

void React.createElement

type BacklogHeaderProps = Pick<
    BacklogProps,
    'renderBacklog' |
    'setStatusUrlEditing' |
    'statusUrlEditing' |
    'convertID_NameStringToURLFormat'
>

export const BacklogHeader: React.FC<BacklogHeaderProps> = (props) => props.renderBacklog && (
    <Block className="actions-wrapper justify-between">
        <Text
            className="blue-link action-button"
            onClick={() => props.setStatusUrlEditing(!props.statusUrlEditing)}
        >
            <FontAwesomeIcon icon={faCheckDouble} />
            <Text variant="span">Filter Statuses</Text>
        </Text>

        <Block className="actions-wrapper w-auto">
            <ProjectBacklogNavigation
                focus="Backlog"
                renderBacklog={props.renderBacklog}
                convertID_NameStringToURLFormat={props.convertID_NameStringToURLFormat}
            />
        </Block>
    </Block>
);
