import { Block, Field } from "@/components"
import { FinishBacklogProps } from "@/components/backlog"

type FinishBacklogMoveToNewProps = Pick<
    FinishBacklogProps,
    'newBacklog' |
    'setNewBacklog'
>

export const FinishBacklogMoveToNew: React.FC<FinishBacklogMoveToNewProps> = (props) => (
    <Block className="my-3 flex flex-col gap-2 p-4 bg-gray-200 rounded">
        <Field
            type="text"
            lbl="New Backlog Name"
            value={props.newBacklog.Backlog_Name}
            onChange={(e: string) => props.setNewBacklog({ ...props.newBacklog, Backlog_Name: e })}
            placeholder="Enter new backlog name"
            disabled={false}
            className="w-full max-w-xs"
        />
        <Field
            type="text"
            lbl="New Backlog Description (optional)"
            value={props.newBacklog.Backlog_Description || ""}
            onChange={(e: string) => props.setNewBacklog({ ...props.newBacklog, Backlog_Description: e })}
            placeholder="Enter new backlog description"
            disabled={false}
            className="w-full max-w-xs"
        />
        <Field
            type="date"
            lbl="New Backlog Start Date (optional)"
            value={props.newBacklog.Backlog_StartDate || ""}
            onChange={(e: string) => props.setNewBacklog({ ...props.newBacklog, Backlog_StartDate: e })}
            placeholder="Start date"
            disabled={false}
            className="w-full max-w-xs"
        />
        <Field
            type="date"
            lbl="New Backlog End Date (optional)"
            value={props.newBacklog.Backlog_EndDate || ""}
            onChange={(e: string) => props.setNewBacklog({ ...props.newBacklog, Backlog_EndDate: e })}
            placeholder="End date"
            disabled={false}
            className="w-full max-w-xs"
        />
    </Block>
)
