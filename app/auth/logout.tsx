import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_URLS, apiCall } from '../../utils/api';

export default function LogoutScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();

    useEffect(() => {
        performLogout();
    }, []);

    const performLogout = async () => {
        try {
            await apiCall(API_URLS.LOGOUT, 'POST');
        } catch (error: any) {
            console.log("Logout warning:", error.message);
        } finally {
            router.replace('/auth/login');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={[styles.text, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>Logging out...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: 20,
        fontSize: 16,
    }
});