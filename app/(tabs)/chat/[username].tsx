import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewToken
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VerifiedBadge from '../../../components/VerifiedBadge';
import { verifiedUsernames } from '../../../constants/verifiedAccounts';
import { API_URLS, apiCall } from '../../../utils/api';

export default function ChatRoomScreen() {
    const { username: receiverUsername } = useLocalSearchParams();
    const router = useRouter();

    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [currentUser, setCurrentUser] = useState<string>("");
    const [receiverProfile, setReceiverProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const wsRef = useRef<WebSocket | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const messagesRef = useRef<any[]>([]);

    // Keep ref synced for the viewability callback
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // --- INSTA LOGIC: Visibility Config ---
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 300,
    }).current;

    // --- INSTA LOGIC: Handle Seen ---
    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        viewableItems.forEach((viewToken) => {
            const item = viewToken.item;
            // If message is from THEM and I haven't seen it yet -> Mark Seen
            if (
                item.sender === receiverUsername &&
                !item.is_seen &&
                item.status !== 'seen'
            ) {
                sendSeenStatus(item.id);
            }
        });
    }).current;

    const sendSeenStatus = (messageId: number | string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "seen",
                message_id: messageId,
                seen_by: currentUser
            }));

            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, is_seen: true, status: 'seen' } : msg
            ));
        }
    };

    // --- Setup ---
    useEffect(() => {
        if (typeof receiverUsername === 'string') {
            setupChat();
            fetchReceiverProfile(receiverUsername);
        }
        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [receiverUsername]);

    const fetchReceiverProfile = async (username: string) => {
        try {
            const res = await apiCall(API_URLS.PROFILE_DETAILS, 'POST', { username });
            setReceiverProfile(res);
        } catch (error) {
            console.log("Error fetching profile", error);
        }
    };

    const setupChat = async () => {
        try {
            const meRes = await apiCall(API_URLS.ME, 'GET');
            setCurrentUser(meRes.username);

            const cleanBase = API_URLS.ME.replace('/api/me/', '');
            const historyUrl = `${cleanBase}/api/chatting/${receiverUsername}/`;

            try {
                const historyRes = await apiCall(historyUrl, 'GET');
                if (Array.isArray(historyRes)) {
                    // Normalize history data
                    const formatted = historyRes.map(m => ({
                        ...m,
                        status: m.is_seen ? 'seen' : 'sent'
                    }));
                    setMessages(formatted);
                }
            } catch (hErr) {
                console.log("History error", hErr);
            }

            const tokenRes = await apiCall(`${cleanBase}/api/ws-token/`, 'GET');
            const wsUrl = `wss://pixel-classes.onrender.com/ws/chat/?token=${tokenRes.ws_token}&receiver=${receiverUsername}`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => console.log("✅ Chat Connected");

            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);

                    if (data.type === "chat") {
                        setMessages(prev => [...prev, data]);
                        scrollToBottom();

                        // If I'm viewing the screen and they send a msg, mark it seen immediately
                        if (data.sender === receiverUsername) {
                            setTimeout(() => sendSeenStatus(data.id), 500);
                        }
                    } else if (data.type === "seen") {
                        // Update my message to show "Seen"
                        setMessages(prev => prev.map(msg => {
                            if (msg.id === data.message_id) {
                                return { ...msg, is_seen: true, status: 'seen' };
                            }
                            return msg;
                        }));
                    }
                } catch (err) {
                    console.error("WS Error", err);
                }
            };

            setLoading(false);
        } catch (e) {
            console.error("Setup Error", e);
            setLoading(false);
        }
    };

    const sendMessage = () => {
        if (!input.trim() || !wsRef.current) return;

        const payload = {
            type: "chat",
            message: input.trim(),
            sender: currentUser,
            receiver: receiverUsername,
        };

        const tempId = Date.now();
        setMessages(prev => [...prev, {
            ...payload,
            id: tempId,
            created_at: new Date().toISOString(),
            status: 'sending',
            is_seen: false
        }]);

        wsRef.current.send(JSON.stringify(payload));
        setInput("");
        scrollToBottom();
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    // --- RENDER MESSAGE (Your Design + Insta Logic) ---
    const renderMessage = ({ item, index }: { item: any, index: number }) => {
        const isMe = item.sender === currentUser;
        const prevMsg = messages[index - 1];
        const nextMsg = messages[index + 1];

        const isFirstOfGroup = !prevMsg || prevMsg.sender !== item.sender;
        const isLastOfGroup = !nextMsg || nextMsg.sender !== item.sender;

        // INSTA LOGIC: Check if this is the *last* message sent by me
        let isLastSentByMe = false;
        if (isMe) {
            // Find the index of the absolute last message I sent in the array
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].sender === currentUser) {
                    if (messages[i].id === item.id) isLastSentByMe = true;
                    break;
                }
            }
        }

        // YOUR DESIGN: Grouping Logic & Colors
        const bubbleStyle: any = {
            maxWidth: '75%',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 18,
            marginVertical: 1,
            // Your exact colors
            backgroundColor: isMe ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            alignSelf: isMe ? 'flex-end' : 'flex-start',
        };

        // Your exact border radius logic
        if (isMe) {
            if (isFirstOfGroup && !isLastOfGroup) {
                bubbleStyle.borderBottomRightRadius = 4;
            } else if (!isFirstOfGroup && !isLastOfGroup) {
                bubbleStyle.borderTopRightRadius = 4;
                bubbleStyle.borderBottomRightRadius = 4;
            } else if (!isFirstOfGroup && isLastOfGroup) {
                bubbleStyle.borderTopRightRadius = 4;
            }
        } else {
            if (isFirstOfGroup && !isLastOfGroup) {
                bubbleStyle.borderBottomLeftRadius = 4;
            } else if (!isFirstOfGroup && !isLastOfGroup) {
                bubbleStyle.borderTopLeftRadius = 4;
                bubbleStyle.borderBottomLeftRadius = 4;
            } else if (!isFirstOfGroup && isLastOfGroup) {
                bubbleStyle.borderTopLeftRadius = 4;
            }
        }

        if (isFirstOfGroup) bubbleStyle.marginTop = 8;

        const time = item.created_at
            ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

        const isSeen = item.is_seen === true || item.status === 'seen';

        return (
            <View>
                <View style={bubbleStyle}>
                    <Text style={styles.msgText}>{item.content || item.message}</Text>
                    {/* Your Time Design (inside bubble) */}
                    <View style={styles.metaContainer}>
                        <Text style={styles.msgTime}>{time}</Text>
                    </View>
                </View>

                {/* INSTA LOGIC: "Seen" Text outside bubble, only on last message */}
                {isMe && isLastSentByMe && isSeen && (
                    <Text style={styles.seenText}>Seen</Text>
                )}
                {/* Sending status */}
                {isMe && item.status === 'sending' && (
                    <Text style={styles.sendingText}>Sending...</Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.navigate('/(tabs)/chat')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.headerProfile}>
                    <Image
                        source={{ uri: receiverProfile?.profile_pic || "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png" }}
                        style={styles.avatar}
                    />
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.headerTitle}>{receiverUsername}</Text>
                            {verifiedUsernames.has(receiverUsername as string) && (
                                <VerifiedBadge size={16} style={{ marginLeft: 4 }} />
                            )}
                        </View>
                        <Text style={styles.lastSeen}>
                            {receiverProfile?.last_seen ? `last seen ${receiverProfile.last_seen}` : "last seen recently"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Messages */}
            {loading ? (
                <ActivityIndicator size="large" color="#10B981" style={{ flex: 1 }} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => item.id?.toString() || `msg-${index}`}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => scrollToBottom()}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                />
            )}

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <View style={styles.inputWrapper}>
                    <LinearGradient
                        colors={['transparent', '#111827']}
                        style={styles.inputGradient}
                        pointerEvents="none"
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Type a message..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                        />
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="image-outline" size={22} color="#9CA3AF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={sendMessage}
                            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                            disabled={!input.trim()}
                        >
                            <Ionicons name="send" size={18} color="#FFF" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#111827',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    backBtn: {
        padding: 8,
        marginRight: 4,
    },
    headerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#4B5563'
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600'
    },
    lastSeen: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 1
    },
    listContent: {
        padding: 16,
        paddingBottom: 20
    },
    msgText: {
        color: '#FFF',
        fontSize: 15,
        lineHeight: 21,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 4,
        opacity: 0.7
    },
    msgTime: {
        color: '#E5E7EB',
        fontSize: 10,
    },
    // New Styles for Insta-like status
    seenText: {
        alignSelf: 'flex-end',
        color: '#9CA3AF',
        fontSize: 11,
        marginBottom: 8,
        marginRight: 4,
    },
    sendingText: {
        alignSelf: 'flex-end',
        color: '#9CA3AF',
        fontSize: 11,
        marginBottom: 2,
        marginRight: 4,
        fontStyle: 'italic'
    },
    inputWrapper: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 10,
        backgroundColor: 'transparent',
        position: 'relative'
    },
    inputGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 120,
        zIndex: -1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(31, 41, 55, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 6,
        paddingLeft: 12,
    },
    input: {
        flex: 1,
        color: '#FFF',
        maxHeight: 100,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 8,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
        marginBottom: 2,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    sendBtnDisabled: {
        backgroundColor: '#374151',
        shadowOpacity: 0,
    }
});