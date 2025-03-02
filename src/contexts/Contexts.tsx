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
    TaskComment,
    TaskMediaFile,
    ProjectFields,
    TeamFields,
    TeamUserSeatFields,
    TaskFields,
    TaskCommentFields,
    TaskMediaFileFields,
    UserFields,
    OrganisationFields
} from "@/types"

// Context for Users
export type UsersContextType = {
    usersById: User[];
    userDetail: User | undefined;
    newUser: User | undefined;
    setUserDetail: React.Dispatch<React.SetStateAction<User | undefined>>;
    handleChangeNewUser: (field: UserFields, value: string) => Promise<void>
    addUser: (parentId: number, object?: User) => Promise<void>
    saveUserChanges: (itemChanges: User, parentId: number) => Promise<void>
    removeUser: (itemId: number, parentId: number) => void;
    // userLoading: boolean;
    // userError: string | null;
};

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
        // loading: userLoading,
        // error: userError,
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
            // userLoading,
            // userError,
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
export type OrganisationsContextType = {
    organisationsById: Organisation[];
    organisationById: Organisation | undefined
    organisationDetail: Organisation | undefined;
    newOrganisation: Organisation | undefined;
    readOrganisationsByUserId: (parentId: number) => Promise<void>
    readOrganisationById: (itemId: number) => Promise<void>
    setOrganisationDetail: React.Dispatch<React.SetStateAction<Organisation | undefined>>;
    handleChangeNewOrganisation: (field: OrganisationFields, value: string) => Promise<void>
    addOrganisation: (parentId: number, object?: Organisation) => Promise<void>
    saveOrganisationChanges: (organisationChanges: Organisation, parentId: number) => Promise<void>
    removeOrganisation: (itemId: number, parentId: number) => void;
};

const OrganisationsContext = createContext<OrganisationsContextType | undefined>(undefined);

