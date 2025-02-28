"use client"

// External
import React, { createContext, useContext } from "react"

// Internal
import { useResourceContext } from "@/contexts"
import {
    User, 
    Organisation, 
    Team, 
    Project, 
    TeamUserSeat, 
    Task, 
    TasksContextType, 
    ProjectsContextType, 
    TeamUserSeatsContextType, 
    TeamsContextType, 
    OrganisationsContextType, 
    UsersContextType,
    TaskCommentsContextType,
    TaskComment,
    TaskMediaFile,
    TaskMediaFilesContextType
} from "@/types"

// Context for Users
const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: usersById,
        newItem: newUser,
        itemDetail: userDetail,
        setItemDetail: setUserDetail,
        handleChangeNewItem: handleChangeNewUser,
        addItem: addUser,
        saveItemChanges: saveUserChanges,
        removeItem: removeUser,
        loading: userLoading,
        error: userError,
    } = useResourceContext<User, "User_ID">(
        "users", 
        "User_ID", 
        ""
    );

    return (
        <UsersContext.Provider value={{
            usersById,
            userDetail,
            newUser,
            setUserDetail,
            handleChangeNewUser,
            addUser,
            saveUserChanges,
            removeUser,
            userLoading,
            userError,
        }}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsersContext = () => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error("useUsersContext must be used within a UsersProvider");
    }
    return context;
};

// Context for Organisations
const OrganisationsContext = createContext<OrganisationsContextType | undefined>(undefined);

export const OrganisationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: organisationsById,
        newItem: newOrganisation,
        itemDetail: organisationDetail,
        readItemsById: readOrganisationsByUserId,
        setItemDetail: setOrganisationDetail,
        handleChangeNewItem: handleChangeNewOrganisation,
        addItem: addOrganisation,
        saveItemChanges: saveOrganisationChanges,
        removeItem: removeOrganisation,
        loading: organisationLoading,
        error: organisationError,
    } = useResourceContext<Organisation, "Organisation_ID">(
        "organisations", 
        "Organisation_ID", 
        ""
    );

    return (
        <OrganisationsContext.Provider value={{
            organisationsById,
            organisationDetail,
            newOrganisation,
            setOrganisationDetail,
            handleChangeNewOrganisation,
            addOrganisation,
            saveOrganisationChanges,
            removeOrganisation,
            // organisationLoading,
            // organisationError,
        }}>
            {children}
        </OrganisationsContext.Provider>
    );
};

export const useOrganisationsContext = () => {
    const context = useContext(OrganisationsContext);
    if (!context) {
        throw new Error("useOrganisationsContext must be used within a OrganisationsProvider");
    }
    return context;
};

// Context for Teams
const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const TeamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: teamsById,
        itemById: teamById,
        newItem: newTeam,
        itemDetail: teamDetail,
        readItemsById: readTeamsByOrganisationId,
        readItemById: readTeamById,
        setItemDetail: setTeamDetail,
        handleChangeNewItem: handleChangeNewTeam,
        addItem: addTeam,
        saveItemChanges: saveTeamChanges,
        removeItem: removeTeam,
        loading: teamLoading,
        error: teamError,
    } = useResourceContext<Team, "Team_ID">(
        "teams", 
        "Team_ID", 
        "organisations"
    );

    return (
        <TeamsContext.Provider value={{
            teamsById,
            teamById,
            newTeam,
            teamDetail,
            readTeamsByOrganisationId,
            readTeamById,
            setTeamDetail,
            handleChangeNewTeam,
            addTeam,
            saveTeamChanges,
            removeTeam,
            // teamLoading,
            // teamError,
        }}>
            {children}
        </TeamsContext.Provider>
    );
};

export const useTeamsContext = () => {
    const context = useContext(TeamsContext);
    if (!context) {
        throw new Error("useTeamsContext must be used within a TeamsProvider");
    }
    return context;
};

// Context for Team User Seats
const TeamUserSeatsContext = createContext<TeamUserSeatsContextType | undefined>(undefined);

