import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import VerifiedBadge from '../components/VerifiedBadge';
import { verifiedUsernames } from '../constants/verifiedAccounts';
import { API_URLS, apiCall } from '../utils/api';

export default function FollowersScreen() {
    const { username } = useLocalSearchParams(); // The user whose followers we are viewing
    const router = useRouter();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, [username]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Get Me (Current Logged In User)
            const meRes = await apiCall(API_URLS.ME, 'GET');
            const myUsername = meRes.username;
            setCurrentUser(myUsername);

            // Target user to fetch lists for (default to me if not provided)
            const targetUser = username || myUsername;

            // 2. Fetch the Target User's Followers
            // "Pass the username parameter to fetch specific user's followers"
            const followersRes = await apiCall(API_URLS.FOLLOWERS, 'POST', {
                username: targetUser
            });

            // 3. Fetch My Following List (to check status)
            // "Get current user's following list to determine follow status"
            const myFollowingRes = await apiCall(API_URLS.FOLLOWING, 'POST', {
                username: myUsername
            });

            // 4. Merge Data
            // Create a Set of usernames I follow for O(1) lookup
            const followingSet = new Set(myFollowingRes.map((u: any) => u.username));

            const processedUsers = (followersRes || []).map((user: any) => ({
                ...user,
                is_following: followingSet.has(user.username)
            }));

            setUsers(processedUsers);

        } catch (error) {
            console.log("Error fetching followers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFollow = useCallback(async (targetUser: any) => {
        setActionLoading(targetUser.username);
        try {
            const isFollowing = targetUser.is_following;
            const endpoint = isFollowing ? API_URLS.UNFOLLOW : API_URLS.FOLLOW;
            const payload = isFollowing
                ? { unfollow_username: targetUser.username }
                : { follow_username: targetUser.username };

            await apiCall(endpoint, 'POST', {
                username: currentUser, // action performed by me
                ...payload
            });

            // Update local state UI immediately
            setUsers(prev => prev.map(u =>
                u.username === targetUser.username
                    ? { ...u, is_following: !isFollowing }
                    : u
            ));

        } catch (error) {
            Alert.alert("Error", "Action failed. Please try again.");
        } finally {
            setActionLoading(null);
        }
    }, [currentUser]);

    const renderItem = useCallback(({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(`/profile/${item.username}` as any)}
        >
            <Image
                source={{ uri: item.profile_pic || "https://i.pravatar.cc/150" }}
                style={styles.avatar}
            />
            <View style={styles.info}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.username}>{item.username}</Text>
                    {verifiedUsernames.has(item.username) && (
                        <VerifiedBadge size={14} style={{ marginLeft: 4 }} />
                    )}
                </View>
                <Text style={styles.fullname}>{item.first_name} {item.last_name}</Text>
            </View>

            {/* Don't show follow button for yourself */}
            {item.username !== currentUser && (
                <TouchableOpacity
                    style={[
                        styles.btn,
                        item.is_following ? styles.btnUnfollow : styles.btnFollow
                    ]}
                    onPress={() => handleToggleFollow(item)}
                    disabled={actionLoading === item.username}
                >
                    {actionLoading === item.username ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.btnText}>
                            {item.is_following ? "Unfollow" : "Follow"}
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    ), [currentUser, actionLoading, handleToggleFollow, router]);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Followers',
                    headerStyle: { backgroundColor: '#121212' },
                    headerTintColor: '#fff'
                }}
            />
            <StatusBar style="light" />

            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 30 }} />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.username}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.empty}>No followers found.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    list: { padding: 16 },
    card: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#1E1E1E', padding: 12, borderRadius: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' },
    info: { flex: 1, marginLeft: 12 },
    username: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    fullname: { color: '#AAA', fontSize: 14 },
    btn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, minWidth: 90, alignItems: 'center' },
    btnFollow: { backgroundColor: '#4A90E2' },
    btnUnfollow: { backgroundColor: '#FF5252' },
    btnText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
    empty: { color: '#666', textAlign: 'center', marginTop: 50, fontSize: 16 }
});
