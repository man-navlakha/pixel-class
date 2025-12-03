import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Hello World</Text>
                <Text style={styles.subtitle}>Welcome to your new app</Text>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Login"
                        onPress={() => router.push('/auth/login')}
                        style={styles.button}
                    />
                    <Button
                        title="Sign Up"
                        onPress={() => router.push('/auth/signup')}
                        variant="outline"
                        style={styles.button}
                    />
                </View>
            </View>
            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Dark background
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#1E1E1E',
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#333',
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#AAAAAA',
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    button: {
        width: '100%',
    }
});
