import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTabBar from '../../components/CustomTabBar';
import { API_URLS, apiCall } from '../../utils/api';

const MENU_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'notes', label: 'Notes' },
    { key: 'assignment', label: 'Assignments' },
    { key: 'imp', label: 'IMP Q&A' },
    { key: 'exam_papper', label: 'Exam Papers' },
    { key: 'practical', label: 'General Book' },
];

const DIRECT_OPEN_CATEGORIES = ['notes', 'exam_papper', 'practical'];

interface PdfResource {
    id: number;
    name: string;
    pdf: string;
    choose: string;
    year?: number;
    username?: string;
}

export default function ResourceListScreen() {
    const router = useRouter();
    const { subject, courseName } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [allPdfs, setAllPdfs] = useState<PdfResource[]>([]);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchPdfResources();
    }, [subject]);

    const fetchPdfResources = async () => {
        if (!subject) return;
        try {
            const response = await apiCall(API_URLS.GET_SUBJECT_PDFS, 'POST', {
                course_name: courseName || "B.C.A",
                sub: subject
            });
            if (Array.isArray(response)) setAllPdfs(response);
        } catch (error: any) {
            Alert.alert("Error", "Failed to load documents.");
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        if (activeTab === 'all') return allPdfs;
        return allPdfs.filter(item => (item.choose || '').trim().toLowerCase() === activeTab);
    }, [allPdfs, activeTab]);

    const handleItemPress = (item: PdfResource) => {
        const category = (item.choose || '').trim().toLowerCase();

        if (DIRECT_OPEN_CATEGORIES.includes(category)) {
            if (item.pdf) {
                Linking.openURL(item.pdf).catch(err =>
                    Alert.alert("Error", "Could not open PDF viewer.")
                );
            } else {
                Alert.alert("Error", "No PDF link available.");
            }
        } else {
            router.push({
                pathname: `/answers/${item.id}` as any,
                params: {
                    title: item.name,
                    questionPdf: item.pdf
                }
            });
        }
    };

    const renderPdfCard = ({ item }: { item: PdfResource }) => {
        const category = (item.choose || '').trim().toLowerCase();
        const isDirectOpen = DIRECT_OPEN_CATEGORIES.includes(category);

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleItemPress(item)}
                style={styles.cardContainer}
            >
                <LinearGradient
                    colors={['#2A2A2A', '#1A1A1A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.cardLeft}>
                        <View style={styles.cardIcon}>
                            <Text style={styles.emojiIcon}>
                                {isDirectOpen ? '📄' : '❓'}
                            </Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.cardSubtitle}>
                                {item.username || 'Admin'} • {item.year || '2025'}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.actionBtn, isDirectOpen ? styles.btnDownload : styles.btnNavigate]}>
                        <Ionicons
                            name={isDirectOpen ? "download-outline" : "chevron-forward"}
                            size={18}
                            color={isDirectOpen ? "#4A90E2" : "#FFF"}
                        />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {typeof subject === 'string' ? subject : 'Resources'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <FlatList
                    data={MENU_OPTIONS}
                    renderItem={({ item }) => {
                        const isActive = activeTab === item.key;
                        return (
                            <TouchableOpacity
                                onPress={() => setActiveTab(item.key)}
                                activeOpacity={0.8}
                                style={[styles.tabWrapper]}
                            >
                                {isActive ? (
                                    <LinearGradient
                                        colors={['#4A90E2', '#357ABD']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.tab}
                                    >
                                        <Text style={[styles.tabText, styles.activeTabText]}>
                                            {item.label}
                                        </Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.tab, styles.inactiveTab]}>
                                        <Text style={styles.tabText}>
                                            {item.label}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                    keyExtractor={(item) => item.key}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabList}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderPdfCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: 100 + insets.bottom }
                    ]}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color="#333" />
                            <Text style={styles.emptyText}>No documents found.</Text>
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
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#121212',
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#252525',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Tabs
    tabContainer: {
        height: 60,
        marginBottom: 10,
    },
    tabList: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    tabWrapper: {
        marginRight: 10,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
    },
    tab: {
        paddingHorizontal: 20,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
    inactiveTab: {
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: '#333',
    },
    tabText: {
        color: '#888',
        fontWeight: '600',
        fontSize: 13,
    },
    activeTabText: {
        color: '#FFF',
        fontWeight: 'bold',
    },

    // List
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
        opacity: 0.5,
    },
    emptyText: {
        color: '#888',
        marginTop: 16,
        fontSize: 16,
    },

    // Card
    cardContainer: {
        marginBottom: 16,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    emojiIcon: {
        fontSize: 24,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSubtitle: {
        color: '#888',
        fontSize: 12,
        fontWeight: '500',
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDownload: {
        backgroundColor: 'rgba(74, 144, 226, 0.15)',
    },
    btnNavigate: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});
