// External
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Internal
import { RootState } from '@/redux/store'
import { Organisation, TaskTimeTrack, TeamUserSeat, User } from '@/types'

type DeleteConfirm = {
    singular: string
    resource: string
    itemId: number
    confirm: boolean | undefined,
    redirect: string | undefined
}

export interface AuthState {
    isLoggedIn: boolean | undefined,
    adminLoggedIn: string,
    authUser: User | undefined,
    authUserSeat: TeamUserSeat | undefined,
    authUserSeatPermissions: string[] | undefined,
    authUserOrganisation: Organisation | undefined,
    authUserTaskTimeTrack: TaskTimeTrack | undefined,
    snackMessage: string | undefined,
    deleteConfirm: DeleteConfirm | undefined,
    accessToken: string,
    refreshToken: string,
    loginResponse: Object,
    axiosGet: string,
}

const initialState = {
    isLoggedIn: undefined,
    adminLoggedIn: '',
    authUser: undefined,
    authUserSeat: undefined,
    authUserSeatPermissions: undefined,
    authUserOrganisation: undefined,
    authUserTaskTimeTrack: undefined,
    snackMessage: undefined,
    deleteConfirm: undefined,
    accessToken: '',
    refreshToken: '',
    loginResponse: {},
    axiosGet: '',
} as AuthState

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setIsLoggedIn: (state: AuthState, action: PayloadAction<any>) => {
            state.isLoggedIn = action.payload.data
        },
        setAuthUser: (state: AuthState, action: PayloadAction<any>) => {
            state.authUser = action.payload.data
        },
        setAuthUserSeat: (state: AuthState, action: PayloadAction<any>) => {
            const data = action.payload.data
            state.authUserSeat = data

            // const Seat_Permissions = data.Seat_Permissions
            // let parsedPermissions: string[] = [];

            // if (Array.isArray(Seat_Permissions)) {
            //     parsedPermissions = Seat_Permissions;
            // } else if (typeof Seat_Permissions === 'string') {
            //     try {
            //         parsedPermissions = JSON.parse(Seat_Permissions);
            //     } catch (e) {
            //         console.error("Failed to parse Seat_Permissions:", e);
            //     }
            // }

            // state.authUserSeatPermissions = parsedPermissions
        },
        setAuthUserSeatPermissions: (state: AuthState, action: PayloadAction<any>) => {
            state.authUserSeatPermissions = action.payload
        },
        setAuthUserOrganisation: (state: AuthState, action: PayloadAction<any>) => {
            state.authUserOrganisation = action.payload.data
        },
        setAuthUserTaskTimeTrack: (state: AuthState, action: PayloadAction<any>) => {
            state.authUserTaskTimeTrack = action.payload
        },
        setSnackMessage: (state: AuthState, action: PayloadAction<any>) => {
            state.snackMessage = action.payload
        },
        setDeleteConfirm: (state: AuthState, action: PayloadAction<DeleteConfirm | undefined>) => {
            state.deleteConfirm = action.payload
        },
        setAccessToken: (state: AuthState, action: PayloadAction<any>) => {
            state.accessToken = action.payload.data
        },
        setRefreshToken: (state: AuthState, action: PayloadAction<any>) => {
            state.refreshToken = action.payload.data
        },
        setLoginResponse: (state: AuthState, action: PayloadAction<any>) => {
            state.loginResponse = action.payload.data
        },
        setAxiosGet: (state: AuthState, action: PayloadAction<any>) => {
            state.axiosGet = action.payload.data
        },
    }
})

const { actions } = authSlice
export const {
    setIsLoggedIn,
    setAuthUser,
    setAuthUserSeat,
    setAuthUserSeatPermissions,
    setAuthUserOrganisation,
    setAuthUserTaskTimeTrack,
    setSnackMessage,
    setDeleteConfirm,
    setAccessToken,
    setRefreshToken,
    setLoginResponse,
    setAxiosGet
} = actions

export default authSlice.reducer

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn
export const selectAuthUser = (state: RootState) => state.auth.authUser
export const selectAuthUserSeat = (state: RootState) => state.auth.authUserSeat
export const selectAuthUserSeatPermissions = (state: RootState) => state.auth?.authUserSeatPermissions ?? []; // Return empty array if undefined
export const selectAuthUserOrganisation = (state: RootState) => state.auth.authUserOrganisation
export const selectAuthUserTaskTimeTrack = (state: RootState) => state.auth.authUserTaskTimeTrack
export const selectSnackMessage = (state: RootState) => state.auth.snackMessage
export const selectDeleteConfirm = (state: RootState) => state.auth.deleteConfirm
export const selectAccessToken = (state: RootState) => state.auth.accessToken
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken
export const selectLoginResponse = (state: RootState) => state.auth.loginResponse
export const selectAxiosGet = (state: RootState) => state.auth.axiosGet
