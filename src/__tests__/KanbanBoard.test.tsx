import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { Backlog, Project, Task } from "@/types"
import { KanbanBoardView } from "@/components"

// Mocking the data
const mockRemoveTask = jest.fn()
const mockSetTaskDetail = jest.fn()
const mockMoveTask = jest.fn()

// Mock Project
const mockProject: Project = {
    Project_ID: 1,
    Team_ID: 1,
    Project_Name: "Test Project",
    Project_Key: "TEST",
    Project_Status: "Active",
    Project_Description: "This is a test project",
    Project_Start_Date: "2025-01-01",
    Project_End_Date: "2025-12-31",
    Project_CreatedAt: "2025-01-01T00:00:00Z",
    Project_UpdatedAt: "2025-01-01T00:00:00Z",
    backlogs: [] // Initially no tasks
}
// Mock Backlog
const mockBacklog: Backlog = {
    Backlog_ID: 1,
    Project_ID: 1,
    Team_ID: 1,
    Backlog_Name: "Test Backlog",
    Backlog_Description: "This is a test backlog",
    Backlog_IsPrimary: true,
    Backlog_StartDate: "2025-01-01",
    Backlog_EndDate: "2025-12-31",
    Backlog_CreatedAt: "2025-01-01T00:00:00Z",
    Backlog_UpdatedAt: "2025-01-01T00:00:00Z",
    project: mockProject,
    team: undefined,
    statuses: [],
    tasks: []
}

// Mock Tasks
const mockTasks: Task[] = [
    {
        Task_ID: 1,
        Task_Key: 1,
        Backlog_ID: 1,
        Team_ID: 1,
        Task_Title: "Test Task 1",
        Status_ID: 1,
        Task_CreatedAt: "2025-01-01T00:00:00Z",
        Task_UpdatedAt: "2025-01-01T00:00:00Z",
        backlog: mockBacklog
    },
    {
        Task_ID: 2,
        Task_Key: 2,
        Backlog_ID: 1,
        Team_ID: 1,
        Task_Title: "Test Task 2",
        Status_ID: 2,
        Task_CreatedAt: "2025-01-01T00:00:00Z",
        Task_UpdatedAt: "2025-01-01T00:00:00Z",
        backlog: mockBacklog
    }
]

describe("KanbanBoardView", () => {

    it("should render correctly with all required props", () => {
        render(
            <KanbanBoardView
                renderBacklog={mockBacklog}
                tasks={mockTasks}
                kanbanColumns={undefined}
                canAccessBacklog={true}
                canManageBacklog={false}
                archiveTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
                moveTask={mockMoveTask}
            />
        )

        // Check if the project name is rendered
        expect(screen.getByText("Kanban: Test Project")).toBeInTheDocument()

        // Check if tasks are rendered under correct columns
        expect(screen.getByText("Test Task 1")).toBeInTheDocument()  // To Do
        expect(screen.getByText("Test Task 2")).toBeInTheDocument()  // In Progress
    })

    it("should render correctly when 'project' is undefined", () => {
        render(
            <KanbanBoardView
                renderBacklog={undefined}
                tasks={mockTasks}
                kanbanColumns={undefined}
                canAccessBacklog={true}
                canManageBacklog={false}
                archiveTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
                moveTask={mockMoveTask}
            />
        )

        // Check if the board renders without a project name
        expect(screen.queryByText("Kanban:")).toBeNull()  // Project name should not appear
    })

    it("should render correctly when 'tasks' are undefined", () => {
        render(
            <KanbanBoardView
                renderBacklog={mockBacklog}
                tasks={undefined}
                kanbanColumns={undefined}
                canAccessBacklog={true}
                canManageBacklog={false}
                archiveTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
                moveTask={mockMoveTask}
            />
        )

        // Check that the columns are rendered even without tasks
        expect(screen.getByText("Some Status")).toBeInTheDocument()

        // No tasks should be rendered
        expect(screen.queryByText("Test Task 1")).toBeNull()
        expect(screen.queryByText("Test Task 2")).toBeNull()
    })

    it("should handle click on task to set task details", () => {
        render(
            <KanbanBoardView
                renderBacklog={mockBacklog}
                tasks={mockTasks}
                kanbanColumns={undefined}
                canAccessBacklog={true}
                canManageBacklog={false}
                archiveTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
                moveTask={mockMoveTask}
            />
        )

        const task = screen.getByText("Test Task 1")
        fireEvent.click(task)

        // Check if the setTaskDetail function is called
        expect(mockSetTaskDetail).toHaveBeenCalledWith(mockTasks[0])
    })

    it("should handle task removal click", () => {
        render(
            <KanbanBoardView
                renderBacklog={mockBacklog}
                tasks={mockTasks}
                kanbanColumns={undefined}
                canAccessBacklog={true}
                canManageBacklog={false}
                archiveTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
                moveTask={mockMoveTask}
            />
        )

        const removeButton = screen.getAllByRole("button")[0]  // Assume the first button is for task removal
        fireEvent.click(removeButton)

        // Check if the removeTask function is called with correct arguments
        expect(mockRemoveTask).toHaveBeenCalledWith(mockTasks[0].Task_ID, mockTasks[0].Backlog_ID)
    })
})

// Edge Case Tests
describe("KanbanBoardView - Edge Cases", () => {
    it("should handle empty project name", () => {
        const emptyBacklog: Backlog = { ...mockBacklog, Backlog_Name: "" }
        render(
            <KanbanBoardView
                renderBacklog={emptyBacklog}
                tasks={mockTasks}
                kanbanColumns={undefined}
                canAccessBacklog={true}
                canManageBacklog={false}
                archiveTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
                moveTask={mockMoveTask}
            />
        )

        // Project name should be an empty string or rendered as empty space
        expect(screen.queryByText("Kanban:")).toBeNull()  // No project name rendered
    })

    it("should handle tasks with undefined status", () => {
        const taskWithUndefinedStatus: Task = { 
            ...mockTasks[0], 
            Status_ID: undefined as any // Assign undefined as status
        }
        render(
            <KanbanBoardView
                renderBacklog={mockBacklog}
                tasks={[taskWithUndefinedStatus]}
                kanbanColumns={undefined}
                canAccessBacklog={true}
                canManageBacklog={false}
                archiveTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
                moveTask={mockMoveTask}
            />
        )

        // Ensure that task without status doesn't break the rendering
        expect(screen.getByText("Test Task 1")).toBeInTheDocument()
    })

    it("should handle tasks with empty title", () => {
        const taskWithEmptyTitle: Task = { 
            ...mockTasks[0], 
            Task_Title: "" 
        }
        render(
            <KanbanBoardView
                renderBacklog={mockBacklog}
                tasks={[taskWithEmptyTitle]}
                kanbanColumns={undefined}
                canAccessBacklog={true}
                canManageBacklog={false}
                archiveTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
                moveTask={mockMoveTask}
            />
        )

        // Check if an empty task title is rendered as an empty string or space
        expect(screen.getByText("")).toBeInTheDocument()
    })

    it("should handle null tasks array", () => {
        render(
            <KanbanBoardView
                renderBacklog={mockBacklog}
                tasks={undefined} // Undefined tasks array
                kanbanColumns={undefined}
                canAccessBacklog={true}
                canManageBacklog={false}
                archiveTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
                moveTask={mockMoveTask}
            />
        )

        // Check if the board renders correctly even with null tasks
        expect(screen.getByText("Some Status")).toBeInTheDocument()
    })
})
