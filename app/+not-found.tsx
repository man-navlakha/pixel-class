
import { Link, Stack } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export default function NotFoundScreen() {
    const containerOpacity = useSharedValue(0);
    const containerScale = useSharedValue(0.8);
    const linkScale = useSharedValue(1);

    useEffect(() => {
        containerOpacity.value = withTiming(1, { duration: 800 });
        containerScale.value = withTiming(1, { duration: 800 });

        linkScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 600 }),
                withTiming(1, { duration: 600 })
            ),
            -1, // Repeat indefinitely
            true // Reverse
        );
    }, []);

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            opacity: containerOpacity.value,
            transform: [{ scale: containerScale.value }],
        };
    });

    const animatedLinkStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: linkScale.value }],
        };
    });

    return (
        <>
            <Stack.Screen options={{ title: 'Oops! Not Found' }} />
            <Animated.View style={[styles.container, animatedContainerStyle]}>
                <Link href="/" asChild>
                    <Animated.Text style={[styles.button, animatedLinkStyle]}>
                        Go back to Home screen!
                    </Animated.Text>
                </Link>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },

    button: {
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#fff',
    },
});
