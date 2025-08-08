import { mockConvertID_NameStringToURLFormat, TestProvider } from '@/__tests__/test-utils';
import { DashboardCharts, DashboardChartsProps, DashboardKPISection, DashboardKPISectionProps, DashboardProgressSection, DashboardProgressSectionProps } from '@/components/backlog';
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';

void React.createElement

let mockConvertID: jest.Mock = mockConvertID_NameStringToURLFormat;
const mockT = Object.assign((key: string) => key, { $TFunctionBrand: true }) as any;

describe('DashboardPage Components', () => {
    describe('DashboardKPISection', () => {
        const mockProps: DashboardKPISectionProps = {
            totalTasks: 20,
            completedTasks: 15,
            completionRate: 75,
            overdueTasks: 3,
            inProgressTasks: 2,
            t: mockT
        };

        const renderDashboardKPISection = (props = {}) =>
            render(
                <TestProvider>
                    <DashboardKPISection {...mockProps} {...props} />
                </TestProvider>
            )

        beforeEach(() => {
            jest.clearAllMocks
            renderDashboardKPISection()
        });

        afterEach(() => {
            cleanup()
        })

        it('renders all KPI cards', () => {
            expect(screen.getByText('dashboard.totalTasks')).toBeInTheDocument();
            expect(screen.getByText('dashboard.completedTasks')).toBeInTheDocument();
            expect(screen.getByText('dashboard.overdueTasks')).toBeInTheDocument();
            expect(screen.getByText('dashboard.tasksInProgress')).toBeInTheDocument();
        });

        it('displays correct values for each KPI', () => {
            expect(screen.getByText('20')).toBeInTheDocument();                      // totalTasks
            expect(screen.getByText('15 (75%)')).toBeInTheDocument();              // completedTasks + rate
            expect(screen.getByText('3')).toBeInTheDocument();                     // overdueTasks
            expect(screen.getByText('2')).toBeInTheDocument();                     // inProgressTasks
        });

        it('renders headings with correct semantic elements', () => {
            const headings = screen.getAllByRole('heading', { level: 3 });
            expect(headings).toHaveLength(4);
            expect(headings.map(h => h.textContent)).toEqual([
                'dashboard.totalTasks',
                'dashboard.completedTasks',
                'dashboard.overdueTasks',
                'dashboard.tasksInProgress'
            ]);
        });
    });

    describe('DashboardProgressSection', () => {
        const mockProps: DashboardProgressSectionProps = {
            completionRate: 75,
            t: mockT
        };

        const renderDashboardProgressSection = (props = {}) =>
            render(
                <TestProvider>
                    <DashboardProgressSection {...mockProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderDashboardProgressSection();
        });

        afterEach(() => {
            cleanup();
        });

        it('renders the progress section heading', () => {
            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('dashboard.progress');
        });

        it('renders the progress bar with correct percentage', () => {
            expect(screen.getByText('75%')).toBeInTheDocument();
        });

        it('progress bar has correct ARIA attributes', () => {
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuenow', '75');
            expect(progressBar).toHaveAttribute('aria-valuemin', '0');
            expect(progressBar).toHaveAttribute('aria-valuemax', '100');
        });
    });

    describe('DashboardCharts', () => {
        const mockProps: DashboardChartsProps = {
            chartData: {
                labels: ['Completed', 'In Progress', 'Overdue', 'Blocked'],
                datasets: [
                    {
                        data: [10, 5, 3, 2],
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                    },
                ],
            },
            barChartData: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: mockT('dashboard.completedTasks'),
                        data: [12, 19, 3, 5],
                        backgroundColor: '#36A2EB',
                        borderColor: '#36A2EB',
                        borderWidth: 1
                    },
                    {
                        label: mockT('dashboard.pendingTasks'),
                        data: [7, 11, 5, 8],
                        backgroundColor: '#FFCE56',
                        borderColor: '#FFCE56',
                        borderWidth: 1
                    }
                ]
            },
            t: mockT,
        };

        const renderDashboardCharts = (props = {}) =>
            render(
                <TestProvider>
                    <DashboardCharts {...mockProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();
            renderDashboardCharts();
        });

        afterEach(() => {
            cleanup();
        });

        it('renders both chart headings', () => {
            const headings = screen.getAllByRole('heading', { level: 2 });
            expect(headings).toHaveLength(2);
            expect(headings[0]).toHaveTextContent('dashboard.analytics');
            expect(headings[1]).toHaveTextContent('dashboard.taskCompletionOverTime');
        });

        it('renders the Pie and Bar chart canvases', () => {
            // The charts render as <canvas> elements
            const canvases = screen.getAllByRole('img'); // role="img" is assigned by Chart.js via ARIA
            expect(canvases).toHaveLength(2);
        });
    });
})
