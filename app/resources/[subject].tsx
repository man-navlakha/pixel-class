import { Ionicons } from '@expo/vector-icons';
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
import { API_URLS, apiCall } from '../../utils/api';

const MENU_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'notes', label: 'Notes' },
    { key: 'assignment', label: 'Assignments' },
    { key: 'imp', label: 'IMP Q&A' },
    { key: 'exam_papper', label: 'Exam Papers' },
    { key: 'practical', label: 'General Book' },
];

// Categories that open directly
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

    // Action Handler
    const handleItemPress = (item: PdfResource) => {
        const category = (item.choose || '').trim().toLowerCase();

        if (DIRECT_OPEN_CATEGORIES.includes(category)) {
            // Direct Open Logic
            if (item.pdf) {
                Linking.openURL(item.pdf).catch(err =>
                    Alert.alert("Error", "Could not open PDF viewer.")
                );
            } else {
                Alert.alert("Error", "No PDF link available.");
            }
        } else {
            // Navigate Logic (for Assignments/IMP)
            router.push({
                pathname: `/answers/${item.id}` as any,
                params: {
                    title: item.name,
                    questionPdf: item.pdf // Pass original PDF to next screen if needed
                }
            });
        }
    };

    const renderPdfCard = ({ item }: { item: PdfResource }) => {
        const category = (item.choose || '').trim().toLowerCase();
        const isDirectOpen = DIRECT_OPEN_CATEGORIES.includes(category);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => handleItemPress(item)}
            >
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

                {/* Action Button */}
                <TouchableOpacity
                    style={[styles.actionBtn, isDirectOpen ? styles.btnDownload : styles.btnNavigate]}
                    onPress={() => handleItemPress(item)}
                >
                    <Ionicons
                        name={isDirectOpen ? "download-outline" : "chevron-forward"}
                        size={20}
                        color="#FFF"
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: typeof subject === 'string' ? subject : 'Resources',
                    headerStyle: { backgroundColor: '#121212' },
                    headerTintColor: '#fff',
                }}
            />
            <StatusBar style="light" />

            <View style={styles.tabContainer}>
                <FlatList
                    data={MENU_OPTIONS}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.tab, activeTab === item.key && styles.activeTab]}
                            onPress={() => setActiveTab(item.key)}
                        >
                            <Text style={[styles.tabText, activeTab === item.key && styles.activeTabText]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.key}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabList}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderPdfCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No documents found.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    tabContainer: { height: 60, borderBottomWidth: 1, borderBottomColor: '#333' },
    tabList: { alignItems: 'center', paddingHorizontal: 16 },
    tab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333', backgroundColor: '#1E1E1E' },
    activeTab: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
    tabText: { color: '#888', fontWeight: '600' },
    activeTabText: { color: '#FFF' },
    listContent: { padding: 16 },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },

    // Card
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
    cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#252525', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    emojiIcon: { fontSize: 24 },
    cardContent: { flex: 1 },
    cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    cardSubtitle: { color: '#888', fontSize: 12 },

    // Buttons
    actionBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    btnDownload: { backgroundColor: '#27ae60' }, // Green for download
    btnNavigate: { backgroundColor: '#4A90E2' }, // Blue for next
});
