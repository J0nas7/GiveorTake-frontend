// User Type
export type User = {
    User_ID: number;
    User_Status: string;
    User_Email: string;
    User_FirstName: string;
    User_Surname: string;
    User_ImageSrc?: string;
    User_CreatedAt?: string;
    User_UpdatedAt?: string;
    User_DeletedAt?: string;
};

export type UserFields =
    "User_ID" | "User_Status" | "User_Email" | "User_FirstName" | "User_Surname" |
    "User_ImageSrc" | "User_CreatedAt" | "User_UpdatedAt" | "User_DeletedAt";

export type UsersContextType = {
    users: User[];
    userDetail: User | undefined;
    newUser: User | undefined;
    setUserDetail: React.Dispatch<React.SetStateAction<User | undefined>>;
    handleChangeNewUser: (field: UserFields, value: string) => void;
    addUser: () => void;
    saveUserChanges: (userChanges: User) => void;
    removeUser: (id: number) => void;
    userLoading: boolean;
    userError: string | null;
};

// Organisation Type
export type Organisation = {
    Organisation_ID: number;
    User_ID: number;
    Organisation_Name: string;
    Organisation_Description?: string;
    Organisation_CreatedAt?: string;
    Organisation_UpdatedAt?: string;

    // Relationships
    teams?: Team[]
};

export type OrganisationFields =
    "Organisation_ID" | "User_ID" | "Organisation_Name" |
    "Organisation_Description" | "Organisation_CreatedAt" | "Organisation_UpdatedAt";

export type OrganisationsContextType = {
    organisations: Organisation[];
    organisationDetail: Organisation | undefined;
    newOrganisation: Organisation | undefined;
    setOrganisationDetail: React.Dispatch<React.SetStateAction<Organisation | undefined>>;
    handleChangeNewOrganisation: (field: OrganisationFields, value: string) => void;
    addOrganisation: () => void;
    saveOrganisationChanges: (organisationChanges: Organisation) => void;
    removeOrganisation: (id: number) => void;
};

// Team Type
export type Team = {
    Team_ID: number;
    Organisation_ID: number;
    Team_Name: string;
    Team_Description?: string;
    Team_CreatedAt?: string;
    Team_UpdatedAt?: string;

    // Relationships
    organisation?: Organisation
    user_seats?: TeamUserSeat[]
    projects?: Project[]
    tasks?: Task[]
};

export type TeamFields =
    "Team_ID" | "Organisation_ID" | "Team_Name" |
    "Team_Description" | "Team_CreatedAt" | "Team_UpdatedAt";

export type TeamsContextType = {
    teamDetail: Team | undefined;
    teams: Team[];
    newTeam: Team | undefined;
    setTeamDetail: React.Dispatch<React.SetStateAction<Team | undefined>>;
    handleChangeNewTeam: (field: TeamFields, value: string) => void;
    addTeam: () => void;
    saveTeamChanges: (teamChanges: Team) => void;
    removeTeam: (id: number) => void;
};

// Project Type
export type Project = {
    Project_ID: number;
    Organisation_ID: number;
    Project_Name: string;
    Project_Description?: string;
    Project_Status: 'Planned' | 'Active' | 'Completed' | 'On Hold';
    Project_Start_Date?: string;
    Project_End_Date?: string;
    Project_CreatedAt?: string;
    Project_UpdatedAt?: string;

    // Relationships
    team?: Team
    tasks?: Task[]
};

export type ProjectFields =
    "Project_ID" | "Organisation_ID" | "Project_Name" |
    "Project_Description" | "Project_Status" | "Project_Start_Date" |
    "Project_End_Date" | "Project_CreatedAt" | "Project_UpdatedAt";

export type ProjectsContextType = {
    projects: Project[];
    projectDetail: Project | undefined
    newProject: Project | undefined;
    setProjectDetail: React.Dispatch<React.SetStateAction<Project | undefined>>
    handleChangeNewProject: (field: ProjectFields, value: string) => void;
    addProject: () => void;
    saveProjectChanges: (projectChanges: Project) => void
    removeProject: (id: number) => void;
};

