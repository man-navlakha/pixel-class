import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { API_URLS, apiCall } from '../../utils/api';

export default function SignupScreen() {
    const router = useRouter();

    // Form State
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'signup' | 'otp'>('signup'); // Track if we are registering or verifying OTP
    const [error, setError] = useState('');

    const handleSignup = async () => {
        setLoading(true);
        setError('');
        try {
            // Call Register API
            await apiCall(API_URLS.REGISTER, 'POST', {
                username,
                email,
                password,
                course: "B.C.A" // Default course as per backend logic or add an input for it
            });

            // If successful, backend sends email. Move to OTP step.
            Alert.alert("Success", "OTP sent to your email!");
            setStep('otp');
        } catch (err: any) {
            setError(err.message);
            Alert.alert("Signup Failed", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        setError('');
        try {
            // Call Verify OTP API
            await apiCall(API_URLS.VERIFY_OTP, 'POST', {
                username, // Backend requires username to find the user
                otp
            });

            // If successful, user is logged in (cookies set).
            Alert.alert("Success", "Account verified!");
            router.replace('/');
        } catch (err: any) {
            setError(err.message);
            Alert.alert("Verification Failed", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

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
                        <Text style={styles.title}>
                            {step === 'signup' ? 'Create Account' : 'Verify Email'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {step === 'signup' ? 'Join Pixel Class today' : `Enter OTP sent to ${email}`}
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(1000)} style={styles.form}>

                        {/* Phase 1: Sign Up Form */}
                        {step === 'signup' && (
                            <>
                                <Input
                                    label="Username"
                                    placeholder="username"
                                    value={username}
                                    onChangeText={setUsername}
                                    iconName="person-outline"
                                    autoCapitalize="none"
                                />

                                <Input
                                    label="Email"
                                    placeholder="hello@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    iconName="mail-outline"
                                />

                                <Input
                                    label="Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    isPassword
                                    iconName="lock-closed-outline"
                                />

                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <Button
                                    title="Sign Up"
                                    onPress={handleSignup}
                                    loading={loading}
                                    style={styles.button}
                                />
                            </>
                        )}

                        {/* Phase 2: OTP Form */}
                        {step === 'otp' && (
                            <>
                                <Input
                                    label="Enter OTP"
                                    placeholder="123456"
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    iconName="key-outline"
                                />

                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <Button
                                    title="Verify & Login"
                                    onPress={handleVerifyOtp}
                                    loading={loading}
                                    style={styles.button}
                                />

                                <TouchableOpacity onPress={() => setStep('signup')} style={{ alignItems: 'center' }}>
                                    <Text style={styles.linkText}>Back to details</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {step === 'signup' && (
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                    <Text style={styles.linkText}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
    button: { marginTop: 10, marginBottom: 24 },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { color: '#AAAAAA', fontSize: 14 },
    linkText: { color: '#4A90E2', fontSize: 14, fontWeight: 'bold' },
    errorText: { color: '#FF5252', marginBottom: 15, textAlign: 'center' }
});