export const TeamUserSeatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: teamUserSeatsById,
        newItem: newTeamUserSeat,
        itemDetail: teamUserSeatDetail,
        readItemsById: readTeamUserSeatsByTeamId,
        setItemDetail: setTeamUserSeatDetail,
        handleChangeNewItem: handleChangeNewTeamUserSeat,
        addItem: addTeamUserSeat,
        saveItemChanges: saveTeamUserSeatChanges,
        removeItem: removeTeamUserSeat,
        loading: teamUserSeatLoading,
        error: teamUserSeatError,
    } = useResourceContext<TeamUserSeat, "Seat_ID">(
        "team-user-seats", 
        "Seat_ID", 
        "teams"
    );

    return (
        <TeamUserSeatsContext.Provider value={{
            teamUserSeatsById,
            teamUserSeatDetail,
            newTeamUserSeat,
            readTeamUserSeatsByTeamId,
            setTeamUserSeatDetail,
            handleChangeNewTeamUserSeat,
            addTeamUserSeat,
            saveTeamUserSeatChanges,
            removeTeamUserSeat,
            // teamUserSeatLoading,
            // teamUserSeatError,
        }}>
            {children}
        </TeamUserSeatsContext.Provider>
    );
};

export const useTeamUserSeatsContext = () => {
    const context = useContext(TeamUserSeatsContext);
    if (!context) {
        throw new Error("useTeamUserSeatsContext must be used within a TeamUserSeatsProvider");
    }
    return context;
};

// Context for Projects
const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: projectsById,
        newItem: newProject,
        itemDetail: projectDetail,
        readItemsById: readProjectsByTeamId,
        setItemDetail: setProjectDetail,
        handleChangeNewItem: handleChangeNewProject,
        addItem: addProject,
        saveItemChanges: saveProjectChanges,
        removeItem: removeProject,
        loading: projectLoading,
        error: projectError,
    } = useResourceContext<Project, "Project_ID">(
        "projects", 
        "Project_ID", 
        "teams"
    );

    return (
        <ProjectsContext.Provider value={{
            projectsById,
            projectDetail,
            newProject,
            readProjectsByTeamId,
            setProjectDetail,
            handleChangeNewProject,
            addProject,
            saveProjectChanges,
            removeProject,
            // projectLoading,
            // projectError,
        }}>
            {children}
        </ProjectsContext.Provider>
    );
};

export const useProjectsContext = () => {
    const context = useContext(ProjectsContext);
    if (!context) {
        throw new Error("useProjectsContext must be used within a ProjectsProvider");
    }
    return context;
};

// Tasks Context (DEPRECATED)
/*export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ResourceProvider<Task, "Task_ID">
            resource="tasks"
            idFieldName="Task_ID"
        >
            {children}
        </ResourceProvider>
    )
}*/

// Tasks Context
// Context API for Tasks
const TasksContext = createContext<TasksContextType | undefined>(undefined)

// TasksProvider using useResourceContext
export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use useResourceContext directly for task-related logic
    const {
        itemsById: tasksById,
        newItem: newTask,
        itemDetail: taskDetail,
        readItemsById: readTasksByProjectId,
        setItemDetail: setTaskDetail,
        handleChangeNewItem: handleChangeNewTask,
        addItem: addTask,
        saveItemChanges: saveTaskChanges,
        removeItem: removeTask,
        loading: taskLoading,
        error: taskError,
    } = useResourceContext<Task, "Task_ID">(
        "tasks",
        "Task_ID",
        "projects"
    );

    return (
        <TasksContext.Provider
            value={{
                tasksById,
                taskDetail,
                newTask,
                readTasksByProjectId,
                setTaskDetail,
                handleChangeNewTask,
                addTask,
                saveTaskChanges,
                removeTask,
                // taskLoading,
                // taskError,
            }}
        >
            {children}
        </TasksContext.Provider>
    );
};

export const useTasksContext = () => {
    const context = useContext(TasksContext)
    if (!context) {
        throw new Error("useTasksContext must be used within a TasksProvider")
    }
    return context
}

