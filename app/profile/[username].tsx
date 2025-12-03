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

            // 5. Check Follow Status
            if (targetUser !== me.username) {
                // This logic might need adjustment based on your specific backend implementation
                // For now, we default to false as we can't easily check "am I following them" 
                // without iterating the entire follower list or having a specific endpoint.
                setIsFollowing(false);
            }

        } catch (error: any) {
            console.error("Profile Fetch Error:", error.message || error);
            // Optional: Alert.alert("Error", "Failed to load profile data.");
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

    const renderHeader = () => {
        if (!profile) return null;
        const isOwnProfile = profile.username === currentUser;

        return (
            <View style={styles.header}>
                <Image
                    source={{ uri: profile.profile_pic || "https://i.pravatar.cc/150" }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{profile.username}</Text>

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
                        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/auth/logout' as any)}>
                            <Text style={styles.btnText}>Logout</Text>
                        </TouchableOpacity>
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

                <Text style={styles.sectionTitle}>Notes Uploaded</Text>
            </View>
        );
    };

    const renderPost = ({ item }: { item: any }) => (
        <View style={styles.postCard}>
            <Ionicons name="document-text" size={24} color="#4A90E2" />
            <View style={styles.postContent}>
                <Text style={styles.postTitle} numberOfLines={1}>{item.contant || "Note"}</Text>
                <Text style={styles.postSub}>{item.sub} • Sem {item.sem}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

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
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12, borderWidth: 2, borderColor: '#4A90E2' },
    name: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 24 },
    stat: { alignItems: 'center' },
    statVal: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    statLabel: { color: '#888', fontSize: 12 },
    actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    btnPrimary: { backgroundColor: '#4A90E2', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20 },
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
});
