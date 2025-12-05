import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URLS, apiCall } from '../utils/api';

// Dynamically import Notifications only on native to avoid Web warnings
let Notifications: any;
if (Platform.OS !== 'web') {
    try {
        Notifications = require('expo-notifications');
        // Configure Notifications
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            }),
        });
    } catch (e) {
        console.warn('Failed to load expo-notifications:', e);
    }
}

// Tab Item Component for individual animation control
const TabItem = ({ tab, isActive, onPress }: { tab: any, isActive: boolean, onPress: () => void }) => {
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    useEffect(() => {
        if (isActive) {
            translateY.value = withSpring(-5, { damping: 12 });
            scale.value = withSpring(1.1);
        } else {
            translateY.value = withSpring(0);
            scale.value = withSpring(1);
        }
    }, [isActive]);

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { scale: scale.value }
            ],
        };
    });

    const animatedLabelStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isActive ? 1 : 0.6, { duration: 200 }),
            transform: [
                { scale: withTiming(isActive ? 1 : 0.9) }
            ]
        };
    });

    return (
        <Pressable
            onPress={onPress}
            style={styles.tabItem}
        >
            <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                {isActive && (
                    <View style={styles.activeBackground} />
                )}
                <Ionicons
                    name={isActive ? (tab.icon as any) : `${tab.icon}-outline` as any}
                    size={24}
                    color={isActive ? '#FFFFFF' : '#A0A0A0'}
                />
                {tab.badge ? (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {tab.badge > 99 ? '99+' : tab.badge}
                        </Text>
                    </View>
                ) : null}
            </Animated.View>
            <Animated.Text style={[styles.label, animatedLabelStyle, isActive && styles.activeLabel]}>
                {tab.name}
            </Animated.Text>
        </Pressable>
    );
};

export default function CustomTabBar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const [unreadCount, setUnreadCount] = useState(0);
    const wsRef = useRef<WebSocket | null>(null);
    const appState = useRef(AppState.currentState);

    // FIX 2: Changed type to 'any' to handle the conflict between Node.Timeout and number
    const reconnectInterval = useRef<any>(null);

    useEffect(() => {
        if (Platform.OS !== 'web') {
            registerForPushNotificationsAsync();
        }
        initializeConnection();

        // Handle App State changes (background/foreground)
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('App has come to the foreground! Reconnecting WS...');
                initializeConnection();
            } else if (nextAppState.match(/inactive|background/)) {
                console.log('App going to background. Closing WS...');
                // Optional: Keep it open for a bit or rely on OS to kill it
                // wsRef.current?.close(); 
            }

            appState.current = nextAppState;
        });

        // Auto-reload connection every 30 seconds to ensure liveness
        reconnectInterval.current = setInterval(() => {
            if (wsRef.current?.readyState !== WebSocket.OPEN) {
                console.log("Auto-reconnecting WS...");
                initializeConnection();
            }
        }, 30000);

        return () => {
            subscription.remove();
            if (wsRef.current) wsRef.current.close();
            if (reconnectInterval.current) clearInterval(reconnectInterval.current);
        };
    }, []);

    const registerForPushNotificationsAsync = async () => {
        if (Platform.OS === 'web' || !Notifications) return;

        try {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }
        } catch (e) {
            console.log("Error requesting notification permissions", e);
        }
    };

    const initializeConnection = async () => {
        try {
            // 1. Ensure we are authenticated first
            await apiCall(API_URLS.ME, 'GET');

            // 2. Connect WS
            connectWebSocket();
        } catch (error) {
            console.log("Auth check failed or user offline", error);
        }
    };

    const connectWebSocket = async () => {
        try {
            // 1. Fetch WS Token
            const tokenUrl = `${API_URLS.ME.replace('me/', '')}ws-token/`;
            const res = await apiCall(tokenUrl, 'GET');
            const wsToken = res.ws_token;

            if (!wsToken) {
                console.log("No WS Token found, skipping connection");
                return;
            }

            // 2. Connect
            const wsUrl = `wss://pixel-classes.onrender.com/ws/notifications/?token=${wsToken}`;

            // Close existing connection if any
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                // Already connected
                return;
            }
            if (wsRef.current) wsRef.current.close();

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("✅ Notification WS Connected");
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "total_unseen_count") {
                        const newCount = data.total_unseen_count || 0;

                        // Trigger notification if count increased
                        setUnreadCount(prev => {
                            if (newCount > prev) {
                                sendLocalNotification(newCount);
                            }
                            return newCount;
                        });
                    }
                } catch (err) {
                    console.error("WS Message Parse Error:", err);
                }
            };

            ws.onerror = (e) => {
                console.log("Notification WS Error", e);
            };

            ws.onclose = () => {
                console.log("Notification WS Closed");
            };

        } catch (error) {
            console.log("Failed to setup Notification WS", error);
        }
    };

    const sendLocalNotification = async (count: number) => {
        if (Platform.OS === 'web' || !Notifications) return;

        // Don't notify if user is already on the chat screen
        if (pathname.startsWith('/chat')) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "New Message",
                body: `You have ${count} unread message${count > 1 ? 's' : ''}`,
                data: { url: '/(tabs)/chat' },
            },
            trigger: null, // Show immediately
        });
    };

    const tabs = [
        { name: 'Home', icon: 'home', route: '/(tabs)' },
        {
            name: 'Chat',
            icon: 'chatbubble',
            route: '/(tabs)/chat',
            badge: unreadCount > 0 ? unreadCount : undefined
        },
        { name: 'Search', icon: 'search', route: '/(tabs)/search' },
        { name: 'Profile', icon: 'person', route: '/(tabs)/profile' },
    ];

    const handlePress = (route: string) => {
        router.push(route as any);
    };

    const isActive = (route: string) => {
        if (route === '/(tabs)') {
            return pathname === '/' || pathname === '/index';
        }
        const cleanRoute = route.replace('/(tabs)', '');
        return pathname.startsWith(cleanRoute);
    };

    // Hide tab bar on Chat Detail screen
    if (pathname.startsWith('/chat/')) {
        return null;
    }

    return (
        <View style={[styles.containerWrapper, { paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.container}>
                <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
                    <View style={styles.tabBar}>
                        {tabs.map((tab, index) => (
                            <TabItem
                                key={index}
                                tab={tab}
                                isActive={isActive(tab.route)}
                                onPress={() => handlePress(tab.route)}
                            />
                        ))}
                    </View>
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 35,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 10,
    },
    blurContainer: {
        borderRadius: 35,
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 75,
        paddingHorizontal: 15,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    iconContainer: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    activeBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#4A90E2',
        borderRadius: 22,
        opacity: 0.2,
        transform: [{ scale: 1.2 }],
    },
    label: {
        fontSize: 10,
        color: '#A0A0A0',
        fontWeight: '500',
    },
    activeLabel: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#1E1E1E',
        zIndex: 10,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 3,
    },
});