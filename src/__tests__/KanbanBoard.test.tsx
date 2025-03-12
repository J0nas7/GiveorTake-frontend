import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { Project, Task } from "@/types"
import { KanbanBoardView } from "@/components"

// Mocking the data
const mockRemoveTask = jest.fn()
const mockSetTaskDetail = jest.fn()

const columns = {
    todo: "To Do",
    inProgress: "In Progress",
    review: "Waiting for Review",
    done: "Done"
}

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
    tasks: [] // Initially no tasks
}

// Mock Tasks
const mockTasks: Task[] = [
    {
        Task_ID: 1,
        Task_Key: "TEST-1",
        Project_ID: 1,
        Team_ID: 1,
        Task_Title: "Test Task 1",
        Task_Status: "To Do",
        Task_CreatedAt: "2025-01-01T00:00:00Z",
        Task_UpdatedAt: "2025-01-01T00:00:00Z",
        project: mockProject
    },
    {
        Task_ID: 2,
        Task_Key: "TEST-2",
        Project_ID: 1,
        Team_ID: 1,
        Task_Title: "Test Task 2",
        Task_Status: "In Progress",
        Task_CreatedAt: "2025-01-01T00:00:00Z",
        Task_UpdatedAt: "2025-01-01T00:00:00Z",
        project: mockProject
    }
]

describe("KanbanBoardView", () => {

    it("should render correctly with all required props", () => {
        render(
            <KanbanBoardView
                project={mockProject}
                tasks={mockTasks}
                columns={columns}
                removeTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
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
                project={undefined}
                tasks={mockTasks}
                columns={columns}
                removeTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
            />
        )

        // Check if the board renders without a project name
        expect(screen.queryByText("Kanban:")).toBeNull()  // Project name should not appear
    })

    it("should render correctly when 'tasks' are undefined", () => {
        render(
            <KanbanBoardView
                project={mockProject}
                tasks={undefined}
                columns={columns}
                removeTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
            />
        )

        // Check that the columns are rendered even without tasks
        expect(screen.getByText("To Do")).toBeInTheDocument()
        expect(screen.getByText("In Progress")).toBeInTheDocument()

        // No tasks should be rendered
        expect(screen.queryByText("Test Task 1")).toBeNull()
        expect(screen.queryByText("Test Task 2")).toBeNull()
    })

    it("should handle click on task to set task details", () => {
        render(
            <KanbanBoardView
                project={mockProject}
                tasks={mockTasks}
                columns={columns}
                removeTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
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
                project={mockProject}
                tasks={mockTasks}
                columns={columns}
                removeTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
            />
        )

        const removeButton = screen.getAllByRole("button")[0]  // Assume the first button is for task removal
        fireEvent.click(removeButton)

        // Check if the removeTask function is called with correct arguments
        expect(mockRemoveTask).toHaveBeenCalledWith(mockTasks[0].Task_ID, mockTasks[0].Project_ID)
    })
})

// Edge Case Tests
describe("KanbanBoardView - Edge Cases", () => {
    it("should handle empty project name", () => {
        const emptyProject: Project = { ...mockProject, Project_Name: "" }
        render(
            <KanbanBoardView
                project={emptyProject}
                tasks={mockTasks}
                columns={columns}
                removeTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
            />
        )

        // Project name should be an empty string or rendered as empty space
        expect(screen.queryByText("Kanban:")).toBeNull()  // No project name rendered
    })

    it("should handle tasks with undefined status", () => {
        const taskWithUndefinedStatus: Task = { 
            ...mockTasks[0], 
            Task_Status: undefined as any // Assign undefined as status
        }
        render(
            <KanbanBoardView
                project={mockProject}
                tasks={[taskWithUndefinedStatus]}
                columns={columns}
                removeTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
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
                project={mockProject}
                tasks={[taskWithEmptyTitle]}
                columns={columns}
                removeTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
            />
        )

        // Check if an empty task title is rendered as an empty string or space
        expect(screen.getByText("")).toBeInTheDocument()
    })

    it("should handle null tasks array", () => {
        render(
            <KanbanBoardView
                project={mockProject}
                tasks={undefined} // Undefined task array
                columns={columns}
                removeTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
            />
        )

        // Check if the board renders correctly even with null tasks
        expect(screen.getByText("To Do")).toBeInTheDocument()
        expect(screen.getByText("In Progress")).toBeInTheDocument()
    })

    it("should handle non-matching column names", () => {
        const nonMatchingColumns = {
            todo: "To Be Done",
            inProgress: "In Process",
            review: "Pending Review",
            done: "Completed"
        }

        render(
            <KanbanBoardView
                project={mockProject}
                tasks={mockTasks}
                columns={nonMatchingColumns} // Using custom column names
                removeTask={mockRemoveTask}
                setTaskDetail={mockSetTaskDetail}
            />
        )

        // Check if the custom column names are rendered correctly
        expect(screen.getByText("To Be Done")).toBeInTheDocument()
        expect(screen.getByText("In Process")).toBeInTheDocument()
        expect(screen.getByText("Pending Review")).toBeInTheDocument()
        expect(screen.getByText("Completed")).toBeInTheDocument()
    })
})