/*export const useTasksContext = () => {
    const context = useResource()

    const {
        itemsById: tasksById,
        newItem: newTask,
        itemDetail: taskDetail,
        setItemDetail: setTaskDetail,
        handleChangeNewItem: handleChangeNewTask,
        addItem: addTask,
        saveItemChanges: saveTaskChanges,
        removeItem: removeTask,
        loading: taskLoading,
        error: taskError,
    } = context

    console.log("useTasksContext", tasks)

    return {
        tasks,
        newTask,
        taskDetail,
        setTaskDetail,
        handleChangeNewTask,
        addTask,
        saveTaskChanges,
        removeTask,
        taskLoading,
        taskError,
    }
}*/

// TaskComments Context
// Context API for TaskComments
const TaskCommentsContext = createContext<TaskCommentsContextType | undefined>(undefined);

// TaskCommentsProvider using useResourceContext
export const TaskCommentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use useResourceContext directly for task-comment related logic
    const {
        itemsById: taskCommentsById,
        newItem: newTaskComment,
        itemDetail: taskCommentDetail,
        readItemsById: readTaskCommentsByTaskId,
        setItemDetail: setTaskCommentDetail,
        handleChangeNewItem: handleChangeNewTaskComment,
        addItem: addTaskComment,
        saveItemChanges: saveTaskCommentChanges,
        removeItem: removeTaskComment,
        loading: taskCommentLoading,
        error: taskCommentError,
    } = useResourceContext<TaskComment, "Comment_ID">(
        "task-comments",
        "Comment_ID",
        "tasks"
    );

    return (
        <TaskCommentsContext.Provider
            value={{
                taskCommentsById,
                taskCommentDetail,
                newTaskComment,
                readTaskCommentsByTaskId,
                setTaskCommentDetail,
                handleChangeNewTaskComment,
                addTaskComment,
                saveTaskCommentChanges,
                removeTaskComment,
                // taskCommentLoading,
                // taskCommentError,
            }}
        >
            {children}
        </TaskCommentsContext.Provider>
    );
};

export const useTaskCommentsContext = () => {
    const context = useContext(TaskCommentsContext);
    if (!context) {
        throw new Error("useTaskCommentsContext must be used within a TaskCommentsProvider");
    }
    return context;
};

// TaskMediaFiles Context
// Context API for TaskMediaFiles
const TaskMediaFilesContext = createContext<TaskMediaFilesContextType | undefined>(undefined);

// TaskMediaFilesProvider using useResourceContext
export const TaskMediaFilesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use useResourceContext directly for task-media-file related logic
    const {
        itemsById: taskMediaFilesById,
        newItem: newTaskMediaFile,
        itemDetail: taskMediaFileDetail,
        readItemsById: readTaskMediaFilesByTaskId,
        setItemDetail: setTaskMediaFileDetail,
        handleChangeNewItem: handleChangeNewTaskMediaFile,
        addItem: addTaskMediaFile,
        saveItemChanges: saveTaskMediaFileChanges,
        removeItem: removeTaskMediaFile,
        loading: taskMediaFileLoading,
        error: taskMediaFileError,
    } = useResourceContext<TaskMediaFile, "Media_ID">(
        "task-media-files",
        "Media_ID", 
        "tasks"
    );

    return (
        <TaskMediaFilesContext.Provider
            value={{
                taskMediaFilesById,
                taskMediaFileDetail,
                newTaskMediaFile,
                readTaskMediaFilesByTaskId,
                setTaskMediaFileDetail,
                handleChangeNewTaskMediaFile,
                addTaskMediaFile,
                saveTaskMediaFileChanges,
                removeTaskMediaFile,
                // taskMediaFileLoading,
                // taskMediaFileError,
            }}
        >
            {children}
        </TaskMediaFilesContext.Provider>
    );
};

export const useTaskMediaFilesContext = () => {
    const context = useContext(TaskMediaFilesContext);
    if (!context) {
        throw new Error("useTaskMediaFilesContext must be used within a TaskMediaFilesProvider");
    }
    return context;
};
