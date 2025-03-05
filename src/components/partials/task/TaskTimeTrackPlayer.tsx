// External
import React, { useEffect, useState } from 'react'

// Internal
import { Block } from '@/components/ui/block-text'
import { selectAuthUserTaskTimeTrack, useAppDispatch, useAuthActions, useTypedSelector } from '@/redux';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons';

export const TaskTimeTrackPlayer = () => {
    const taskTimeTrack = useTypedSelector(selectAuthUserTaskTimeTrack)

    const dispatch = useAppDispatch()
    const { fetchIsLoggedInStatus } = useAuthActions()

    useEffect(() => {
        if (!taskTimeTrack) {
            dispatch(fetchIsLoggedInStatus())
        }
    }, [taskTimeTrack])

    if (!taskTimeTrack) return null

    return (
        <Block className="timetrackplayer-container">
            <Block className="timetrack-metric">
                {taskTimeTrack ? (
                    <Block variant="span" className="flex gap-3 items-center">
                        <Block variant="span" className="block w-8">
                            <button className="timetrack-button timetrack-stopbutton">
                                <FontAwesomeIcon icon={faStop} />
                            </button>
                        </Block>
                        <Block variant="span" className="block w-20">
                            {/* Calculate and display time spent since start */}
                            {taskTimeTrack.Time_Tracking_Start_Time ? (
                                <TimeSpentDisplay startTime={taskTimeTrack.Time_Tracking_Start_Time} />
                            ) : null}
                        </Block>
                        <Block variant="span">
                            {taskTimeTrack.task?.Task_Title}
                        </Block>
                    </Block>
                ) : (
                    <button className={clsx("timetrack-button", "timetrack-playbutton")}>
                        <FontAwesomeIcon icon={faPlay} />
                    </button>
                )}
            </Block>
        </Block>
    )
}

export const TimeSpentDisplay = ({ startTime }: { startTime: string }) => {
    const [timeSpent, setTimeSpent] = useState<string>('');

    useEffect(() => {
        const interval = setInterval(() => {
            const startDate = new Date(startTime);
            const currentDate = new Date();
            const diffInMilliseconds = currentDate.getTime() - startDate.getTime();

            // Calculate seconds, minutes, and hours
            const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
            const hours = Math.floor(diffInSeconds / 3600);
            const minutes = Math.floor((diffInSeconds % 3600) / 60);
            const seconds = diffInSeconds % 60;

            // Format the time as hh:mm:ss
            const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            setTimeSpent(formattedTime);
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [startTime]);

    return <>{timeSpent}</>;
};