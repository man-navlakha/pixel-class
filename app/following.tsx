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
import { useTheme } from '../contexts/ThemeContext';
import { API_URLS, apiCall } from '../utils/api';

export default function FollowingScreen() {
    const { username } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<string>('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [username]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const meRes = await apiCall(API_URLS.ME, 'GET');
            const myUsername = meRes.username;
            setCurrentUser(myUsername);

            const targetUser = username || myUsername;

            // 1. Fetch Who targetUser is Following
            const followingListRes = await apiCall(API_URLS.FOLLOWING, 'POST', {
                username: targetUser
            });

            // 2. Fetch Who I am Following (to check status)
            const myFollowingRes = await apiCall(API_URLS.FOLLOWING, 'POST', {
                username: myUsername
            });

            const followingSet = new Set(myFollowingRes.map((u: any) => u.username));

            const processedUsers = (followingListRes || []).map((user: any) => ({
                ...user,
                is_following: followingSet.has(user.username)
            }));

            setUsers(processedUsers);

        } catch (error) {
            console.log("Error fetching following:", error);
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
                username: currentUser,
                ...payload
            });

            setUsers(prev => prev.map(u =>
                u.username === targetUser.username
                    ? { ...u, is_following: !isFollowing }
                    : u
            ));
        } catch (error) {
            Alert.alert("Error", "Action failed.");
        } finally {
            setActionLoading(null);
        }
    }, [currentUser]);

    const renderItem = useCallback(({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: isDarkMode ? '#1E1E1E' : '#f3f4f6' }]}
            activeOpacity={0.7}
            onPress={() => router.push(`/profile/${item.username}` as any)}
        >
            <Image
                source={{ uri: item.profile_pic || "https://i.pravatar.cc/150" }}
                style={[styles.avatar, { backgroundColor: isDarkMode ? '#333' : '#d1d5db' }]}
            />
            <View style={styles.info}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.username, { color: isDarkMode ? '#FFF' : '#111827' }]}>{item.username}</Text>
                    {verifiedUsernames.has(item.username) && (
                        <VerifiedBadge size={14} style={{ marginLeft: 4 }} />
                    )}
                </View>
                <Text style={[styles.fullname, { color: isDarkMode ? '#AAA' : '#6b7280' }]}>{item.first_name} {item.last_name}</Text>
            </View>

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
    ), [currentUser, actionLoading, handleToggleFollow, router, isDarkMode]);

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
            <Stack.Screen
                options={{
                    title: 'Following',
                    headerStyle: { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' },
                    headerTintColor: isDarkMode ? '#fff' : '#111827'
                }}
            />
            <StatusBar style={isDarkMode ? "light" : "dark"} animated />
            {loading ? (
                <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 30 }} />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.username}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={[styles.empty, { color: isDarkMode ? '#666' : '#9ca3af' }]}>Following no one yet.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16 },
    card: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 12, borderRadius: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    info: { flex: 1, marginLeft: 12 },
    username: { fontWeight: 'bold', fontSize: 16 },
    fullname: { fontSize: 14 },
    btn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, minWidth: 90, alignItems: 'center' },
    btnFollow: { backgroundColor: '#10b981' },
    btnUnfollow: { backgroundColor: '#ef4444' },
    btnText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
    empty: { textAlign: 'center', marginTop: 50, fontSize: 16 }
});
