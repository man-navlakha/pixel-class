import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URLS, apiCall } from '../../utils/api';

const { width } = Dimensions.get('window');
const SPACING = 24; // Side padding
const GAP = 16; // Gap between cards
const CARD_WIDTH = (width - (SPACING * 2) - GAP) / 2;

export default function HomeScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [semesters, setSemesters] = useState<number[]>([]);
    const [courseName, setCourseName] = useState('');
    const [user, setUser] = useState({ username: '', profile_pic: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const userData = await apiCall(API_URLS.ME, 'GET');
            setUser(userData);

            const courseData = await apiCall(API_URLS.COURSES, 'GET');
            if (courseData.CourseList && courseData.CourseList.length > 0) {
                const selectedCourse = courseData.CourseList.find((c: any) => c.name === "B.C.A") || courseData.CourseList[0];
                setCourseName(selectedCourse.name);
                const semArray = Array.from({ length: selectedCourse.number_sem }, (_, i) => i + 1);
                setSemesters(semArray);
            }
        } catch (error: any) {
            console.log("Auth Error:", error.message);
            router.replace('/auth/login');
        } finally {
            setLoading(false);
        }
    };

    const handleSemesterPress = (sem: number) => {
        router.push({
            pathname: `/subjects/${sem}` as any,
            params: { courseName: courseName }
        });
    };

    const handleProfilePress = () => {
        if (user.username) {
            router.push(`/profile/${user.username}` as any);
        } else {
            router.push('/auth/login');
        }
    };

    const renderSemesterCard = ({ item }: { item: number }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => handleSemesterPress(item)}
            activeOpacity={0.8}
        >
            <LinearGradient
                // Lighter dark grey to darker grey gradient
                colors={['#333333', '#1A1A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Top Section: Icon */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardIconBg}>
                        <Ionicons name="school-outline" size={24} color="#4A90E2" />
                    </View>
                    <View style={styles.badge}>
                        <Ionicons name="chevron-forward" size={14} color="#AAA" />
                    </View>
                </View>

                {/* Bottom Section: Text */}
                <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>Semester</Text>
                    <Text style={styles.cardTitle}>{item}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header Background */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#1E1E1E', '#121212']}
                    style={styles.headerGradient}
                >
                    <SafeAreaView edges={['top']} style={styles.safeArea}>
                        {/* Top Bar */}
                        <View style={styles.topBar}>
                            <View>
                                <Text style={styles.greeting}>Welcome Back,</Text>
                                <Text style={styles.username}>{user.username || 'Student'}</Text>
                            </View>
                            <View style={styles.topBarRight}>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                                    <Image
                                        source={{ uri: user.profile_pic || "https://i.pravatar.cc/150" }}
                                        style={styles.avatar}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Featured Banner */}
                        <LinearGradient
                            colors={['#4A90E2', '#357ABD']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.banner}
                        >
                            <View>
                                <Text style={styles.bannerLabel}>Current Course</Text>
                                <Text style={styles.bannerTitle}>{courseName}</Text>
                            </View>
                            <View style={styles.bannerIcon}>
                                <Ionicons name="book" size={48} color="rgba(255,255,255,0.2)" />
                            </View>
                        </LinearGradient>
                    </SafeAreaView>
                </LinearGradient>
            </View>

            {/* Content */}
            <FlatList
                data={semesters}
                renderItem={renderSemesterCard}
                keyExtractor={(item) => item.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Text style={styles.sectionTitle}>Your Semesters</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loaderContainer: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        marginBottom: 10,
    },
    headerGradient: {
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    safeArea: {
        paddingHorizontal: 24,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 24,
    },
    greeting: {
        color: '#AAA',
        fontSize: 14,
        marginBottom: 4,
    },
    username: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    banner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    bannerLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    bannerTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    bannerIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
    },
    // Updated FlatList styles
    listContent: {
        paddingHorizontal: SPACING, // 24
        paddingBottom: 40,
        paddingTop: 20, // Add some top space
    },

    sectionTitle: {
        color: '#FFF',
        fontSize: 20, // Slightly larger to match the new design
        fontWeight: 'bold',
        marginBottom: 20, // Increased spacing
        marginLeft: 4, // Aligns with the cards visually
    },
    row: {
        justifyContent: 'space-between', // This handles the GAP automatically now
        marginBottom: GAP,
    },

    // REDESIGNED CARD STYLES
    cardContainer: {
        width: CARD_WIDTH,
        height: 170, // Slightly taller for better proportions
        borderRadius: 24,
        // Deep shadow for depth
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    card: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)', // Subtle glass border effect
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardIconBg: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(74, 144, 226, 0.15)', // More transparent blue
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        marginTop: 12,
    },
    cardLabel: {
        color: '#888',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardTitle: {
        color: '#FFF',
        fontSize: 32, // Large, bold number
        fontWeight: 'bold',
        letterSpacing: -1, // Tight tracking for modern look
    },
});