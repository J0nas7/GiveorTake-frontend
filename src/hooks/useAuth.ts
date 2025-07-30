"use client"

// External
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

// Internal
import {
    setAccessToken,
    setAuthUser,
    setIsLoggedIn,
    setSnackMessage,
    useAppDispatch,
    useAuthActions
} from '@/redux'
import { apiResponseDTO } from "@/types"
import { useAxios, useCookies } from './'

interface Errors {
    [key: string]: string | undefined
}

const errorCodes: Errors = {
    wrong_credentials: 'Incorrect credentials. Please try again.',
    invalid_username: 'Invalid username or email address. Please check it and try again.',
    invalid_email: 'Invalid email address. Please check it and try again.',
    incorrect_password: 'Incorrect password. Please try again, or reset your password.',
    empty_username: 'Please provide your username.',
    empty_password: 'Please provide your password.',
    "Login Attempt Failed": 'Incorrect credentials. Please try again.',
    //"Empty request": 'Name or password not provided.',
}

export const useAuth = () => {
    // Hooks
    const router = useRouter()
    const searchParams = useSearchParams()
    const { httpPostWithData, httpGetRequest } = useAxios()
    const { getTheCookie, setTheCookie, deleteTheCookie } = useCookies()

    // Redux
    const dispatch = useAppDispatch()
    const { fetchIsLoggedInStatus } = useAuthActions()

    // Variables
    const [errorMsg, setErrorMsg] = useState<string>('')
    const [status, setStatus] = useState<string>('')

    // Methods
    const saveLoginSuccess = (loginData: any) => {
        if (typeof window !== "undefined") {
            const newAccessToken = loginData.accessToken
            const newAuthUser = loginData.user

            setTheCookie("accessToken", newAccessToken)

            dispatch(setAccessToken({ "data": newAccessToken }))
            // dispatch(setRefreshToken({ "data": jwtData.refreshToken }))
            dispatch(setIsLoggedIn({ "data": true }))
            dispatch(setAuthUser({ "data": newAuthUser }))

            let ref = searchParams.get("ref")
            router.push(ref ?? "/")
        }

        return true
    }

    const processResult = (fromAction: string, theResult: apiResponseDTO) => {
        if (fromAction != 'login') return false

        setStatus('resolved')

        if (theResult.success === true) {
            console.log("User logged in:", theResult.data)
            return saveLoginSuccess(theResult.data)
        }

        dispatch(setSnackMessage(
            theResult.message ? theResult.message : "Login credentials are wrong."
        ))

        console.log("Login failed", theResult)
        return false
    }

    const handleLoginSubmit = async (emailInput: string, passwordInput: string): Promise<boolean> => {
        setStatus('resolving')
        let errorData: apiResponseDTO
        let error = false
        // Resetting the errorType triggers another dispatch that resets the error
        // dispatch(setLoginErrorType({ "data": "" }))

        // If name/email or password is empty
        if (!emailInput || !passwordInput) {
            errorData = {
                "success": false,
                "message": "Missing neccesary credentials.",
                "data": false
            }
            error = true
        }

        const loginVariables = {
            "User_Email": emailInput,
            "password": passwordInput
        }
        // Send login variables to the API for authentication
        try {
            if (!error) {
                const data = await httpPostWithData("auth/login", loginVariables)
                return processResult("login", data)
            }
        } catch (e) {
            console.log("useAuth login error", e)
            errorData = {
                "success": false,
                "message": "Login failed. Try again.",
                "data": false
            }
            error = true
        }

        processResult("login", errorData!)
        return false
    }

    const handleRegister = async (formData: any): Promise<boolean> => {
        setStatus('resolving')
        let errorData: apiResponseDTO = {
            "success": false,
            "message": "-",
            "data": false
        }
        let error = false

        // Send email to the API for token generation
        try {
            if (!error) {
                const data = await httpPostWithData("auth/register", formData)

                if (data.success !== true) {
                    const errors = data.response?.data?.errors;

                    if (errors && typeof errors === 'object') {
                        // Flatten the object to a single array of messages
                        let messages = Object.values(errors).flat()
                        errorData.message = messages.join(' ')
                        throw new Error(errorData.message)
                    } else {
                        errorData.message = data.message
                        throw new Error(errorData.message)
                    }
                } else if (data.success === true) {
                    dispatch(setSnackMessage("Your account was created. Activation e-mail is sent."))
                    router.push("/sign-in")
                    return true
                }
            }
        } catch (e) {
            if (!error && errorData.message == "-") {
                console.log("useAuth register error", e)
                errorData = {
                    "success": false,
                    "message": "Register-request failed. Try again.",
                    "data": false
                }
                error = true
            }
        }

        dispatch(setSnackMessage(errorData.message))
        return false
    }

    const handleForgotRequest = async (emailInput: string): Promise<boolean> => {
        setStatus('resolving')
        let errorData: apiResponseDTO = {
            "success": false,
            "message": "-",
            "data": false
        }
        let error = false
        // Resetting the errorType triggers another dispatch that resets the error
        // dispatch(setLoginErrorType({ "data": "" }))

        // If name/email or password is empty
        if (!emailInput) {
            errorData = {
                "success": false,
                "message": "Missing neccesary credentials.",
                "data": false
            }
            error = true
        }

        const forgotVariables = {
            "User_Email": emailInput
        }

        // Send email to the API for token generation
        try {
            if (!error) {
                const data = await httpPostWithData("auth/forgot-password", forgotVariables)

                if (data.success !== true) {
                    const errors = data.response?.data?.errors;

                    if (errors && typeof errors === 'object') {
                        // Flatten the object to a single array of messages
                        let messages = Object.values(errors).flat();
                        errorData.message = messages.join(', ');
                        throw new Error(errorData.message)
                    } else {
                        errorData.message = data.message
                        throw new Error(errorData.message)
                    }
                } else if (data.success === true) {
                    dispatch(setSnackMessage("Reset-mail is sent to you."))
                    router.push("/forgot-password/reset")
                    return true
                }
            }
        } catch (e) {
            if (!error && errorData.message == "-") {
                console.log("useAuth forgot error", e)
                errorData = {
                    "success": false,
                    "message": "Forgot-request failed. Try again.",
                    "data": false
                }
                error = true
            }
        }

        dispatch(setSnackMessage(errorData.message))
        return false
    }

    const handleResetRequest = async (
        email: string,
        rememberToken: string,
        password1: string,
        password2: string
    ): Promise<boolean> => {
        setStatus('resolving')
        let errorData: apiResponseDTO = {
            "success": false,
            "message": "-",
            "data": false
        }
        let error = false
        // Resetting the errorType triggers another dispatch that resets the error
        // dispatch(setLoginErrorType({ "data": "" }))

        // If fields are empty
        if (!email || !rememberToken || !password1 || !password2) {
            errorData = {
                "success": false,
                "message": "Missing neccesary credentials.",
                "data": false
            }
            error = true
        }

        const resetVariables = {
            "User_Email": email,
            "User_Remember_Token": rememberToken,
            "New_User_Password": password1,
            "New_User_Password_confirmation": password2
        };

        // Send email to the API for token generation
        try {
            if (!error) {
                const data = await httpPostWithData("auth/reset-password", resetVariables)

                if (data.success !== true) {
                    const errors = data.response?.data?.errors;

                    if (errors && typeof errors === 'object') {
                        // Flatten the object to a single array of messages
                        let messages = Object.values(errors).flat();
                        errorData.message = messages.join(', ');
                        throw new Error(errorData.message)
                    } else {
                        errorData.message = data.message
                        throw new Error(errorData.message)
                    }
                } else if (data.success === true) {
                    dispatch(setSnackMessage("Your password was reset."))
                    router.push("/sign-in")
                    return true
                }
            }
        } catch (e) {
            if (!error && errorData.message == "-") {
                console.log("useAuth forgot error", e)
                errorData = {
                    "success": false,
                    "message": "Reset-request failed. Try again.",
                    "data": false
                }
                error = true
            }
        }

        dispatch(setSnackMessage(errorData.message))
        return false
    }

    const handleLogoutSubmit = async () => {
        deleteTheCookie("accessToken")
        window.location.href = "/sign-in"; // Forces a full page reload
    }

    const handleTokenTest = () => {
        dispatch(fetchIsLoggedInStatus())
    }

    // Effects
    useEffect(() => {
        if (typeof window !== "undefined") {
            // deleteTheCookie("accessToken")
            // console.log("useAuth loginstatus")
            // if (window.localStorag.getItem("isLoggedIn")) {
            if (getTheCookie("accessToken")) {
                const accessToken = getTheCookie("accessToken")
                // console.log("window.local true")
                dispatch(setAccessToken({ "data": accessToken }))
                dispatch(setIsLoggedIn({ "data": true }))
                handleTokenTest()
            } else {
                // console.log("window.local false")
                dispatch(setAccessToken({ "data": "" }))
                dispatch(setIsLoggedIn({ "data": false }))
            }
        }
    }, [])

    return {
        saveLoginSuccess,
        handleLoginSubmit,
        handleRegister,
        handleForgotRequest,
        handleResetRequest,
        handleLogoutSubmit,
        errorMsg,
        status,
    }
}
