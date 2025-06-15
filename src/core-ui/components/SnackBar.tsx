// External
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';

// Internal
import { Block, Text } from '@/components/ui/block-text';
import {
    selectDeleteConfirm,
    selectSnackMessage,
    setDeleteConfirm,
    setSnackMessage,
    useAppDispatch,
    useTypedSelector
} from '@/redux';

export const SnackBar = () => {
    // Hooks
    const dispatch = useAppDispatch()

    // State
    const snackMessage = useTypedSelector(selectSnackMessage)
    const deleteConfirm = useTypedSelector(selectDeleteConfirm)

    // Effects
    useEffect(() => {
        const timer = setTimeout(() => {
            resetSnackMessage()
        }, 8000)

        return () => clearTimeout(timer)
    }, [snackMessage])

    const resetSnackMessage = () => dispatch(setSnackMessage(undefined))

    const handleDeleteConfirm = (answer: boolean) => {
        if (!deleteConfirm) return

        dispatch(setDeleteConfirm({
            ...deleteConfirm,
            confirm: answer
        }))
    }

    if (!snackMessage && deleteConfirm === undefined) return null

    return (
        <Block className="taskplayer-container flex items-center justify-between">
            {deleteConfirm ? (
                <Block className="w-full flex gap-2 items-center justify-between">
                    <Text className="font-semibold">
                        Are you sure you want to delete this {deleteConfirm.singular}?
                    </Text>

                    <Block className="flex gap-3 items-center">
                        <button onClick={() => handleDeleteConfirm(false)}>
                            Cancel
                        </button>
                        <button
                            className="text-white bg-red-600 rounded-md px-4 py-2"
                            onClick={() => handleDeleteConfirm(true)}
                        >
                            Yes, delete
                        </button>
                    </Block>
                </Block>
            ) : (
                <Block className="w-full flex gap-2 items-center justify-between">
                    <Text className="font-semibold">{snackMessage}</Text>
                    <FontAwesomeIcon icon={faXmark} onClick={resetSnackMessage} className="cursor-pointer" />
                </Block>
            )}
        </Block>
    )
}
