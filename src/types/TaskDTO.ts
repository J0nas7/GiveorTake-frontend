export type Task = {
    id: number;
    text: string;
    column: "todo" | "inProgress" | "done";
}

export type TasksContextType = {
    tasks: Task[]
    newTask: Task | undefined
    handleChangeNewTask: (field: "id" | "text" | "column", value: string) => void
    addTask: () => void
    removeTask: (index: number) => void
}