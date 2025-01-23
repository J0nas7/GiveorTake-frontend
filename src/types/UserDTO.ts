// Importing related entities as interfaces (assuming they exist)
// import {
//     Customer, 
//     Calendar, 
//     Status, 
//     Type, 
//     Task, 
//     Category, 
//     Order, 
//     Bank
// } from './'

interface Role {
    id: number;
    name: string;
    users: User[];
}

interface Todo {
    id: number;
    title: string;
    user: User; // Represents the 'belongsTo' relationship with User
}

interface UserNote {
    id: number;
    text: string; // The 'text' field from the $fillable array
    user: User; // Represents the 'belongsTo' relationship with User
}

export interface User {
    id?: number;
    parent_id?: number;
    name: string;
    email: string;
    password?: string;  // Hidden attribute
    country_code: string;
    mobile: string;
    type: string;
    address?: string;
    active?: number;
    zip: string;
    city: string;
    remember_token?: string;  // Hidden attribute

    // Parent-child relationships
    parent?: User;
    children?: User[];

    // Relations with other models
    // roles?: Role[];
    // customers?: Customer[];
    // calendars?: Calendar[];
    // todos?: Todo[];
    // statuses?: Status[];
    // types?: Type[];
    // tasks?: Task[];
    // notes?: UserNote[];
    // categories?: Category[];
    // orders?: Order[];
    // banks?: Bank[];
}
