import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Image,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

export default function AboutScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const appVersion = Constants.expoConfig?.version || '1.0.0';

    const openLink = (url: string) => {
        Linking.openURL(url);
    };

    const InfoCard = ({ icon, title, description }: any) => (
        <View className="flex-row bg-gray-100 dark:bg-[#1E1E1E] rounded-xl p-4 mb-3 border border-gray-200 dark:border-gray-800">
            <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#2A2A2A] items-center justify-center mr-4">
                <Ionicons name={icon} size={28} color="#4ade80" />
            </View>
            <View className="flex-1">
                <Text className="text-gray-900 dark:text-white text-base font-semibold mb-1">{title}</Text>
                <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">{description}</Text>
            </View>
        </View>
    );

    const LinkButton = ({ icon, title, onPress }: any) => (
        <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-[#2A2A2A]"
            onPress={onPress}
        >
            <View className="flex-row items-center">
                <Ionicons name={icon} size={20} color="#4ade80" />
                <Text className="text-gray-900 dark:text-white text-base ml-3">{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
    );

    return (
        <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
            <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]" edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar style="auto" animated />

                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                    <TouchableOpacity
                        className="p-2"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} className="text-gray-900 dark:text-white" color="#000" />
                    </TouchableOpacity>
                    <Text className="text-gray-900 dark:text-white text-xl font-bold">About Us</Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo Section */}
                    <View className="items-center py-10 px-5">
                        <View className="w-30 h-30 rounded-full bg-gray-100 dark:bg-[#1E1E1E] items-center justify-center mb-5 border-3 border-green-400 shadow-lg shadow-green-400/50">
                            <Image
                                source={{ uri: 'https://ik.imagekit.io/pxc/pixel%20class%20fav%20w-02.png' }}
                                className="w-20 h-20"
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-gray-900 dark:text-white text-3xl font-bold mb-2">Pixel Class</Text>
                        <Text className="text-gray-600 dark:text-gray-400 text-base mb-4">Your Digital Learning Companion</Text>
                        <View className="mt-2 bg-green-400 dark:bg-green-500 px-4 py-2 rounded-full">
                            <Text className="text-white dark:text-gray-900 text-xs font-semibold">Version {appVersion}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="px-5 py-6">
                        <Text className="text-gray-900 dark:text-white text-xl font-bold mb-4">Our Mission</Text>
                        <Text className="text-gray-700 dark:text-gray-300 text-base leading-6 mb-4">
                            Pixel Class is dedicated to revolutionizing the way students learn and share knowledge.
                            We provide a comprehensive platform where students can access study materials, share notes,
                            collaborate with peers, and excel in their academic journey.
                        </Text>
                        <Text className="text-gray-700 dark:text-gray-300 text-base leading-6 mb-4">
                            Our mission is to make quality education accessible to everyone, anywhere, anytime.
                            We believe in the power of collaborative learning and aim to create a vibrant community
                            of learners who support and inspire each other.
                        </Text>
                    </View>

                    {/* Features */}
                    <View className="px-5 py-6 bg-gray-50 dark:bg-[#1A1A1A]">
                        <Text className="text-gray-900 dark:text-white text-xl font-bold mb-4">What We Offer</Text>
                        <InfoCard
                            icon="book-outline"
                            title="Study Materials"
                            description="Access a vast library of notes, PDFs, and study resources shared by students and educators."
                        />
                        <InfoCard
                            icon="people-outline"
                            title="Community Learning"
                            description="Connect with fellow students, share knowledge, and grow together in a supportive environment."
                        />
                        <InfoCard
                            icon="chatbubbles-outline"
                            title="Real-time Chat"
                            description="Communicate instantly with classmates and get help when you need it most."
                        />
                        <InfoCard
                            icon="search-outline"
                            title="Smart Search"
                            description="Find exactly what you need with our powerful search and filtering capabilities."
                        />
                    </View>

                    {/* Quick Links */}
                    <View className="px-5 py-6">
                        <Text className="text-gray-900 dark:text-white text-xl font-bold mb-4">Important Links</Text>
                        <View className="bg-gray-100 dark:bg-[#1E1E1E] rounded-xl overflow-hidden">
                            <LinkButton
                                icon="shield-checkmark-outline"
                                title="Privacy Policy"
                                onPress={() => router.push('/settings/privacy' as any)}
                            />
                            <LinkButton
                                icon="document-text-outline"
                                title="Terms & Conditions"
                                onPress={() => router.push('/settings/terms' as any)}
                            />
                            <LinkButton
                                icon="mail-outline"
                                title="Contact Support"
                                onPress={() => openLink('mailto:support@pixelclass.com')}
                            />
                            <LinkButton
                                icon="globe-outline"
                                title="Visit Website"
                                onPress={() => openLink('https://pixelclass.netlify.app')}
                            />
                        </View>
                    </View>

                    {/* Team Section */}
                    <View className="px-5 py-6 bg-gray-50 dark:bg-[#1A1A1A]">
                        <Text className="text-gray-900 dark:text-white text-xl font-bold mb-4">Our Team</Text>
                        <Text className="text-gray-700 dark:text-gray-300 text-base leading-6 mb-5">
                            Pixel Class is built and maintained by a passionate team of developers and educators
                            who are committed to making education better for everyone.
                        </Text>
                        <View className="bg-gray-100 dark:bg-[#1E1E1E] rounded-xl p-5 items-center border border-gray-200 dark:border-gray-800">
                            <Text className="text-green-500 dark:text-green-400 text-sm font-semibold mb-1">Lead Developer</Text>
                            <Text className="text-gray-900 dark:text-white text-lg font-bold">Man Navlakha</Text>
                        </View>
                    </View>

                    {/* Social Media */}
                    <View className="px-5 py-6">
                        <Text className="text-gray-900 dark:text-white text-xl font-bold mb-4">Connect With Us</Text>
                        <View className="flex-row justify-center gap-4">
                            <TouchableOpacity
                                className="w-15 h-15 rounded-full bg-gray-100 dark:bg-[#1E1E1E] items-center justify-center border border-gray-200 dark:border-gray-800"
                                onPress={() => openLink('https://twitter.com/pixelclass')}
                            >
                                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-15 h-15 rounded-full bg-gray-100 dark:bg-[#1E1E1E] items-center justify-center border border-gray-200 dark:border-gray-800"
                                onPress={() => openLink('https://instagram.com/pixelclass')}
                            >
                                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-15 h-15 rounded-full bg-gray-100 dark:bg-[#1E1E1E] items-center justify-center border border-gray-200 dark:border-gray-800"
                                onPress={() => openLink('https://linkedin.com/company/pixelclass')}
                            >
                                <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-15 h-15 rounded-full bg-gray-100 dark:bg-[#1E1E1E] items-center justify-center border border-gray-200 dark:border-gray-800"
                                onPress={() => openLink('https://github.com/pixelclass')}
                            >
                                <Ionicons name="logo-github" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <View className="items-center py-10 px-5">
                        <Text className="text-gray-500 dark:text-gray-600 text-base mb-2">Made with ❤️ for Students</Text>
                        <Text className="text-gray-400 dark:text-gray-700 text-sm mb-1">© 2024 Pixel Class. All rights reserved.</Text>
                        <Text className="text-gray-300 dark:text-gray-800 text-xs">Build {appVersion}</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
