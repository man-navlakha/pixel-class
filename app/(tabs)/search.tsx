import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import VerifiedBadge from '../../components/VerifiedBadge';
import { verifiedUsernames } from '../../constants/verifiedAccounts';
import { useTheme } from '../../contexts/ThemeContext';
import { useDebounce } from '../../hooks/useDebounce';
import { API_URLS, apiCall } from '../../utils/api';

export default function SearchScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [usernamec, setUsernamec] = useState<string | null>(null);
    const [followingUsernames, setFollowingUsernames] = useState<string[]>([]);

    const debouncedSearch = useDebounce(search, 500);

    // --- 1. Fetch logged-in username ---
    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const res = await apiCall(API_URLS.ME, 'GET');
                if (res?.username) {
                    setUsernamec(res.username);
                }
            } catch (error) {
                console.error("Error fetching logged-in user:", error);
            }
        };
        fetchUsername();
    }, []);

    // --- 2. Fetch "following" list ONCE after usernamec is known ---
    useEffect(() => {
        if (!usernamec) return;

        const fetchFollowing = async () => {
            try {
                const res = await apiCall(API_URLS.FOLLOWING, 'POST', { username: usernamec });
                if (Array.isArray(res)) {
                    setFollowingUsernames(res.map((u: any) => u.username));
                }
            } catch (err) {
                console.error("Error fetching following list:", err);
            }
        };

        fetchFollowing();
    }, [usernamec]);

    // --- 3. Fetch users on search ---
    useEffect(() => {
        if (!usernamec || !debouncedSearch.trim()) {
            setUsers([]);
            return;
        }

        if (debouncedSearch.trim() === usernamec) {
            setUsers([]);
            return;
        }

        let active = true;

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const endpoint = `${API_URLS.USER_SEARCH}?username=${debouncedSearch}`;
                const response = await apiCall(endpoint, 'GET');

                if (!active) return;

                if (Array.isArray(response)) {
                    const filtered = response
                        .filter((user: any) => user.username !== usernamec)
                        .filter((user: any) =>
                            user.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                            (user.first_name && user.first_name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
                            (user.last_name && user.last_name.toLowerCase().includes(debouncedSearch.toLowerCase()))
                        )
                        .map((user: any) => ({
                            ...user,
                            is_following: followingUsernames.includes(user.username),
                        }));

                    setUsers(filtered);
                }
            } catch (error) {
                if (active) console.error("Error fetching users:", error);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchUsers();

        return () => {
            active = false;
        };
    }, [debouncedSearch, usernamec, followingUsernames]);

    // --- Actions ---
    const follow = async (follow_username: string) => {
        setActionLoading(follow_username);
        try {
            const response = await apiCall(API_URLS.FOLLOW, 'POST', {
                username: usernamec,
                follow_username,
            });
            if (response.message) {
                setUsers(prev => prev.map(u => u.username === follow_username ? { ...u, is_following: true } : u));
                setFollowingUsernames(prev => [...prev, follow_username]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Error following user.");
        } finally {
            setActionLoading(null);
        }
    };

    const unfollow = async (unfollow_username: string) => {
        setActionLoading(unfollow_username);
        try {
            const response = await apiCall(API_URLS.UNFOLLOW, 'POST', {
                username: usernamec,
                unfollow_username,
            });
            if (response.message) {
                setUsers(prev => prev.map(u => u.username === unfollow_username ? { ...u, is_following: false } : u));
                setFollowingUsernames(prev => prev.filter(u => u !== unfollow_username));
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Error unfollowing user.");
        } finally {
            setActionLoading(null);
        }
    };

    const renderUserItem = useCallback(({ item }: { item: any }) => (
        <View className="flex-row items-center justify-between bg-gray-100 dark:bg-white/5 p-3 rounded-2xl mb-2.5 border border-transparent">
            <TouchableOpacity
                className="flex-row items-center flex-1"
                onPress={() => router.push(`/profile/${item.username}` as any)}
            >
                <Image
                    source={{ uri: item.profile_pic || `https://i.pravatar.cc/150?u=${item.username}` }}
                    className="w-12 h-12 rounded-full mr-3 border border-gray-300 dark:border-white/20"
                />
                <View>
                    <View className="flex-row items-center">
                        <Text className="text-gray-900 dark:text-white font-semibold text-base">{item.username}</Text>
                        {verifiedUsernames.has(item.username) && (
                            <VerifiedBadge size={16} style={{ marginLeft: 4 }} />
                        )}
                    </View>
                    <Text className="text-gray-600 dark:text-white/60 text-sm">{item.first_name} {item.last_name}</Text>
                </View>
            </TouchableOpacity>

            <View className="flex-row gap-2">
                {item.is_following ? (
                    <>
                        <TouchableOpacity
                            className="py-2 px-3 rounded-lg bg-gray-200 dark:bg-white/10"
                            onPress={() => router.push(`/chat/${item.username}` as any)}
                        >
                            <Text className="text-gray-900 dark:text-white text-sm font-semibold">Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="py-2 px-3 rounded-lg bg-red-500/80 min-w-[80px] items-center justify-center"
                            onPress={() => unfollow(item.username)}
                            disabled={actionLoading === item.username}
                        >
                            {actionLoading === item.username ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text className="text-white text-sm font-semibold">Unfollow</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        className="py-2 px-4 rounded-lg bg-blue-600 min-w-[90px] items-center justify-center"
                        onPress={() => follow(item.username)}
                        disabled={actionLoading === item.username}
                    >
                        {actionLoading === item.username ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <View className="flex-row items-center">
                                <Ionicons name="person-add" size={16} color="#FFF" style={{ marginRight: 4 }} />
                                <Text className="text-white text-sm font-semibold">Follow</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    ), [actionLoading, followingUsernames, router]);

    return (
        // Make sure it looks like this:
        <View className={`${isDarkMode ? 'dark' : ''}`} style={{ flex: 1, marginBottom: 120 }}>
            <View className="flex-1 bg-gray-50 dark:bg-[#121212] p-4 pt-[60px] ">
                <StatusBar style="auto" animated />
                <Text className="text-gray-900 dark:text-white text-4xl font-bold text-center mb-5">Find Users</Text>

                <View className="flex-row items-center bg-gray-200 dark:bg-white/5 rounded-2xl px-4 h-14 mb-4 border border-gray-300 dark:border-white/10">
                    <Ionicons name="search" size={20} color={isDarkMode ? "#888" : "#6b7280"} style={{ marginRight: 12 }} />
                    <TextInput
                        className="flex-1 text-gray-900 dark:text-white text-base"
                        placeholder="Search by username or name..."
                        placeholderTextColor={isDarkMode ? "#888" : "#9ca3af"}
                        value={search}
                        onChangeText={setSearch}
                        autoCapitalize="none"
                    />
                </View>

                {loading ? (
                    <View className="mt-5">
                        <ActivityIndicator size="large" color="#4ade80" />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        renderItem={renderUserItem}
                        keyExtractor={item => item.username}
                        ListEmptyComponent={
                            search.trim() ? (
                                <Text className="text-gray-500 dark:text-white/60 text-center mt-10 text-base">No users found for your search.</Text>
                            ) : (
                                <Text className="text-gray-500 dark:text-white/60 text-center mt-10 text-base">Start typing to search for users.</Text>
                            )
                        }
                    />
                )}
            </View>
        </View>
    );
}
