import styles from "@/core-ui/styles/modules/Dashboard.module.scss"

type ProgressBarProps = {
    completed: number // Completion percentage (0 - 100)
}

export const ProgressBar: React.FC<ProgressBarProps> = (props) => (
    <div className={styles.progressBar}>
        <div
            className={styles.progressFill}
            style={{ width: `${props.completed}%` }}
        >
            <span className={styles.progressText}>{props.completed}%</span>
        </div>
    </div>
)
