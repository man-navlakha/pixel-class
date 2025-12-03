import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { API_URLS, apiCall } from '../../utils/api';

export default function ForgetPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await apiCall(API_URLS.FORGOT_PASSWORD, 'POST', { email });
            Alert.alert("Email Sent", "Check your inbox for the reset link.");
            router.back();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Reset Password' }} />
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>

            <Input
                label="Email"
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <Button title="Send Link" onPress={handleSubmit} loading={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 24, justifyContent: 'center' },
    title: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { color: '#AAA', fontSize: 16, marginBottom: 32 },
});
