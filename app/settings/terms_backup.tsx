import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const Section = ({ title, children }: any) => (
        <View className="mb-7">
            <Text className="text-gray-900 dark:text-white text-lg font-bold mb-3">{title}</Text>
            {children}
        </View>
    );

    const Paragraph = ({ children }: any) => (
        <Text className="text-gray-700 dark:text-gray-300 text-base leading-6 mb-3">{children}</Text>
    );

    const BulletPoint = ({ children }: any) => (
        <View className="flex-row mb-2.5 pl-2">
            <Text className="text-green-500 dark:text-green-400 text-base mr-2 mt-0.5">•</Text>
            <Text className="text-gray-700 dark:text-gray-300 text-base leading-6 flex-1">{children}</Text>
        </View>
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
                        <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                    </TouchableOpacity>
                    <Text className="text-gray-900 dark:text-white text-xl font-bold">Privacy Policy</Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="p-5">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm italic mb-6 text-center">Last Updated: December 10, 2024</Text>

                        <Section title="Introduction">
                            <Paragraph>
                                Welcome to Pixel Class. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you about how we look after your personal data when you visit our
                                application and tell you about your privacy rights and how the law protects you.
                            </Paragraph>
                        </Section>

                        <Section title="Information We Collect">
                            <Paragraph>
                                We may collect, use, store and transfer different kinds of personal data about you:
                            </Paragraph>
                            <BulletPoint>
                                Identity Data: includes first name, last name, username or similar identifier
                            </BulletPoint>
                            <BulletPoint>
                                Contact Data: includes email address and telephone numbers
                            </BulletPoint>
                            <BulletPoint>
                                Profile Data: includes your profile picture, academic information, and preferences
                            </BulletPoint>
                            <BulletPoint>
                                Usage Data: includes information about how you use our app and services
                            </BulletPoint>
                            <BulletPoint>
                                Technical Data: includes device type, operating system, and app version
                            </BulletPoint>
                        </Section>

                        <Section title="How We Use Your Information">
                            <Paragraph>
                                We use your personal data for the following purposes:
                            </Paragraph>
                            <BulletPoint>
                                To provide and maintain our service
                            </BulletPoint>
                            <BulletPoint>
                                To notify you about changes to our service
                            </BulletPoint>
                            <BulletPoint>
                                To allow you to participate in interactive features
                            </BulletPoint>
                            <BulletPoint>
                                To provide customer support
                            </BulletPoint>
                            <BulletPoint>
                                To gather analysis or valuable information to improve our service
                            </BulletPoint>
                            <BulletPoint>
                                To monitor the usage of our service
                            </BulletPoint>
                            <BulletPoint>
                                To detect, prevent and address technical issues
                            </BulletPoint>
                        </Section>

                        <Section title="Data Security">
                            <Paragraph>
                                We have implemented appropriate security measures to prevent your personal data from being
                                accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We limit
                                access to your personal data to those employees, agents, contractors and other third parties
                                who have a business need to know.
                            </Paragraph>
                        </Section>

                        <Section title="Data Retention">
                            <Paragraph>
                                We will only retain your personal data for as long as necessary to fulfill the purposes we
                                collected it for, including for the purposes of satisfying any legal, accounting, or reporting
                                requirements.
                            </Paragraph>
                        </Section>

                        <Section title="Your Rights">
                            <Paragraph>
                                Under certain circumstances, you have rights under data protection laws in relation to your
                                personal data:
                            </Paragraph>
                            <BulletPoint>
                                Request access to your personal data
                            </BulletPoint>
                            <BulletPoint>
                                Request correction of your personal data
                            </BulletPoint>
                            <BulletPoint>
                                Request erasure of your personal data
                            </BulletPoint>
                            <BulletPoint>
                                Object to processing of your personal data
                            </BulletPoint>
                            <BulletPoint>
                                Request restriction of processing your personal data
                            </BulletPoint>
                            <BulletPoint>
                                Request transfer of your personal data
                            </BulletPoint>
                            <BulletPoint>
                                Right to withdraw consent
                            </BulletPoint>
                        </Section>

                        <Section title="Third-Party Services">
                            <Paragraph>
                                We may employ third-party companies and individuals to facilitate our service, provide the
                                service on our behalf, perform service-related services, or assist us in analyzing how our
                                service is used. These third parties have access to your personal data only to perform these
                                tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                            </Paragraph>
                        </Section>

                        <Section title="Children's Privacy">
                            <Paragraph>
                                Our service is intended for users who are at least 13 years old. We do not knowingly collect
                                personally identifiable information from children under 13. If you are a parent or guardian
                                and you are aware that your child has provided us with personal data, please contact us.
                            </Paragraph>
                        </Section>

                        <Section title="Changes to This Privacy Policy">
                            <Paragraph>
                                We may update our Privacy Policy from time to time. We will notify you of any changes by
                                posting the new Privacy Policy on this page and updating the "Last Updated" date at the top
                                of this Privacy Policy.
                            </Paragraph>
                        </Section>

                        <Section title="Contact Us">
                            <Paragraph>
                                If you have any questions about this Privacy Policy, please contact us:
                            </Paragraph>
                            <BulletPoint>
                                By email: privacy@pixelclass.com
                            </BulletPoint>
                            <BulletPoint>
                                By visiting our website: https://pixelclass.netlify.app
                            </BulletPoint>
                        </Section>

                        <View className="items-center py-8 mt-5 border-t border-gray-200 dark:border-gray-800">
                            <Text className="text-gray-500 dark:text-gray-600 text-sm">© 2024 Pixel Class. All rights reserved.</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
