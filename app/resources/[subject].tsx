import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
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
import UploadModal from '../../components/UploadModal';
import { useTheme } from '../../contexts/ThemeContext';
import { usePdfViewer } from '../../hooks/usePdfViewer';
import { PdfResource } from '../../types';
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

export default function ResourceListScreen() {
    const router = useRouter();
    const { subject, courseName, sem } = useLocalSearchParams();
    const [isUploadVisible, setIsUploadVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const insets = useSafeAreaInsets();
    const { isDarkMode } = useTheme();

    const { sharePdf, loadingId } = usePdfViewer();
    const [loading, setLoading] = useState(true);
    const [allPdfs, setAllPdfs] = useState<PdfResource[]>([]);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchCurrentUser();
        fetchPdfResources();
    }, [subject]);

    const fetchCurrentUser = async () => {
        try {
            const me = await apiCall(API_URLS.ME, 'GET');
            setCurrentUser(me.username);
        } catch (e) { console.log(e) }
    };

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

    const handleView = (item: PdfResource) => {
        const category = (item.choose || '').trim().toLowerCase();

        if (DIRECT_OPEN_CATEGORIES.includes(category)) {
            if (item.pdf) {
                router.push({
                    pathname: '/pdf-viewer',
                    params: { uri: item.pdf, title: item.name }
                });
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
        const isSharing = loadingId === item.id;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleView(item)}
                style={styles.cardContainer}
            >
                <LinearGradient
                    colors={isDarkMode ? ['#2A2A2A', '#1A1A1A'] : ['#ffffff', '#f3f4f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, { borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb' }]}
                >
                    <View style={styles.cardLeft}>
                        <View style={[styles.cardIcon, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]}>
                            <Text style={styles.emojiIcon}>
                                {isDirectOpen ? '📄' : '❓'}
                            </Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFF' : '#111827' }]} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text style={[styles.cardSubtitle, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                                {item.username || 'Admin'} • {item.year || '2025'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.iconBtn, styles.shareBtn]}
                            onPress={() => sharePdf(item.pdf, item.name, item.id)}
                            disabled={isSharing}
                        >
                            {isSharing ? (
                                <ActivityIndicator size="small" color="#4ade80" />
                            ) : (
                                <Ionicons name="share-social-outline" size={18} color="#4ade80" />
                            )}
                        </TouchableOpacity>

                        <View style={[styles.iconBtn, isDirectOpen ? styles.btnBlue : (isDarkMode ? styles.btnGrayDark : styles.btnGrayLight)]}>
                            <Ionicons
                                name={isDirectOpen ? "eye-outline" : "chevron-forward"}
                                size={18}
                                color={isDirectOpen ? "#4ade80" : (isDarkMode ? "#FFF" : "#6b7280")}
                            />
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="auto" animated />

            {/* Custom Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 10,
                backgroundColor: isDarkMode ? '#121212' : '#f9fafb'
            }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: isDarkMode ? '#252525' : '#e5e7eb' }]}
                >
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#111827' }]} numberOfLines={1}>
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
                                style={styles.tabWrapper}
                            >
                                {isActive ? (
                                    <LinearGradient
                                        colors={['#4ade80', '#357ABD']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.tab}
                                    >
                                        <Text style={styles.activeTabText}>
                                            {item.label}
                                        </Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.tab, styles.inactiveTab, {
                                        backgroundColor: isDarkMode ? '#1E1E1E' : '#e5e7eb',
                                        borderColor: isDarkMode ? '#333' : '#d1d5db'
                                    }]}>
                                        <Text style={[styles.tabText, { color: isDarkMode ? '#888' : '#6b7280' }]}>
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
                    <ActivityIndicator size="large" color="#4ade80" />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderPdfCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{
                        padding: 20,
                        paddingTop: 0,
                        paddingBottom: 100 + insets.bottom
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color={isDarkMode ? "#333" : "#9ca3af"} />
                            <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#6b7280' }]}>
                                No documents found.
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Floating Upload Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsUploadVisible(true)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#4ade80', '#357ABD']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={30} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Upload Modal */}
            <UploadModal
                isVisible={isUploadVisible}
                onClose={() => {
                    setIsUploadVisible(false);
                    fetchPdfResources();
                }}
                subject={subject as string}
                sem={sem as string || "1"}
                username={currentUser}
            />
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
        borderWidth: 1,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 13,
    },
    activeTabText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 13,
    },

    // Card
    cardContainer: {
        marginBottom: 16,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
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
        marginRight: 10,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
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
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        fontWeight: '500',
    },

    // Actions
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center'
    },
    shareBtn: {
        backgroundColor: 'rgba(74, 226, 100, 0.1)',
        marginRight: 8
    },
    btnBlue: {
        backgroundColor: 'rgba(74, 144, 226, 0.15)'
    },
    btnGrayDark: {
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    btnGrayLight: {
        backgroundColor: '#e5e7eb'
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 50,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
