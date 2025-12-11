import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VerifiedBadge from '../../components/VerifiedBadge';
import { verifiedUsernames } from '../../constants/verifiedAccounts';
import { useTheme } from '../../contexts/ThemeContext';
import { API_URLS, apiCall } from '../../utils/api';

export default function HomeScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [semesters, setSemesters] = useState<number[]>([]);
    const [courseName, setCourseName] = useState('');
    const [user, setUser] = useState({ username: 'Guest', profile_pic: '' });
    const [verifiedAccounts, setVerifiedAccounts] = useState<any[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const userData = await apiCall(API_URLS.ME, 'GET');

            if (userData?.username) {
                try {
                    const profileDetails = await apiCall(API_URLS.PROFILE_DETAILS, 'POST', {
                        username: userData.username
                    });
                    setUser({
                        username: userData.username,
                        profile_pic: profileDetails.profile_pic
                    });
                } catch (profileError) {
                    console.log("Profile Details Error:", profileError);
                    setUser(userData);
                }
            } else {
                setUser(userData);
            }

            const courseData = await apiCall(API_URLS.COURSES, 'GET');
            if (courseData.CourseList && courseData.CourseList.length > 0) {
                const selectedCourse = courseData.CourseList.find((c: any) => c.name === "B.C.A") || courseData.CourseList[0];
                setCourseName(selectedCourse.name);
                const semArray = Array.from({ length: selectedCourse.number_sem }, (_, i) => i + 1);
                setSemesters(semArray);
            }

            // Fetch verified accounts
            await fetchVerifiedAccounts();
        } catch (error: any) {
            console.log("Auth Error:", error.message);
            router.replace('/auth/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchVerifiedAccounts = async () => {
        try {
            const verifiedUsers = [];
            for (const username of Array.from(verifiedUsernames)) {
                try {
                    const profile = await apiCall(API_URLS.PROFILE_DETAILS, 'POST', { username });
                    verifiedUsers.push(profile);
                } catch (err) {
                    console.log(`Could not fetch profile for ${username}`);
                }
            }
            setVerifiedAccounts(verifiedUsers);
        } catch (error) {
            console.log("Error fetching verified accounts:", error);
        }
    };

    const handleSemesterPress = (sem: number) => {
        router.push({
            pathname: `/subjects/${sem}` as any,
            params: { courseName: courseName }
        });
    };

    const renderSemesterCard = ({ item }: { item: number }) => (
        <TouchableOpacity
            style={styles.semesterCard}
            className={` ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            onPress={() => handleSemesterPress(item)}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={isDarkMode ? ['#000000', '#1A1A1A'] : ['#ffffff', '#f3f4f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.semesterGradient}
            >
                <View style={styles.semesterTop}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="school-outline" size={24} color="#029739ff" />
                    </View>
                    <View style={[styles.chevronContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name="chevron-forward" size={14} color={isDarkMode ? "#AAA" : "#666"} />
                    </View>
                </View>

                <View>
                    <Text style={[styles.semesterLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Semester</Text>
                    <Text style={[styles.semesterNumber, { color: isDarkMode ? '#FFF' : '#111827' }]}>{item}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: isDarkMode ? '#1A1A1A' : '#f9fafb' }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4ade80" />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1A1A1A' : '#f9fafb' }]}>
            <StatusBar style="auto" />

            <View style={styles.headerWrapper}>
                <LinearGradient
                    colors={isDarkMode ? ['#1A1A1A', '#1A1A1A'] : ['#f9fafb', '#f9fafb']}
                    style={styles.headerGradient}
                >
                    <SafeAreaView edges={['top']} style={styles.headerSafe}>
                        {/* Top Bar */}
                        <View style={styles.topBar}>
                            <View>
                                <Text style={[styles.welcomeText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Welcome Back,</Text>
                                <Text style={[styles.usernameText, { color: isDarkMode ? '#FFF' : '#111827' }]}>{user.username || 'Student'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                                <Image
                                    source={{ uri: user.profile_pic || "https://i.pravatar.cc/150" }}
                                    style={[styles.profileImage, { borderColor: isDarkMode ? '#10b981' : '#10b981' }]}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Featured Banner */}
                        <LinearGradient
                            colors={isDarkMode ? ['#055824ff', '#000000ff'] : ['#10b981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.banner}
                        >
                            <View style={styles.bannerContent}>
                                <Text style={styles.bannerLabel}>Current Course</Text>
                                <Text style={styles.bannerTitle}>{courseName}</Text>
                            </View>
                            <View style={styles.bannerIcon}>
                                <Ionicons name="book" size={56} color={isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.3)"} />
                            </View>
                        </LinearGradient>
                    </SafeAreaView>
                </LinearGradient>
            </View>

            <FlatList
                data={semesters}
                className={`rounded-3xl border-2 ${isDarkMode ? 'border-[#1E1E1E07]' : 'border-[#10b981]'}`}
                renderItem={renderSemesterCard}
                keyExtractor={(item) => item.toString()}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        {/* Verified Accounts Section */}
                        {verifiedAccounts.length > 0 && (
                            <View style={styles.verifiedSection}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                                    <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>Verified Accounts</Text>
                                </View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.verifiedScrollContent}
                                >
                                    {verifiedAccounts.map((account, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.verifiedCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }, { borderColor: isDarkMode ? '#ffffff09' : '#10b98152' }]}
                                            onPress={() => router.push(`/profile/${account.username}` as any)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.verifiedAvatarContainer}>
                                                <Image
                                                    source={{ uri: account.profile_pic || `https://i.pravatar.cc/150?u=${account.username}` }}
                                                    style={styles.verifiedAvatar}
                                                />
                                                <View style={[styles.verifiedBadgeContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
                                                    <VerifiedBadge size={16} />
                                                </View>
                                            </View>
                                            <Text
                                                style={[styles.verifiedUsername, { color: isDarkMode ? '#FFF' : '#111827' }]}
                                                numberOfLines={1}
                                            >
                                                {account.username}
                                            </Text>
                                            <Text
                                                style={[styles.verifiedName, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}
                                                numberOfLines={1}
                                            >
                                                {account.first_name} {account.last_name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>Your Semesters</Text>
                    </>
                }
                ListFooterComponent={
                    < View style={styles.footer} >
                        <Text style={[styles.footerTitle, { color: isDarkMode ? '#6b7280' : '#9ca3af' }]}>Live it up!</Text>
                        <View style={styles.footerRow}>
                            <Text style={[styles.footerText, { color: isDarkMode ? '#6b7280' : '#6b7280' }]}>Crafted with </Text>
                            <Ionicons name="heart" size={16} color="#10b981" />
                            <Text style={[styles.footerText, { color: isDarkMode ? '#6b7280' : '#6b7280' }]}> by Pixel Class Teams</Text>
                        </View>
                        <Text style={[styles.footerCopyright, { color: isDarkMode ? '#4b5563' : '#9ca3af' }]}>© 2025 Pixel Class. All rights reserved.</Text>
                        <Text style={[styles.footerVersion, { color: isDarkMode ? '#374151' : '#d1d5db' }]}>v{Constants.expoConfig?.version ?? (Constants.manifest as any)?.version ?? '1.0.0'}</Text>
                    </View >
                }
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerWrapper: {
        marginBottom: 8,
    },
    headerGradient: {
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerSafe: {
        paddingHorizontal: 24,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 14,
        marginBottom: 4,
    },
    usernameText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
    },
    banner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    bannerContent: {
        padding: 8,
        borderRadius: 12,
    },
    bannerLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    bannerTitle: {
        color: '#FFF',
        fontSize: 36,
        fontWeight: 'bold',
    },
    bannerIcon: {
        position: 'absolute',
        right: -12,
        bottom: -12,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
        paddingTop: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        marginLeft: 8,
    },
    semesterCard: {
        flex: 1,
        marginHorizontal: 8,
        marginBottom: 16,
        height: 176,
        borderWidth: 1,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    semesterGradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    semesterTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    semesterLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    semesterNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        letterSpacing: -2,
    },
    footer: {
        marginTop: 48,
        marginBottom: 32,
        alignItems: 'center',
    },
    footerTitle: {
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: -2,
        marginBottom: 16,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
    },
    footerCopyright: {
        fontSize: 12,
        marginTop: 8,
    },
    footerVersion: {
        fontSize: 10,
        marginTop: 4,
    },
    // Verified Accounts Styles
    verifiedSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginLeft: 8,
        gap: 8,
    },
    verifiedScrollContent: {
        paddingHorizontal: 8,
    },
    verifiedCard: {
        width: 140,
        marginHorizontal: 6,
        padding: 16,
        borderWidth: 2,
        borderColor: '#10b981',

        borderRadius: 16,
        alignItems: 'center',
    },
    verifiedAvatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    verifiedAvatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: '#10b981',
    },
    verifiedBadgeContainer: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        borderRadius: 12,
        padding: 2,
    },
    verifiedUsername: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
        textAlign: 'center',
    },
    verifiedName: {
        fontSize: 12,
        textAlign: 'center',
    },
});
