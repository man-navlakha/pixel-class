import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { API_URLS, apiCall } from '../../utils/api';

export default function ForgetPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!email) {
            setError("Please enter your email");
            return;
        }
        setLoading(true);
        setError('');
        try {
            await apiCall(API_URLS.FORGOT_PASSWORD, 'POST', { email });
            Alert.alert("Email Sent", "Check your inbox for the reset link.");
            router.back();
        } catch (error: any) {
            setError(error.message);
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" animated />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.header}>
                        <Image
                            source={{ uri: 'https://ik.imagekit.io/pxc/pixel%20class%20fav%20w-02.png' }}
                            style={styles.logo}
                            contentFit="contain"
                        />
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(1000)} style={styles.form}>
                        <Input
                            label="Email"
                            placeholder="email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            iconName="mail-outline"
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Button
                            title="Send Link"
                            onPress={handleSubmit}
                            loading={loading}
                            style={styles.button}
                        />

                        <View style={styles.footer}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.linkText}>Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 80, height: 80, marginBottom: 20, borderRadius: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#AAAAAA', textAlign: 'center' },
    form: { width: '100%' },
    button: { marginBottom: 24 },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    linkText: { color: '#4A90E2', fontSize: 14, fontWeight: 'bold' },
    errorText: { color: '#FF5252', marginBottom: 15, textAlign: 'center' }
});
