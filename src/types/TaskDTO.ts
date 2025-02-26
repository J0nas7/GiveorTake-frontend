// Organisation Type
export type Organisation = {
    Organisation_ID: number;
    User_ID: number;
    Organisation_Name: string;
    Organisation_Description?: string;
    Organisation_CreatedAt?: string;
    Organisation_UpdatedAt?: string;
};

export type OrganisationFields = 
    "Organisation_ID" | "User_ID" | "Organisation_Name" | 
    "Organisation_Description" | "Organisation_CreatedAt" | "Organisation_UpdatedAt";

export type OrganisationsContextType = {
    organisations: Organisation[];
    newOrganisation: Organisation | undefined;
    handleChangeNewOrganisation: (field: OrganisationFields, value: string) => void;
    addOrganisation: () => void;
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
};

export type TeamFields = 
    "Team_ID" | "Organisation_ID" | "Team_Name" | 
    "Team_Description" | "Team_CreatedAt" | "Team_UpdatedAt";

export type TeamsContextType = {
    teams: Team[];
    newTeam: Team | undefined;
    handleChangeNewTeam: (field: TeamFields, value: string) => void;
    addTeam: () => void;
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
};

export type ProjectFields = 
    "Project_ID" | "Organisation_ID" | "Project_Name" | 
    "Project_Description" | "Project_Status" | "Project_Start_Date" | 
    "Project_End_Date" | "Project_CreatedAt" | "Project_UpdatedAt";

export type ProjectsContextType = {
    projects: Project[];
    newProject: Project | undefined;
    handleChangeNewProject: (field: ProjectFields, value: string) => void;
    addProject: () => void;
    removeProject: (id: number) => void;
};

// Team Member Type
export type TeamMember = {
    Team_Member_ID: number;
    Team_ID: number;
    User_ID: number;
    Team_Member_Role: 'Lead' | 'Member';
    Team_Member_CreatedAt?: string;
    Team_Member_UpdatedAt?: string;
};

export type TeamMemberFields = 
    "Team_Member_ID" | "Team_ID" | "User_ID" | 
    "Team_Member_Role" | "Team_Member_CreatedAt" | "Team_Member_UpdatedAt";

export type TeamMembersContextType = {
    teamMembers: TeamMember[];
    newTeamMember: TeamMember | undefined;
    handleChangeNewTeamMember: (field: TeamMemberFields, value: string) => void;
    addTeamMember: () => void;
    removeTeamMember: (id: number) => void;
};

// Project Team Type
export type ProjectTeam = {
    Project_Team_ID: number;
    Project_ID: number;
    Team_ID: number;
    Project_Team_CreatedAt?: string;
    Project_Team_UpdatedAt?: string;
};

export type ProjectTeamFields = 
    "Project_Team_ID" | "Project_ID" | "Team_ID" | 
    "Project_Team_CreatedAt" | "Project_Team_UpdatedAt";

export type ProjectTeamsContextType = {
    projectTeams: ProjectTeam[];
    newProjectTeam: ProjectTeam | undefined;
    handleChangeNewProjectTeam: (field: ProjectTeamFields, value: string) => void;
    addProjectTeam: () => void;
    removeProjectTeam: (id: number) => void;
}

// Task Type
export type Task = {
    Task_ID: number;
    Task_Number: number;
    Project_ID: number;
    Team_ID: number; // Nullable if not assigned to a team
    Assigned_User_ID?: number; // Nullable if unassigned
    Task_Title: string;
    Task_Description?: string;
    Task_Status: "todo" | "inProgress" | "review" | "done";
    Task_Due_Date?: string; // YYYY-MM-DD format
    Task_CreatedAt: string;
    Task_UpdatedAt: string;
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