// Team User Seat Type
export type TeamUserSeat = {
    Seat_ID: number;
    Team_ID: number;
    User_ID: number;
    Seat_Role: string;
    Seat_Status: string;
    Seat_Role_Description?: string;
    Seat_Permissions?: string[];
    Seat_CreatedAt?: string;
    Seat_UpdatedAt?: string;
    Seat_DeletedAt?: string;

    // Relationships
    team?: Team
    user?: User
};

export type TeamUserSeatFields =
    "Seat_ID" | "Team_ID" | "User_ID" | "Seat_Role" | "Seat_Status" |
    "Seat_Role_Description" | "Seat_Permissions" | "Seat_CreatedAt" | "Seat_UpdatedAt" | "Seat_DeletedAt";

export type TeamUserSeatsContextType = {
    teamUserSeats: TeamUserSeat[];
    teamUserSeatDetail: TeamUserSeat | undefined
    newTeamUserSeat: TeamUserSeat | undefined;
    setTeamUserSeatDetail: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    handleChangeNewTeamUserSeat: (field: TeamUserSeatFields, value: string) => void;
    addTeamUserSeat: () => void;
    saveTeamUserSeatChanges: (teamUserSeatChanges: TeamUserSeat) => void
    removeTeamUserSeat: (id: number) => void;
};

// Task Type
export type Task = {
    Task_ID: number;
    Task_Number: number;
    Project_ID: number;
    Team_ID: number; // Nullable if not assigned to a team
    Assigned_User_ID?: number; // Nullable if unassigned
    Task_Title: string;
    Task_Description?: string;
    Task_Status: 'To Do' | 'In Progress' | 'Waiting for Review' | 'Done'
    Task_Due_Date?: string; // YYYY-MM-DD format
    Task_CreatedAt: string;
    Task_UpdatedAt: string;

    // Relationships
    project?: Project
}

export type TaskFields =
    "Task_ID" | "Task_Number" | "Project_ID" | "Team_ID" | "Assigned_User_ID" | "Task_Title" |
    "Task_Description" | "Task_Status" | "Task_Due_Date" | "Task_CreatedAt" | "Task_UpdatedAt"

export type TasksContextType = {
    taskDetail: Task | undefined
    tasks: Task[]
    newTask: Task | undefined
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    handleChangeNewTask: (field: TaskFields, value: string) => void
    addTask: () => void
    saveTaskChanges: (taskChanges: Task) => void
    removeTask: (id: number) => void
}

// Activity Log Type
export type ActivityLog = {
    Log_ID: number;
    User_ID: number;
    Project_ID?: number;
    Log_Action: string;
    Log_Details?: any;
    Log_CreatedAt?: string;
    Log_UpdatedAt?: string;
};

export type ActivityLogFields =
    "Log_ID" | "User_ID" | "Project_ID" | "Log_Action" |
    "Log_Details" | "Log_CreatedAt" | "Log_UpdatedAt";

export type ActivityLogsContextType = {
    activityLogs: ActivityLog[];
    newActivityLog: ActivityLog | undefined;
    handleChangeNewActivityLog: (field: ActivityLogFields, value: string) => void;
    addActivityLog: () => void;
    removeActivityLog: (id: number) => void;
};

// Notification Type
export type Notification = {
    Notification_ID: number;
    User_ID: number;
    Notification_Message: string;
    Notification_Read: boolean;
    Notification_CreatedAt?: string;
    Notification_UpdatedAt?: string;
};

export type NotificationFields =
    "Notification_ID" | "User_ID" | "Notification_Message" |
    "Notification_Read" | "Notification_CreatedAt" | "Notification_UpdatedAt";

export type NotificationsContextType = {
    notifications: Notification[];
    newNotification: Notification | undefined;
    handleChangeNewNotification: (field: NotificationFields, value: string) => void;
    addNotification: () => void;
    removeNotification: (id: number) => void;
};