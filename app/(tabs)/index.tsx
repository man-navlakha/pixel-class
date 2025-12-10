import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { API_URLS, apiCall } from '../../utils/api';

export default function HomeScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [semesters, setSemesters] = useState<number[]>([]);
    const [courseName, setCourseName] = useState('');
    const [user, setUser] = useState({ username: 'Guest', profile_pic: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const userData = await apiCall(API_URLS.ME, 'GET');

            // Fetch profile details to get the correct profile picture
            if (userData?.username) {
                try {
                    const profileDetails = await apiCall(API_URLS.PROFILE_DETAILS, 'POST', {
                        username: userData.username
                    });
                    setUser({
                        username: userData.username,
                        profile_pic: profileDetails.profile_pic
                    });
                } catch (profileError) {
                    console.log("Profile Details Error:", profileError);
                    setUser(userData);
                }
            } else {
                setUser(userData);
            }

            const courseData = await apiCall(API_URLS.COURSES, 'GET');
            if (courseData.CourseList && courseData.CourseList.length > 0) {
                const selectedCourse = courseData.CourseList.find((c: any) => c.name === "B.C.A") || courseData.CourseList[0];
                setCourseName(selectedCourse.name);
                const semArray = Array.from({ length: selectedCourse.number_sem }, (_, i) => i + 1);
                setSemesters(semArray);
            }
        } catch (error: any) {
            console.log("Auth Error:", error.message);
            router.replace('/auth/login');
        } finally {
            setLoading(false);
        }
    };

    const handleSemesterPress = (sem: number) => {
        router.push({
            pathname: `/subjects/${sem}` as any,
            params: { courseName: courseName }
        });
    };

    const renderSemesterCard = ({ item }: { item: number }) => (
        <TouchableOpacity
            className="flex-1 mx-2 mb-4 h-44 rounded-3xl overflow-hidden shadow-lg"
            onPress={() => handleSemesterPress(item)}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={isDarkMode ? ['#000000', '#1A1A1A'] : ['#ffffff', '#f3f4f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 p-5 justify-between"
            >
                <View className="flex-row justify-between items-start">
                    <View className="w-12 h-12 justify-center items-center">
                        <Ionicons name="school-outline" size={24} color="#029739ff" />
                    </View>
                    <View className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 justify-center items-center">
                        <Ionicons name="chevron-forward" size={14} color={isDarkMode ? "#AAA" : "#666"} />
                    </View>
                </View>

                <View>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Semester</Text>
                    <Text className="text-gray-900 dark:text-white text-4xl font-bold tracking-tighter">{item}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
                <View className="flex-1 bg-gray-50 dark:bg-[#1A1A1A] justify-center items-center">
                    <ActivityIndicator size="large" color="#4ade80" />
                </View>
            </View>
        );
    }

    return (
        <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
            <View className="flex-1 bg-gray-50 dark:bg-[#1A1A1A]">
                <StatusBar style="auto" />

                <View className="mb-2">
                    <LinearGradient
                        colors={isDarkMode ? ['#1A1A1A', '#1A1A1A'] : ['#f9fafb', '#f9fafb']}
                        className="pb-6 rounded-b-[30px]"
                    >
                        <SafeAreaView edges={['top']} className="px-6">
                            {/* Top Bar */}
                            <View className="flex-row justify-between items-center mt-2 mb-6">
                                <View>
                                    <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">Welcome Back,</Text>
                                    <Text className="text-gray-900 dark:text-white text-2xl font-bold">{user.username || 'Student'}</Text>
                                </View>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                                    <Image
                                        source={{ uri: user.profile_pic || "https://i.pravatar.cc/150" }}
                                        className="w-11 h-11 rounded-full border-2 border-blue-500"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Featured Banner */}
                            <LinearGradient
                                colors={['#055824ff', '#000000ff']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="flex-row justify-between items-center p-6 rounded-3xl overflow-hidden relative"
                            >
                                <View className="p-2 rounded-xl ">
                                    <Text className="text-white/80 text-xs font-semibold uppercase mb-1">Current Course</Text>
                                    <Text className="text-white text-4xl font-bold">{courseName}</Text>
                                </View>
                                <View className="absolute -right-3 -bottom-3">
                                    <Ionicons name="book" size={56} color="rgba(255, 255, 255, 0.23)" />
                                </View>
                            </LinearGradient>
                        </SafeAreaView>
                    </LinearGradient>
                </View>



                <FlatList
                    data={semesters}
                    renderItem={renderSemesterCard}
                    keyExtractor={(item) => item.toString()}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text className="text-gray-900 dark:text-white text-xl font-bold mb-4 ml-2">Your Semesters</Text>
                    }
                    ListFooterComponent={
                        <View className="mt-12 mb-6 items-center">
                            <Text className="text-gray-400 dark:text-neutral-500 text-6xl font-bold tracking-tighter mb-4">Live it up!</Text>
                            <View className="flex-row items-center">
                                <Text className="text-gray-500 dark:text-neutral-500 text-base">Crafted with </Text>
                                <Ionicons name="heart" size={16} color="#005018ff" />
                                <Text className="text-gray-500 dark:text-neutral-500 text-base"> by Pixel Class Teams</Text>
                            </View>
                            <Text className="text-neutral-600 text-xs mt-2">© 2025 Pixel Class. All rights reserved.</Text>
                            <Text className="text-neutral-700 text-[10px] mt-1">v{Constants.expoConfig?.version ?? (Constants.manifest as any)?.version ?? '1.0.0'}</Text>
                            {/* 
                        <Text className="text-neutral-500 text-xs mt-2">
                            Front End Development : <Link href="https://github.com/man-navlakha">MAN NAVLAKHA</Link>
                            Back End Development : <Link href="https://github.com/dhruv-sharma">DHRUV SHARMA</Link>
                        </Text> */}
                        </View>
                    }
                />
            </View>
        </View>
    );
}
