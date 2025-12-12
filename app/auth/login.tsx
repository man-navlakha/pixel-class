import { makeRedirectUri } from 'expo-auth-session';
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

export default function LoginScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: '724330412810-krfm9oo85om3vkt9gcs65turjgpokdbh.apps.googleusercontent.com',
        iosClientId: '724330412810-gsfoobrlbor5mfr9d972s7nd8c12nktj.apps.googleusercontent.com',
        androidClientId: '724330412810-vjesigur94njprddrfarcl30jmsokmfd.apps.googleusercontent.com',
        redirectUri: makeRedirectUri({
            scheme: 'pixelclass', // Must match 'scheme' in your app.json
            path: 'auth/login'    // Optional: helps route back to this screen
        }),
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                handleGoogleLoginSuccess(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            setError("Google Sign-In failed");
        }
    }, [response]);

    const handleGoogleLoginSuccess = async (token: string) => {
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
            const msg = error instanceof Error ? error.message : "Google Login Failed";
            setError(msg);
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiCall(API_URLS.LOGIN, 'POST', {
                username: username,
                password: password
            });
            router.replace('/(tabs)' as any);
        } catch (err: any) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            Alert.alert("Login Failed", message);
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
                        <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: isDarkMode ? '#AAAAAA' : '#6b7280' }]}>Sign in to continue learning</Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Username"
                            placeholder="username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            iconName="person-outline"
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

                        <TouchableOpacity onPress={() => router.push('/auth/forgetpassword')} style={styles.forgotPassword}>
                            <Text style={styles.linkText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
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
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: isDarkMode ? '#AAAAAA' : '#6b7280' }]}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                                <Text style={styles.linkText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
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
    subtitle: { fontSize: 16 },
    form: { width: '100%' },
    forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
    button: { marginBottom: 24 },
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