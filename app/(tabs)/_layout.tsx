import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: '#000000',
                        borderTopWidth: 0,
                        height: Platform.OS === 'ios' ? 85 : 60,
                        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                        paddingTop: 10,
                    },
                    tabBarActiveTintColor: '#FFFFFF',
                    tabBarInactiveTintColor: '#666666',
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '500',
                        marginTop: -5,
                    },
                }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="chat"
                    options={{
                        title: 'Chat',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={24} color={color} />
                        ),
                        tabBarBadge: 1,
                        tabBarBadgeStyle: { backgroundColor: '#FF3B30', fontSize: 10, minWidth: 16, height: 16, lineHeight: 15 },
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: 'Search',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </>
    );
}
