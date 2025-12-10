import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
    const router = useRouter();

    const Section = ({ title, children }: any) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    const Paragraph = ({ children }: any) => (
        <Text style={styles.paragraph}>{children}</Text>
    );

    const BulletPoint = ({ children }: any) => (
        <View style={styles.bulletContainer}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{children}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" animated />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    <Text style={styles.lastUpdated}>Last Updated: December 10, 2024</Text>

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

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>© 2024 Pixel Class. All rights reserved.</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    lastUpdated: {
        color: '#888',
        fontSize: 13,
        fontStyle: 'italic',
        marginBottom: 24,
        textAlign: 'center',
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    paragraph: {
        color: '#AAA',
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 12,
    },
    bulletContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingLeft: 8,
    },
    bullet: {
        color: '#4ade80',
        fontSize: 15,
        marginRight: 8,
        marginTop: 2,
    },
    bulletText: {
        color: '#AAA',
        fontSize: 15,
        lineHeight: 24,
        flex: 1,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    footerText: {
        color: '#666',
        fontSize: 13,
    },
});
