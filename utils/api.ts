// utils/api.ts
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pixel-classes.onrender.com';

export const API_URLS = {
    LOGIN: `${BASE_URL}/api/user/login/`,
    REGISTER: `${BASE_URL}/api/user/register/`,
    VERIFY_OTP: `${BASE_URL}/api/user/verify-otp/`,

    // Add this line:
    LOGOUT: `${BASE_URL}/api/user/logout/`,

    COURSES: `${BASE_URL}/api/home/courses/`,
    GET_SUBJECTS: `${BASE_URL}/api/home/QuePdf/Get_Subjact`,
    GET_SUBJECT_PDFS: `${BASE_URL}/api/home/QuePdf/Subject_Pdf`,
    GET_ANSWERS: `${BASE_URL}/api/home/AnsPdf/`,
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

export const apiCall = async (endpoint: string, method: 'POST' | 'GET' | 'PUT', body?: any) => {
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