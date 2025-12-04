import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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

            // Fetch detailed profile to get the correct profile picture
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
            <SafeAreaView className="flex-1 bg-[#121212] justify-center items-center">
                <ActivityIndicator size="large" color="#4A90E2" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#121212]">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Edit Profile</Text>
                <View className="w-8" />
            </View>

            <View className="p-5">
                {/* Avatar */}
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={pickImage} className="relative">
                        <Image
                            source={{ uri: imagePreview || `https://i.pravatar.cc/150?u=${originalUsername}` }}
                            className="w-28 h-28 rounded-full border-2 border-[#4A90E2]"
                        />
                        <View className="absolute bottom-0 right-0 bg-[#4A90E2] p-2 rounded-full border-4 border-[#121212]">
                            <Ionicons name="camera" size={16} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage}>
                        <Text className="text-[#4A90E2] mt-3 font-semibold">Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Username Input */}
                <View className="mb-6">
                    <Text className="text-white/70 mb-2 ml-1 text-sm font-medium">Username</Text>
                    <View className="relative">
                        <TextInput
                            className="bg-white/5 rounded-xl px-4 py-3.5 text-white border border-white/10 focus:border-[#4A90E2]"
                            value={username}
                            onChangeText={(text) => setUsername(text.replace(/\s/g, ""))}
                            placeholder="New Username"
                            placeholderTextColor="#666"
                            autoCapitalize="none"
                        />
                        <View className="absolute right-3 top-3.5">
                            {getStatusIcon()}
                        </View>
                    </View>

                    {/* Error Messages */}
                    {["taken", "forbidden", "short"].includes(usernameStatus) && (
                        <Text className="text-red-500 text-xs mt-2 ml-1">
                            {usernameStatus === "taken" && "This username is already taken."}
                            {usernameStatus === "forbidden" && "This username contains a forbidden word."}
                            {usernameStatus === "short" && "Username must be at least 3 characters."}
                        </Text>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    className={`py-4 rounded-xl items-center ${(loading || ["checking", "taken", "forbidden", "short"].includes(usernameStatus))
                        ? 'bg-white/10 opacity-50'
                        : 'bg-[#4A90E2]'
                        }`}
                    onPress={handleProfileEdit}
                    disabled={loading || ["checking", "taken", "forbidden", "short"].includes(usernameStatus)}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
