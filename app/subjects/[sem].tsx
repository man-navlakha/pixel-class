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
import { API_URLS, apiCall } from '../../utils/api';

import { Subject } from '../../types';

export default function SubjectListScreen() {
    const router = useRouter();
    const { sem, courseName } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

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
                colors={['#2A2A2A', '#1A1A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.cardLeft}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.indexText}>{String(index + 1).padStart(2, '0')}</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.subjectName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.subjectCode}>Semester {item.sem} • {courseName || "B.C.A"}</Text>
                    </View>
                </View>
                <View style={styles.arrowBtn}>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false, // Custom header
                }}
            />
            <StatusBar style="light" animated />

            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Semester {sem}</Text>
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
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: 100 + insets.bottom } // Extra padding for tab bar
                    ]}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="library-outline" size={64} color="#333" />
                            <Text style={styles.emptyText}>No subjects found.</Text>
                        </View>
                    }
                />
            )}

            {/* Floating Tab Bar */}
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingTop: 10,
    },
    cardContainer: {
        marginBottom: 16,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
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
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
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
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subjectCode: {
        color: '#888',
        fontSize: 12,
        fontWeight: '500',
    },
    arrowBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
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
});
