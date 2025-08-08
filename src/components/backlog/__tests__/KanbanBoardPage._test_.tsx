jest.mock('@/components/backlog', () => {
    // Import the actual module for everything except ItemType
    const originalModule = jest.requireActual('@/components/backlog');
    return {
        ...originalModule,
        ItemType: { TASK: 'task' },  // mock ItemType here
    };
});

import React from 'react';

jest.mock('react-dnd', () => {
    const React = require('react');
    return {
        DndProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        useDrop: (specFunction: any) => {
            console.log('mock useDrop called');
            // Just return simple collected props and a noop ref function
            return [{ isOver: false }, () => { }];
        },
        useDrag: (specFunction: any) => {
            console.log('mock useDrag called');
            const spec = specFunction();
            const collected = spec.collect ? spec.collect({ isDragging: () => false }) : {};
            return [collected, () => { }];
        },
    };
});

jest.mock('react-dnd-html5-backend', () => ({}));

import { mockConvertID_NameStringToURLFormat } from '@/__tests__/test-utils';
import { Column, ColumnProps } from '@/components/backlog';
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

void React.createElement

let mockConvertID: jest.Mock = mockConvertID_NameStringToURLFormat;
const mockT = Object.assign((key: string) => key, { $TFunctionBrand: true }) as any;

describe('KanbanBoardPage Components', () => {
    describe('Column', () => {
        const mockProps: ColumnProps = {
            status: 1,
            label: 'In Progress',
            tasks: [
                { Task_ID: 1, Task_Title: 'Task A' } as any,
                { Task_ID: 2, Task_Title: 'Task B' } as any,
            ],
            canManageBacklog: true,
            archiveTask: jest.fn(),
            setTaskDetail: jest.fn(),
            moveTask: jest.fn(),
        };

        const renderColumn = (props = {}) =>
            render(
                <Column {...mockProps} {...props} />
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderColumn();
        })

        afterEach(() => {
            cleanup();
        });

        it('renders column title and tasks', () => {
            expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
            const taskCards = screen.getAllByTestId('task-card');
            expect(taskCards).toHaveLength(2);
            expect(taskCards[0]).toHaveTextContent('Task A');
            expect(taskCards[1]).toHaveTextContent('Task B');
        });

        it('renders empty column if no tasks', () => {
            cleanup();
            renderColumn({ tasks: [] });

            expect(screen.queryAllByTestId('task-card')).toHaveLength(0);
        });
    });
})
