import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VerifiedBadge from '../../components/VerifiedBadge';
import { verifiedUsernames } from '../../constants/verifiedAccounts';
import { useTheme } from '../../contexts/ThemeContext';
import { API_URLS, apiCall } from '../../utils/api';

export default function ProfileScreen() {
    const { username } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<string>('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [suggestionLoading, setSuggestionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [username]);

    const fetchData = async () => {
        try {
            // 1. Get Me
            const me = await apiCall(API_URLS.ME, 'GET');
            setCurrentUser(me.username);

            // 2. Determine Target User
            let targetUser = username;
            if (Array.isArray(targetUser)) targetUser = targetUser[0];
            if (!targetUser) targetUser = me.username;

            // 3. Get Profile Details
            const details = await apiCall(API_URLS.PROFILE_DETAILS, 'POST', { username: targetUser });
            setProfile(details);

            // 4. Get Posts
            const postsRes = await apiCall(API_URLS.PROFILE_POSTS, 'POST', { username: targetUser });
            setPosts(postsRes.posts || []);

            // 5. Check Follow Status & Fetch Suggestions
            if (targetUser !== me.username) {
                setIsFollowing(false);

                const [targetFollowing, targetFollowers, myFollowing] = await Promise.all([
                    apiCall(API_URLS.FOLLOWING, 'POST', { username: targetUser }).catch(() => []),
                    apiCall(API_URLS.FOLLOWERS, 'POST', { username: targetUser }).catch(() => []),
                    apiCall(API_URLS.FOLLOWING, 'POST', { username: me.username }).catch(() => [])
                ]);

                const myFollowingSet = new Set(Array.isArray(myFollowing) ? myFollowing.map((u: any) => u.username) : []);
                setIsFollowing(myFollowingSet.has(targetUser));

                const suggestionsMap = new Map();
                const addToMap = (user: any) => {
                    if (user.username !== me.username && !myFollowingSet.has(user.username)) {
                        suggestionsMap.set(user.username, user);
                    }
                };

                const availableUsers = new Map();
                if (Array.isArray(targetFollowing)) targetFollowing.forEach((u: any) => availableUsers.set(u.username, u));
                if (Array.isArray(targetFollowers)) targetFollowers.forEach((u: any) => availableUsers.set(u.username, u));

                const verifiedArray = Array.from(verifiedUsernames);
                const missingVerified: string[] = [];

                for (const vUser of verifiedArray) {
                    if (vUser === me.username || myFollowingSet.has(vUser)) continue;
                    if (availableUsers.has(vUser)) {
                        suggestionsMap.set(vUser, availableUsers.get(vUser));
                    } else {
                        missingVerified.push(vUser);
                    }
                }

                if (missingVerified.length > 0) {
                    const verifiedPromises = missingVerified.map(vUsername =>
                        apiCall(API_URLS.PROFILE_DETAILS, 'POST', { username: vUsername }).catch(() => null)
                    );
                    const fetchedVerified = await Promise.all(verifiedPromises);
                    fetchedVerified.forEach((u: any) => {
                        if (u && u.username) suggestionsMap.set(u.username, u);
                    });
                }

                if (Array.isArray(targetFollowing)) targetFollowing.forEach(addToMap);
                if (Array.isArray(targetFollowers)) targetFollowers.forEach(addToMap);

                setSuggestions(Array.from(suggestionsMap.values()));
            } else {
                setSuggestions([]);
            }

        } catch (error: any) {
            console.error("Profile Fetch Error:", error.message || error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!profile) return;
        const targetUser = profile.username;
        const action = isFollowing ? API_URLS.UNFOLLOW : API_URLS.FOLLOW;
        const payload = isFollowing ? { unfollow_username: targetUser } : { follow_username: targetUser };

        try {
            await apiCall(action, 'POST', {
                username: currentUser,
                ...payload
            });
            setIsFollowing(!isFollowing);
            Alert.alert("Success", isFollowing ? "Unfollowed" : "Following");
        } catch (error) {
            Alert.alert("Error", "Action failed");
        }
    };

    const handleSuggestionFollow = async (suggestedUser: any) => {
        setSuggestionLoading(suggestedUser.username);
        try {
            await apiCall(API_URLS.FOLLOW, 'POST', {
                username: currentUser,
                follow_username: suggestedUser.username
            });
            setSuggestions(prev => prev.filter(u => u.username !== suggestedUser.username));
            Alert.alert("Success", `You are now following ${suggestedUser.username}`);
        } catch (error) {
            Alert.alert("Error", "Failed to follow user");
        } finally {
            setSuggestionLoading(null);
        }
    };

    const renderHeader = () => {
        if (!profile) return null;
        const isOwnProfile = profile.username === currentUser;

        return (
            <View className="items-center p-5 border-b border-gray-200 dark:border-gray-800 mb-2.5">
                <Image
                    source={{ uri: profile.profile_pic || "https://i.pravatar.cc/150" }}
                    style={{ width: 100, height: 100 }}
                    className="w-25 h-25 rounded-full mb-3 border-2 border-green-500"
                />
                <View className="flex-row items-center mb-5">
                    <Text className="text-gray-900 dark:text-white text-2xl font-bold">{profile.username}</Text>
                    {verifiedUsernames.has(profile.username) && (
                        <VerifiedBadge size={24} style={{ marginLeft: 6 }} />
                    )}
                </View>

                {/* Stats */}
                <View className="flex-row w-full justify-around mb-6">
                    <View className="items-center">
                        <Text className="text-gray-900 dark:text-white text-lg font-bold">{posts.length}</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">Posts</Text>
                    </View>
                    <TouchableOpacity
                        className="items-center"
                        onPress={() => router.push({
                            pathname: '/followers',
                            params: { username: profile.username }
                        } as any)}
                    >
                        <Text className="text-gray-900 dark:text-white text-lg font-bold">{profile.follower_count || 0}</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">Followers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="items-center"
                        onPress={() => router.push({
                            pathname: '/following',
                            params: { username: profile.username }
                        } as any)}
                    >
                        <Text className="text-gray-900 dark:text-white text-lg font-bold">{profile.following_count || 0}</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">Following</Text>
                    </TouchableOpacity>
                </View>

                {/* Actions */}
                <View className="flex-row gap-2.5 mb-5">
                    {isOwnProfile ? (
                        <>
                            <TouchableOpacity
                                className="bg-gray-200 dark:bg-gray-800 py-2.5 px-8 rounded-full"
                                onPress={() => router.push('/profile/edit' as any)}
                            >
                                <Text className="text-gray-900 dark:text-white font-semibold">Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-gray-200 dark:bg-gray-800 py-2.5 px-8 rounded-full"
                                onPress={() => router.push('/auth/logout' as any)}
                            >
                                <Text className="text-gray-900 dark:text-white font-semibold">Logout</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            className={`py-2.5 px-8 rounded-full ${isFollowing ? 'bg-transparent border border-white' : 'bg-green-500'}`}
                            onPress={handleFollowToggle}
                        >
                            <Text className={`font-semibold ${isFollowing ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Suggestions Section */}
                {!isOwnProfile && suggestions.length > 0 && (
                    <View className="w-full mb-6">
                        <View className="flex-row justify-between items-center mb-3 px-1">
                            <Text className="text-gray-900 dark:text-white text-base font-semibold">Suggested for you</Text>
                            <TouchableOpacity>
                                <Text className="text-green-500 text-sm">See all</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={suggestions}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.username}
                            renderItem={({ item }) => (
                                <View className="w-[140px] bg-gray-100 dark:bg-black rounded-lg p-3 items-center mr-2.5 border border-gray-200 dark:border-gray-800 relative">
                                    <TouchableOpacity
                                        className="absolute top-2 right-2 z-10"
                                        onPress={() => setSuggestions(prev => prev.filter(u => u.username !== item.username))}
                                    >
                                        <Ionicons name="close" size={16} color={isDarkMode ? "#888" : "#6b7280"} />
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => router.push(`/profile/${item.username}` as any)}>
                                        <Image
                                            source={{ uri: item.profile_pic || `https://i.pravatar.cc/150?u=${item.username}` }}
                                            className="w-15 h-15 rounded-full mb-2" style={{ width: 100, height: 100 }}
                                        />
                                    </TouchableOpacity>

                                    <View className="flex-row items-center justify-center mt-2">
                                        <Text className="text-gray-900 dark:text-white text-sm font-semibold text-center" numberOfLines={1}>{item.username}</Text>
                                        {verifiedUsernames.has(item.username) && (
                                            <VerifiedBadge size={12} style={{ marginLeft: 4 }} />
                                        )}
                                    </View>

                                    <Text className="text-gray-600 dark:text-gray-400 text-xs text-center mb-3" numberOfLines={1}>
                                        {item.first_name} {item.last_name}
                                    </Text>

                                    <TouchableOpacity
                                        className="bg-transparent py-1.5 px-5 rounded-md border border-green-500 w-full items-center"
                                        onPress={() => handleSuggestionFollow(item)}
                                        disabled={suggestionLoading === item.username}
                                    >
                                        {suggestionLoading === item.username ? (
                                            <ActivityIndicator size="small" color="#4ade80" />
                                        ) : (
                                            <Text className="text-green-500 text-xs font-semibold">Follow</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                            contentContainerStyle={{ paddingHorizontal: 4 }}
                        />
                    </View>
                )}

                <Text className="text-gray-900 dark:text-white text-lg font-semibold self-start mt-2.5 w-full">Notes Uploaded</Text>
            </View>
        );
    };

    const renderPost = ({ item }: { item: any }) => (
        <View className="flex-row items-center bg-gray-100 dark:bg-[#1E1E1E] p-4 rounded-xl mb-3 mx-5">
            <Ionicons name="document-text" size={24} color="#4ade80" />
            <View className="ml-3 flex-1">
                <Text className="text-gray-900 dark:text-white text-base font-medium" numberOfLines={1}>{item.contant || "Note"}</Text>
                <Text className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">{item.sub} • Sem {item.sem}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
                <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#121212]">
                    <ActivityIndicator size="large" color="#4ade80" />
                </SafeAreaView>
            </View>
        );
    }

    const isOwnProfile = profile?.username === currentUser;

    return (
        <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#121212]" edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar style="auto" animated />

                {/* Settings Icon - Only show on own profile */}
                {isOwnProfile && (
                    <TouchableOpacity
                        className="absolute top-[50px] right-5 z-10 bg-gray-200 dark:bg-[#1E1E1E] p-2.5 rounded-full border border-gray-300 dark:border-gray-800"
                        onPress={() => router.push('/settings' as any)}
                    >
                        <Ionicons name="settings-outline" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                    </TouchableOpacity>
                )}

                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <Text className="text-gray-500 dark:text-gray-600 text-center mt-5">No notes uploaded yet.</Text>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
                />
            </SafeAreaView>
        </View>
    );
}
