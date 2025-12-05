// utils/api.ts
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pixel-classes.onrender.com';

export const API_URLS = {
    LOGIN: `${BASE_URL}/api/user/login/`,
    GOOGLE_LOGIN: `${BASE_URL}/api/user/google-login/`,
    REGISTER: `${BASE_URL}/api/user/register/`,
    VERIFY_OTP: `${BASE_URL}/api/user/verify-otp/`,
    REFRESH_TOKEN: `${BASE_URL}/api/token/refresh/`,

    // Add this line:
    LOGOUT: `${BASE_URL}/api/user/logout/`,

    COURSES: `${BASE_URL}/api/home/courses/`,
    GET_SUBJECTS: `${BASE_URL}/api/home/QuePdf/Get_Subjact`,
    GET_SUBJECT_PDFS: `${BASE_URL}/api/home/QuePdf/Subject_Pdf`,
    GET_ANSWERS: `${BASE_URL}/api/home/AnsPdf/`,
    UPLOAD_RESOURCE: `${BASE_URL}/api/home/QuePdf/Add/`,
    ME: `${BASE_URL}/api/me/`,

    // Profile & Social Endpoints
    PROFILE_DETAILS: `${BASE_URL}/api/Profile/details/`,
    PROFILE_POSTS: `${BASE_URL}/api/Profile/posts/`,
    FOLLOW: `${BASE_URL}/api/Profile/follow/`,
    UNFOLLOW: `${BASE_URL}/api/Profile/unfollow/`,
    USER_SEARCH: `${BASE_URL}/api/Profile/UserSearch/`,
    FOLLOWING: `${BASE_URL}/api/Profile/following/`,
    FOLLOWERS: `${BASE_URL}/api/Profile/followers/`,
    PROFILE_EDIT: `${BASE_URL}/api/Profile/edit/`,

    // Auth Endpoints
    FORGOT_PASSWORD: `${BASE_URL}/api/user/password_reset/`,
    RESET_PASSWORD: `${BASE_URL}/api/user/submit-new-password/`,
};

export const apiCall = async (
    endpoint: string,
    method: 'POST' | 'GET' | 'PUT' | 'DELETE',
    body?: any,
    isRetry: boolean = false // New flag to prevent infinite loops
): Promise<any> => {
    try {
        const isFormData = body instanceof FormData;
        const headers: any = {};

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(endpoint, {
            method,
            headers,
            body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
            credentials: 'include', // Important for sending/clearing cookies
        });
        if (response.status === 401 && !isRetry) {
            console.log("Token expired. Attempting refresh...");

            // 1. Attempt to refresh the token
            const refreshResponse = await fetch(API_URLS.REFRESH_TOKEN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Important to send the HttpOnly refresh cookie
                body: JSON.stringify({}) // Empty body for this specific endpoint
            });

            if (refreshResponse.ok) {
                console.log("Refresh successful. Retrying original request...");
                // 2. Retry the original request with the new session
                return apiCall(endpoint, method, body, true);
            } else {
                console.log("Refresh failed. User must login again.");
                throw new Error('Session expired');
            }
        }
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error: any) {
        if (Platform.OS === 'web' && error.message === 'Failed to fetch') {
            console.error("CORS Error or Network Issue on Web. Ensure backend allows this origin.");
        }
        throw error;
    }
};