export const OrganisationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: organisationsById,
        itemById: organisationById,
        newItem: newOrganisation,
        itemDetail: organisationDetail,
        readItemsById: readOrganisationsByUserId,
        readItemById: readOrganisationById,
        setItemDetail: setOrganisationDetail,
        handleChangeNewItem: handleChangeNewOrganisation,
        addItem: addOrganisation,
        saveItemChanges: saveOrganisationChanges,
        removeItem: removeOrganisation,
        // loading: organisationLoading,
        // error: organisationError,
    } = useResourceContext<Organisation, "Organisation_ID">(
        "organisations", 
        "Organisation_ID", 
        "users"
    );

    return (
        <OrganisationsContext.Provider value={{
            organisationsById,
            organisationById,
            newOrganisation,
            organisationDetail,
            readOrganisationsByUserId,
            readOrganisationById,
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
export type TeamsContextType = {
    teamsById: Team[];
    teamById: Team | undefined;
    teamDetail: Team | undefined;
    newTeam: Team | undefined;
    readTeamsByOrganisationId: (parentId: number) => Promise<void>
    readTeamById: (itemId: number) => Promise<void>
    setTeamDetail: React.Dispatch<React.SetStateAction<Team | undefined>>;
    handleChangeNewTeam: (field: TeamFields, value: string) => Promise<void>
    addTeam: (parentId: number, object?: Team) => Promise<void>
    saveTeamChanges: (teamChanges: Team, parentId: number) => Promise<void>
    removeTeam: (itemId: number, parentId: number) => void;
};

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
        // loading: teamLoading,
        // error: teamError,
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
export type TeamUserSeatsContextType = {
    teamUserSeatsById: TeamUserSeat[];
    teamUserSeatDetail: TeamUserSeat | undefined
    newTeamUserSeat: TeamUserSeat | undefined;
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    setTeamUserSeatDetail: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    handleChangeNewTeamUserSeat: (field: TeamUserSeatFields, value: string) => Promise<void>
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    saveTeamUserSeatChanges: (teamUserSeatChanges: TeamUserSeat, parentId: number) => Promise<void>
    removeTeamUserSeat: (itemId: number, parentId: number) => void;
};

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
        // loading: teamUserSeatLoading,
        // error: teamUserSeatError,
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
export type ProjectsContextType = {
    projectsById: Project[]
    projectById: Project | undefined;
    projectDetail: Project | undefined
    newProject: Project | undefined;
    readProjectsByTeamId: (parentId: number) => Promise<void>
    readProjectById: (itemId: number) => Promise<void>
    setProjectDetail: React.Dispatch<React.SetStateAction<Project | undefined>>
    handleChangeNewProject: (field: ProjectFields, value: string) => Promise<void>
    addProject: (parentId: number, object?: Project) => Promise<void>
    saveProjectChanges: (projectChanges: Project, parentId: number) => Promise<void>
    removeProject: (itemId: number, parentId: number) => void;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: projectsById,
        itemById: projectById,
        newItem: newProject,
        itemDetail: projectDetail,
        readItemsById: readProjectsByTeamId,
        readItemById: readProjectById,
        setItemDetail: setProjectDetail,
        handleChangeNewItem: handleChangeNewProject,
        addItem: addProject,
        saveItemChanges: saveProjectChanges,
        removeItem: removeProject,
        // loading: projectLoading,
        // error: projectError,
    } = useResourceContext<Project, "Project_ID">(
        "projects", 
        "Project_ID", 
        "teams"
    );

    return (
        <ProjectsContext.Provider value={{
            projectsById,
            projectById,
            projectDetail,
            newProject,
            readProjectsByTeamId,
            readProjectById,
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
export type TasksContextType = {
    tasksById: Task[]
    taskById: Task | undefined
    taskDetail: Task | undefined
    newTask: Task | undefined
    readTasksByProjectId: (parentId: number, refresh?: boolean) => Promise<void>
    readTaskById: (itemId: number) => Promise<void>
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    handleChangeNewTask: (field: TaskFields, value: string) => Promise<void>
    addTask: (parentId: number, object?: Task) => Promise<void>
    saveTaskChanges: (taskChanges: Task, parentId: number) => Promise<void>
    removeTask: (itemId: number, parentId: number) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

// TasksProvider using useResourceContext
export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use useResourceContext directly for task-related logic
    const {
        itemsById: tasksById,
        itemById: taskById,
        newItem: newTask,
        itemDetail: taskDetail,
        readItemsById: readTasksByProjectId,
        readItemById: readTaskById,
        setItemDetail: setTaskDetail,
        handleChangeNewItem: handleChangeNewTask,
        addItem: addTask,
        saveItemChanges: saveTaskChanges,
        removeItem: removeTask,
        // loading: taskLoading,
        // error: taskError,
    } = useResourceContext<Task, "Task_ID">(
        "tasks",
        "Task_ID",
        "projects"
    );

    return (
        <TasksContext.Provider
            value={{
                tasksById,
                taskById,
                taskDetail,
                newTask,
                readTasksByProjectId,
                readTaskById,
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
export type TaskCommentsContextType = {
    taskCommentsById: TaskComment[]
    taskCommentDetail: TaskComment | undefined
    newTaskComment: TaskComment | undefined
    readTaskCommentsByTaskId: (parentId: number) => Promise<void>
    setTaskCommentDetail: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    handleChangeNewTaskComment: (field: TaskCommentFields, value: string, object?: TaskComment | undefined) => Promise<void>
    addTaskComment: (parentId: number, object?: TaskComment | undefined) => Promise<void>
    saveTaskCommentChanges: (taskCommentChanges: TaskComment, parentId: number) => Promise<void>
    removeTaskComment: (itemId: number, parentId: number) => void;
}

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
        // loading: taskCommentLoading,
        // error: taskCommentError,
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
export type TaskMediaFilesContextType = {
    taskMediaFilesById: TaskMediaFile[]
    taskMediaFileDetail: TaskMediaFile | undefined
    newTaskMediaFile: TaskMediaFile | undefined
    readTaskMediaFilesByTaskId: (parentId: number) => Promise<void>
    setTaskMediaFileDetail: React.Dispatch<React.SetStateAction<TaskMediaFile | undefined>>
    handleChangeNewTaskMediaFile: (field: TaskMediaFileFields, value: string) => Promise<void>
    addTaskMediaFile: (parentId: number, object?: TaskMediaFile | undefined) => Promise<void>
    saveTaskMediaFileChanges: (taskMediaFileChanges: TaskMediaFile, parentId: number) => Promise<void>
    removeTaskMediaFile: (itemId: number, parentId: number) => void
}

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
        // loading: taskMediaFileLoading,
        // error: taskMediaFileError,
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
