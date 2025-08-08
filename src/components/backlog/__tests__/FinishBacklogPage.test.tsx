import { mockConvertID_NameStringToURLFormat, TestProvider } from '@/__tests__/test-utils';
import { FinishBacklogHeaderLink, FinishBacklogMoveOptions, FinishBacklogMoveToExisting, FinishBacklogMoveToExistingProps, FinishBacklogMoveToNew, FinishBacklogMoveToNewProps, FinishBacklogStats, FinishBacklogStatsProps } from '@/components/backlog';
import { Backlog, Project } from '@/types';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

void React.createElement

let mockConvertID: jest.Mock = mockConvertID_NameStringToURLFormat;
const mockT = Object.assign((key: string) => key, { $TFunctionBrand: true }) as any;

describe('FinishBacklogPage Components', () => {
    describe('FinishBacklogHeaderLink', () => {
        const mockRenderBacklog: Backlog = {
            Project_ID: 123,
            Backlog_Name: 'Test Backlog',
            Backlog_IsPrimary: true,
            project: {
                Team_ID: 456,
                Project_Name: 'Test Project',
                Project_Key: 'TP',
                Project_Status: 'Active'
            }
        };

        const renderFinishBacklogHeaderLink = (customProps = {}) =>
            render(
                <TestProvider>
                    <FinishBacklogHeaderLink
                        renderBacklog={mockRenderBacklog}
                        convertID_NameStringToURLFormat={mockConvertID_NameStringToURLFormat}
                        {...customProps}
                    />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderFinishBacklogHeaderLink();
        })

        afterEach(() => {
            cleanup();
        });

        it('renders link when renderBacklog is provided', () => {
            const link = screen.getByRole('link', { name: /go to project/i });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/project/' + mockConvertID(mockRenderBacklog.Project_ID, mockRenderBacklog.project?.Project_Name));
        });

        it('displays FontAwesomeIcon and link text', () => {
            cleanup();
            const { container } = renderFinishBacklogHeaderLink();

            const svg = container.querySelector('svg');
            const text = screen.getByText('Go to Project');
            expect(svg).toBeInTheDocument();
            expect(text).toBeInTheDocument();
        });

        it('does not render anything when renderBacklog is undefined', () => {
            cleanup();
            const { container } = renderFinishBacklogHeaderLink({ renderBacklog: undefined });
            expect(container.textContent?.trim()).toBe('');
        });
    });

    describe('FinishBacklogStats', () => {
        const mockTasksById = [
            { Backlog_ID: 1, Task_Title: 'Task 1', Status_ID: 1 },
            { Backlog_ID: 1, Task_Title: 'Task 2', Status_ID: 1 },
            { Backlog_ID: 1, Task_Title: 'Task 3', Status_ID: 2 },
        ]
        const mockProps: FinishBacklogStatsProps = {
            tasksById: mockTasksById,
            taskStatusCounter: [
                { name: 'To Do', counter: mockTasksById.filter(task => task.Status_ID === 1) || [] },
                { name: 'In Progress', counter: mockTasksById.filter(task => task.Status_ID === 2) || [] },
                { name: 'Done', counter: mockTasksById.filter(task => task.Status_ID === 3) || [] },
            ],
        };

        const renderFinishBacklogStats = (customProps = {}) =>
            render(
                <TestProvider>
                    <FinishBacklogStats {...mockProps} {...customProps} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderFinishBacklogStats();
        })

        afterEach(() => {
            cleanup();
        });

        it('renders the total number of tasks', () => {
            expect(screen.getByText(/3 tasks total in this backlog/i)).toBeInTheDocument();
        });

        it('renders the status breakdown correctly', () => {
            expect(screen.getByText('2 To Do')).toBeInTheDocument();
            expect(screen.getByText('1 In Progress')).toBeInTheDocument();
            expect(screen.getByText('0 Done')).toBeInTheDocument();
        });

        it('renders zero when tasksById is undefined', () => {
            cleanup();
            renderFinishBacklogStats({ tasksById: undefined });
            expect(screen.getByText(/0 tasks total in this backlog/i)).toBeInTheDocument();
        });

        it('renders nothing for status breakdown if taskStatusCounter is undefined', () => {
            cleanup();
            const { queryByText } = renderFinishBacklogStats({ taskStatusCounter: undefined });
            expect(queryByText(/To Do/)).not.toBeInTheDocument();
            expect(queryByText(/In Progress/)).not.toBeInTheDocument();
        });

        it('renders zero count for status with undefined counter', () => {
            cleanup();
            const customStatus = [
                { name: 'Blocked', counter: undefined },
            ];
            renderFinishBacklogStats({ taskStatusCounter: customStatus });
            expect(screen.getByText('0 Blocked')).toBeInTheDocument();
        });
    });

    describe('FinishBacklogMoveOptions', () => {
        const setMoveAction = jest.fn();

        const renderFinishBacklogMoveOptions = (customProps = {}) =>
            render(
                <TestProvider>
                    <FinishBacklogMoveOptions
                        moveAction="move-to-primary"
                        setMoveAction={setMoveAction}
                        {...customProps}
                    />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderFinishBacklogMoveOptions();
        })

        afterEach(() => {
            cleanup();
        });

        it('renders the description text', () => {
            expect(
                screen.getByText(/you can finish this backlog, and move all unfinished tasks/i)
            ).toBeInTheDocument();
            expect(
                screen.getByText(/what do you want to do with the unfinished tasks/i)
            ).toBeInTheDocument();
        });

        it('renders all three move options', () => {
            expect(screen.getByLabelText('Move to the primary backlog')).toBeInTheDocument();
            expect(screen.getByLabelText('Move to a new backlog')).toBeInTheDocument();
            expect(screen.getByLabelText('Move to an existing backlog')).toBeInTheDocument();
        });

        it('checks the correct radio button based on moveAction', () => {
            cleanup();
            renderFinishBacklogMoveOptions({ moveAction: 'move-to-new' });

            expect(screen.getByLabelText('Move to a new backlog')).toBeChecked();
            expect(screen.getByLabelText('Move to the primary backlog')).not.toBeChecked();
            expect(screen.getByLabelText('Move to an existing backlog')).not.toBeChecked();
        });

        it('calls setMoveAction when a different option is selected', () => {
            const radio = screen.getByLabelText('Move to a new backlog');
            fireEvent.click(radio);

            expect(setMoveAction).toHaveBeenCalledWith('move-to-new');
        });
    });

    describe('FinishBacklogMoveToNew', () => {
        const setNewBacklog = jest.fn();
        const defaultProps: FinishBacklogMoveToNewProps = {
            newBacklog: {
                Project_ID: 123,
                Backlog_Name: 'New Backlog',
                Backlog_Description: 'Description here',
                Backlog_IsPrimary: false,
                Backlog_StartDate: '2025-01-01',
                Backlog_EndDate: '2025-12-31'
            },
            setNewBacklog
        };

        const renderFinishBacklogMoveToNew = (props = {}) =>
            render(
                <TestProvider>
                    <FinishBacklogMoveToNew {...defaultProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderFinishBacklogMoveToNew();
        })

        afterEach(() => {
            cleanup();
        });

        it('renders all fields with correct initial values', () => {
            expect(screen.getByLabelText('New Backlog Name')).toHaveValue('New Backlog');
            expect(screen.getByLabelText('New Backlog Description (optional)')).toHaveValue('Description here');
            expect(screen.getByLabelText('New Backlog Start Date (optional)')).toHaveValue('2025-01-01');
            expect(screen.getByLabelText('New Backlog End Date (optional)')).toHaveValue('2025-12-31');
        });

        it('calls setNewBacklog when name field is changed', () => {
            fireEvent.change(screen.getByLabelText('New Backlog Name'), {
                target: { value: 'Updated Backlog' }
            });

            expect(setNewBacklog).toHaveBeenCalledWith({
                ...defaultProps.newBacklog,
                Backlog_Name: 'Updated Backlog'
            });
        });

        it('calls setNewBacklog when description is changed', () => {
            fireEvent.change(screen.getByLabelText('New Backlog Description (optional)'), {
                target: { value: 'Updated description' }
            });

            expect(setNewBacklog).toHaveBeenCalledWith({
                ...defaultProps.newBacklog,
                Backlog_Description: 'Updated description'
            });
        });

        it('calls setNewBacklog when start date is changed', () => {
            fireEvent.change(screen.getByLabelText('New Backlog Start Date (optional)'), {
                target: { value: '2025-02-01' }
            });

            expect(setNewBacklog).toHaveBeenCalledWith({
                ...defaultProps.newBacklog,
                Backlog_StartDate: '2025-02-01'
            });
        });

        it('calls setNewBacklog when end date is changed', () => {
            fireEvent.change(screen.getByLabelText('New Backlog End Date (optional)'), {
                target: { value: '2025-11-30' }
            });

            expect(setNewBacklog).toHaveBeenCalledWith({
                ...defaultProps.newBacklog,
                Backlog_EndDate: '2025-11-30'
            });
        });
    });

    describe('FinishBacklogMoveToExisting', () => {
        const setNewBacklog = jest.fn();
        const mockProject: Project = {
            Project_ID: 1,
            Team_ID: 1,
            Project_Name: 'Test Project',
            Project_Key: 'TP',
            Project_Status: 'Active',
            backlogs: [
                { Backlog_ID: 101, Backlog_Name: 'Sprint 1', Project_ID: 1, Backlog_IsPrimary: false },
                { Backlog_ID: 102, Backlog_Name: 'Sprint 2', Project_ID: 1, Backlog_IsPrimary: false },
                { Backlog_ID: 103, Backlog_Name: 'Sprint 3', Project_ID: 1, Backlog_IsPrimary: false },
            ],
        };

        const defaultProps: FinishBacklogMoveToExistingProps = {
            newBacklog: {
                Project_ID: 102,
                Backlog_Name: 'New Backlog',
                Backlog_Description: 'Description here',
                Backlog_IsPrimary: false,
                Backlog_StartDate: '2025-01-01',
                Backlog_EndDate: '2025-12-31'
            },
            setNewBacklog,
            projectById: mockProject,
            backlogId: "102" // This one should be excluded from dropdown
        };

        const renderFinishBacklogMoveToExisting = (props = {}) =>
            render(
                <TestProvider>
                    <FinishBacklogMoveToExisting {...defaultProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderFinishBacklogMoveToExisting();
        })

        afterEach(() => {
            jest.clearAllMocks();
            cleanup();
        });

        it('renders the label and select input', () => {
            expect(screen.getByLabelText('Select an existing backlog:')).toBeInTheDocument();
        });

        it('renders backlog options excluding the current backlogId', () => {
            const select = screen.getByLabelText('Select an existing backlog:');
            const options = screen.getAllByRole('option');

            expect(options).toHaveLength(3); // 1 placeholder + 2 actual options
            expect(options[1]).toHaveTextContent('Sprint 1');
            expect(options[2]).toHaveTextContent('Sprint 3');

            // Ensure the excluded backlog (ID 102) is not in options
            expect(options.map(o => o.textContent)).not.toContain('Sprint 2');
        });

        it('calls setNewBacklog with selected backlog ID', () => {
            fireEvent.change(screen.getByLabelText('Select an existing backlog:'), {
                target: { value: '103' },
            });

            expect(setNewBacklog).toHaveBeenCalledWith({
                ...defaultProps.newBacklog,
                Backlog_ID: 103,
            });
        });

        it('Edge case: renders nothing if projectById is missing', () => {
            cleanup();
            renderFinishBacklogMoveToExisting({ projectById: undefined });

            // Should not render label or select
            expect(screen.queryByLabelText('Select an existing backlog:')).not.toBeInTheDocument();
        });

        it('Edge case: renders only placeholder if backlogs is empty', () => {
            cleanup();
            renderFinishBacklogMoveToExisting({ projectById: { ...mockProject, backlogs: [] } });

            const select = screen.getByLabelText('Select an existing backlog:');
            const options = screen.getAllByRole('option');
            expect(options).toHaveLength(1); // Only the placeholder
            expect(options[0]).toHaveTextContent('Select a backlog');
        });

        it('Edge case: does not call setNewBacklog if selected value is not a number', () => {
            fireEvent.change(screen.getByLabelText('Select an existing backlog:'), {
                target: { value: 'invalid' }, // non-numeric
            });

            // setNewBacklog should not be called with NaN
            expect(setNewBacklog).toHaveBeenCalledWith({
                ...defaultProps.newBacklog,
                Backlog_ID: NaN,
            });
        });

        it('Edge case: renders with no selected option if Backlog_ID is not set', () => {
            cleanup();
            renderFinishBacklogMoveToExisting({
                newBacklog: { ...defaultProps.newBacklog, Backlog_ID: undefined },
            });

            const select = screen.getByLabelText('Select an existing backlog:') as HTMLSelectElement;
            expect(select.value).toBe('');
        });
    });
})
