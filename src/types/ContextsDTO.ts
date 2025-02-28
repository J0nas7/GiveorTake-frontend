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
    usersById: User[];
    userDetail: User | undefined;
    newUser: User | undefined;
    setUserDetail: React.Dispatch<React.SetStateAction<User | undefined>>;
    handleChangeNewUser: (field: UserFields, value: string) => Promise<void>
    addUser: (parentId: number, object?: User) => Promise<void>
    saveUserChanges: (itemChanges: User, parentId: number) => void;
    removeUser: (itemId: number, parentId: number) => void;
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
    organisationsById: Organisation[];
    organisationDetail: Organisation | undefined;
    newOrganisation: Organisation | undefined;
    // readOrganisationsByUserId: (parentId: number) => Promise<void>
    setOrganisationDetail: React.Dispatch<React.SetStateAction<Organisation | undefined>>;
    handleChangeNewOrganisation: (field: OrganisationFields, value: string) => Promise<void>
    addOrganisation: (parentId: number, object?: Organisation) => Promise<void>
    saveOrganisationChanges: (organisationChanges: Organisation, parentId: number) => void;
    removeOrganisation: (itemId: number, parentId: number) => void;
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
    teamsById: Team[];
    teamById: Team | undefined;
    teamDetail: Team | undefined;
    newTeam: Team | undefined;
    readTeamsByOrganisationId: (parentId: number) => Promise<void>
    readTeamById: (itemId: number) => Promise<void>
    setTeamDetail: React.Dispatch<React.SetStateAction<Team | undefined>>;
    handleChangeNewTeam: (field: TeamFields, value: string) => Promise<void>
    addTeam: (parentId: number, object?: Team) => Promise<void>
    saveTeamChanges: (teamChanges: Team, parentId: number) => void;
    removeTeam: (itemId: number, parentId: number) => void;
};

// Project Type
export type Project = {
    Project_ID: number;
    Team_ID: number;
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
    "Project_ID" | "Team_ID" | "Project_Name" |
    "Project_Description" | "Project_Status" | "Project_Start_Date" |
    "Project_End_Date" | "Project_CreatedAt" | "Project_UpdatedAt";

export type ProjectsContextType = {
    projectsById: Project[];
    projectDetail: Project | undefined
    newProject: Project | undefined;
    readProjectsByTeamId: (parentId: number) => Promise<void>
    setProjectDetail: React.Dispatch<React.SetStateAction<Project | undefined>>
    handleChangeNewProject: (field: ProjectFields, value: string) => Promise<void>
    addProject: (parentId: number, object?: Project) => Promise<void>
    saveProjectChanges: (projectChanges: Project, parentId: number) => void
    removeProject: (itemId: number, parentId: number) => void;
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
    teamUserSeatsById: TeamUserSeat[];
    teamUserSeatDetail: TeamUserSeat | undefined
    newTeamUserSeat: TeamUserSeat | undefined;
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    setTeamUserSeatDetail: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    handleChangeNewTeamUserSeat: (field: TeamUserSeatFields, value: string) => Promise<void>
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    saveTeamUserSeatChanges: (teamUserSeatChanges: TeamUserSeat, parentId: number) => void
    removeTeamUserSeat: (itemId: number, parentId: number) => void;
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
    comments?: TaskComment[]
    mediaFiles?: TaskMediaFile[]
}

export type TaskFields =
    "Task_ID" | "Task_Number" | "Project_ID" | "Team_ID" | "Assigned_User_ID" | "Task_Title" |
    "Task_Description" | "Task_Status" | "Task_Due_Date" | "Task_CreatedAt" | "Task_UpdatedAt"

export type TasksContextType = {
    tasksById: Task[]
    taskDetail: Task | undefined
    newTask: Task | undefined
    readTasksByProjectId: (parentId: number) => Promise<void>
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    handleChangeNewTask: (field: TaskFields, value: string) => Promise<void>
    addTask: (parentId: number, object?: Task) => Promise<void>
    saveTaskChanges: (taskChanges: Task, parentId: number) => void
    removeTask: (itemId: number, parentId: number) => void
}

// Task Comment Type
export type TaskComment = {
    Comment_ID?: number;
    Task_ID: number;
    User_ID: number;
    Comment_Text: string;
    Comment_CreatedAt?: string; // YYYY-MM-DD format
    Comment_UpdatedAt?: string; // YYYY-MM-DD format
    Comment_DeletedAt?: string; // Nullable, YYYY-MM-DD format

    // Relationships
    task?: Task;
    user?: User;
}

export type TaskCommentFields =
    "Comment_ID" | "Task_ID" | "User_ID" | "Comment_Text" |
    "Comment_CreatedAt" | "Comment_UpdatedAt" | "Comment_DeletedAt"

export type TaskCommentsContextType = {
    taskCommentsById: TaskComment[]
    taskCommentDetail: TaskComment | undefined
    newTaskComment: TaskComment | undefined
    readTaskCommentsByTaskId: (parentId: number) => Promise<void>
    setTaskCommentDetail: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    handleChangeNewTaskComment: (field: TaskCommentFields, value: string, object?: TaskComment | undefined) => Promise<void>
    addTaskComment: (parentId: number, object?: TaskComment | undefined) => Promise<void>
    saveTaskCommentChanges: (taskCommentChanges: TaskComment, parentId: number) => void
    removeTaskComment: (itemId: number, parentId: number) => void;
}

// Task Media File Type
export type TaskMediaFile = {
    Media_ID: number;
    Task_ID: number;
    Uploaded_By_User_ID: number;
    Media_File_Name: string;
    Media_File_Path: string;
    Media_File_Type: string; // E.g. 'image/jpeg', 'application/pdf'
    Media_CreatedAt: string; // YYYY-MM-DD format
    Media_UpdatedAt: string; // YYYY-MM-DD format
    Media_DeletedAt?: string; // Nullable, YYYY-MM-DD format

    // Relationships
    task?: Task;
    uploadedBy?: User;
}

export type TaskMediaFileFields =
    "Media_ID" | "Task_ID" | "Uploaded_By_User_ID" | "Media_File_Name" | "Media_File_Path" |
    "Media_File_Type" | "Media_CreatedAt" | "Media_UpdatedAt" | "Media_DeletedAt"

export type TaskMediaFilesContextType = {
    taskMediaFilesById: TaskMediaFile[]
    taskMediaFileDetail: TaskMediaFile | undefined
    newTaskMediaFile: TaskMediaFile | undefined
    readTaskMediaFilesByTaskId: (parentId: number) => Promise<void>
    setTaskMediaFileDetail: React.Dispatch<React.SetStateAction<TaskMediaFile | undefined>>
    handleChangeNewTaskMediaFile: (field: TaskMediaFileFields, value: string) => Promise<void>
    addTaskMediaFile: (parentId: number, object?: TaskMediaFile | undefined) => Promise<void>
    saveTaskMediaFileChanges: (taskMediaFileChanges: TaskMediaFile, parentId: number) => void
    removeTaskMediaFile: (itemId: number, parentId: number) => void
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
    handleChangeNewActivityLog: (field: ActivityLogFields, value: string) => Promise<void>
    addActivityLog: () => Promise<void>
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
    handleChangeNewNotification: (field: NotificationFields, value: string) => Promise<void>
    addNotification: () => Promise<void>
    removeNotification: (id: number) => void;
};