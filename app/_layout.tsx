import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import Animated, { FadeOut } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from '../contexts/ThemeContext';
import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading resources (e.g. fonts, api calls)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide the native splash screen immediately
      await SplashScreen.hideAsync();
      // Start fading out the custom splash after a short delay
      setTimeout(() => {
        setShowSplash(false);
      }, 500);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="auth/forgetpassword" options={{ headerShown: false }} />
        </Stack>

        {showSplash && (
          <Animated.View
            exiting={FadeOut.duration(800)}
            style={styles.splashContainer}
          >
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: 'https://ik.imagekit.io/pxc/pixel%20class%20fav%20w-02.png' }}
                style={styles.logoImage}
                contentFit="contain"
              />
            </View>
            <Text style={styles.appName}>Pixel Class</Text>
          </Animated.View>
        )}
        <Toast />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: '80%',
    height: '80%',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
});
