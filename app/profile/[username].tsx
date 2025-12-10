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
import { API_URLS, apiCall } from '../../utils/api';

export default function ProfileScreen() {
    const { username } = useLocalSearchParams();
    const router = useRouter();

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
                setIsFollowing(false); // Default

                // Fetch Suggestions Logic:
                // 1. Get Lists: Target Following, Target Followers, My Following
                const [targetFollowing, targetFollowers, myFollowing] = await Promise.all([
                    apiCall(API_URLS.FOLLOWING, 'POST', { username: targetUser }).catch(() => []),
                    apiCall(API_URLS.FOLLOWERS, 'POST', { username: targetUser }).catch(() => []),
                    apiCall(API_URLS.FOLLOWING, 'POST', { username: me.username }).catch(() => [])
                ]);

                const myFollowingSet = new Set(Array.isArray(myFollowing) ? myFollowing.map((u: any) => u.username) : []);

                // Update Follow Status
                setIsFollowing(myFollowingSet.has(targetUser));

                const suggestionsMap = new Map();

                // Helper to add to map
                const addToMap = (user: any) => {
                    if (user.username !== me.username && !myFollowingSet.has(user.username)) {
                        suggestionsMap.set(user.username, user);
                    }
                };

                // Create a pool of available user objects from lists to avoid re-fetching
                const availableUsers = new Map();
                if (Array.isArray(targetFollowing)) targetFollowing.forEach((u: any) => availableUsers.set(u.username, u));
                if (Array.isArray(targetFollowers)) targetFollowers.forEach((u: any) => availableUsers.set(u.username, u));

                // A. Process Verified Users (Priority)
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

                // Fetch details for missing verified users
                if (missingVerified.length > 0) {
                    const verifiedPromises = missingVerified.map(vUsername =>
                        apiCall(API_URLS.PROFILE_DETAILS, 'POST', { username: vUsername })
                            .catch(() => null)
                    );
                    const fetchedVerified = await Promise.all(verifiedPromises);
                    fetchedVerified.forEach((u: any) => {
                        if (u && u.username) suggestionsMap.set(u.username, u);
                    });
                }

                // B. Add Target Following
                if (Array.isArray(targetFollowing)) targetFollowing.forEach(addToMap);

                // C. Add Target Followers
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
            // Remove from suggestions list
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
            <View style={styles.header}>
                <Image
                    source={{ uri: profile.profile_pic || "https://i.pravatar.cc/150" }}
                    style={styles.avatar}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={styles.name}>{profile.username}</Text>
                    {verifiedUsernames.has(profile.username) && (
                        <VerifiedBadge size={24} style={{ marginLeft: 6 }} />
                    )}
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statVal}>{posts.length}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.stat}
                        onPress={() => router.push({
                            pathname: '/followers',
                            params: { username: profile.username }
                        } as any)}
                    >
                        <Text style={styles.statVal}>{profile.follower_count || 0}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.stat}
                        onPress={() => router.push({
                            pathname: '/following',
                            params: { username: profile.username }
                        } as any)}
                    >
                        <Text style={styles.statVal}>{profile.following_count || 0}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                    {isOwnProfile ? (
                        <>
                            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/profile/edit' as any)}>
                                <Text style={styles.btnText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/auth/logout' as any)}>
                                <Text style={styles.btnText}>Logout</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[styles.btnPrimary, isFollowing && styles.btnOutline]}
                            onPress={handleFollowToggle}
                        >
                            <Text style={[styles.btnTextPrimary, isFollowing && styles.btnTextOutline]}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Suggestions Section */}
                {!isOwnProfile && suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        <View style={styles.suggestionsHeader}>
                            <Text style={styles.suggestionsTitle}>Suggested for you</Text>
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
                                <View style={styles.suggestionCard}>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setSuggestions(prev => prev.filter(u => u.username !== item.username))}
                                    >
                                        <Ionicons name="close" size={16} color="#888" />
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => router.push(`/profile/${item.username}` as any)}>
                                        <Image
                                            source={{ uri: item.profile_pic || `https://i.pravatar.cc/150?u=${item.username}` }}
                                            style={styles.suggestionAvatar}
                                        />
                                    </TouchableOpacity>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
                                        <Text style={styles.suggestionUsername} numberOfLines={1}>{item.username}</Text>
                                        {verifiedUsernames.has(item.username) && (
                                            <VerifiedBadge size={12} style={{ marginLeft: 4 }} />
                                        )}
                                    </View>

                                    <Text style={styles.suggestionName} numberOfLines={1}>
                                        {item.first_name} {item.last_name}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.suggestionFollowBtn}
                                        onPress={() => handleSuggestionFollow(item)}
                                        disabled={suggestionLoading === item.username}
                                    >
                                        {suggestionLoading === item.username ? (
                                            <ActivityIndicator size="small" color="#4ade80" />
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

                <Text style={styles.sectionTitle}>Notes Uploaded</Text>
            </View>
        );
    };

    const renderPost = ({ item }: { item: any }) => (
        <View style={styles.postCard}>
            <Ionicons name="document-text" size={24} color="#4ade80" />
            <View style={styles.postContent}>
                <Text style={styles.postTitle} numberOfLines={1}>{item.contant || "Note"}</Text>
                <Text style={styles.postSub}>{item.sub} • Sem {item.sem}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#4ade80" />
            </SafeAreaView>
        );
    }

    const isOwnProfile = profile?.username === currentUser;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" animated />

            {/* Settings Icon - Only show on own profile */}
            {isOwnProfile && (
                <TouchableOpacity
                    style={styles.settingsIcon}
                    onPress={() => router.push('/settings' as any)}
                >
                    <Ionicons name="settings-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            )}

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No notes uploaded yet.</Text>
                }
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    listContent: { paddingBottom: 20 },
    header: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 10 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12, borderWidth: 2, borderColor: '#4ade80' },
    name: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 24 },
    stat: { alignItems: 'center' },
    statVal: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    statLabel: { color: '#888', fontSize: 12 },
    actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    btnPrimary: { backgroundColor: '#4ade80', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20 },
    btnSecondary: { backgroundColor: '#333', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20 },
    btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFF' },
    btnText: { color: '#FFF', fontWeight: '600' },
    btnTextPrimary: { color: '#FFF', fontWeight: '600' },
    btnTextOutline: { color: '#FFF' },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '600', alignSelf: 'flex-start', marginTop: 10, width: '100%' },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
    postCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 12, marginHorizontal: 20 },
    postContent: { marginLeft: 12, flex: 1 },
    postTitle: { color: '#FFF', fontSize: 16, fontWeight: '500' },
    postSub: { color: '#888', fontSize: 12, marginTop: 2 },

    // Suggestions Styles
    suggestionsContainer: { width: '100%', marginBottom: 24 },
    suggestionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
    suggestionsTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    seeAllText: { color: '#4ade80', fontSize: 14 },
    suggestionCard: {
        width: 140,
        backgroundColor: '#000',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#333',
        position: 'relative'
    },
    closeButton: { position: 'absolute', top: 8, right: 8, zIndex: 1 },
    suggestionAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
    suggestionUsername: { color: '#FFF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
    suggestionName: { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 12 },
    suggestionFollowBtn: {
        backgroundColor: 'transparent',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#4ade80',
        width: '100%',
        alignItems: 'center'
    },
    suggestionFollowText: { color: '#4ade80', fontSize: 12, fontWeight: '600' },
    settingsIcon: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: '#1E1E1E',
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
});
