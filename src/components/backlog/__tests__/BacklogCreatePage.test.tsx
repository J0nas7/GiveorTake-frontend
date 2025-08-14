import { TestProvider, mockConvertID_NameStringToURLFormat } from '@/__tests__/test-utils';
import { BacklogCreate, BacklogCreateProps } from '@/components/backlog';

import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

void React.createElement

let mockHandleInputChange: jest.Mock = jest.fn();
let mockHandleSubmit: jest.Mock = jest.fn();
let mockConvertID: jest.Mock = mockConvertID_NameStringToURLFormat;

const mockProps: BacklogCreateProps = {
    projectById: {
        Team_ID: 1,
        Project_ID: 1,
        Project_Name: 'Test Project',
        Project_Key: 'TEST',
        Project_Status: 'Active'
    },
    canManageProject: true,
    newBacklog: {
        Project_ID: 1,
        Team_ID: 1,
        Backlog_Name: '',
        Backlog_Description: '',
        Backlog_IsPrimary: false,
        Backlog_StartDate: '',
        Backlog_EndDate: '',
    },
    createPending: false,
    handleInputChange: mockHandleInputChange,
    handleSubmit: mockHandleSubmit,
    convertID_NameStringToURLFormat: mockConvertID,
};

jest.mock('react-quill', () => (props: any) => (
    <textarea
        data-testid="mock-quill"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
    />
));

describe('BacklogCreateView Components', () => {
    const renderBacklogCreateView = async (customProps = {}) => {
        await waitFor(() =>
            render(
                <TestProvider>
                    <BacklogCreate {...mockProps} {...customProps} />
                </TestProvider>
            )
        );
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        await renderBacklogCreateView();
    });

    afterEach(() => {
        cleanup();
    });

    // 8-10 tests
    describe('BacklogCreateView - Casual Cases', () => {
        it('renders all required fields', () => {
            expect(screen.getByLabelText(/Backlog Name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Is Primary Backlog/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
            expect(screen.getByText(/Backlog Description/i)).toBeInTheDocument();
        });

        it('calls handleInputChange when Backlog Name changes', () => {
            fireEvent.change(screen.getByLabelText(/Backlog Name/i), {
                target: { value: 'New backlog' },
            });
            expect(mockHandleInputChange).toHaveBeenCalledWith('Backlog_Name', 'New backlog');
        });

        it('Primary Backlog select calls handleInputChange', () => {
            fireEvent.change(screen.getByLabelText(/Is Primary Backlog/i), {
                target: { value: 'true' },
            });
            expect(mockHandleInputChange).toHaveBeenCalledWith('Backlog_IsPrimary', true);
        });

        it('Start Date and End Date inputs call handleInputChange', () => {
            fireEvent.change(screen.getByLabelText(/Start Date/i), {
                target: { value: '2025-08-01' },
            });
            expect(mockHandleInputChange).toHaveBeenCalledWith('Backlog_StartDate', '2025-08-01');

            fireEvent.change(screen.getByLabelText(/End Date/i), {
                target: { value: '2025-08-10' },
            });
            expect(mockHandleInputChange).toHaveBeenCalledWith('Backlog_EndDate', '2025-08-10');
        });

        // it('ReactQuill calls handleInputChange when description changes', () => {
        //     const quill = screen.getByTestId('backlog-description-editor'); // ReactQuill renders a contenteditable div
        //     fireEvent.input(quill, { target: { innerHTML: '<p>New description</p>' } });
        //     expect(mockHandleInputChange).toHaveBeenCalled();
        // });

        it('Clicking Create Backlog triggers handleSubmit', () => {
            fireEvent.click(screen.getByTestId('create-backlog-button'));
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
        });

        it('Button disabled when createPending is true', () => {
            cleanup()
            renderBacklogCreateView({ createPending: true });
            expect(screen.getByTestId('create-backlog-button')).toBeDisabled();
        });

        it('Renders "Go to Project" link with correct href', () => {
            expect(screen.getByRole('link', { name: /Go to Project/i })).toHaveAttribute(
                'href',
                '/project/1-test-project'
            );
        });

        it('LoadingState renders children when permitted', () => {
            expect(screen.getByText(/Backlog Details/i)).toBeInTheDocument();
        });

        it('LoadingState hides children when not permitted', () => {
            cleanup();
            renderBacklogCreateView({ canManageProject: false });
            expect(screen.queryByText(/Backlog Details/i)).not.toBeInTheDocument();
        });
    })

    // 5-6 tests
    describe('BacklogCreateView - Edge Cases', () => {
        it('Handles empty newBacklog object gracefully', () => {
            cleanup();
            expect(() =>
                renderBacklogCreateView({ newBacklog: {} as any })
            ).not.toThrow();
        });

        it('Handles missing projectById gracefully', () => {
            cleanup();
            renderBacklogCreateView({ projectById: undefined as any });
            expect(screen.queryByRole('link', { name: /Go to Project/i })).not.toBeInTheDocument();
        });

        it('Handles Backlog_IsPrimary toggle from true to false', () => {
            renderBacklogCreateView({ newBacklog: { ...mockProps.newBacklog, Backlog_IsPrimary: true } });
            fireEvent.change(screen.getByLabelText(/Is Primary Backlog/i), {
                target: { value: 'false' },
            });
            expect(mockHandleInputChange).toHaveBeenCalledWith('Backlog_IsPrimary', false);
        });

        it('Click Create Backlog when createPending is true does not call handler', () => {
            cleanup();
            renderBacklogCreateView({ createPending: true });
            fireEvent.click(screen.getByTestId('create-backlog-button'));
            expect(mockHandleSubmit).not.toHaveBeenCalled();
        });

        it('Handles special characters in Backlog_Name', () => {
            fireEvent.change(screen.getByLabelText(/Backlog Name/i), {
                target: { value: '!@#$%^&*()' },
            });
            expect(mockHandleInputChange).toHaveBeenCalledWith('Backlog_Name', '!@#$%^&*()');
        });

        // it('ReactQuill accepts long HTML content', () => {
        //     const longHTML = `<p>${'a'.repeat(1000)}</p>`;
        //     const quill = screen.getByTestId('backlog-description-editor'); // ReactQuill renders a contenteditable div
        //     fireEvent.input(quill, { target: { innerHTML: longHTML } });
        //     expect(mockHandleInputChange).toHaveBeenCalled();
        // });
    })
})
