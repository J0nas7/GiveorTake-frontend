// External
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Internal
import {
    CommentsAreaView,
    CtaButtonsView,
    DescriptionAreaView,
    MediaFilesAreaView,
    TaskDetailsView,
    TitleAreaView
} from '@/components/partials/task/TaskDetails';
import { Task } from '@/types';

const mockTask: Task = {
    Task_ID: 1,
    Task_Key: 1,
    Backlog_ID: 1,
    Team_ID: 1,
    Assigned_User_ID: 2,
    Task_Title: 'Sample Task',
    Task_Description: 'Sample Description',
    Status_ID: 1,
    Task_Due_Date: '2024-06-01',
    Task_CreatedAt: '2024-05-01',
    Task_UpdatedAt: '2024-05-02',
};

const mockRef = { current: { focus: jest.fn() } } as unknown as React.RefObject<HTMLInputElement>;

describe('TitleAreaView', () => {
    test('renders correctly with valid task', () => {
        render(<TitleAreaView
            isEditing={false}
            setIsEditing={jest.fn()}
            title={"Samle Task"}
            setTitle={jest.fn()}
            inputRef={mockRef}
            task={mockTask}
            handleBlur={jest.fn()}
        />);
        expect(screen.getByText('Sample Task')).toBeInTheDocument();
    });

    test('renders placeholder when task title is empty', () => {
        render(<TitleAreaView
            isEditing={false}
            setIsEditing={jest.fn()}
            title={"Samle Task"}
            setTitle={jest.fn()}
            inputRef={mockRef}
            task={{ ...mockTask, Task_Title: '' }}
            handleBlur={jest.fn()}
        />);
        expect(screen.getByText('Click to add title...')).toBeInTheDocument();
    });

    test('calls saveTaskChanges on blur', () => {
        const handleBlurMock = jest.fn();
        render(<TitleAreaView
            isEditing={false}
            setIsEditing={jest.fn()}
            title={"Samle Task"}
            setTitle={jest.fn()}
            inputRef={mockRef}
            task={mockTask}
            handleBlur={handleBlurMock}
        />);
        fireEvent.click(screen.getByText('Sample Task'));
        fireEvent.blur(screen.getByRole('textbox'));
        expect(handleBlurMock).toHaveBeenCalled();
    });

    // Edge case: long title
    test('renders long task title without breaking layout', () => {
        const longTitle = 'A'.repeat(300);
        render(<TitleAreaView
            isEditing={false}
            setIsEditing={jest.fn()}
            title={"Samle Task"}
            setTitle={jest.fn()}
            inputRef={mockRef}
            task={{ ...mockTask, Task_Title: longTitle }}
            handleBlur={jest.fn()}
        />);
        expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    // Edge case: undefined task
    test('handles undefined task gracefully', () => {
        render(<TitleAreaView
            isEditing={false}
            setIsEditing={jest.fn()}
            title={"Samle Task"}
            setTitle={jest.fn()}
            inputRef={mockRef}
            task={undefined as any}
            handleBlur={jest.fn()}
        />);
        expect(screen.getByText('Click to add title...')).toBeInTheDocument();
    });
});

describe('DescriptionAreaView', () => {
    test('renders correctly with valid task', () => {
        render(
            <DescriptionAreaView
                task={mockTask}
                isEditing={false}
                setIsEditing={jest.fn()}
                description="Sample Description"
                setDescription={jest.fn()}
                handleSave={jest.fn()}
                handleCancel={jest.fn()}
                quillModule={{
                    mention: {
                        allowedChars: /^[A-Za-z\s]*$/,
                        mentionDenotationChars: ['@'],
                        source: jest.fn(),
                    },
                }}
            />
        );
        expect(screen.getByText('Sample Description')).toBeInTheDocument();
    });

    test('renders placeholder when task description is empty', () => {
        render(
            <DescriptionAreaView
                task={{ ...mockTask, Task_Description: '' }}
                isEditing={false}
                setIsEditing={jest.fn()}
                description="Sample Description"
                setDescription={jest.fn()}
                handleSave={jest.fn()}
                handleCancel={jest.fn()}
                quillModule={{
                    mention: {
                        allowedChars: /^[A-Za-z\s]*$/,
                        mentionDenotationChars: ['@'],
                        source: jest.fn(),
                    },
                }}
            />
        );
        expect(screen.getByText('Click to add description...')).toBeInTheDocument();
    });

    test('triggers saveTaskChanges when editor loses focus', () => {
        const saveTaskChangesMock = jest.fn();
        render(
            <DescriptionAreaView
                task={mockTask}
                isEditing={false}
                setIsEditing={jest.fn()}
                description="Sample Description"
                setDescription={jest.fn()}
                handleSave={jest.fn()}
                handleCancel={jest.fn()}
                quillModule={{
                    mention: {
                        allowedChars: /^[A-Za-z\s]*$/,
                        mentionDenotationChars: ['@'],
                        source: jest.fn(),
                    },
                }}
            />
        );
        fireEvent.click(screen.getByText('Sample Description'));
        fireEvent.blur(screen.getByRole('textbox'));
        expect(saveTaskChangesMock).toHaveBeenCalled();
    });

    // Edge case: long description
    test('renders long task description properly', () => {
        const longDescription = 'Lorem ipsum '.repeat(50);
        render(
            <DescriptionAreaView
                task={{ ...mockTask, Task_Description: longDescription }}
                isEditing={false}
                setIsEditing={jest.fn()}
                description="Sample Description"
                setDescription={jest.fn()}
                handleSave={jest.fn()}
                handleCancel={jest.fn()}
                quillModule={{
                    mention: {
                        allowedChars: /^[A-Za-z\s]*$/,
                        mentionDenotationChars: ['@'],
                        source: jest.fn(),
                    },
                }}
            />
        );
        expect(screen.getByText(longDescription.substring(0, 20))).toBeInTheDocument();
    });
});

describe('MediaFilesAreaView', () => {
    test('renders media section title', () => {
        render(
            <MediaFilesAreaView
                task={mockTask}
                setToggleAddFile={jest.fn()}
                handleDelete={jest.fn()}
            />
        );
        expect(screen.getByText('Media Files')).toBeInTheDocument();
    });

    test('renders three placeholders for media items', () => {
        render(
            <MediaFilesAreaView
                task={mockTask}
                setToggleAddFile={jest.fn()}
                handleDelete={jest.fn()}
            />
        );
        expect(screen.getAllByText(/Image \d/)).toHaveLength(3);
    });

    // Edge case: no media files
    test('renders properly when no media files exist', () => {
        render(
            <MediaFilesAreaView
                task={{ ...mockTask, media_files: [] }}
                setToggleAddFile={jest.fn()}
                handleDelete={jest.fn()}
            />
        );
        expect(screen.getByText('No media files available')).toBeInTheDocument();
    });

    // Edge case: task is undefined
    test('renders without crashing if task is undefined', () => {
        render(
            <MediaFilesAreaView
                task={undefined as any}
                setToggleAddFile={jest.fn()}
                handleDelete={jest.fn()}
            />
        );
        expect(screen.getByText('Media Files')).toBeInTheDocument();
    });
});

const mockQuill = {
    toolbar: [['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }]],
    mention: {
        allowedChars: /^[A-Za-z\s]*$/,
        mentionDenotationChars: ['@'],
        source: jest.fn(),
    },
}
describe('CommentsAreaView', () => {
    test('renders comments section title', () => {
        render(
            <CommentsAreaView
                createComment=""
                setCreateComment={jest.fn()}
                editComment=""
                setEditComment={jest.fn()}
                isCreateCommentVisible={false}
                setIsCreateCommentVisible={jest.fn()}
                isEditCommentVisible={undefined}
                setIsEditCommentVisible={jest.fn()}
                task={mockTask}
                authUser={undefined}
                addTaskComment={jest.fn()}
                handleAddComment={jest.fn()}
                handleCommentCancel={jest.fn()}
                handleEditComment={jest.fn()}
                handleEditCommentCancel={jest.fn()}
                handleDeleteComment={jest.fn()}
                quillModule={mockQuill}
            />
        );
        expect(screen.getByText('Comments')).toBeInTheDocument();
    });

    test('renders comment input when editor is visible', () => {
        render(
            <CommentsAreaView
                createComment=""
                setCreateComment={jest.fn()}
                editComment=""
                setEditComment={jest.fn()}
                isCreateCommentVisible={true}
                setIsCreateCommentVisible={jest.fn()}
                isEditCommentVisible={undefined}
                setIsEditCommentVisible={jest.fn()}
                task={mockTask}
                authUser={undefined}
                addTaskComment={jest.fn()}
                handleAddComment={jest.fn()}
                handleCommentCancel={jest.fn()}
                handleEditComment={jest.fn()}
                handleEditCommentCancel={jest.fn()}
                handleDeleteComment={jest.fn()}
                quillModule={mockQuill}
            />
        );
        expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });

    test('calls handleAddComment on submit', () => {
        const handleAddCommentMock = jest.fn();
        render(
            <CommentsAreaView
                createComment="Test Comment"
                setCreateComment={jest.fn()}
                editComment=""
                setEditComment={jest.fn()}
                isCreateCommentVisible={false}
                setIsCreateCommentVisible={jest.fn()}
                isEditCommentVisible={undefined}
                setIsEditCommentVisible={jest.fn()}
                task={mockTask}
                authUser={undefined}
                addTaskComment={jest.fn()}
                handleAddComment={jest.fn()}
                handleCommentCancel={jest.fn()}
                handleEditComment={jest.fn()}
                handleEditCommentCancel={jest.fn()}
                handleDeleteComment={jest.fn()}
                quillModule={mockQuill}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /send/i }));
        expect(handleAddCommentMock).toHaveBeenCalled();
    });

    // Edge case: Empty comment submission
    test('prevents submission of empty comments', () => {
        const handleAddCommentMock = jest.fn();
        render(
            <CommentsAreaView
                createComment=""
                setCreateComment={jest.fn()}
                editComment=""
                setEditComment={jest.fn()}
                isCreateCommentVisible={false}
                setIsCreateCommentVisible={jest.fn()}
                isEditCommentVisible={undefined}
                setIsEditCommentVisible={jest.fn()}
                task={mockTask}
                authUser={undefined}
                addTaskComment={jest.fn()}
                handleAddComment={jest.fn()}
                handleCommentCancel={jest.fn()}
                handleEditComment={jest.fn()}
                handleEditCommentCancel={jest.fn()}
                handleDeleteComment={jest.fn()}
                quillModule={mockQuill}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /send/i }));
        expect(handleAddCommentMock).not.toHaveBeenCalled();
    });

    // Edge case: Long comment text
    test('handles long comment text without breaking', () => {
        const longComment = 'This is a very long comment '.repeat(20);
        render(
            <CommentsAreaView
                createComment={longComment}
                setCreateComment={jest.fn()}
                editComment=""
                setEditComment={jest.fn()}
                isCreateCommentVisible={true}
                setIsCreateCommentVisible={jest.fn()}
                isEditCommentVisible={undefined}
                setIsEditCommentVisible={jest.fn()}
                task={mockTask}
                authUser={undefined}
                addTaskComment={jest.fn()}
                handleAddComment={jest.fn()}
                handleCommentCancel={jest.fn()}
                handleEditComment={jest.fn()}
                handleEditCommentCancel={jest.fn()}
                handleDeleteComment={jest.fn()}
                quillModule={mockQuill}
            />
        );
        expect(screen.getByDisplayValue(longComment.substring(0, 20))).toBeInTheDocument();
    });
});

