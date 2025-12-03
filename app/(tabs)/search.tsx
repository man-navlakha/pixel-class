import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URLS, apiCall } from '../../utils/api';

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<string>('');

    // Fetch current user to avoid listing yourself
    useEffect(() => {
        apiCall(API_URLS.ME, 'GET').then(data => setCurrentUser(data.username)).catch(() => { });
    }, []);

    // Search Logic
    useEffect(() => {
        if (!query.trim()) {
            setUsers([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setLoading(true);
            try {
                // api/Profile/UserSearch/?username=query
                const res = await apiCall(`${API_URLS.USER_SEARCH}?username=${query}`, 'GET');
                if (Array.isArray(res)) {
                    // Filter out current user
                    const filtered = res.filter((u: any) => u.username !== currentUser);
                    setUsers(filtered);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounce);
    }, [query, currentUser]);

    const renderUserItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => router.push(`/profile/${item.username}` as any)}
        >
            <Image
                source={{ uri: item.profile_pic || "https://i.pravatar.cc/150" }}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.fullName}>{item.first_name} {item.last_name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    placeholderTextColor="#888"
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                />
            </View>

            {loading ? (
                <ActivityIndicator color="#4A90E2" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.username}
                    ListEmptyComponent={
                        query.length > 0 ? (
                            <Text style={styles.emptyText}>No users found.</Text>
                        ) : (
                            <Text style={styles.emptyText}>Type to search people.</Text>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 16 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, height: 50 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: '#FFF', fontSize: 16, height: '100%' },
    userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 12, borderRadius: 12, marginBottom: 10 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
    userInfo: { flex: 1 },
    username: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    fullName: { color: '#AAA', fontSize: 14 },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 40 },
});
