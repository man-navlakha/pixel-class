import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { API_URLS, apiCall } from '../../utils/api';

// Debounce hook
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function EditProfileScreen() {
    const router = useRouter();
    const [originalUsername, setOriginalUsername] = useState('');
    const [username, setUsername] = useState('');
    const [profilePic, setProfilePic] = useState<any>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Username validation state
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
            setOriginalUsername(me.username);
            setUsername(me.username);
            setImagePreview(me.profile_pic);
        } catch (error) {
            console.error("Error fetching user:", error);
            Alert.alert("Error", "Failed to load profile");
            router.back();
        } finally {
            setInitialLoading(false);
        }
    };

    // Real-time username validation
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
                const res = await apiCall(API_URLS.USER_SEARCH, 'GET', null); // Note: The original code used GET with params. apiCall might need adjustment for GET params or we append to URL.
                // Wait, apiCall doesn't support query params in the body argument for GET requests easily.
                // I'll manually append the query param for now or update apiCall.
                // Let's assume I can append it to the URL.

                // Actually, the USER_SEARCH endpoint in the provided code was: api.get("Profile/UserSearch/", { params: { username: debouncedUsername } })
                // My apiCall doesn't handle params object. I'll construct the URL.
                const searchUrl = `${API_URLS.USER_SEARCH}?username=${debouncedUsername}`;

                // Wait, apiCall signature is (endpoint, method, body). 
                // For GET, body is ignored in my implementation if I pass it? 
                // Let's look at apiCall implementation again.
                // "body: body ? JSON.stringify(body) : undefined" -> fetch GET with body is invalid.
                // So I must pass params in URL.

                // However, I need to use `fetch` directly or update `apiCall` to handle query params? 
                // I'll just use `fetch` here or use `apiCall` with the query string appended to endpoint.

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
                // Navigate back or refresh
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
                return <ActivityIndicator size="small" color="#FFF" />;
            case "available":
                return <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />;
            case "taken":
            case "forbidden":
            case "short":
                return <Ionicons name="alert-circle" size={20} color="#F44336" />;
            default:
                return null;
        }
    };

    if (initialLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* Profile Picture */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={{ uri: imagePreview || `https://i.pravatar.cc/150?u=${originalUsername}` }}
                            style={styles.avatar}
                        />
                        <View style={styles.editIcon}>
                            <Ionicons name="camera" size={20} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage}>
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Username Field */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={(text) => setUsername(text.replace(/\s/g, ""))}
                            placeholder="New Username"
                            placeholderTextColor="#666"
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
                        styles.submitBtn,
                        (loading || ["checking", "taken", "forbidden", "short"].includes(usernameStatus)) && styles.disabledBtn
                    ]}
                    onPress={handleProfileEdit}
                    disabled={loading || ["checking", "taken", "forbidden", "short"].includes(usernameStatus)}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#4A90E2' },
    editIcon: { position: 'absolute', bottom: 0, right: '35%', backgroundColor: '#4A90E2', padding: 6, borderRadius: 20 },
    changePhotoText: { color: '#4A90E2', marginTop: 10, fontSize: 14, fontWeight: '600' },
    inputContainer: { marginBottom: 24 },
    label: { color: 'rgba(255,255,255,0.7)', marginBottom: 8, fontSize: 14 },
    inputWrapper: { position: 'relative' },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, paddingRight: 40, color: '#FFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    statusIcon: { position: 'absolute', right: 12, top: 12 },
    errorText: { color: '#FF5252', fontSize: 12, marginTop: 4 },
    submitBtn: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 8, alignItems: 'center' },
    disabledBtn: { backgroundColor: '#333', opacity: 0.7 },
    submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
