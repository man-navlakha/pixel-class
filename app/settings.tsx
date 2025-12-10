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
    const { isDarkMode, toggleTheme } = useTheme();
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
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={22} color="#4ade80" />
                </View>
                <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {rightComponent || (showArrow && (
                <Ionicons name="chevron-forward" size={20} color="#666" />
            ))}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    return (
        <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
            <SafeAreaView style={styles.container} edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar style="auto" animated />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Account Section */}
                    <SectionHeader title="ACCOUNT" />
                    <View style={styles.section}>
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
                    <View style={styles.section}>
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
                                    trackColor={{ false: '#333', true: '#4ade80' }}
                                    thumbColor={notificationsEnabled ? '#FFF' : '#888'}
                                />
                            }
                        />
                        <SettingItem
                            icon="moon-outline"
                            title="Dark Mode"
                            subtitle="Use dark theme"
                            onPress={() => { }}
                            showArrow={false}
                            rightComponent={
                                <Switch
                                    value={isDarkMode}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: '#333', true: '#4ade80' }}
                                    thumbColor={isDarkMode ? '#FFF' : '#888'}
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
                    <View style={styles.section}>
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
                            subtitle={`v${appVersion}`}
                            onPress={() => { }}
                            showArrow={false}
                        />
                    </View>

                    {/* Support Section */}
                    <SectionHeader title="SUPPORT" />
                    <View style={styles.section}>
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
                        <Text style={styles.footerText}>Made with ❤️ by Pixel Class Team</Text>
                        <Text style={styles.footerSubtext}>© 2024 Pixel Class. All rights reserved.</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    sectionHeader: {
        color: '#888',
        fontSize: 13,
        fontWeight: '600',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 8,
        letterSpacing: 0.5,
    },
    section: {
        backgroundColor: '#1E1E1E',
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A2A',
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
        backgroundColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    settingSubtitle: {
        color: '#888',
        fontSize: 13,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 4,
    },
    footerSubtext: {
        color: '#555',
        fontSize: 12,
    },
});
