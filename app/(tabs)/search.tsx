import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
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
        <View style={[styles.userCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6', borderColor: 'transparent' }]}>
            <TouchableOpacity
                style={styles.userInfo}
                onPress={() => router.push(`/profile/${item.username}` as any)}
            >
                <Image
                    source={{ uri: item.profile_pic || `https://i.pravatar.cc/150?u=${item.username}` }}
                    style={[styles.avatar, { borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#d1d5db' }]}
                />
                <View>
                    <View style={styles.usernameRow}>
                        <Text style={[styles.username, { color: isDarkMode ? '#FFF' : '#111827' }]}>{item.username}</Text>
                        {verifiedUsernames.has(item.username) && (
                            <VerifiedBadge size={16} style={{ marginLeft: 4 }} />
                        )}
                    </View>
                    <Text style={[styles.fullName, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#6b7280' }]}>{item.first_name} {item.last_name}</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.actionsRow}>
                {item.is_following ? (
                    <>
                        <TouchableOpacity
                            style={[styles.messageButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }]}
                            onPress={() => router.push(`/chat/${item.username}` as any)}
                        >
                            <Text style={[styles.messageButtonText, { color: isDarkMode ? '#FFF' : '#111827' }]}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.unfollowButton}
                            onPress={() => unfollow(item.username)}
                            disabled={actionLoading === item.username}
                        >
                            {actionLoading === item.username ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.unfollowButtonText}>Unfollow</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={styles.followButton}
                        onPress={() => follow(item.username)}
                        disabled={actionLoading === item.username}
                    >
                        {actionLoading === item.username ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <View style={styles.followButtonContent}>
                                <Ionicons name="person-add" size={16} color="#FFF" style={{ marginRight: 4 }} />
                                <Text style={styles.followButtonText}>Follow</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    ), [actionLoading, followingUsernames, router, isDarkMode]);

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb', paddingBottom: 120 }]}>
            <View style={styles.content}>
                <StatusBar style="auto" animated />
                <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#111827' }]}>Find Users</Text>

                <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#d1d5db' }]}>
                    {/* <Ionicons name="search" size={20} color={isDarkMode ? "#888" : "#6b7280"} style={{ marginRight: 12 }} /> */}
                    <Text style={[{ color: isDarkMode ? '#888' : '#6b7280', marginLeft: 12 }]}>@</Text>

                    <TextInput
                        style={[styles.searchInput, { color: isDarkMode ? '#FFF' : '#111827', paddingVertical: 0, paddingHorizontal: 12 }]}
                        placeholder="Search by username or name..."
                        placeholderTextColor={isDarkMode ? "#888" : "#9ca3af"}
                        value={search}
                        onChangeText={setSearch}
                        autoCapitalize="none"
                    />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#10b981" />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        renderItem={renderUserItem}
                        keyExtractor={item => item.username}
                        className={`rounded-3xl`}
                        ListEmptyComponent={
                            search.trim() ? (
                                <Text style={[styles.emptyText, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#6b7280' }]}>No users found for your search.</Text>
                            ) : (
                                <Text style={[styles.emptyText, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#6b7280' }]}>Start typing to search for users.</Text>
                            )
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
        paddingTop: 60,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 6,
        height: 56,
        marginBottom: 16,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    loadingContainer: {
        marginTop: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        borderWidth: 1,
    },
    usernameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
    },
    fullName: {
        fontSize: 14,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    messageButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    messageButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    unfollowButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unfollowButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    followButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#2563eb',
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    followButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    followButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
});
