import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PdfViewerScreen() {
    const router = useRouter();
    const { uri, title } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);

    if (!uri) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Error', headerStyle: { backgroundColor: '#121212' }, headerTintColor: '#fff' }} />
                <Text style={styles.errorText}>No Document URI provided.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const pdfUrl = uri as string;

    // CRITICAL FIX: 
    // Android WebView cannot display PDFs directly. We use Google Docs Viewer service.
    // iOS WebView handles PDFs natively.
    const viewerUrl = Platform.OS === 'android'
        ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`
        : pdfUrl;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: (title as string) || 'Document',
                    headerStyle: { backgroundColor: '#121212' },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    ),
                    headerShown: true
                }}
            />

            <WebView
                source={{ uri: viewerUrl }}
                style={{ flex: 1, backgroundColor: '#121212' }}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#4ade80" />
                    </View>
                )}
                // Fix for Android not allowing mixed content if your PDF server is HTTP
                mixedContentMode="always"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#FF5252',
        fontSize: 16,
        marginBottom: 20
    },
    backButton: {
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 8
    },
    backButtonText: {
        color: '#FFF'
    }
});