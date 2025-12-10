import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { API_URLS, apiCall } from '../../utils/api';

export default function LogoutScreen() {
    const router = useRouter();

    useEffect(() => {
        performLogout();
    }, []);

    const performLogout = async () => {
        try {
            // Call the backend to invalidate the session/cookies
            await apiCall(API_URLS.LOGOUT, 'POST');
        } catch (error: any) {
            console.log("Logout warning:", error.message);
            // Even if the API call fails (e.g., already logged out), 
            // we should still proceed to redirect the user to the login screen.
        } finally {
            // Force navigation to Login and replace the history
            // so the user can't go "back" to the protected screens.
            router.replace('/auth/login');
        }
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4ade80" />
            <Text style={styles.text}>Logging out...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#FFFFFF',
        marginTop: 20,
        fontSize: 16,
    }
});