describe('CtaButtonsView', () => {
    test('renders "Open in URL" button when task is undefined', () => {
        render(
            <CtaButtonsView
                task={undefined as any}
                taskDetail={mockTask}
                archiveTask={jest.fn()}
                shareTask={jest.fn()}
            />
        );
        expect(screen.getByText('Open in URL')).toBeInTheDocument();
    });

    test('does not render "Open in URL" button when task is defined', () => {
        render(
            <CtaButtonsView
                task={mockTask}
                taskDetail={undefined}
                archiveTask={jest.fn()}
                shareTask={jest.fn()}
            />
        );
        expect(screen.queryByText('Open in URL')).not.toBeInTheDocument();
    });
});

describe('TaskDetailsView', () => {
    test('renders task details section title', () => {
        render(
            <TaskDetailsView
                task={mockTask}
                taskDetail={undefined}
                taskTimeSpent={0}
                taskTimeTracksById={[]}
                setTaskDetail={jest.fn()}
                saveTaskChanges={jest.fn()}
                handleStatusChange={jest.fn()}
                handleAssigneeChange={jest.fn()}
                handleBacklogChange={jest.fn()}
                handleTaskChanges={jest.fn()}
                handleTaskTimeTrack={jest.fn()}
            />
        );
        expect(screen.getByText('Task Details')).toBeInTheDocument();
    });

    test('renders assigned user', () => {
        render(
            <TaskDetailsView
                task={mockTask}
                taskDetail={undefined}
                taskTimeSpent={0}
                taskTimeTracksById={[]}
                setTaskDetail={jest.fn()}
                saveTaskChanges={jest.fn()}
                handleStatusChange={jest.fn()}
                handleAssigneeChange={jest.fn()}
                handleBacklogChange={jest.fn()}
                handleTaskChanges={jest.fn()}
                handleTaskTimeTrack={jest.fn()}
            />
        );
        expect(screen.getByText('Assigned To:')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('renders correct task status', () => {
        render(
            <TaskDetailsView
                task={{ ...mockTask, Status_ID: 1 }}
                taskDetail={undefined}
                taskTimeSpent={0}
                taskTimeTracksById={[]}
                setTaskDetail={jest.fn()}
                saveTaskChanges={jest.fn()}
                handleStatusChange={jest.fn()}
                handleAssigneeChange={jest.fn()}
                handleBacklogChange={jest.fn()}
                handleTaskChanges={jest.fn()}
                handleTaskTimeTrack={jest.fn()}
            />
        );
        expect(screen.getByDisplayValue('In Progress')).toBeInTheDocument();
    });

    test('calls handleStatusChange on status update', () => {
        const handleStatusChangeMock = jest.fn();
        render(
            <TaskDetailsView
                task={mockTask}
                taskDetail={undefined}
                taskTimeSpent={0}
                taskTimeTracksById={[]}
                setTaskDetail={jest.fn()}
                saveTaskChanges={jest.fn()}
                handleStatusChange={handleStatusChangeMock}
                handleAssigneeChange={jest.fn()}
                handleBacklogChange={jest.fn()}
                handleTaskChanges={jest.fn()}
                handleTaskTimeTrack={jest.fn()}
            />
        );
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Done' } });
        expect(handleStatusChangeMock).toHaveBeenCalled();
    });

    // Edge case: Task object with missing required fields
    test('renders correctly even if task has missing fields', () => {
        const incompleteTask = {
            Task_ID: 1,
            Task_Title: '',
            Task_Description: '',
        } as any;
        render(
            <TaskDetailsView
                task={incompleteTask}
                taskDetail={undefined}
                taskTimeSpent={0}
                taskTimeTracksById={[]}
                setTaskDetail={jest.fn()}
                saveTaskChanges={jest.fn()}
                handleStatusChange={jest.fn()}
                handleAssigneeChange={jest.fn()}
                handleBacklogChange={jest.fn()}
                handleTaskChanges={jest.fn()}
                handleTaskTimeTrack={jest.fn()}
            />
        );
        expect(screen.getByText('Task Details')).toBeInTheDocument();
        expect(screen.getByText('Click to add title...')).toBeInTheDocument();
        expect(screen.getByText('Click to add description...')).toBeInTheDocument();
    });

    // Edge case: Task with long text values
    test('renders properly when task contains extremely long text values', () => {
        const longText = 'A'.repeat(500);
        const longTextTask = {
            ...mockTask,
            Task_Title: longText,
            Task_Description: longText,
        };
        render(
            <TaskDetailsView
                task={longTextTask}
                taskDetail={longTextTask}
                taskTimeSpent={0}
                taskTimeTracksById={[]}
                setTaskDetail={jest.fn()}
                saveTaskChanges={jest.fn()}
                handleStatusChange={jest.fn()}
                handleAssigneeChange={jest.fn()}
                handleBacklogChange={jest.fn()}
                handleTaskChanges={jest.fn()}
                handleTaskTimeTrack={jest.fn()}
            />
        );
        expect(screen.getByText(longText.substring(0, 50))).toBeInTheDocument();
    });
});
