import { mockConvertID_NameStringToURLFormat, TestProvider } from '@/__tests__/test-utils';
import { BacklogActions, BacklogActionsProps, BacklogEditEditor, BacklogEditorProps, StatusListEditor, TaskSummaryCard } from '@/components/backlog';
import { Backlog } from '@/types';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

void React.createElement

const mockSetShowEditToggles = jest.fn();
const mockHandleSaveBacklogChanges = jest.fn();

const mockHandleBacklogChange = jest.fn();
const mockHandleBacklogInputChange = jest.fn();
const mockHandleDeleteBacklog = jest.fn();

let mockConvertID: jest.Mock = mockConvertID_NameStringToURLFormat;

jest.mock('react-quill', () => (props: any) => (
    <textarea
        data-testid="mock-quill"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
    />
));

describe('BacklogEditPage Components', () => {
    describe('BacklogActions', () => {
        const mockProps: BacklogActionsProps = {
            localBacklog: {
                Backlog_ID: 1,
                Backlog_Name: 'Test Backlog',
                Project_ID: 10,
                Backlog_IsPrimary: true,
                project: {
                    Project_Name: 'Test Project',
                    Team_ID: 1,
                    Project_Key: 'TP',
                    Project_Status: 'Active'
                }
            },
            canAccessBacklog: true,
            convertID_NameStringToURLFormat: mockConvertID_NameStringToURLFormat,
            editPending: false,
            showEditToggles: false,
            setShowEditToggles: mockSetShowEditToggles,
            handleSaveBacklogChanges: mockHandleSaveBacklogChanges
        };

        const renderBacklogActions = (props = {}) =>
            render(
                <TestProvider>
                    <BacklogActions {...mockProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderBacklogActions();
        });

        afterEach(() => {
            cleanup
        })

        it('renders when canAccessBacklog is true and localBacklog exists', () => {
            expect(screen.getByText(/Go to Backlog/i)).toBeInTheDocument();
            expect(screen.getByText(/Go to Project/i)).toBeInTheDocument();
        });

        it('does not render when canAccessBacklog is false', () => {
            cleanup()
            const { container } = renderBacklogActions({ canAccessBacklog: false })

            expect(container.textContent?.trim()).toBe('')
        });

        it('toggles showEditToggles when edit button is clicked', () => {
            fireEvent.click(screen.getByRole('button'));
            expect(mockSetShowEditToggles).toHaveBeenCalledWith(true);
            expect(mockHandleSaveBacklogChanges).not.toHaveBeenCalled();
        });

        it('calls handleSaveBacklogChanges when showEditToggles is true and clicked', () => {
            cleanup()
            renderBacklogActions({ showEditToggles: true })
            fireEvent.click(screen.getByRole('button'));
            expect(mockHandleSaveBacklogChanges).toHaveBeenCalled();
            expect(mockSetShowEditToggles).toHaveBeenCalledWith(false);
        });

        it('displays LoadingButton when editPending is true', () => {
            cleanup()
            renderBacklogActions({ editPending: true })
            expect(screen.getByAltText('Loading...')).toBeInTheDocument();
        });

        it('Go to Backlog link uses correct href', () => {
            const link = screen.getByRole('link', { name: /Go to Backlog/i });
            expect(link).toHaveAttribute('href', '/backlog/1-test-backlog');
            expect(mockConvertID_NameStringToURLFormat).toHaveBeenCalledWith(1, 'Test Backlog');
        });

        it('Go to Project link uses correct href', () => {
            const link = screen.getByRole('link', { name: /Go to Project/i });
            expect(link).toHaveAttribute('href', '/project/10-test-project');
            expect(mockConvertID_NameStringToURLFormat).toHaveBeenCalledWith(10, 'Test Project');
        });

        it('handles missing project name gracefully', () => {
            const props = {
                ...mockProps,
                localBacklog: {
                    ...mockProps.localBacklog,
                    project: {
                        Project_Name: '',
                        Team_ID: 1,
                        Project_Key: 'TP',
                        Project_Status: 'Active'
                    }
                } as Backlog
            };
            cleanup()
            renderBacklogActions({ ...props });
            const link = screen.getByRole('link', { name: /Go to Project/i });
            expect(link).toHaveAttribute('href', '/project/10-');
        });
    })

    describe('BacklogEditEditor View Mode', () => {
        const defaultProps: BacklogEditorProps = {
            localBacklog: {
                Backlog_ID: 1,
                Project_ID: 1,
                Backlog_Name: 'Test Backlog',
                Backlog_Description: 'Test Description',
                Backlog_IsPrimary: true,
                Backlog_StartDate: '2025-08-01',
                Backlog_EndDate: '2025-08-10'
            },
            handleBacklogChange: mockHandleBacklogChange,
            handleBacklogInputChange: mockHandleBacklogInputChange,
            handleDeleteBacklog: mockHandleDeleteBacklog,
            canManageBacklog: true,
            showEditToggles: false
        };

        const renderEditor = (props = {}) =>
            render(
                <TestProvider>
                    <BacklogEditEditor {...defaultProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderEditor();
        });

        afterEach(cleanup);

        it('renders backlog details in view mode', () => {
            expect(screen.getByText(/Backlog Details/i)).toBeInTheDocument();
            expect(screen.getByText(/Test Backlog/i)).toBeInTheDocument();
            expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
        });

        it('shows "No description provided" when description is empty', () => {
            cleanup()
            renderEditor({ localBacklog: { ...defaultProps.localBacklog, Backlog_Description: '' } });
            expect(screen.getByText(/No description provided/i)).toBeInTheDocument();
        });

        it('shows N/A for missing dates', () => {
            cleanup()
            renderEditor({
                localBacklog: { ...defaultProps.localBacklog, Backlog_StartDate: '', Backlog_EndDate: '' }
            });
            const startLabel = screen.getByText(/Start:/i);
            expect(startLabel.parentElement?.textContent).toContain('N/A');

            const endLabel = screen.getByText(/End:/i);
            expect(endLabel.parentElement?.textContent).toContain('N/A');
        });
    });

    describe('BacklogEditEditor Edit Mode', () => {
        const defaultProps = {
            localBacklog: {
                Backlog_ID: 1,
                Project_ID: 1,
                Backlog_Name: 'Test Backlog',
                Backlog_Description: 'Test Description',
                Backlog_IsPrimary: true,
                Backlog_StartDate: '2025-08-01',
                Backlog_EndDate: '2025-08-10'
            },
            handleBacklogChange: mockHandleBacklogChange,
            handleBacklogInputChange: mockHandleBacklogInputChange,
            handleDeleteBacklog: mockHandleDeleteBacklog,
            canManageBacklog: true,
            showEditToggles: true
        };

        const renderEditor = (props = {}) =>
            render(
                <TestProvider>
                    <BacklogEditEditor {...defaultProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks()
            renderEditor()
        })

        afterEach(cleanup);

        it('renders all editable fields', () => {
            expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
        });

        it('calls handleBacklogInputChange when name changes', () => {
            fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Updated' } });
            expect(mockHandleBacklogInputChange).toHaveBeenCalled();
        });

        it('calls handleBacklogChange when start date changes', () => {
            fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2025-09-01' } });
            expect(mockHandleBacklogChange).toHaveBeenCalledWith('Backlog_StartDate', '2025-09-01');
        });

        it('calls handleBacklogChange when end date changes', () => {
            fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2025-09-15' } });
            expect(mockHandleBacklogChange).toHaveBeenCalledWith('Backlog_EndDate', '2025-09-15');
        });

        it('calls handleDeleteBacklog when delete button clicked', () => {
            fireEvent.click(screen.getByText(/Delete Backlog/i));
            expect(mockHandleDeleteBacklog).toHaveBeenCalled();
        });

        it('calls handleBacklogChange when description changes', () => {
            fireEvent.change(screen.getByTestId('mock-quill'), { target: { value: 'New Desc' } });
            expect(mockHandleBacklogChange).toHaveBeenCalledWith('Backlog_Description', 'New Desc');
        });
    });

    describe('StatusListEditor', () => {
        const mockSetNewStatus = jest.fn();
        const mockIfEnterCreateStatus = jest.fn();
        const mockHandleCreateStatus = jest.fn();
        const mockIfEnterSaveStatus = jest.fn();
        const mockHandleSaveStatusChanges = jest.fn();
        const mockRemoveStatus = jest.fn();
        const mockHandleMoveStatusChanges = jest.fn();
        const mockHandleAssignDefaultStatus = jest.fn();
        const mockHandleAssignClosedStatus = jest.fn();

        const defaultProps = {
            newStatus: { Backlog_ID: 1, Status_Name: '' },
            setNewStatus: mockSetNewStatus,
            localBacklog: {
                Backlog_ID: 1,
                Project_ID: 1,
                Backlog_Name: 'Test Backlog',
                Backlog_Description: 'Test Description',
                Backlog_IsPrimary: true,
                Backlog_StartDate: '2025-08-01',
                Backlog_EndDate: '2025-08-10',
                statuses: [
                    { Backlog_ID: 1, Status_ID: 1, Status_Name: 'Open', Status_Order: 1, Status_Is_Default: true, Status_Is_Closed: false },
                    { Backlog_ID: 1, Status_ID: 2, Status_Name: 'Closed', Status_Order: 2, Status_Is_Default: false, Status_Is_Closed: true }
                ],
                tasks: []
            },
            ifEnterCreateStatus: mockIfEnterCreateStatus,
            handleCreateStatus: mockHandleCreateStatus,
            ifEnterSaveStatus: mockIfEnterSaveStatus,
            saveStatusPending: undefined,
            moveStatusPending: undefined,
            handleSaveStatusChanges: mockHandleSaveStatusChanges,
            removeStatus: mockRemoveStatus,
            convertID_NameStringToURLFormat: mockConvertID,
            handleMoveStatusChanges: mockHandleMoveStatusChanges,
            handleAssignDefaultStatus: mockHandleAssignDefaultStatus,
            handleAssignClosedStatus: mockHandleAssignClosedStatus,
            showEditToggles: false,
            createStatusPending: false
        };

        const renderStatusListEditor = (props = {}) =>
            render(
                <TestProvider>
                    <StatusListEditor {...defaultProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderStatusListEditor();
        });

        afterEach(cleanup)

        it('renders statuses in view mode', () => {
            expect(screen.getByText('Open')).toBeInTheDocument();
            expect(screen.getByText('Closed')).toBeInTheDocument();
        });

        it('renders input for new status in edit mode', () => {
            cleanup()
            renderStatusListEditor({ showEditToggles: true });
            expect(screen.getByLabelText(/New status/i)).toBeInTheDocument();
        });

        it('calls handleCreateStatus when Create status button clicked', () => {
            cleanup()
            renderStatusListEditor({ showEditToggles: true });
            fireEvent.click(screen.getByText(/Create status/i));
            expect(mockHandleCreateStatus).toHaveBeenCalled();
        });

        it('calls handleSaveStatusChanges when status name edited', () => {
            cleanup()
            renderStatusListEditor({ showEditToggles: true });
            const firstStatusField = screen.getAllByTestId('status-name-field')[0]
                .querySelector('input') as HTMLInputElement;
            fireEvent.change(firstStatusField, { target: { value: 'Updated Open' } });
            fireEvent.click(screen.getByTestId('save-status-button')); // Pencil icon button
            expect(mockHandleSaveStatusChanges).toHaveBeenCalled();
        });
    });

    describe('TaskSummaryCard', () => {
        const mockStats = {
            total: 10,
            assigneeCount: {
                1: 3,
                2: 5,
                Unassigned: 2,
            },
        };

        const renderTaskSummaryCard = (stats = mockStats) => {
            render(<TaskSummaryCard stats={stats} />);
        };

        it('renders total tasks correctly', () => {
            renderTaskSummaryCard();
            expect(screen.getByText('Total Tasks')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
        });

        it('renders assignee distribution percentages correctly', () => {
            renderTaskSummaryCard();
            expect(screen.getByText('User #1:30.0%')).toBeInTheDocument();
            expect(screen.getByText('User #2:50.0%')).toBeInTheDocument();
            expect(screen.getByText('Unassigned:20.0%')).toBeInTheDocument();
        });

        it('does not render anything if stats is null', () => {
            const { container } = render(<TaskSummaryCard stats={null} />);
            expect(container.firstChild).toBeNull();
        });
    });
})
