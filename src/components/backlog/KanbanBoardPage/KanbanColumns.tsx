import { Column, ColumnProps, KanbanBoardProps } from '@/components/backlog'

type KanbanColumnsProps = Pick<
    KanbanBoardProps,
    'kanbanColumns' |
    'renderTasks' |
    'canManageBacklog' |
    'archiveTask' |
    'setTaskDetail' |
    'moveTask'
>

export const KanbanColumns: React.FC<KanbanColumnsProps> = (props) =>
    props.kanbanColumns &&
    props.kanbanColumns
        .sort((a, b) => (a.Status_Order || 0) - (b.Status_Order || 0))
        .map((status) => {
            const columnProps: ColumnProps = {
                status: status.Status_ID ?? 0,
                label: status.Status_Name,
                tasks: props.renderTasks?.filter(task => task.Status_ID === status.Status_ID),
                canManageBacklog: props.canManageBacklog,
                archiveTask: props.archiveTask,
                setTaskDetail: props.setTaskDetail,
                moveTask: props.moveTask,
            }

            return <Column key={status.Status_ID} {...columnProps} />
        })
