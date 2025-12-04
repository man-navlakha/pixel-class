import { Ionicons } from '@expo/vector-icons';
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
import { API_URLS, apiCall } from '../../utils/api';

export default function HomeScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [semesters, setSemesters] = useState<number[]>([]);
    const [courseName, setCourseName] = useState('');
    const [user, setUser] = useState({ username: '', profile_pic: '' });

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
                colors={['#333333', '#1A1A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 p-5 justify-between border border-white/10"
            >
                <View className="flex-row justify-between items-start">
                    <View className="w-12 h-12 rounded-2xl bg-blue-500/15 justify-center items-center">
                        <Ionicons name="school-outline" size={24} color="#4A90E2" />
                    </View>
                    <View className="w-8 h-8 rounded-full bg-white/5 justify-center items-center">
                        <Ionicons name="chevron-forward" size={14} color="#AAA" />
                    </View>
                </View>

                <View>
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Semester</Text>
                    <Text className="text-white text-4xl font-bold tracking-tighter">{item}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 bg-neutral-900 justify-center items-center">
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-neutral-900">
            <StatusBar style="light" />

            <View className="mb-2">
                <LinearGradient
                    colors={['#1E1E1E', '#121212']}
                    className="pb-6 rounded-b-[30px]"
                >
                    <SafeAreaView edges={['top']} className="px-6">
                        {/* Top Bar */}
                        <View className="flex-row justify-between items-center mt-2 mb-6">
                            <View>
                                <Text className="text-gray-400 text-sm mb-1">Welcome Back,</Text>
                                <Text className="text-white text-2xl font-bold">{user.username || 'Student'}</Text>
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
                            colors={['#4A90E2', '#357ABD']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="flex-row justify-between items-center p-6 rounded-3xl overflow-hidden relative"
                        >
                            <View>
                                <Text className="text-white/80 text-xs font-semibold uppercase mb-1">Current Course</Text>
                                <Text className="text-white text-2xl font-bold">{courseName}</Text>
                            </View>
                            <View className="absolute -right-3 -bottom-3">
                                <Ionicons name="book" size={56} color="rgba(255,255,255,0.2)" />
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
                    <Text className="text-white text-xl font-bold mb-4 ml-2">Your Semesters</Text>
                }
                ListFooterComponent={
                    <View className="mt-8 items-center">
                        <Text className="text-gray-500 text-sm">Made with ❤️ by Pixel Class Teams</Text>
                        <Text className="text-gray-600 text-xs mt-1">© 2025 Pixel Class. All rights reserved.</Text>
                    </View>
                }
            />
        </View>
    );
}
