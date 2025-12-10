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

export default function TermsScreen() {
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
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    <Text style={styles.lastUpdated}>Last Updated: December 10, 2024</Text>

                    <Section title="1. Acceptance of Terms">
                        <Paragraph>
                            By accessing and using Pixel Class, you accept and agree to be bound by the terms and
                            provision of this agreement. If you do not agree to abide by the above, please do not use
                            this service.
                        </Paragraph>
                    </Section>

                    <Section title="2. Use License">
                        <Paragraph>
                            Permission is granted to temporarily access the materials (information or software) on
                            Pixel Class for personal, non-commercial transitory viewing only. This is the grant of a
                            license, not a transfer of title, and under this license you may not:
                        </Paragraph>
                        <BulletPoint>
                            Modify or copy the materials
                        </BulletPoint>
                        <BulletPoint>
                            Use the materials for any commercial purpose or for any public display
                        </BulletPoint>
                        <BulletPoint>
                            Attempt to reverse engineer any software contained in Pixel Class
                        </BulletPoint>
                        <BulletPoint>
                            Remove any copyright or other proprietary notations from the materials
                        </BulletPoint>
                        <BulletPoint>
                            Transfer the materials to another person or "mirror" the materials on any other server
                        </BulletPoint>
                    </Section>

                    <Section title="3. User Accounts">
                        <Paragraph>
                            When you create an account with us, you must provide information that is accurate, complete,
                            and current at all times. Failure to do so constitutes a breach of the Terms, which may result
                            in immediate termination of your account.
                        </Paragraph>
                        <Paragraph>
                            You are responsible for safeguarding the password that you use to access the service and for
                            any activities or actions under your password.
                        </Paragraph>
                    </Section>

                    <Section title="4. User Content">
                        <Paragraph>
                            Our service allows you to post, link, store, share and otherwise make available certain
                            information, text, graphics, or other material. You are responsible for the content that you
                            post to the service, including its legality, reliability, and appropriateness.
                        </Paragraph>
                        <Paragraph>
                            By posting content to the service, you grant us the right and license to use, modify, publicly
                            perform, publicly display, reproduce, and distribute such content on and through the service.
                        </Paragraph>
                    </Section>

                    <Section title="5. Prohibited Uses">
                        <Paragraph>
                            You may use the service only for lawful purposes and in accordance with these Terms. You agree
                            not to use the service:
                        </Paragraph>
                        <BulletPoint>
                            In any way that violates any applicable national or international law or regulation
                        </BulletPoint>
                        <BulletPoint>
                            To transmit, or procure the sending of, any advertising or promotional material without our
                            prior written consent
                        </BulletPoint>
                        <BulletPoint>
                            To impersonate or attempt to impersonate the company, another user, or any other person or entity
                        </BulletPoint>
                        <BulletPoint>
                            To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the service
                        </BulletPoint>
                        <BulletPoint>
                            To upload or transmit viruses or any other type of malicious code
                        </BulletPoint>
                    </Section>

                    <Section title="6. Intellectual Property">
                        <Paragraph>
                            The service and its original content (excluding content provided by users), features and
                            functionality are and will remain the exclusive property of Pixel Class and its licensors.
                            The service is protected by copyright, trademark, and other laws.
                        </Paragraph>
                    </Section>

                    <Section title="7. Copyright Policy">
                        <Paragraph>
                            We respect the intellectual property rights of others. It is our policy to respond to any claim
                            that content posted on the service infringes on the copyright or other intellectual property
                            rights of any person or entity.
                        </Paragraph>
                    </Section>

                    <Section title="8. Termination">
                        <Paragraph>
                            We may terminate or suspend your account and bar access to the service immediately, without prior
                            notice or liability, under our sole discretion, for any reason whatsoever and without limitation,
                            including but not limited to a breach of the Terms.
                        </Paragraph>
                    </Section>

                    <Section title="9. Limitation of Liability">
                        <Paragraph>
                            In no event shall Pixel Class, nor its directors, employees, partners, agents, suppliers, or
                            affiliates, be liable for any indirect, incidental, special, consequential or punitive damages,
                            including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                        </Paragraph>
                    </Section>

                    <Section title="10. Disclaimer">
                        <Paragraph>
                            Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS
                            AVAILABLE" basis. The service is provided without warranties of any kind, whether express or
                            implied.
                        </Paragraph>
                    </Section>

                    <Section title="11. Governing Law">
                        <Paragraph>
                            These Terms shall be governed and construed in accordance with the laws of India, without regard
                            to its conflict of law provisions.
                        </Paragraph>
                    </Section>

                    <Section title="12. Changes to Terms">
                        <Paragraph>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                            If a revision is material, we will provide at least 30 days' notice prior to any new terms
                            taking effect.
                        </Paragraph>
                    </Section>

                    <Section title="13. Contact Us">
                        <Paragraph>
                            If you have any questions about these Terms, please contact us:
                        </Paragraph>
                        <BulletPoint>
                            By email: legal@pixelclass.com
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
