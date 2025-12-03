import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { API_URLS, apiCall } from '../../../utils/api';

export default function ResetPasswordScreen() {
    const { token } = useLocalSearchParams();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await apiCall(API_URLS.RESET_PASSWORD, 'POST', {
                token: token,
                new_password: password
            });
            Alert.alert("Success", "Password reset successfully. Please login.");
            router.replace('/auth/login');
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'New Password' }} />
            <Text style={styles.title}>Set New Password</Text>

            <Input
                label="New Password"
                placeholder="******"
                value={password}
                onChangeText={setPassword}
                isPassword
            />

            <Button title="Reset Password" onPress={handleSubmit} loading={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 24, justifyContent: 'center' },
    title: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 32 },
});
