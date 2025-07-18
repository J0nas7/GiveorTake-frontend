import styles from "@/core-ui/styles/modules/Dashboard.module.scss"

type ProgressBarProps = {
    completed: number // Completion percentage (0 - 100)
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed }) => {
    return (
        <div className={styles.progressBar}>
            <div
                className={styles.progressFill}
                style={{ width: `${completed}%` }}
            >
                <span className={styles.progressText}>{completed}%</span>
            </div>
        </div>
    )
}
