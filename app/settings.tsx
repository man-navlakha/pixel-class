import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
    const router = useRouter();
    const { isDarkMode, toggleTheme, isSystemTheme, setSystemTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const appVersion = Constants.expoConfig?.version || '1.0.0';

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => router.push('/auth/logout' as any)
                }
            ]
        );
    };

    const SettingItem = ({
        icon,
        title,
        subtitle,
        onPress,
        showArrow = true,
        rightComponent
    }: any) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#2A2A2A' : '#e5e7eb' }]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2A2A2A' : '#e5e7eb' }]}>
                    <Ionicons name={icon} size={22} color="#10b981" />
                </View>
                <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>{title}</Text>
                    {subtitle && <Text style={[styles.settingSubtitle, { color: isDarkMode ? '#888' : '#6b7280' }]}>{subtitle}</Text>}
                </View>
            </View>
            {rightComponent || (showArrow && (
                <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#666" : "#9ca3af"} />
            ))}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={[styles.sectionHeader, { color: isDarkMode ? '#888' : '#6b7280' }]}>{title}</Text>
    );

    return (
        <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style={isDarkMode ? "light" : "dark"} animated />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDarkMode ? '#333' : '#e5e7eb' }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Account Section */}
                <SectionHeader title="ACCOUNT" />
                <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
                    <SettingItem
                        icon="person-outline"
                        title="Edit Profile"
                        subtitle="Update your profile information"
                        onPress={() => router.push('/profile/edit' as any)}
                    />
                    <SettingItem
                        icon="key-outline"
                        title="Change Password"
                        subtitle="Update your password"
                        onPress={() => Alert.alert("Coming Soon", "This feature will be available soon")}
                    />
                    <SettingItem
                        icon="log-out-outline"
                        title="Logout"
                        subtitle="Sign out of your account"
                        onPress={handleLogout}
                    />
                </View>

                {/* Preferences Section */}
                <SectionHeader title="PREFERENCES" />
                <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
                    <SettingItem
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Enable push notifications"
                        onPress={() => { }}
                        showArrow={false}
                        rightComponent={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: isDarkMode ? '#333' : '#d1d5db', true: '#10b981' }}
                                thumbColor={notificationsEnabled ? '#FFF' : '#888'}
                            />
                        }
                    />
                    <SettingItem
                        icon="moon-outline"
                        title="Dark Mode"
                        subtitle={isSystemTheme ? "Controlled by system" : "Use dark theme"}
                        onPress={() => { }}
                        showArrow={false}
                        rightComponent={
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleTheme}
                                disabled={isSystemTheme}
                                trackColor={{ false: isDarkMode ? '#333' : '#d1d5db', true: '#10b981' }}
                                thumbColor={isDarkMode ? '#FFF' : '#888'}
                            />
                        }
                    />
                    <SettingItem
                        icon="phone-portrait-outline"
                        title="Use System Theme"
                        subtitle="Follow device theme settings"
                        onPress={() => { }}
                        showArrow={false}
                        rightComponent={
                            <Switch
                                value={isSystemTheme}
                                onValueChange={setSystemTheme}
                                trackColor={{ false: isDarkMode ? '#333' : '#d1d5db', true: '#10b981' }}
                                thumbColor={isSystemTheme ? '#FFF' : '#888'}
                            />
                        }
                    />
                    <SettingItem
                        icon="language-outline"
                        title="Language"
                        subtitle="English"
                        onPress={() => Alert.alert("Coming Soon", "Language selection will be available soon")}
                    />
                </View>

                {/* App Information Section */}
                <SectionHeader title="APP INFORMATION" />
                <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
                    <SettingItem
                        icon="information-circle-outline"
                        title="About Us"
                        subtitle="Learn more about Pixel Class"
                        onPress={() => router.push('/settings/about' as any)}
                    />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        title="Privacy Policy"
                        subtitle="Read our privacy policy"
                        onPress={() => router.push('/settings/privacy' as any)}
                    />
                    <SettingItem
                        icon="document-text-outline"
                        title="Terms & Conditions"
                        subtitle="Read our terms of service"
                        onPress={() => router.push('/settings/terms' as any)}
                    />
                    <SettingItem
                        icon="code-slash-outline"
                        title="Version"
                        subtitle={`v${appVersion} by Dhruv 🤞 Man`}
                        onPress={() => { }}
                        showArrow={false}
                    />
                </View>

                {/* Support Section */}
                <SectionHeader title="SUPPORT" />
                <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
                    <SettingItem
                        icon="help-circle-outline"
                        title="Help & Support"
                        subtitle="Get help with your account"
                        onPress={() => Alert.alert("Support", "Contact us at support@pixelclass.com")}
                    />
                    <SettingItem
                        icon="bug-outline"
                        title="Report a Bug"
                        subtitle="Help us improve the app"
                        onPress={() => Alert.alert("Report Bug", "Send bug reports to bugs@pixelclass.com")}
                    />
                    <SettingItem
                        icon="star-outline"
                        title="Rate Us"
                        subtitle="Share your feedback"
                        onPress={() => Alert.alert("Thank You!", "We appreciate your feedback")}
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: isDarkMode ? '#666' : '#9ca3af' }]}>Made by Dhruv 🤞 Man </Text>
                    <Text style={[styles.footerSubtext, { color: isDarkMode ? '#555' : '#6b7280' }]}>© 2024 Pixel Class. All rights reserved.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 8,
        letterSpacing: 0.5,
    },
    section: {
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 13,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 14,
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
    },
});
