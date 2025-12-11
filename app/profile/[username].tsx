import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VerifiedBadge from '../../components/VerifiedBadge';
import { verifiedUsernames } from '../../constants/verifiedAccounts';
import { useTheme } from '../../contexts/ThemeContext';
import { API_URLS, apiCall } from '../../utils/api';

export default function ProfileScreen() {
    const { username } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<string>('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [suggestionLoading, setSuggestionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [username]);

    const fetchData = async () => {
        try {
            // 1. Get Me
            const me = await apiCall(API_URLS.ME, 'GET');
            setCurrentUser(me.username);

            // 2. Determine Target User
            let targetUser = username;
            if (Array.isArray(targetUser)) targetUser = targetUser[0];
            if (!targetUser) targetUser = me.username;

            // 3. Get Profile Details
            const details = await apiCall(API_URLS.PROFILE_DETAILS, 'POST', { username: targetUser });
            setProfile(details);

            // 4. Get Posts
            const postsRes = await apiCall(API_URLS.PROFILE_POSTS, 'POST', { username: targetUser });
            setPosts(postsRes.posts || []);

            // 5. Check Follow Status & Fetch Suggestions
            if (targetUser !== me.username) {
                setIsFollowing(false);

                const [targetFollowing, targetFollowers, myFollowing] = await Promise.all([
                    apiCall(API_URLS.FOLLOWING, 'POST', { username: targetUser }).catch(() => []),
                    apiCall(API_URLS.FOLLOWERS, 'POST', { username: targetUser }).catch(() => []),
                    apiCall(API_URLS.FOLLOWING, 'POST', { username: me.username }).catch(() => [])
                ]);

                const myFollowingSet = new Set(Array.isArray(myFollowing) ? myFollowing.map((u: any) => u.username) : []);
                setIsFollowing(myFollowingSet.has(targetUser));

                const suggestionsMap = new Map();
                const addToMap = (user: any) => {
                    if (user.username !== me.username && !myFollowingSet.has(user.username)) {
                        suggestionsMap.set(user.username, user);
                    }
                };

                const availableUsers = new Map();
                if (Array.isArray(targetFollowing)) targetFollowing.forEach((u: any) => availableUsers.set(u.username, u));
                if (Array.isArray(targetFollowers)) targetFollowers.forEach((u: any) => availableUsers.set(u.username, u));

                const verifiedArray = Array.from(verifiedUsernames);
                const missingVerified: string[] = [];

                for (const vUser of verifiedArray) {
                    if (vUser === me.username || myFollowingSet.has(vUser)) continue;
                    if (availableUsers.has(vUser)) {
                        suggestionsMap.set(vUser, availableUsers.get(vUser));
                    } else {
                        missingVerified.push(vUser);
                    }
                }

                if (missingVerified.length > 0) {
                    const verifiedPromises = missingVerified.map(vUsername =>
                        apiCall(API_URLS.PROFILE_DETAILS, 'POST', { username: vUsername }).catch(() => null)
                    );
                    const fetchedVerified = await Promise.all(verifiedPromises);
                    fetchedVerified.forEach((u: any) => {
                        if (u && u.username) suggestionsMap.set(u.username, u);
                    });
                }

                if (Array.isArray(targetFollowing)) targetFollowing.forEach(addToMap);
                if (Array.isArray(targetFollowers)) targetFollowers.forEach(addToMap);

                setSuggestions(Array.from(suggestionsMap.values()));
            } else {
                setSuggestions([]);
            }

        } catch (error: any) {
            console.error("Profile Fetch Error:", error.message || error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!profile) return;
        const targetUser = profile.username;
        const action = isFollowing ? API_URLS.UNFOLLOW : API_URLS.FOLLOW;
        const payload = isFollowing ? { unfollow_username: targetUser } : { follow_username: targetUser };

        try {
            await apiCall(action, 'POST', {
                username: currentUser,
                ...payload
            });
            setIsFollowing(!isFollowing);
            Alert.alert("Success", isFollowing ? "Unfollowed" : "Following");
        } catch (error) {
            Alert.alert("Error", "Action failed");
        }
    };

    const handleSuggestionFollow = async (suggestedUser: any) => {
        setSuggestionLoading(suggestedUser.username);
        try {
            await apiCall(API_URLS.FOLLOW, 'POST', {
                username: currentUser,
                follow_username: suggestedUser.username
            });
            setSuggestions(prev => prev.filter(u => u.username !== suggestedUser.username));
            Alert.alert("Success", `You are now following ${suggestedUser.username}`);
        } catch (error) {
            Alert.alert("Error", "Failed to follow user");
        } finally {
            setSuggestionLoading(null);
        }
    };

    const renderHeader = () => {
        if (!profile) return null;
        const isOwnProfile = profile.username === currentUser;

        return (
            <View style={[styles.header, { borderBottomColor: isDarkMode ? '#1f2937' : '#e5e7eb' }]}>
                <Image
                    source={{ uri: profile.profile_pic || "https://i.pravatar.cc/150" }}
                    style={styles.profileImage}
                />
                <View style={styles.usernameRow}>
                    <Text style={[styles.username, { color: isDarkMode ? '#FFF' : '#111827' }]}>{profile.username}</Text>
                    {verifiedUsernames.has(profile.username) && (
                        <VerifiedBadge size={24} style={{ marginLeft: 6 }} />
                    )}
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: isDarkMode ? '#FFF' : '#111827' }]}>{posts.length}</Text>
                        <Text style={[styles.statLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Posts</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={() => router.push({
                            pathname: '/followers',
                            params: { username: profile.username }
                        } as any)}
                    >
                        <Text style={[styles.statNumber, { color: isDarkMode ? '#FFF' : '#111827' }]}>{profile.follower_count || 0}</Text>
                        <Text style={[styles.statLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Followers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={() => router.push({
                            pathname: '/following',
                            params: { username: profile.username }
                        } as any)}
                    >
                        <Text style={[styles.statNumber, { color: isDarkMode ? '#FFF' : '#111827' }]}>{profile.following_count || 0}</Text>
                        <Text style={[styles.statLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Following</Text>
                    </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                    {isOwnProfile ? (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: isDarkMode ? '#1f2937' : '#e5e7eb' }]}
                                onPress={() => router.push('/profile/edit' as any)}
                            >
                                <Text style={[styles.actionButtonText, { color: isDarkMode ? '#FFF' : '#111827' }]}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: isDarkMode ? '#1f2937' : '#e5e7eb' }]}
                                onPress={() => router.push('/auth/logout' as any)}
                            >
                                <Text style={[styles.actionButtonText, { color: isDarkMode ? '#FFF' : '#111827' }]}>Logout</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[styles.followButton, isFollowing ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: isDarkMode ? '#FFF' : '#111827' } : { backgroundColor: '#10b981' }]}
                            onPress={handleFollowToggle}
                        >
                            <Text style={[styles.followButtonText, { color: isFollowing ? (isDarkMode ? '#FFF' : '#111827') : '#FFF' }]}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Suggestions Section */}
                {!isOwnProfile && suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        <View style={styles.suggestionsHeader}>
                            <Text style={[styles.suggestionsTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>Suggested for you</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={suggestions}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.username}
                            renderItem={({ item }) => (
                                <View style={[styles.suggestionCard, { backgroundColor: isDarkMode ? '#000' : '#f3f4f6', borderColor: isDarkMode ? '#1f2937' : '#e5e7eb' }]}>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setSuggestions(prev => prev.filter(u => u.username !== item.username))}
                                    >
                                        <Ionicons name="close" size={16} color={isDarkMode ? "#888" : "#6b7280"} />
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => router.push(`/profile/${item.username}` as any)}>
                                        <Image
                                            source={{ uri: item.profile_pic || `https://i.pravatar.cc/150?u=${item.username}` }}
                                            style={styles.suggestionImage}
                                        />
                                    </TouchableOpacity>

                                    <View style={styles.suggestionUsernameRow}>
                                        <Text style={[styles.suggestionUsername, { color: isDarkMode ? '#FFF' : '#111827' }]} numberOfLines={1}>{item.username}</Text>
                                        {verifiedUsernames.has(item.username) && (
                                            <VerifiedBadge size={12} style={{ marginLeft: 4 }} />
                                        )}
                                    </View>

                                    <Text style={[styles.suggestionName, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]} numberOfLines={1}>
                                        {item.first_name} {item.last_name}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.suggestionFollowButton}
                                        onPress={() => handleSuggestionFollow(item)}
                                        disabled={suggestionLoading === item.username}
                                    >
                                        {suggestionLoading === item.username ? (
                                            <ActivityIndicator size="small" color="#10b981" />
                                        ) : (
                                            <Text style={styles.suggestionFollowText}>Follow</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                            contentContainerStyle={{ paddingHorizontal: 4 }}
                        />
                    </View>
                )}

                <Text style={[styles.notesTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>Notes Uploaded</Text>
            </View>
        );
    };

    const renderPost = ({ item }: { item: any }) => (
        <View style={[styles.postCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#f3f4f6' }]}>
            <Ionicons name="document-text" size={24} color="#10b981" />
            <View style={styles.postContent}>
                <Text style={[styles.postTitle, { color: isDarkMode ? '#FFF' : '#111827' }]} numberOfLines={1}>{item.contant || "Note"}</Text>
                <Text style={[styles.postSubtitle, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{item.sub} • Sem {item.sem}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#f9fafb' }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            </SafeAreaView>
        );
    }

    const isOwnProfile = profile?.username === currentUser;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#f9fafb' }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="auto" animated />

            {/* Settings Icon - Only show on own profile */}
            {isOwnProfile && (
                <TouchableOpacity
                    style={[styles.settingsButton, { backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6', borderColor: isDarkMode ? '#374151' : '#d1d5db' }]}
                    onPress={() => router.push('/settings' as any)}
                >
                    <Ionicons name="settings-outline" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                </TouchableOpacity>
            )}

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: isDarkMode ? '#6b7280' : '#9ca3af' }]}>No notes uploaded yet.</Text>
                }
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
            />
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
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        marginBottom: 10,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#10b981',
    },
    usernameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 32,
        borderRadius: 20,
    },
    actionButtonText: {
        fontWeight: '600',
    },
    followButton: {
        paddingVertical: 10,
        paddingHorizontal: 32,
        borderRadius: 20,
    },
    followButtonText: {
        fontWeight: '600',
    },
    suggestionsContainer: {
        width: '100%',
        marginBottom: 24,
    },
    suggestionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    suggestionsTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    seeAllText: {
        color: '#10b981',
        fontSize: 14,
    },
    suggestionCard: {
        width: 140,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
    suggestionImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
    },
    suggestionUsernameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    suggestionUsername: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    suggestionName: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 12,
    },
    suggestionFollowButton: {
        backgroundColor: 'transparent',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#10b981',
        width: '100%',
        alignItems: 'center',
    },
    suggestionFollowText: {
        color: '#10b981',
        fontSize: 12,
        fontWeight: '600',
    },
    notesTitle: {
        fontSize: 18,
        fontWeight: '600',
        alignSelf: 'flex-start',
        marginTop: 10,
        width: '100%',
    },
    postCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        marginHorizontal: 20,
    },
    postContent: {
        marginLeft: 12,
        flex: 1,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    postSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    settingsButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
    },
});
