import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTabBar from '../../components/CustomTabBar';
import { useTheme } from '../../contexts/ThemeContext';
import { usePdfViewer } from '../../hooks/usePdfViewer';
import { API_URLS, apiCall } from '../../utils/api';

interface AnswerPdf {
    id: number;
    name: string;
    contant: string;
    pdf: string;
}

export default function AnswerListScreen() {
    const router = useRouter();
    const { id, title, questionPdf } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<AnswerPdf[]>([]);

    const { sharePdf, loadingId } = usePdfViewer();

    useEffect(() => {
        fetchAnswers();
    }, [id]);

    const fetchAnswers = async () => {
        try {
            const response = await apiCall(API_URLS.GET_ANSWERS, 'POST', { id: id });
            if (Array.isArray(response)) {
                setAnswers(response);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (uri: string, docTitle: string) => {
        router.push({
            pathname: '/pdf-viewer',
            params: { uri, title: docTitle }
        });
    };

    const renderAnswerCard = ({ item }: { item: AnswerPdf }) => {
        const isSharing = loadingId === item.id;

        return (
            <View style={styles.cardContainer}>
                <LinearGradient
                    colors={isDarkMode ? ['#2A2A2A', '#1A1A1A'] : ['#ffffff', '#f3f4f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, { borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb' }]}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.avatar, { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }]}>
                            <Text style={styles.avatarText}>
                                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={[styles.authorName, { color: isDarkMode ? '#FFF' : '#111827' }]}>
                                {item.name || 'Unknown User'}
                            </Text>
                            <Text style={[styles.description, { color: isDarkMode ? '#AAA' : '#6b7280' }]} numberOfLines={2}>
                                {item.contant || 'No description provided'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.btnView, {
                                backgroundColor: isDarkMode ? 'rgba(74, 144, 226, 0.1)' : 'rgba(74, 144, 226, 0.05)',
                                borderColor: isDarkMode ? 'rgba(74, 144, 226, 0.3)' : 'rgba(74, 144, 226, 0.2)'
                            }]}
                            onPress={() => handleView(item.pdf, `Answer - ${item.name}`)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="eye-outline" size={20} color="#4ade80" />
                            <Text style={styles.btnText}>View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, styles.btnShare, {
                                backgroundColor: isDarkMode ? 'rgba(74, 226, 100, 0.1)' : 'rgba(74, 226, 100, 0.05)',
                                borderColor: isDarkMode ? 'rgba(74, 226, 100, 0.3)' : 'rgba(74, 226, 100, 0.2)'
                            }]}
                            onPress={() => sharePdf(item.pdf, `Answer - ${item.name}`, item.id)}
                            activeOpacity={0.8}
                            disabled={isSharing}
                        >
                            {isSharing ? (
                                <ActivityIndicator size="small" color="#4ade80" />
                            ) : (
                                <>
                                    <Ionicons name="share-social-outline" size={20} color="#4ade80" />
                                    <Text style={styles.btnText}>Share</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="auto" />

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
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>Solutions</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Question Info Section */}
            <View style={[styles.questionSection, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb' }]}>
                <Text style={[styles.questionTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>{title}</Text>
                {questionPdf && (
                    <TouchableOpacity
                        style={[styles.questionBtn, {
                            backgroundColor: isDarkMode ? 'rgba(74, 144, 226, 0.1)' : 'rgba(74, 144, 226, 0.05)',
                            borderColor: isDarkMode ? 'rgba(74, 144, 226, 0.2)' : 'rgba(74, 144, 226, 0.15)'
                        }]}
                        onPress={() => handleView(questionPdf as string, 'Question Paper')}
                    >
                        <Ionicons name="document-text" size={16} color="#4ade80" />
                        <Text style={styles.questionBtnText}>View Question Paper</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4ade80" />
                </View>
            ) : (
                <FlatList
                    data={answers}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[
                        styles.list,
                        { paddingBottom: 100 + insets.bottom }
                    ]}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="file-tray-outline" size={64} color={isDarkMode ? "#333" : "#9ca3af"} />
                            <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#6b7280' }]}>
                                No solutions uploaded yet.
                            </Text>
                        </View>
                    }
                    renderItem={renderAnswerCard}
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Question Section
    questionSection: {
        padding: 20,
        paddingTop: 0,
        paddingBottom: 20,
        borderBottomWidth: 1,
        marginBottom: 10,
    },
    questionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        lineHeight: 26,
    },
    questionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
    },
    questionBtnText: {
        color: '#4ade80',
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 13,
    },

    // List
    list: {
        padding: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
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
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4ade80',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 2,
    },
    description: {
        fontSize: 13,
    },

    // Action Buttons
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    btnView: {},
    btnShare: {},
    btnText: {
        color: '#4ade80',
        fontWeight: '600',
        marginLeft: 8,
    },
});