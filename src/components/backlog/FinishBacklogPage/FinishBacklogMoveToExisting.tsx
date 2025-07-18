import { Block } from "@/components"
import { FinishBacklogProps } from "@/components/backlog"

type FinishBacklogMoveToExistingProps = Pick<
    FinishBacklogProps,
    'newBacklog' |
    'setNewBacklog' |
    'projectById' |
    'backlogId'
>

export const FinishBacklogMoveToExisting: React.FC<FinishBacklogMoveToExistingProps> = (props) => (
    <Block className="my-3 flex flex-col gap-2 p-4 bg-gray-200 rounded">
        <label htmlFor="existing-backlog-select" className="font-semibold">Select an existing backlog:</label>
        <select
            id="existing-backlog-select"
            className="w-full max-w-xs p-2 border rounded"
            value={props.newBacklog.Backlog_ID || ""}
            onChange={(e) => props.setNewBacklog({ ...props.newBacklog, Backlog_ID: parseInt(e.target.value) })}
        >
            <option value="" disabled>Select a backlog</option>
            {props.projectById && props.projectById.backlogs?.map((backlog) => (
                backlog.Backlog_ID?.toString() !== props.backlogId && (
                    <option key={backlog.Backlog_ID} value={backlog.Backlog_ID}>
                        {backlog.Backlog_Name}
                    </option>
                )
            ))}
        </select>
    </Block>
)
