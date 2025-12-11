import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function NotFoundScreen() {
    const { isDarkMode } = useTheme();

    return (
        <>
            <Stack.Screen options={{
                title: 'Oops! Not Found',
                headerStyle: { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' },
                headerTintColor: isDarkMode ? '#fff' : '#111827'
            }} />
            <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]}>
                <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#111827' }]}>404</Text>
                <Text style={[styles.message, { color: isDarkMode ? '#AAA' : '#6b7280' }]}>Page not found</Text>
                <Link href="/" asChild>
                    <Text style={styles.button}>
                        Go back to Home screen!
                    </Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 72,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    message: {
        fontSize: 18,
        marginBottom: 32,
    },
    button: {
        fontSize: 16,
        color: '#10b981',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
