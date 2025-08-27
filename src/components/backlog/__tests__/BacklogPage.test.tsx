import { mockConvertID_NameStringToURLFormat, mockHttpPostWithData, pushMock, TestProvider } from '@/__tests__/test-utils';
import { BacklogHeader, BacklogNewTaskRow, BacklogStatusActionMenu, BacklogTaskRow, BacklogTaskTableHeader, TaskBulkActionMenu } from '@/components/backlog';
import * as redux from '@/redux';
import { BacklogStates, Project, Task } from '@/types';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as nextNavigation from 'next/navigation';
import React from 'react';

void React.createElement

let mockConvertID: jest.Mock = mockConvertID_NameStringToURLFormat;

describe('BacklogPage Components', () => {
    describe('BacklogHeader', () => {
        const mockSetStatusUrlEditing = jest.fn();

        const mockRenderBacklog = {
            Backlog_ID: 1,
            Backlog_Name: 'Sample Backlog',
            Backlog_IsPrimary: true,
            Project_ID: 2,
            project: {
                Project_Name: 'Sample Project',
                Project_Key: 'SP',
                Team_ID: 1,
                Project_Status: "Active" as "Active" | "Planned" | "Completed" | "On Hold",
            },
        };

        const renderBacklogHeader = (props = {}) =>
            render(
                <TestProvider>
                    <BacklogHeader
                        renderBacklog={mockRenderBacklog}
                        setStatusUrlEditing={mockSetStatusUrlEditing}
                        statusUrlEditing={false}
                        convertID_NameStringToURLFormat={mockConvertID}
                        {...props}
                    />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderBacklogHeader();
        });

        afterEach(() => {
            cleanup();
        })

        it('renders filter button and project navigation', () => {
            expect(screen.getByText(/Filter Statuses/i)).toBeInTheDocument();
            expect(screen.getByText(/Backlog/i)).toBeInTheDocument(); // from ProjectBacklogNavigation
        });

        it('calls setStatusUrlEditing with toggled value when clicked', () => {
            cleanup();
            renderBacklogHeader({ statusUrlEditing: false });

            const filterButton = screen.getByText(/Filter Statuses/i);
            fireEvent.click(filterButton);

            expect(mockSetStatusUrlEditing).toHaveBeenCalledWith(true);
        });

        it('does not render anything if renderBacklog is undefined', () => {
            cleanup();
            const { container } = render(
                <TestProvider>
                    <BacklogHeader
                        renderBacklog={undefined}
                        setStatusUrlEditing={mockSetStatusUrlEditing}
                        statusUrlEditing={false}
                        convertID_NameStringToURLFormat={mockConvertID}
                    />
                </TestProvider>
            );

            expect(container.textContent?.trim()).toBe('');
        });
    });

    describe('BacklogNewTaskRow', () => {
        const mockHandleChangeNewTask = jest.fn();
        const mockHandleCreateTask = jest.fn();
        const mockIfEnter = jest.fn();

        const mockRenderBacklog: BacklogStates = {
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
                Project_Key: 'SP',
                Project_Status: "Active" as "Active" | "Planned" | "Completed" | "On Hold",
                team: {
                    Organisation_ID: 100,
                    Team_Name: 'Sample Team',
                    user_seats: [
                        {
                            Team_ID: 1,
                            User_ID: 10,
                            Role_ID: 1,
                            Seat_Status: 'Active',
                            user: {
                                User_ID: 10,
                                User_FirstName: 'Alice',
                                User_Surname: 'Smith',
                                User_Status: '1',
                                User_Email: ''
                            },
                        },
                        {
                            Team_ID: 1,
                            User_ID: 20,
                            Role_ID: 1,
                            Seat_Status: 'Active',
                            user: {
                                User_ID: 20,
                                User_FirstName: 'Bob',
                                User_Surname: 'Jones',
                                User_Status: '1',
                                User_Email: ''
                            },
                        },
                    ],
                },
            },
        };

        const renderNewTaskRow = (props = {}) =>
            render(
                <TestProvider>
                    <table>
                        <tbody>
                            <BacklogNewTaskRow
                                newTask={{ Task_Title: '', Status_ID: 1, Backlog_ID: 1, Assigned_User_ID: 0 }}
                                handleChangeNewTask={mockHandleChangeNewTask}
                                handleCreateTask={mockHandleCreateTask}
                                ifEnter={mockIfEnter}
                                renderBacklog={mockRenderBacklog}
                                createTaskPending={false}
                                {...props}
                            />
                        </tbody>
                    </table>
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderNewTaskRow()
        });

        afterEach(() => {
            cleanup();
        })

        it('renders all fields correctly', () => {
            expect(screen.getByLabelText(/New Task/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();

            const selects = screen.getAllByRole('combobox');
            expect(selects).toHaveLength(2); // Status + Assignee
            expect(screen.getByRole('combobox', { name: /Status/i })).toBeInTheDocument();
            expect(screen.getByRole('combobox', { name: /Assignee/i })).toBeInTheDocument();
        });

        it('calls handleChangeNewTask on input change', () => {
            fireEvent.change(screen.getByLabelText(/New Task/i), {
                target: { value: 'Write tests' },
            });

            expect(mockHandleChangeNewTask).toHaveBeenCalledWith('Task_Title', 'Write tests');
        });

        it('calls handleChangeNewTask on assignee change', () => {
            fireEvent.change(screen.getAllByRole('combobox')[1], {
                target: { value: '20' },
            });

            expect(mockHandleChangeNewTask).toHaveBeenCalledWith('Assigned_User_ID', '20');
        });

        it('calls ifEnter on Enter key in task title field', () => {
            fireEvent.keyDown(screen.getByLabelText(/New Task/i), {
                key: 'Enter',
                code: 'Enter',
            });

            expect(mockIfEnter).toHaveBeenCalled();
        });

        it('does not call handleCreateTask if createTaskPending is true', () => {
            cleanup();
            renderNewTaskRow({ createTaskPending: true });

            fireEvent.click(screen.getByTestId('create-task-button'));
            expect(mockHandleCreateTask).not.toHaveBeenCalled();
        });

        it('calls handleCreateTask when Create button clicked', () => {
            fireEvent.click(screen.getByRole('button', { name: /Create/i }));
            expect(mockHandleCreateTask).toHaveBeenCalled();
        });
    });

    describe('BacklogStatusActionMenu', () => {
        const mockRenderBacklog: BacklogStates = {
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
                Project_Key: 'SP',
                Project_Status: "Active",
            },
        };

        const renderBacklogStatusActionMenu = (selectedStatusIds: string[] = []) =>
            render(
                <TestProvider>
                    <BacklogStatusActionMenu
                        renderBacklog={mockRenderBacklog}
                        selectedStatusIds={selectedStatusIds}
                        statusUrlEditing={true}
                    />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();

            // const href = 'http://localhost/?statusIds=1';

            // Object.defineProperty(window, 'location', {
            //     configurable: true,
            //     writable: true,
            //     value: {
            //         href,
            //         search: '?statusIds=1',
            //         origin: 'http://localhost',
            //         hostname: 'localhost',
            //         pathname: '/',
            //         protocol: 'http:',
            //         assign: jest.fn(),
            //         replace: jest.fn(),
            //         reload: jest.fn(),
            //     },
            // });

            renderBacklogStatusActionMenu();
        });

        const originalLocation = window.location;

        afterEach(() => {
            // Object.defineProperty(window, 'location', {
            //     configurable: true,
            //     value: originalLocation,
            // });
            // delete (window as any).location;

            cleanup();
        })

        it('renders status checkboxes correctly', () => {
            expect(screen.getByText(/Backlog statuses/i)).toBeInTheDocument();
            expect(screen.getAllByRole('checkbox')).toHaveLength(2); // 2 statuses
            expect(screen.getByText(/To Do/i)).toBeInTheDocument();
            expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
        });

        it('checkboxes are checked when selectedStatusIds is empty (default all selected)', () => {
            cleanup();
            renderBacklogStatusActionMenu([]); // simulate "all selected"

            const checkboxes = screen.getAllByRole('checkbox');
            checkboxes.forEach(cb => {
                expect(cb).toBeChecked();
            });
        });

        it('checkboxes reflect selectedStatusIds', () => {
            cleanup();
            renderBacklogStatusActionMenu(['1']); // only 'To Do' selected

            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes[0]).toBeChecked(); // To Do
            expect(checkboxes[1]).not.toBeChecked(); // In Progress
        });

        // it('updates URL parameters when a checkbox is toggled', () => {
        //     const inProgressCheckbox = screen.getByText(/In Progress/i).previousSibling as HTMLInputElement;
        //     fireEvent.click(inProgressCheckbox); // Click 'In Progress' to add it

        //     expect(pushMock).toHaveBeenCalled();

        //     const newUrl = pushMock.mock.calls[0][0];
        //     console.log('URL called with:', newUrl); // Debug output

        //     expect(newUrl).toContain('statusIds=1,2');
        // });

        it('does not render when statusUrlEditing is false', () => {
            cleanup();
            const { container } = render(
                <TestProvider>
                    <BacklogStatusActionMenu
                        renderBacklog={mockRenderBacklog}
                        selectedStatusIds={[]}
                        statusUrlEditing={false}
                    />
                </TestProvider>
            );
            expect(container.textContent?.trim()).toBe('');
        });
    });

    describe('BacklogTaskRow', () => {
        const mockHandleCheckboxChange = jest.fn();
        const mockSetTaskDetail = jest.fn();

        const mockTask: Task = {
            Task_ID: 101,
            Backlog_ID: 1,
            Task_Title: 'Fix bug',
            Task_Key: 7,
            Task_CreatedAt: new Date().toISOString(),
            Status_ID: 1,
            Assigned_User_ID: 11,
        };

        const mockRenderBacklog: BacklogStates = {
            Backlog_ID: 1,
            Backlog_Name: 'Sample Backlog',
            Backlog_IsPrimary: true,
            Project_ID: 2,
            statuses: [
                { Backlog_ID: 1, Status_ID: 1, Status_Name: 'To Do' },
                { Backlog_ID: 1, Status_ID: 2, Status_Name: 'Done' },
            ],
            project: {
                Team_ID: 1,
                Project_Name: 'Sample Project',
                Project_Status: "Active",
                Project_Key: 'PRJ',
                team: {
                    Organisation_ID: 1,
                    Team_Name: 'Sample Team',
                    user_seats: [
                        {
                            Team_ID: 1,
                            Role_ID: 1,
                            Seat_Status: '1',
                            User_ID: 11,
                            user: {
                                User_FirstName: 'Jane',
                                User_Surname: 'Doe',
                                User_Status: '1',
                                User_Email: ''
                            },
                        },
                    ],
                },
            },
        };

        const renderBacklogTaskRow = (overrides = {}) =>
            render(
                <TestProvider>
                    <table>
                        <tbody>
                            <BacklogTaskRow
                                task={mockTask}
                                selectedTaskIds={[]}
                                selectedStatusIds={['1']}
                                handleCheckboxChange={mockHandleCheckboxChange}
                                setTaskDetail={mockSetTaskDetail}
                                renderBacklog={mockRenderBacklog}
                                {...overrides}
                            />
                        </tbody>
                    </table>
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();

            renderBacklogTaskRow();
        });

        afterEach(() => {
            cleanup();
        })

        it('renders task row correctly with assignee and status', () => {
            expect(screen.getByText('PRJ-7')).toBeInTheDocument();
            expect(screen.getByText('Fix bug')).toBeInTheDocument();
            expect(screen.getByText('To Do')).toBeInTheDocument();
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        });

        it('calls setTaskDetail when task title is clicked', () => {
            const titleCell = screen.getByText('Fix bug');
            fireEvent.click(titleCell);

            expect(mockSetTaskDetail).toHaveBeenCalledWith(mockTask);
        });

        it('calls handleCheckboxChange when checkbox is clicked', () => {
            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);

            expect(mockHandleCheckboxChange).toHaveBeenCalled();
        });

        it('does not render if task status is not in selectedStatusIds', () => {
            cleanup();
            renderBacklogTaskRow({ selectedStatusIds: ['2'] }); // Status_ID = 1, so should be filtered out

            expect(screen.queryByText('Fix bug')).not.toBeInTheDocument();
        });

        it('shows "Unassigned" when no user match is found', () => {
            const taskWithoutAssignee = { ...mockTask, Assigned_User_ID: 999 };

            cleanup();
            renderBacklogTaskRow({ task: taskWithoutAssignee });

            expect(screen.getByText('Unassigned')).toBeInTheDocument();
        });
    });

    describe('BacklogTaskTableHeader', () => {
        const mockHandleSelectAllChange = jest.fn();
        const mockHandleSort = jest.fn();

        const renderBacklogTaskTableHeader = (props = {}) =>
            render(
                <TestProvider>
                    <table>
                        <BacklogTaskTableHeader
                            selectAll={false}
                            handleSelectAllChange={mockHandleSelectAllChange}
                            currentSort={'1'}
                            currentOrder={'asc'}
                            handleSort={mockHandleSort}
                            {...props}
                        />
                    </table>
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderBacklogTaskTableHeader();
        });

        afterEach(() => {
            cleanup();
        });

        it('renders all column headers', () => {
            const expectedHeaders = [
                'Task Key',
                'Task Title',
                'Status',
                'Assignee',
                'Created At',
            ];

            expectedHeaders.forEach(header => {
                expect(screen.getByText(header)).toBeInTheDocument();
            });

            expect(screen.getByRole('checkbox')).toBeInTheDocument();
        });

        it('checkbox reflects `selectAll` state', () => {
            cleanup();
            renderBacklogTaskTableHeader({ selectAll: true });

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeChecked();
        });

        it('calls handleSelectAllChange when checkbox is clicked', () => {
            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);

            expect(mockHandleSelectAllChange).toHaveBeenCalled();
        });

        it('calls handleSort when a column header is clicked', () => {
            const column = screen.getByText('Task Title');
            fireEvent.click(column);

            expect(mockHandleSort).toHaveBeenCalledWith('1'); // Task Title has col: '1'
        });

        it('shows sort icon only on currently sorted column', () => {
            const taskTitleHeader = screen.getByText('Task Title');
            expect(taskTitleHeader.nextSibling?.nodeName).toBe('svg'); // FontAwesomeIcon renders <svg>
        });
    });
})

