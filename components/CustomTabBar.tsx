import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
                {tab.badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{tab.badge}</Text>
                    </View>
                )}
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

    const tabs = [
        { name: 'Home', icon: 'home', route: '/(tabs)' },
        { name: 'Chat', icon: 'chatbubble', route: '/(tabs)/chat', badge: 1 },
        { name: 'Search', icon: 'search', route: '/(tabs)/search' },
        { name: 'Profile', icon: 'person', route: '/(tabs)/profile' },
    ];

    const handlePress = (route: string) => {
        router.push(route as any);
    };

    const isActive = (route: string) => {
        // Special case for Home
        if (route === '/(tabs)') {
            return pathname === '/' || pathname === '/index';
        }
        const cleanRoute = route.replace('/(tabs)', '');

        // Check if pathname starts with the clean route
        // This handles nested routes like /profile/edit keeping the Profile tab active
        return pathname.startsWith(cleanRoute);
    };

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
    },
    badgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 2,
    },
});
