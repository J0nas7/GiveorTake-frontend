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
    UsersContextType
} from "@/types"

// Context for Users
const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        items: users,
        newItem: newUser,
        itemDetail: userDetail,
        setItemDetail: setUserDetail,
        handleChangeNewItem: handleChangeNewUser,
        addItem: addUser,
        saveItemChanges: saveUserChanges,
        removeItem: removeUser,
        loading: userLoading,
        error: userError,
    } = useResourceContext<User, "User_ID">("users", "User_ID");

    return (
        <UsersContext.Provider value={{
            users,
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
        items: organisations,
        newItem: newOrganisation,
        itemDetail: organisationDetail,
        setItemDetail: setOrganisationDetail,
        handleChangeNewItem: handleChangeNewOrganisation,
        addItem: addOrganisation,
        saveItemChanges: saveOrganisationChanges,
        removeItem: removeOrganisation,
        loading: organisationLoading,
        error: organisationError,
    } = useResourceContext<Organisation, "Organisation_ID">("organisations", "Organisation_ID");

    return (
        <OrganisationsContext.Provider value={{
            organisations,
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
        items: teams,
        newItem: newTeam,
        itemDetail: teamDetail,
        setItemDetail: setTeamDetail,
        handleChangeNewItem: handleChangeNewTeam,
        addItem: addTeam,
        saveItemChanges: saveTeamChanges,
        removeItem: removeTeam,
        loading: teamLoading,
        error: teamError,
    } = useResourceContext<Team, "Team_ID">("teams", "Team_ID");

    return (
        <TeamsContext.Provider value={{
            teams,
            teamDetail,
            newTeam,
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
        items: teamUserSeats,
        newItem: newTeamUserSeat,
        itemDetail: teamUserSeatDetail,
        setItemDetail: setTeamUserSeatDetail,
        handleChangeNewItem: handleChangeNewTeamUserSeat,
        addItem: addTeamUserSeat,
        saveItemChanges: saveTeamUserSeatChanges,
        removeItem: removeTeamUserSeat,
        loading: teamUserSeatLoading,
        error: teamUserSeatError,
    } = useResourceContext<TeamUserSeat, "Seat_ID">("team-user-seats", "Seat_ID");

    return (
        <TeamUserSeatsContext.Provider value={{
            teamUserSeats,
            teamUserSeatDetail,
            newTeamUserSeat,
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
        items: projects,
        newItem: newProject,
        itemDetail: projectDetail,
        setItemDetail: setProjectDetail,
        handleChangeNewItem: handleChangeNewProject,
        addItem: addProject,
        saveItemChanges: saveProjectChanges,
        removeItem: removeProject,
        loading: projectLoading,
        error: projectError,
    } = useResourceContext<Project, "Project_ID">("projects", "Project_ID");

    return (
        <ProjectsContext.Provider value={{
            projects,
            projectDetail,
            newProject,
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

// Tasks Context
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

// Context API for Tasks
const TasksContext = createContext<TasksContextType | undefined>(undefined)

// TasksProvider using useResourceContext
export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use useResourceContext directly for task-related logic
    const {
        items: tasks,
        newItem: newTask,
        itemDetail: taskDetail,
        setItemDetail: setTaskDetail,
        handleChangeNewItem: handleChangeNewTask,
        addItem: addTask,
        saveItemChanges: saveTaskChanges,
        removeItem: removeTask,
        loading: taskLoading,
        error: taskError,
    } = useResourceContext<Task, "Task_ID">(
        "tasks",
        "Task_ID"
    );

    return (
        <TasksContext.Provider
            value={{
                tasks,
                taskDetail,
                newTask,
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
        items: tasks,
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