import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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
import { API_URLS, apiCall } from '../../utils/api';

export default function SearchScreen() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [usernamec, setUsernamec] = useState<string | null>(null);
    const [followingUsernames, setFollowingUsernames] = useState<string[]>([]);

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
                // Assuming res is an array based on your web code structure
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
        if (!usernamec || !search.trim()) {
            setUsers([]);
            return;
        }

        if (search.trim() === usernamec) {
            setUsers([]);
            return;
        }

        let active = true;

        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Manually constructing query param since apiCall wrapper logic
                const endpoint = `${API_URLS.USER_SEARCH}?username=${search}`;
                const response = await apiCall(endpoint, 'GET');

                if (!active) return;

                if (Array.isArray(response)) {
                    const filtered = response
                        .filter((user: any) => user.username !== usernamec)
                        .filter((user: any) =>
                            user.username.toLowerCase().includes(search.toLowerCase()) ||
                            (user.first_name && user.first_name.toLowerCase().includes(search.toLowerCase())) ||
                            (user.last_name && user.last_name.toLowerCase().includes(search.toLowerCase()))
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

        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500); // 500ms debounce to match web feel

        return () => {
            active = false;
            clearTimeout(timeoutId);
        };
    }, [search, usernamec, followingUsernames]);

    // --- Actions ---
    const follow = async (follow_username: string) => {
        setActionLoading(follow_username);
        try {
            const response = await apiCall(API_URLS.FOLLOW, 'POST', {
                username: usernamec,
                follow_username,
            });
            if (response.message) {
                // Alert.alert("Success", `You are now following ${follow_username}`);
                setUsers(prev => prev.map(u => u.username === follow_username ? { ...u, is_following: true } : u));
                // Update local following list tracking
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
                // Alert.alert("Success", `Unfollowed ${unfollow_username}`);
                setUsers(prev => prev.map(u => u.username === unfollow_username ? { ...u, is_following: false } : u));
                // Update local following list tracking
                setFollowingUsernames(prev => prev.filter(u => u !== unfollow_username));
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Error unfollowing user.");
        } finally {
            setActionLoading(null);
        }
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <View style={styles.userCard}>
            <TouchableOpacity
                style={styles.userInfo}
                onPress={() => router.push(`/profile/${item.username}` as any)}
            >
                <Image
                    source={{ uri: item.profile_pic || `https://i.pravatar.cc/150?u=${item.username}` }}
                    style={styles.avatar}
                />
                <View>
                    <View style={styles.nameRow}>
                        <Text style={styles.username}>{item.username}</Text>
                        {verifiedUsernames.has(item.username) && (
                            <VerifiedBadge size={16} style={{ marginLeft: 4 }} />
                        )}
                    </View>
                    <Text style={styles.fullName}>{item.first_name} {item.last_name}</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.actions}>
                {item.is_following ? (
                    <>
                        <TouchableOpacity
                            style={styles.btnMessage}
                            onPress={() => router.push(`/chat/${item.username}` as any)}
                        >
                            <Text style={styles.btnText}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.btnUnfollow}
                            onPress={() => unfollow(item.username)}
                            disabled={actionLoading === item.username}
                        >
                            {actionLoading === item.username ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.btnText}>Unfollow</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={styles.btnFollow}
                        onPress={() => follow(item.username)}
                        disabled={actionLoading === item.username}
                    >
                        {actionLoading === item.username ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="person-add" size={16} color="#FFF" style={{ marginRight: 4 }} />
                                <Text style={styles.btnText}>Follow</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Text style={styles.headerTitle}>Find Users</Text>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by username or name..."
                    placeholderTextColor="#888"
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                />
            </View>

            {loading ? (
                <View style={{ marginTop: 20 }}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.username}
                    ListEmptyComponent={
                        search.trim() ? (
                            <Text style={styles.emptyText}>No users found for your search.</Text>
                        ) : (
                            <Text style={styles.emptyText}>Start typing to search for users.</Text>
                        )
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 16, paddingTop: 60 },
    headerTitle: { color: '#FFF', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, color: '#FFF', fontSize: 16, height: '100%' },

    userCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    nameRow: { flexDirection: 'row', alignItems: 'center' },
    username: { color: '#FFF', fontWeight: '600', fontSize: 16 },
    fullName: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },

    actions: { flexDirection: 'row', gap: 8 },
    btnMessage: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
    btnUnfollow: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.8)', minWidth: 80, alignItems: 'center', justifyContent: 'center' },
    btnFollow: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#2563EB', minWidth: 90, alignItems: 'center', justifyContent: 'center' },
    btnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

    emptyText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 40, fontSize: 16 },
});
