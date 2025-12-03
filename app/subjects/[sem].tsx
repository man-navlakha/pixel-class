import { Ionicons } from '@expo/vector-icons';
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
import { API_URLS, apiCall } from '../../utils/api';

interface Subject {
    id: number;
    name: string;
    sem: number;
}

export default function SubjectListScreen() {
    const router = useRouter();
    const { sem, courseName } = useLocalSearchParams(); // Retrieve params passed from Home

    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        fetchSubjects();
    }, [sem]);

    const fetchSubjects = async () => {
        if (!sem) return;

        try {
            // Your backend expects "course_name" and "sem" in the POST body
            // Reference: QuePdfGetSubView in home/views.py
            const response = await apiCall(API_URLS.GET_SUBJECTS, 'POST', {
                sem: sem,
                course_name: courseName || "B.C.A" // Default to B.C.A if not passed
            });

            // The backend returns a direct list: [ {id, name, sem}, ... ]
            setSubjects(response);
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", "Failed to load subjects.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectPress = (subject: Subject) => {
        // Navigate to /resources/[subject]
        // We pass the subject name and persist the courseName
        router.push({
            pathname: `/resources/${subject.name}` as any,
            params: { courseName: courseName }
        });
    };

    const renderSubjectItem = ({ item, index }: { item: Subject; index: number }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleSubjectPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.subjectName}>{item.name}</Text>
                    <Text style={styles.subjectCode}>Semester {item.sem}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#333" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: `Semester ${sem}`,
                    headerStyle: { backgroundColor: '#121212' },
                    headerTintColor: '#fff',
                    headerShown: true
                }}
            />
            <StatusBar style="light" />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                </View>
            ) : (
                <FlatList
                    data={subjects}
                    renderItem={renderSubjectItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No subjects found for this semester.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#252525',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    indexText: {
        color: '#4A90E2',
        fontWeight: 'bold',
        fontSize: 16,
    },
    textContainer: {
        flex: 1,
    },
    subjectName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    subjectCode: {
        color: '#888',
        fontSize: 12,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});
