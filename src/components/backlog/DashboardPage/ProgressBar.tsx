import styles from "@/core-ui/styles/modules/Dashboard.module.scss"
import React from 'react'

void React.createElement

type ProgressBarProps = {
    completed: number // Completion percentage (0 - 100)
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed }) => (
    <div
        className={styles.progressBar}
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress"
    >
        <div
            className={styles.progressFill}
            style={{ width: `${completed}%` }}
        >
            <span className={styles.progressText}>{completed}%</span>
        </div>
    </div>
)
