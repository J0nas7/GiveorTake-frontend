import { mockConvertID_NameStringToURLFormat } from '@/__tests__/test-utils';
import { BacklogSiblingsHeader, BacklogSiblingsNewTaskRow, BacklogSiblingsTaskTableBody, BacklogSiblingsTaskTableHeader } from '@/components/backlog';
import { BacklogStates, Task } from '@/types';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

void React.createElement

let mockConvertID: jest.Mock = mockConvertID_NameStringToURLFormat;

describe('BacklogsPage Components', () => {
    describe('BacklogSiblingsHeader', () => {
        const localBacklog: BacklogStates = {
            Backlog_ID: 123,
            Backlog_Name: "Test Backlog",
            Project_ID: 1,
            Backlog_IsPrimary: true,
            tasks: [
                { Backlog_ID: 123, Task_Title: "Task 1", Status_ID: 1 },
                { Backlog_ID: 123, Task_Title: "Task 2", Status_ID: 1 },
                { Backlog_ID: 123, Task_Title: "Task 3", Status_ID: 1 }
            ], // 3 tasks
        };

        const renderBacklogSiblingsHeader = (props = {}) =>
            render(
                <BacklogSiblingsHeader
                    localBacklog={localBacklog}
                    convertID_NameStringToURLFormat={mockConvertID}
                    {...props}
                />
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderBacklogSiblingsHeader();
        });

        afterEach(() => {
            cleanup();
        });

        it('renders backlog name and task count', () => {
            expect(screen.getByText('Test Backlog')).toBeInTheDocument();
            expect(screen.getByText('3 tasks')).toBeInTheDocument();
        });

        it('renders navigation links with correct hrefs', () => {
            // Labels and expected paths
            const linksData = [
                { label: "Backlog", path: `/backlog/123-test-backlog` },
                { label: "Kanban Board", path: `/kanban/123-test-backlog` },
                { label: "Dashboard", path: `/dashboard/123-test-backlog` },
            ];

            linksData.forEach(({ label, path }) => {
                const link = screen.getByRole('link', { name: label });
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', path);
            });

            // Ensure the mock was called with expected args
            expect(mockConvertID_NameStringToURLFormat).toHaveBeenCalledWith(123, 'Test Backlog');
        });

        it('renders nothing if localBacklog is falsy', () => {
            cleanup();
            const { container } = render(
                <BacklogSiblingsHeader
                    localBacklog={undefined}
                    convertID_NameStringToURLFormat={mockConvertID_NameStringToURLFormat}
                />
            );

            expect(container.firstChild).toBeNull();
        });
    })

    describe('BacklogSiblingsNewTaskRow', () => {
        const localBacklog = {
            Project_ID: 1,
            Backlog_Name: 'Sample Backlog',
            Backlog_IsPrimary: true,
            statuses: [
                { Backlog_ID: 1, Status_ID: 1, Status_Name: 'To Do', Status_Order: 1 },
                { Backlog_ID: 1, Status_ID: 2, Status_Name: 'In Progress', Status_Order: 2 },
            ],
            project: {
                Team_ID: 1,
                Project_Name: 'Sample Project',
                Project_Key: 'SPL',
                Project_Status: 'Active' as 'Active',
                team: {
                    Organisation_ID: 1,
                    Team_Name: 'Sample Team',
                    user_seats: [
                        {
                            Seat_ID: 1,
                            user: {
                                User_ID: 1,
                                User_FirstName: 'Alice',
                                User_Surname: 'Smith',
                                User_Status: '1',
                                User_Email: ''
                            },
                            Team_ID: 1,
                            User_ID: 1,
                            Role_ID: 1,
                            Seat_Status: 'active'
                        },
                        {
                            Seat_ID: 2,
                            user: {
                                User_ID: 2,
                                User_FirstName: 'Bob',
                                User_Surname: 'Jones',
                                User_Status: '1',
                                User_Email: ''
                            },
                            Team_ID: 1,
                            User_ID: 2,
                            Role_ID: 2,
                            Seat_Status: 'active'
                        },
                    ],
                },
            },
        };

        let localNewTask = {
            Task_Title: '',
            Status_ID: 1,
            Assigned_User_ID: 0,
            Backlog_ID: 1
        };

        const handleChangeLocalNewTask = jest.fn(async (field: string, value: any) => {
            localNewTask = { ...localNewTask, [field]: value };
        });

        const handleCreateTask = jest.fn();
        const ifEnter = jest.fn();
        const createTaskPending = false;

        const renderNewTaskRow = (props = {}) =>
            render(
                <table>
                    <tbody>
                        <BacklogSiblingsNewTaskRow
                            localNewTask={localNewTask}
                            localBacklog={localBacklog}
                            handleChangeLocalNewTask={handleChangeLocalNewTask}
                            handleCreateTask={handleCreateTask}
                            ifEnter={ifEnter}
                            createTaskPending={createTaskPending}
                            {...props}
                        />
                    </tbody>
                </table>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            localNewTask = { Backlog_ID: 1, Task_Title: '', Status_ID: 1, Assigned_User_ID: 0 };
            renderNewTaskRow();
        });

        afterEach(() => {
            cleanup();
        });

        it('renders new task input field with empty value initially', () => {
            expect(screen.getByLabelText('New Task')).toHaveValue('');
        });

        it('calls handleChangeLocalNewTask when typing in new task input', () => {
            const input = screen.getByLabelText('New Task');
            fireEvent.change(input, { target: { value: 'New Task Title' } });
            expect(handleChangeLocalNewTask).toHaveBeenCalledWith('Task_Title', 'New Task Title');
        });

        it('renders status dropdown with correct options', () => {
            const selects = screen.getAllByRole('combobox');
            const statusDropdown = selects[0]; // assuming it's the first one

            const statusOptions = within(statusDropdown).getAllByRole('option').filter(o => o.textContent !== 'Assignee' && o.textContent !== '-');
            expect(statusOptions).toHaveLength(2);
            expect(statusOptions[0]).toHaveTextContent('To Do');
            expect(statusOptions[1]).toHaveTextContent('In Progress');
        });

        it('calls handleChangeLocalNewTask when changing status', () => {
            const selects = screen.getAllByRole('combobox');
            const statusDropdown = selects[0]; // assuming it's the first one

            fireEvent.change(statusDropdown, { target: { value: '2' } });
            expect(handleChangeLocalNewTask).toHaveBeenCalledWith('Status_ID', '2');
        });

        it('renders assignee dropdown with correct options', () => {
            const selects = screen.getAllByRole('combobox');
            const assigneeDropdown = selects[1]; // assuming it's the second one

            const assigneeOptions = within(assigneeDropdown).getAllByRole('option').filter(o => o.textContent !== '-' && o.textContent !== '');
            expect(assigneeOptions).toHaveLength(3);
            expect(assigneeOptions[0]).toHaveTextContent('Assignee');
            expect(assigneeOptions[1]).toHaveTextContent('Alice Smith');
            expect(assigneeOptions[2]).toHaveTextContent('Bob Jones');
        });

        it('calls handleChangeLocalNewTask when changing assignee', () => {
            const assigneeSelect = screen.getAllByRole('combobox')[1]; // second select is assignee
            fireEvent.change(assigneeSelect, { target: { value: '2' } });
            expect(handleChangeLocalNewTask).toHaveBeenCalledWith('Assigned_User_ID', '2');
        });

        it('calls handleCreateTask on Create button click when not pending', () => {
            const button = screen.getByRole('button', { name: /Create/i });
            fireEvent.click(button);
            expect(handleCreateTask).toHaveBeenCalled();
        });

        it('disables Create button and shows LoadingButton when createTaskPending is true', () => {
            cleanup();
            renderNewTaskRow({ createTaskPending: true });

            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
            expect(screen.getByAltText('Loading...')).toBeInTheDocument();
        });
    });

    describe('BacklogSiblingsTaskTableBody', () => {
        const mockHandleCheckboxChange = jest.fn();
        const mockSetTaskDetail = jest.fn();

        const tasks: Task[] = [
            {
                Task_ID: 1,
                Task_Key: 101,
                Task_Title: "Fix login bug",
                Status_ID: 1,
                Assigned_User_ID: 1,
                Task_CreatedAt: new Date().toISOString(),
                Backlog_ID: 123,
            },
            {
                Task_ID: 2,
                Task_Key: 102,
                Task_Title: "Improve UI",
                Status_ID: 2,
                Assigned_User_ID: undefined,
                Task_CreatedAt: new Date().toISOString(),
                Backlog_ID: 123,
            },
        ];

        const localBacklog: BacklogStates = {
            Backlog_ID: 123,
            Backlog_Name: "Test Backlog",
            Project_ID: 1,
            Backlog_IsPrimary: true,
            project: {
                Project_ID: 1,
                Team_ID: 1,
                Project_Status: "Active",
                Project_Name: "Demo Project",
                Project_Key: "DP",
                team: {
                    Team_ID: 1,
                    Organisation_ID: 1,
                    Team_Name: "Demo Team",
                    user_seats: [
                        {
                            Seat_ID: 1,
                            User_ID: 1,
                            Team_ID: 1,
                            Role_ID: 1,
                            Seat_Status: "Active",
                            user: {
                                User_ID: 1,
                                User_FirstName: "Alice",
                                User_Surname: "Smith",
                                User_Status: "1",
                                User_Email: ""
                            },
                        },
                    ],
                },
            },
            statuses: [
                { Backlog_ID: 1, Status_ID: 1, Status_Name: "To Do", Status_Order: 1 },
                { Backlog_ID: 1, Status_ID: 2, Status_Name: "In Progress", Status_Order: 2 },
            ],
        };

        const renderTableBody = (props = {}) =>
            render(
                <table>
                    <tbody>
                        <BacklogSiblingsTaskTableBody
                            sortedTasks={tasks}
                            selectedTaskIds={["1"]}
                            handleCheckboxChange={mockHandleCheckboxChange}
                            setTaskDetail={mockSetTaskDetail}
                            localBacklog={localBacklog}
                            {...props}
                        />
                    </tbody>
                </table>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderTableBody();
        });

        afterEach(() => {
            cleanup();
        });

        it('renders task rows with correct data', () => {
            expect(screen.getByText('DP-101')).toBeInTheDocument();
            expect(screen.getByText('Fix login bug')).toBeInTheDocument();
            expect(screen.getByText('To Do')).toBeInTheDocument();
            expect(screen.getByText('Alice Smith')).toBeInTheDocument();

            expect(screen.getByText('DP-102')).toBeInTheDocument();
            expect(screen.getByText('Improve UI')).toBeInTheDocument();
            expect(screen.getByText('In Progress')).toBeInTheDocument();
            expect(screen.getByText('Unassigned')).toBeInTheDocument();
        });

        it('calls setTaskDetail when clicking on key or title', () => {
            fireEvent.click(screen.getByText('DP-101'));
            fireEvent.click(screen.getByText('Fix login bug'));
            expect(mockSetTaskDetail).toHaveBeenCalledTimes(2);
            expect(mockSetTaskDetail).toHaveBeenCalledWith(expect.objectContaining({ Task_ID: 1 }));
        });

        it('calls handleCheckboxChange on checkbox toggle', () => {
            const checkbox = screen.getAllByRole('checkbox')[0];
            fireEvent.click(checkbox);
            expect(mockHandleCheckboxChange).toHaveBeenCalled();
        });
    });

    describe('BacklogSiblingsTaskTableHeader', () => {
        const mockHandleSort = jest.fn();
        const mockHandleSelectAllChange = jest.fn();

        const renderHeader = (props = {}) =>
            render(
                <table>
                    <BacklogSiblingsTaskTableHeader
                        selectAll={false}
                        currentSort="3"
                        currentOrder="asc"
                        handleSort={mockHandleSort}
                        handleSelectAllChange={mockHandleSelectAllChange}
                        {...props}
                    />
                </table>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderHeader();
        });

        afterEach(() => {
            cleanup();
        });

        it('renders all column headers', () => {
            const headers = [
                "Task Key",
                "Task Title",
                "Status",
                "Assignee",
                "Created At"
            ];

            headers.forEach(header => {
                expect(screen.getByText(header)).toBeInTheDocument();
            });
        });

        it('calls handleSort with correct sort key when column clicked', () => {
            fireEvent.click(screen.getByText('Task Key'));
            expect(mockHandleSort).toHaveBeenCalledWith("2");

            fireEvent.click(screen.getByText('Task Title'));
            expect(mockHandleSort).toHaveBeenCalledWith("1");
        });

        it('calls handleSelectAllChange when checkbox is clicked', () => {
            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);
            expect(mockHandleSelectAllChange).toHaveBeenCalled();
        });

        it('shows sort icon for currently sorted column', () => {
            const statusHeader = screen.getByText('Status');
            expect(statusHeader.nextElementSibling?.tagName.toLowerCase()).toBe('svg'); // FontAwesomeIcon renders as SVG
        });
    });
})
