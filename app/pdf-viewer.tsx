import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../contexts/ThemeContext';

export default function PdfViewerScreen() {
    const router = useRouter();
    const { uri, title } = useLocalSearchParams();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);

    if (!uri) {
        return (
            <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
                <Stack.Screen
                    options={{
                        title: 'Error',
                        headerStyle: { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' },
                        headerTintColor: isDarkMode ? '#fff' : '#111827'
                    }}
                />
                <Text style={[styles.errorText, { color: isDarkMode ? '#ef4444' : '#dc2626' }]}>No Document URI provided.</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: isDarkMode ? '#333' : '#e5e7eb' }]}
                >
                    <Text style={[styles.backButtonText, { color: isDarkMode ? '#FFF' : '#111827' }]}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const pdfUrl = uri as string;

    // Android WebView cannot display PDFs directly. We use Google Docs Viewer service.
    // iOS WebView handles PDFs natively.
    const viewerUrl = Platform.OS === 'android'
        ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`
        : pdfUrl;

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
            <Stack.Screen
                options={{
                    title: (title as string) || 'Document',
                    headerStyle: { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' },
                    headerTintColor: isDarkMode ? '#fff' : '#111827',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
                            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFF" : "#111827"} />
                        </TouchableOpacity>
                    ),
                    headerShown: true
                }}
            />

            <WebView
                source={{ uri: viewerUrl }}
                style={[styles.webview, { backgroundColor: isDarkMode ? '#121212' : '#ffffff' }]}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={[styles.loadingOverlay, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
                        <ActivityIndicator size="large" color="#10b981" />
                    </View>
                )}
                mixedContentMode="always"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    backButton: {
        padding: 10,
        borderRadius: 8,
        alignSelf: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
    }
});