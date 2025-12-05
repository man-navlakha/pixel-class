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
import { usePdfViewer } from '../../hooks/usePdfViewer'; // Import hook
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

    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<AnswerPdf[]>([]);

    // Init Hook
    const { viewPdf, loadingId } = usePdfViewer();

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

    const renderAnswerCard = ({ item }: { item: AnswerPdf }) => {
        const isItemLoading = loadingId === item.id;

        return (
            <View style={styles.cardContainer}>
                <LinearGradient
                    colors={['#2A2A2A', '#1A1A1A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.authorName}>{item.name || 'Unknown User'}</Text>
                            <Text style={styles.description} numberOfLines={2}>{item.contant || 'No description provided'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={() => !isItemLoading && viewPdf(item.pdf, `Answer - ${item.name}`, item.id)}
                        activeOpacity={0.8}
                        disabled={isItemLoading}
                    >
                        <LinearGradient
                            colors={['rgba(74, 144, 226, 0.2)', 'rgba(74, 144, 226, 0.1)']}
                            style={styles.downloadBtnGradient}
                        >
                            {isItemLoading ? (
                                <ActivityIndicator size="small" color="#4A90E2" />
                            ) : (
                                <>
                                    <Ionicons name="eye-outline" size={20} color="#4A90E2" />
                                    <Text style={styles.downloadText}>View Solution</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Solutions</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.questionSection}>
                <Text style={styles.questionTitle}>{title}</Text>
                {questionPdf && (
                    <TouchableOpacity
                        style={styles.questionBtn}
                        onPress={() => viewPdf(questionPdf as string, 'Question Paper', 'question-pdf')}
                    >
                        {loadingId === 'question-pdf' ? (
                            <ActivityIndicator size="small" color="#4A90E2" style={{ marginRight: 8 }} />
                        ) : (
                            <Ionicons name="document-text" size={16} color="#4A90E2" />
                        )}
                        <Text style={styles.questionBtnText}>View Question Paper</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4A90E2" />
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
                            <Ionicons name="file-tray-outline" size={64} color="#333" />
                            <Text style={styles.emptyText}>No solutions uploaded yet.</Text>
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
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#121212', zIndex: 10 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#252525', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    questionSection: { padding: 20, paddingTop: 0, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', marginBottom: 10 },
    questionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12, lineHeight: 26 },
    questionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74, 144, 226, 0.1)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(74, 144, 226, 0.2)' },
    questionBtnText: { color: '#4A90E2', marginLeft: 8, fontWeight: '600', fontSize: 13 },
    list: { padding: 20 },
    emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
    emptyText: { color: '#888', marginTop: 16, fontSize: 16 },
    cardContainer: { marginBottom: 16, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    card: { borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardHeader: { flexDirection: 'row', marginBottom: 16 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
    avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
    headerInfo: { flex: 1, justifyContent: 'center' },
    authorName: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
    description: { color: '#AAA', fontSize: 13 },
    downloadBtn: { borderRadius: 12, overflow: 'hidden' },
    downloadBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: 'rgba(74, 144, 226, 0.3)', borderRadius: 12 },
    downloadText: { color: '#4A90E2', fontWeight: '600', marginLeft: 8 },
});