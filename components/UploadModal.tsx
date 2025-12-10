import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { API_URLS, apiCall } from '../utils/api';
import Button from './Button';
import Input from './Input';

const CATEGORIES = [
    { key: 'notes', label: '📝 Notes' },
    { key: 'assignment', label: '📚 Assignment' },
    { key: 'exam_papper', label: '📄 Exam Paper' },
    { key: 'practical', label: '🧑‍💻 General' },
];

interface UploadModalProps {
    isVisible: boolean;
    onClose: () => void;
    subject: string;
    sem: string | number; // You need to pass this from the previous screen
    username: string;
}

export default function UploadModal({ isVisible, onClose, subject, sem, username }: UploadModalProps) {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setFile(result.assets[0]);
            }
        } catch (err) {
            console.log('Unknown error: ', err);
        }
    };

    const handleUpload = async () => {
        if (!content || !category || !file) {
            Alert.alert("Missing Fields", "Please fill description, category and select a file.");
            return;
        }

        setLoading(true);

        try {
            // Construct FormData exactly as your web hook useFileUploadHandler.js does
            const formData = new FormData();
            formData.append("name", content);
            formData.append("username", username);
            formData.append("course_id", "1"); // Defaulting to 1 based on your web code
            formData.append("sem", String(sem));
            formData.append("choose", category);
            formData.append("sub", subject);

            // React Native FormData file structure
            // @ts-ignore
            formData.append("pdf", {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/pdf',
            });

            await apiCall(API_URLS.UPLOAD_RESOURCE, 'POST', formData);

            Alert.alert("Success", "Document uploaded successfully!");
            onClose();
            setContent('');
            setFile(null);
            setCategory('');
        } catch (error: any) {
            Alert.alert("Upload Failed", error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Upload Document</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.subLabel}>For: {subject} (Sem {sem})</Text>

                        {/* Category Selector */}
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoryContainer}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.key}
                                    style={[styles.catChip, category === cat.key && styles.catChipActive]}
                                    onPress={() => setCategory(cat.key)}
                                >
                                    <Text style={[styles.catText, category === cat.key && styles.catTextActive]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Input
                            label="Description"
                            placeholder="e.g. Unit 1 Notes"
                            value={content}
                            onChangeText={setContent}
                        />

                        {/* File Picker */}
                        <Text style={styles.label}>Document (PDF)</Text>
                        <TouchableOpacity onPress={handlePickDocument} style={styles.fileBtn}>
                            {file ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="document" size={20} color="#4ade80" />
                                    <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="cloud-upload-outline" size={20} color="#AAA" />
                                    <Text style={styles.filePlaceholder}>Select PDF File</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Button
                            title="Upload"
                            onPress={handleUpload}
                            loading={loading}
                            style={{ marginTop: 20 }}
                        />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'flex-end' },
    modalView: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        height: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
    subLabel: { color: '#888', marginBottom: 20 },
    label: { color: '#CCC', marginBottom: 10, fontWeight: '600' },
    categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    catChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#333', backgroundColor: '#252525' },
    catChipActive: { borderColor: '#4ade80', backgroundColor: 'rgba(74, 144, 226, 0.2)' },
    catText: { color: '#AAA', fontSize: 12 },
    catTextActive: { color: '#4ade80', fontWeight: 'bold' },
    fileBtn: {
        height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#333',
        backgroundColor: '#252525', justifyContent: 'center', paddingHorizontal: 16, marginBottom: 20,
        borderStyle: 'dashed'
    },
    fileName: { color: '#FFF', marginLeft: 10, flex: 1 },
    filePlaceholder: { color: '#AAA', marginLeft: 10 },
});