import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VerifiedBadge from '../../components/VerifiedBadge';
import { verifiedUsernames } from '../../constants/verifiedAccounts';
import { API_URLS, apiCall } from '../../utils/api';

// Helper to format time similar to your web version
const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper to extract message text safely
const getLatestMessageText = (latest: any) => {
    if (!latest) return "";
    if (typeof latest === "string") return latest;
    return latest.text || latest.message || latest.content || "";
};

export default function ChatInboxScreen() {
    const router = useRouter();
    const wsRef = useRef<WebSocket | null>(null);

    const [currentUser, setCurrentUser] = useState<string>('');
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    // Reconnect WS when app comes to foreground
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "active") {
                connectWebSocket();
            } else if (nextAppState === "background") {
                wsRef.current?.close();
            }
        });
        return () => subscription.remove();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await apiCall(API_URLS.ME, 'GET');
            setCurrentUser(res.username);
            connectWebSocket(); // Connect after getting user
        } catch (error: any) {
            console.log("Error fetching user", error);
            setLoading(false);

            // If session expired, redirect to login
            if (error.message === 'Session expired') {
                router.replace('/auth/login');
            }
        }
    };

    const connectWebSocket = async () => {
        try {
            console.log("App has come to the foreground! Reconnecting WS...");

            // 1. Get Short-lived WS Token
            // Construct URL manually since apiCall wrapper might not handle this specific endpoint structure easily
            const tokenUrl = `${API_URLS.ME.replace('me/', '')}ws-token/`;
            const tokenRes = await apiCall(tokenUrl, 'GET');
            const wsToken = tokenRes.ws_token;

            if (!wsToken) return;

            // 2. Connect to WebSocket
            const wsUrl = `wss://pixel-classes.onrender.com/ws/message-inbox/?token=${wsToken}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => console.log("✅ Inbox WS Connected");

            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);

                    if (data.type === "inbox_data" && Array.isArray(data.inbox)) {
                        setConversations(processInboxData(data.inbox));
                        setLoading(false);
                        setRefreshing(false);
                    }

                    if (data.type === "inbox_update" && data.user) {
                        setConversations(prev => {
                            const updatedUser = {
                                ...data.user,
                                latest_message: data.latest_message,
                                unread_count: data.unread_count,
                                timestamp: data.timestamp
                            };
                            // Remove old entry and add new one to top
                            const others = prev.filter(c => c.username !== data.user.username);
                            return processInboxData([updatedUser, ...others]);
                        });
                    }
                } catch (err) {
                    console.error("WS Parse Error", err);
                }
            };

            ws.onerror = (e) => {
                console.log("WS Error", e);
                setLoading(false);
                setRefreshing(false);
            };

        } catch (error: any) {
            console.log("Auth check failed or user offline", error);
            setLoading(false);
            setRefreshing(false);

            // If session expired, redirect to login
            if (error.message === 'Session expired') {
                router.replace('/auth/login');
            }
        }
    };

    // Process and Sort Data (Unread first, then timestamp)
    const processInboxData = (data: any[]) => {
        return data.sort((a, b) => {
            const unreadA = a.unread_count > 0;
            const unreadB = b.unread_count > 0;
            if (unreadA && !unreadB) return -1;
            if (!unreadA && unreadB) return 1;

            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            return timeB - timeA;
        });
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (wsRef.current) wsRef.current.close();
        connectWebSocket();
    }, []);

    // Filter for Search
    const filteredConversations = useMemo(() => {
        if (!search.trim()) return conversations;
        return conversations.filter(c =>
            c.username.toLowerCase().includes(search.toLowerCase()) ||
            (c.first_name + " " + c.last_name).toLowerCase().includes(search.toLowerCase())
        );
    }, [conversations, search]);

    const renderItem = ({ item }: { item: any }) => {
        const isUnread = item.unread_count > 0;
        const msgText = getLatestMessageText(item.latest_message);

        // Determine status icons
        const isOwnMessage = item.latest_message?.sender_username === currentUser;
        const seenByOther = item.latest_message?.is_seen;

        return (
            <TouchableOpacity
                style={[styles.card, isUnread && styles.cardUnread]}
                onPress={() => router.push(`/chat/${item.username}` as any)}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: item.profile_pic || "https://i.pravatar.cc/150" }}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                    {item.is_online && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Text style={[styles.username, isUnread && styles.usernameUnread]} numberOfLines={1}>
                                {item.username}
                            </Text>
                            {verifiedUsernames.has(item.username) && (
                                <VerifiedBadge size={14} style={{ marginLeft: 4 }} />
                            )}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.time}>
                                {formatTime(item.timestamp || item.latest_message?.timestamp)}
                            </Text>
                            {isUnread && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {item.unread_count > 99 ? '99+' : item.unread_count}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.bottomRow}>
                        <Text
                            style={[styles.message, isUnread ? styles.messageUnread : styles.messageRead]}
                            numberOfLines={1}
                        >
                            {isOwnMessage ? "You: " : ""}
                            {msgText || "Start a conversation"}
                        </Text>

                        {isOwnMessage && (
                            <Ionicons
                                name={seenByOther ? "checkmark-done" : "checkmark"}
                                size={16}
                                color={seenByOther ? "#4ade80" : "#6B7280"}
                                style={{ marginLeft: 4 }}
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search conversations..."
                    placeholderTextColor="#6B7280"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.username}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubbles-outline" size={64} color="#333" />
                            <Text style={styles.emptyTitle}>No conversations yet</Text>
                            <Text style={styles.emptySubtitle}>Start chatting by searching for a user!</Text>
                            <TouchableOpacity
                                style={styles.findBtn}
                                onPress={() => router.push('/(tabs)/search')}
                            >
                                <Ionicons name="search" size={16} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.findBtnText}>Find Friends</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.95)'
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 45,
        borderWidth: 1,
        borderColor: '#374151'
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: '#FFF', fontSize: 15, height: '100%' },

    listContent: { paddingHorizontal: 16, paddingBottom: 80 },

    card: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
        backgroundColor: '#000', // Default bg
        borderWidth: 1,
        borderColor: 'transparent'
    },
    cardUnread: {
        backgroundColor: '#111827',
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6'
    },

    avatarContainer: { position: 'relative', marginRight: 12 },
    avatar: {
        width: 50, height: 50, borderRadius: 25,
        borderWidth: 1, borderColor: '#374151'
    },
    onlineDot: {
        position: 'absolute', bottom: 0, right: 0,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#10B981', borderWidth: 2, borderColor: '#000'
    },

    content: { flex: 1, justifyContent: 'center' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },

    username: { fontSize: 16, color: '#E5E7EB', fontWeight: '600' },
    usernameUnread: { color: '#FFF', fontWeight: '700' },

    time: { fontSize: 11, color: '#9CA3AF' },

    badge: {
        backgroundColor: '#3B82F6',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
        paddingHorizontal: 5
    },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    bottomRow: { flexDirection: 'row', alignItems: 'center' },
    message: { flex: 1, fontSize: 14, marginRight: 8 },
    messageRead: { color: '#6B7280' },
    messageUnread: { color: '#E5E7EB', fontWeight: '500' },

    emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
    emptySubtitle: { color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 24 },
    findBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#2563EB', paddingVertical: 10, paddingHorizontal: 20,
        borderRadius: 8
    },
    findBtnText: { color: '#FFF', fontWeight: '600' }
});