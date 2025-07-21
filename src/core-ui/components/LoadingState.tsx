import { Block, Text } from '@/components'
import { BacklogStates, CommentStates, Organisation, OrganisationStates, ProjectStates, TeamStates } from '@/types'
import Image from 'next/image'
import React from 'react'

type LoadingStateProps = {
    singular: string
    renderItem: OrganisationStates | TeamStates | ProjectStates | BacklogStates | CommentStates | Organisation[]
    permitted: boolean | undefined
    children?: React.ReactNode
}

export const LoadingState: React.FC<LoadingStateProps> = (props) => (
    <>
        {props.renderItem === undefined ? (
            <Block className="flex justify-center">
                <Image
                    src="/spinner-loader.gif"
                    alt="Loading..."
                    width={45}
                    height={45}
                />
            </Block>
        ) : props.permitted !== undefined && !props.permitted ? (
            <Block className="text-center">
                <Text className="text-gray-400">
                    You don't have permission to view this {props.singular.toLowerCase()}
                </Text>
            </Block>
        ) : props.renderItem === false ? (
            <Block className="text-center">
                <Text className="text-gray-400">
                    {props.singular} not found
                </Text>
            </Block>
        ) : Array.isArray(props.renderItem) && !props.renderItem.length ? (
            <Block>
                <Text className="text-gray-500">
                    No {props.singular.toLowerCase()}s found
                </Text>
            </Block>
        ) : (
            props.children
        )}
    </>
)
