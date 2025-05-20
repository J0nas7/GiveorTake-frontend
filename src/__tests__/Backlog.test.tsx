import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Internal
import { Task } from "@/types";
import { BacklogContainerView, BacklogContainerViewProps } from "@/components";
import { TFunction } from "next-i18next";

const mockProps: BacklogContainerViewProps = {
    renderBacklog: {
        Project_ID: 1,
        Team_ID: 1,
        Backlog_Name: "Primary Backlog",
        Backlog_IsPrimary: true,
        Backlog_StartDate: "2024-01-01",
        Backlog_EndDate: "2024-12-31",
        Backlog_CreatedAt: "2024-01-01",
        Backlog_UpdatedAt: "2024-03-01",
    },
    canAccessBacklog: false,
    canManageBacklog: false,
    sortedTasks: [
        {
            Task_ID: 1,
            Task_Key: 1,
            Backlog_ID: 1,
            Team_ID: 1,
            Task_Title: "Task 1",
            Status_ID: 1,
            Task_CreatedAt: "2024-01-01",
            Task_UpdatedAt: "2024-02-01",
        },
        {
            Task_ID: 2,
            Task_Key: 2,
            Backlog_ID: 1,
            Team_ID: 1,
            Task_Title: "Task 2",
            Status_ID: 2,
            Task_CreatedAt: "2024-02-01",
            Task_UpdatedAt: "2024-03-01",
        }
    ],
    newTask: {
        Task_ID: 3,
        Task_Key: 3,
        Backlog_ID: 1,
        Team_ID: 1,
        Task_Title: "New Task",
        Status_ID: 3,
        Task_CreatedAt: "2024-03-01",
        Task_UpdatedAt: "2024-03-01",
    },
    currentSort: "1",
    currentOrder: "asc",
    // showActionMenu: null,
    t: ((key: string) => key) as unknown as TFunction,
    handleSort: jest.fn(),
    handleCreateTask: jest.fn(),
    handleChangeNewTask: jest.fn(),
    setTaskDetail: jest.fn(),
    selectedTaskIds: [] as string[],
    selectAll: false,
    ifEnter: jest.fn(),
    handleCheckboxChange: jest.fn(),
    handleSelectAllChange: jest.fn()
    // setActionMenu: jest.fn(),
};

describe("BacklogContainerView Component", () => {

    it("renders without crashing", () => {
        render(<BacklogContainerView {...mockProps} />);
        expect(screen.getByText(/Backlog: Test Project/i)).toBeInTheDocument();
    });

    it("renders tasks correctly", () => {
        render(<BacklogContainerView {...mockProps} />);
        expect(screen.getByText(/Task 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Task 2/i)).toBeInTheDocument();
    });

    it("handles sorting when clicking on headers", () => {
        render(<BacklogContainerView {...mockProps} />);
        fireEvent.click(screen.getByText(/Task Title/i));
        expect(mockProps.handleSort).toHaveBeenCalledWith("1");
    });

    it("handles creating a new task", () => {
        render(<BacklogContainerView {...mockProps} />);
        fireEvent.click(screen.getByText(/Add/i));
        expect(mockProps.handleCreateTask).toHaveBeenCalled();
    });

    it("handles changing a new task title", () => {
        render(<BacklogContainerView {...mockProps} />);
        const input = screen.getByLabelText(/New Task/i);
        fireEvent.change(input, { target: { value: "Updated Task" } });
        expect(mockProps.handleChangeNewTask).toHaveBeenCalled();
    });

    it("displays 'Unassigned' when no assignee is provided", () => {
        render(<BacklogContainerView {...mockProps} />);
        expect(screen.getByText(/Unassigned/i)).toBeInTheDocument();
    });

    it("renders correctly with empty tasks", () => {
        render(<BacklogContainerView {...mockProps} sortedTasks={[]} />);
        expect(screen.getByText(/Backlog: Test Project/i)).toBeInTheDocument();
        expect(screen.queryByText(/Task 1/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Task 2/i)).not.toBeInTheDocument();
    });

    it("renders correctly when project is undefined", () => {
        render(<BacklogContainerView {...mockProps} renderBacklog={undefined} />);
        expect(screen.getByText(/Backlog:/i)).toBeInTheDocument();
    });

    it("renders correctly when newTask is undefined", () => {
        render(<BacklogContainerView {...mockProps} newTask={undefined} />);
        expect(screen.getByLabelText(/New Task/i)).toHaveValue("");
    });
});

// Edge cases testing
describe("Edge Cases for BacklogContainerView", () => {
    const mockPropsEdge: BacklogContainerViewProps = {
        ...mockProps, // Use mockProps as base
    };

    // Edge Case 1: Empty tasks list
    it("handles rendering when no tasks are available", () => {
        render(<BacklogContainerView {...mockPropsEdge} sortedTasks={[]} />);
        expect(screen.getByText(/No tasks available/i)).toBeInTheDocument();  // assuming you show this message when no tasks exist
    });

    // Edge Case 2: Undefined project data
    it("renders gracefully when project data is missing", () => {
        render(<BacklogContainerView {...mockPropsEdge} renderBacklog={undefined} />);
        expect(screen.getByText(/Backlog:/i)).toBeInTheDocument();
    });

    // Edge Case 3: New task is undefined
    it("handles case where newTask is undefined", () => {
        render(<BacklogContainerView {...mockPropsEdge} newTask={undefined} />);
        expect(screen.getByLabelText(/New Task/i)).toHaveValue(""); // Should render an empty input field
    });

    // Edge Case 4: Task without assignee
    it("displays 'Unassigned' if the task has no assigned user", () => {
        render(<BacklogContainerView {...mockPropsEdge} sortedTasks={[{ ...mockPropsEdge.sortedTasks[0], Assigned_User_ID: undefined }]} />);
        expect(screen.getByText(/Unassigned/i)).toBeInTheDocument(); // Task without assignee should show "Unassigned"
    });
});
