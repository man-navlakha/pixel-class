import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Tabs
                tabBar={() => <CustomTabBar />}
                screenOptions={{
                    headerShown: false,
                }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                    }}
                />
                <Tabs.Screen
                    name="chat"
                    options={{
                        title: 'Chat',
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: 'Search',
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                    }}
                />
            </Tabs>
        </>
    );
}