const mockReadTasksByBacklogId = jest.fn();

jest.mock('@/contexts', () => ({
    ...jest.requireActual('@/contexts'),
    useTasksContext: () => ({
        readTasksByBacklogId: mockReadTasksByBacklogId,
    }),
    useBacklogsContext: () => ({
        backlogById: { Project_ID: 1 },
        readBacklogById: jest.fn(),
        readBacklogsByProjectId: jest.fn(),
    }),
}));

jest.mock('@/redux', () => ({
    ...jest.requireActual('@/redux'),
    useTypedSelector: jest.fn(),
}));

describe('TaskBulkActionMenu', () => {

    let clipboardWriteTextMock: jest.Mock;

    beforeEach(() => {
        clipboardWriteTextMock = jest.fn();
        Object.assign(navigator, {
            clipboard: {
                writeText: clipboardWriteTextMock,
            },
        });

        // Override the mocked useSearchParams from the jest.mock
        (nextNavigation.useSearchParams as jest.Mock).mockImplementation(() => ({
            get: (key: string) => {
                if (key === 'taskIds') return '1,2,3';
                if (key === 'taskBulkFocus') return '';
                return null;
            },
        }));

        jest.spyOn(nextNavigation, 'useRouter').mockReturnValue({ push: pushMock } as any);
        jest.spyOn(nextNavigation, 'useParams').mockReturnValue({
            backlogLink: 'backlog-1',
            projectLink: 'project-1',
        } as any);

        jest.spyOn(redux, 'useTypedSelector').mockReturnValue(null);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        cleanup();
    });

    it('renders nothing if no taskIds in URL', () => {
        jest.spyOn(nextNavigation, 'useSearchParams').mockReturnValue({
            get: (key: string) => null,
        } as any);

        const { container } = render(
            <TestProvider>
                <TaskBulkActionMenu />
            </TestProvider>
        );
        expect(container.textContent?.trim()).toBe('');
    });

    it('renders task count and menu options', () => {
        render(
            <TestProvider>
                <TaskBulkActionMenu />
            </TestProvider>
        );
        expect(screen.getByText('3 tasks selected')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Copy to clipboard')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('copies to clipboard and shows success message', async () => {
        render(
            <TestProvider>
                <TaskBulkActionMenu />
            </TestProvider>
        );
        fireEvent.click(screen.getByText('Copy to clipboard'));

        await waitFor(() => {
            expect(clipboardWriteTextMock).toHaveBeenCalledWith('tester');
        });

        expect(await screen.findByText('3 items copied')).toBeInTheDocument();
    });

    it('calls API and clears URL on delete', async () => {
        // Mock confirm to return true
        global.confirm = jest.fn(() => true);

        const project: Project = {
            Team_ID: 1,
            Project_Name: "Test Project",
            Project_Key: "Test",
            Project_Status: 'Planned',
            backlogs: [
                {
                    Backlog_IsPrimary: false,
                    Backlog_Name: "Test Backlog",
                    Project_ID: 1
                }
            ]
        };

        const deletableTask: Task = {
            Task_ID: 1,
            Backlog_ID: 1,
            Task_Title: "Task Test",
            Status_ID: 1,
            status: {
                Status_ID: 1,
                Backlog_ID: 1,
                Status_Name: "Test",
                Status_Is_Closed: true
            }
        };

        // Set the return value for your mock
        mockReadTasksByBacklogId.mockResolvedValueOnce([deletableTask]);

        render(
            <TestProvider>
                <TaskBulkActionMenu project={project} />
            </TestProvider>
        );

        // Trigger delete action
        fireEvent.click(screen.getByText('Delete'));

        // Wait for async operations to complete
        await waitFor(() => {
            // Assert that the API was called
            expect(mockHttpPostWithData).toHaveBeenCalled();
            // Assert that the URL was cleared
            expect(pushMock).toHaveBeenCalled();
            // Clears task_id from the URL
            expect(window.location.search).not.toContain('task_id');
        });
    });

    it('updates URL on focus toggle', async () => {
        render(
            <TestProvider>
                <TaskBulkActionMenu />
            </TestProvider>
        );
        const toggleButton = screen.getByTestId('task-bulk-focus-toggle');
        expect(toggleButton).toBeInTheDocument(); // sanity check
        fireEvent.click(toggleButton);

        const expectedUrl = new URL('http://localhost/');
        expectedUrl.searchParams.set('taskBulkFocus', '1');

        expect(toggleButton).toHaveAttribute('href', expectedUrl.toString());
    });

    it('shows bulk edit when "Edit" is clicked', async () => {
        render(
            <TestProvider>
                <TaskBulkActionMenu />
            </TestProvider>
        );
        fireEvent.click(screen.getByText('Edit'));

        await waitFor(() => {
            expect(screen.getByText('Bulk edit')).toBeInTheDocument();
        });
    });
});
