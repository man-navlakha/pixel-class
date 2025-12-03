import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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

interface AnswerPdf {
    id: number;
    name: string; // User who uploaded it
    contant: string; // Description/Content
    pdf: string; // URL
}

export default function AnswerListScreen() {
    const { id, title, questionPdf } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<AnswerPdf[]>([]);

    useEffect(() => {
        fetchAnswers();
    }, [id]);

    const fetchAnswers = async () => {
        try {
            // Calls /api/home/AnsPdf/ with the question ID
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

    const openPdf = (url: string) => {
        Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot open PDF"));
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: "Solutions",
                    headerStyle: { backgroundColor: '#121212' },
                    headerTintColor: '#fff',
                }}
            />
            <StatusBar style="light" />

            {/* Header with Question Info */}
            <View style={styles.header}>
                <Text style={styles.questionTitle}>{title}</Text>
                {questionPdf && (
                    <TouchableOpacity
                        style={styles.questionBtn}
                        onPress={() => openPdf(questionPdf as string)}
                    >
                        <Ionicons name="document-text" size={16} color="#FFF" />
                        <Text style={styles.questionBtnText}>View Question Paper</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.divider} />

            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={answers}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="file-tray-outline" size={48} color="#444" />
                            <Text style={styles.emptyText}>No solutions uploaded yet.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.authorName}>{item.name}</Text>
                                    <Text style={styles.description}>{item.contant}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.downloadBtn}
                                onPress={() => openPdf(item.pdf)}
                            >
                                <Ionicons name="cloud-download-outline" size={20} color="#4A90E2" />
                                <Text style={styles.downloadText}>Download Solution</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },

    // Header
    header: { padding: 20, backgroundColor: '#1E1E1E' },
    questionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    questionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', padding: 10, borderRadius: 8, alignSelf: 'flex-start' },
    questionBtnText: { color: '#FFF', marginLeft: 8, fontWeight: '600' },

    divider: { height: 1, backgroundColor: '#333' },

    // List
    list: { padding: 16 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#666', marginTop: 12, fontSize: 16 },

    // Card
    card: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
    cardHeader: { flexDirection: 'row', marginBottom: 16 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
    authorName: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    description: { color: '#AAA', fontSize: 13, marginTop: 2, marginRight: 20 },

    // Download Button
    downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(74, 144, 226, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(74, 144, 226, 0.3)' },
    downloadText: { color: '#4A90E2', fontWeight: '600', marginLeft: 8 },
});
