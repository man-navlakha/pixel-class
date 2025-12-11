import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../contexts/ThemeContext';
import { useDebounce } from '../../hooks/useDebounce';
import { API_URLS, apiCall } from '../../utils/api';

export default function EditProfileScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const [originalUsername, setOriginalUsername] = useState('');
    const [username, setUsername] = useState('');
    const [profilePic, setProfilePic] = useState<any>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'forbidden' | 'short'>('idle');
    const debouncedUsername = useDebounce(username, 500);

    const forbiddenUsernames = [
        "pxc", "pixel", "pixelclass", "admin", "support", "kill", "murder", "terrorist", "abuse",
    ];

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const me = await apiCall(API_URLS.ME, 'GET');
            const profileDetails = await apiCall(API_URLS.PROFILE_DETAILS, 'POST', {
                username: me.username
            });

            setOriginalUsername(profileDetails.username);
            setUsername(profileDetails.username);
            setImagePreview(profileDetails.profile_pic);
        } catch (error) {
            console.error("Error fetching user:", error);
            Alert.alert("Error", "Failed to load profile");
            router.back();
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        if (initialLoading) return;

        if (debouncedUsername === originalUsername) {
            setUsernameStatus("idle");
            return;
        }
        if (debouncedUsername.length < 3) {
            setUsernameStatus("short");
            return;
        }

        const isForbidden = forbiddenUsernames.some((f) =>
            debouncedUsername.toLowerCase().includes(f)
        );
        if (isForbidden) {
            setUsernameStatus("forbidden");
            return;
        }

        const checkUsername = async () => {
            setUsernameStatus("checking");
            try {
                const searchUrl = `${API_URLS.USER_SEARCH}?username=${debouncedUsername}`;
                const response = await fetch(searchUrl);
                const data = await response.json();

                if (Array.isArray(data)) {
                    const exactMatch = data.some(
                        (u: any) => u.username === debouncedUsername.toLowerCase()
                    );
                    if (exactMatch) {
                        setUsernameStatus("taken");
                    } else {
                        setUsernameStatus("available");
                    }
                } else if (data.exists === true) {
                    setUsernameStatus("taken");
                } else {
                    setUsernameStatus("available");
                }
            } catch (error) {
                console.error("Error checking username:", error);
                setUsernameStatus("idle");
            }
        };

        checkUsername();
    }, [debouncedUsername, originalUsername, initialLoading]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setProfilePic({
                uri: asset.uri,
                type: asset.mimeType || 'image/jpeg',
                name: asset.fileName || 'profile.jpg',
            });
            setImagePreview(asset.uri);
        }
    };

    const handleProfileEdit = async () => {
        if (["taken", "forbidden", "short"].includes(usernameStatus)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Username',
                text2: 'Please fix the errors before submitting.',
            });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("new_username", username);
        if (profilePic) {
            // @ts-ignore
            formData.append("profile_pic", {
                uri: profilePic.uri,
                name: profilePic.name,
                type: profilePic.type,
            });
        }

        try {
            const response = await apiCall(API_URLS.PROFILE_EDIT, 'PUT', formData);

            if (response.message) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Profile updated successfully!',
                });
                router.replace('/(tabs)/profile');
            }
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: err.message || "An error occurred while updating.",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = () => {
        switch (usernameStatus) {
            case "checking":
                return <ActivityIndicator size="small" color={isDarkMode ? "#FFF" : "#111827"} />;
            case "available":
                return <Ionicons name="checkmark-circle" size={20} color="#10b981" />;
            case "taken":
            case "forbidden":
            case "short":
                return <Ionicons name="alert-circle" size={20} color="#ef4444" />;
            default:
                return null;
        }
    };

    if (initialLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style={isDarkMode ? "light" : "dark"} animated />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>Edit Profile</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: imagePreview || `https://i.pravatar.cc/150?u=${originalUsername}` }}
                                style={styles.avatar}
                            />
                            <View style={[styles.cameraButton, { borderColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
                                <Ionicons name="camera" size={16} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={pickImage}>
                            <Text style={styles.changePhotoText}>Change Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Username Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }]}>Username</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                                        color: isDarkMode ? '#FFF' : '#111827',
                                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
                                    }
                                ]}
                                value={username}
                                onChangeText={(text) => setUsername(text.replace(/\s/g, ""))}
                                placeholder="New Username"
                                placeholderTextColor={isDarkMode ? "#666" : "#9ca3af"}
                                autoCapitalize="none"
                            />
                            <View style={styles.statusIcon}>
                                {getStatusIcon()}
                            </View>
                        </View>

                        {/* Error Messages */}
                        {["taken", "forbidden", "short"].includes(usernameStatus) && (
                            <Text style={styles.errorText}>
                                {usernameStatus === "taken" && "This username is already taken."}
                                {usernameStatus === "forbidden" && "This username contains a forbidden word."}
                                {usernameStatus === "short" && "Username must be at least 3 characters."}
                            </Text>
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (loading || ["checking", "taken", "forbidden", "short"].includes(usernameStatus))
                                ? styles.submitButtonDisabled
                                : styles.submitButtonActive
                        ]}
                        onPress={handleProfileEdit}
                        disabled={loading || ["checking", "taken", "forbidden", "short"].includes(usernameStatus)}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 2,
        borderColor: '#10b981',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#10b981',
        padding: 8,
        borderRadius: 20,
        borderWidth: 4,
    },
    changePhotoText: {
        color: '#10b981',
        marginTop: 12,
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        marginBottom: 8,
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 1,
    },
    statusIcon: {
        position: 'absolute',
        right: 12,
        top: 14,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 8,
        marginLeft: 4,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonActive: {
        backgroundColor: '#10b981',
    },
    submitButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
});
