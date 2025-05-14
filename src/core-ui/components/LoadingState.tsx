import { Block, Text } from '@/components'
import { BacklogStates, OrganisationStates, ProjectStates, TeamStates } from '@/types'
import Image from 'next/image'
import React from 'react'

type LoadingStateType = {
    singular: string
    renderItem: OrganisationStates | TeamStates | ProjectStates | BacklogStates
    permitted: boolean | undefined
    children?: React.ReactNode
}

export const LoadingState: React.FC<LoadingStateType> = ({
    singular, renderItem, permitted, children
}) => {
    return (
        <>
            {permitted !== undefined && !permitted ? (
                <Block className="text-center">
                    <Text className="text-gray-400">
                        You don't have permission to view this
                    </Text>
                </Block>
            ) : renderItem === false ? (
                <Block className="text-center">
                    <Text className="text-gray-400">
                        {singular} not found
                    </Text>
                </Block>
            ) : renderItem === undefined ? (
                <Block className="flex justify-center">
                    <Image
                        src="/spinner-loader.gif"
                        alt="Loading..."
                        width={45}
                        height={45}
                    />
                </Block>
            ) : (
                children
            )}
        </>
    )
}
