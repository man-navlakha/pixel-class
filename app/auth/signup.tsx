import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useTheme } from '../../contexts/ThemeContext';
import { API_URLS, apiCall } from '../../utils/api';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'signup' | 'otp'>('signup');
    const [error, setError] = useState('');

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: '724330412810-krfm9oo85om3vkt9gcs65turjgpokdbh.apps.googleusercontent.com',
        iosClientId: '724330412810-gsfoobrlbor5mfr9d972s7nd8c12nktj.apps.googleusercontent.com',
        androidClientId: '724330412810-vjesigur94njprddrfarcl30jmsokmfd.apps.googleusercontent.com',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                handleGoogleSignup(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            setError("Google Sign-In failed");
        }
    }, [response]);

    const handleGoogleSignup = async (token: string) => {
        setLoading(true);
        try {
            const userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = await userInfoResponse.json();

            await apiCall(API_URLS.GOOGLE_LOGIN, 'POST', {
                access_token: token,
                email: user.email,
                name: user.name,
                photo: user.picture
            });

            router.replace('/(tabs)' as any);
        } catch (error: any) {
            const msg = error instanceof Error ? error.message : "Google Signup Failed";
            setError(msg);
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        setLoading(true);
        setError('');
        try {
            await apiCall(API_URLS.REGISTER, 'POST', {
                username,
                email,
                password,
                course: "B.C.A"
            });

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
            await apiCall(API_URLS.VERIFY_OTP, 'POST', {
                username,
                otp
            });

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
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style={isDarkMode ? "light" : "dark"} animated />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Image
                            source={{ uri: 'https://ik.imagekit.io/pxc/pixel%20class%20fav%20w-02.png' }}
                            style={styles.logo}
                            contentFit="contain"
                        />
                        <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>
                            {step === 'signup' ? 'Create Account' : 'Verify Email'}
                        </Text>
                        <Text style={[styles.subtitle, { color: isDarkMode ? '#AAAAAA' : '#6b7280' }]}>
                            {step === 'signup' ? 'Join Pixel Class today' : `Enter OTP sent to ${email}`}
                        </Text>
                    </View>

                    <View style={styles.form}>
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

                                <View style={styles.dividerContainer}>
                                    <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? '#333' : '#d1d5db' }]} />
                                    <Text style={[styles.dividerText, { color: isDarkMode ? '#666' : '#9ca3af' }]}>OR</Text>
                                    <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? '#333' : '#d1d5db' }]} />
                                </View>

                                <TouchableOpacity
                                    style={styles.googleButton}
                                    onPress={() => promptAsync()}
                                    disabled={!request || loading}
                                >
                                    <Image
                                        source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" }}
                                        style={styles.googleIcon}
                                    />
                                    <Text style={styles.googleButtonText}>Sign Up with Google</Text>
                                </TouchableOpacity>
                            </>
                        )}

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
                                <Text style={[styles.footerText, { color: isDarkMode ? '#AAAAAA' : '#6b7280' }]}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                    <Text style={styles.linkText}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 80, height: 80, marginBottom: 20, borderRadius: 20 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { fontSize: 16, textAlign: 'center' },
    form: { width: '100%' },
    button: { marginTop: 10, marginBottom: 24 },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { fontSize: 14 },
    linkText: { color: '#10b981', fontSize: 14, fontWeight: 'bold' },
    errorText: { color: '#ef4444', marginBottom: 15, textAlign: 'center' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { marginHorizontal: 10, fontSize: 12 },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 24,
    },
    googleIcon: { width: 20, height: 20, marginRight: 10 },
    googleButtonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' }
});