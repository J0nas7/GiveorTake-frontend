import { Block, Text } from "@/components"
import { FinishBacklogProps } from "@/components/backlog"

type FinishBacklogMoveOptionsProps = Pick<
    FinishBacklogProps,
    'moveAction' |
    'setMoveAction'
>

export const FinishBacklogMoveOptions: React.FC<FinishBacklogMoveOptionsProps> = (props) => (
    <>
        <Block className="my-3">
            <Text>You can finish this backlog, and move all unfinished tasks to the <strong>primary project-backlog</strong>, move them to a new backlog or an existing backlog.</Text>
            <Text>What do you want to do with the unfinished tasks in this backlog?</Text>
        </Block>

        <Block className="my-3">
            {[
                { id: "move-to-primary", label: "Move to the primary backlog" },
                { id: "move-to-new", label: "Move to a new backlog" },
                { id: "move-to-existing", label: "Move to an existing backlog" }
            ].map(({ id, label }) => (
                <Block key={id}>
                    <input
                        type="radio"
                        value={id}
                        name="move"
                        id={id}
                        checked={props.moveAction === id}
                        onChange={() => props.setMoveAction(id)}
                    />
                    <label htmlFor={id} className="ml-2">{label}</label>
                </Block>
            ))}
        </Block>
    </>
)
