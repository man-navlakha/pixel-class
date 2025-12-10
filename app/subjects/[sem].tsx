import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTabBar from '../../components/CustomTabBar';
import { useTheme } from '../../contexts/ThemeContext';
import { Subject } from '../../types';
import { API_URLS, apiCall } from '../../utils/api';

export default function SubjectListScreen() {
    const router = useRouter();
    const { sem, courseName } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        fetchSubjects();
    }, [sem]);

    const fetchSubjects = async () => {
        if (!sem) return;

        try {
            const response = await apiCall(API_URLS.GET_SUBJECTS, 'POST', {
                sem: sem,
                course_name: courseName || "B.C.A"
            });
            setSubjects(response);
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", "Failed to load subjects.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectPress = (subject: Subject) => {
        router.push({
            pathname: `/resources/${subject.name}` as any,
            params: { courseName: courseName }
        });
    };

    const renderSubjectItem = ({ item, index }: { item: Subject; index: number }) => (
        <TouchableOpacity
            onPress={() => handleSubjectPress(item)}
            activeOpacity={0.8}
            style={styles.cardContainer}
        >
            <LinearGradient
                colors={isDarkMode ? ['#2A2A2A', '#1A1A1A'] : ['#ffffff', '#f3f4f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, { borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb' }]}
            >
                <View style={styles.cardLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(74, 144, 226, 0.1)' : 'rgba(74, 144, 226, 0.1)' }]}>
                        <Text style={styles.indexText}>{String(index + 1).padStart(2, '0')}</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.subjectName, { color: isDarkMode ? '#FFF' : '#111827' }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={[styles.subjectCode, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                            Semester {item.sem} • {courseName || "B.C.A"}
                        </Text>
                    </View>
                </View>
                <View style={[styles.arrowBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb' }]}>
                    <Ionicons name="arrow-forward" size={20} color={isDarkMode ? "#FFF" : "#000"} />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <StatusBar style="auto" animated />

            {/* Custom Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 10,
                backgroundColor: isDarkMode ? '#121212' : '#f9fafb',
                borderBottomColor: isDarkMode ? '#333' : '#e5e7eb'
            }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: isDarkMode ? '#252525' : '#e5e7eb' }]}
                >
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>
                    Semester {sem}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4ade80" />
                </View>
            ) : (
                <FlatList
                    data={subjects}
                    renderItem={renderSubjectItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{
                        padding: 20,
                        paddingTop: 10,
                        paddingBottom: 100 + insets.bottom
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="library-outline" size={64} color={isDarkMode ? "#333" : "#9ca3af"} />
                            <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#6b7280' }]}>
                                No subjects found.
                            </Text>
                        </View>
                    }
                />
            )}

            <CustomTabBar />
        </View>
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
        paddingBottom: 20,
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        marginBottom: 16,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    indexText: {
        color: '#4ade80',
        fontWeight: 'bold',
        fontSize: 18,
    },
    textContainer: {
        flex: 1,
        marginRight: 10,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subjectCode: {
        fontSize: 12,
        fontWeight: '500',
    },
    arrowBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
});
