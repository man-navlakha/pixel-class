import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeContextType = {
    isDarkMode: boolean;
    toggleTheme: () => void;
    isSystemTheme: boolean;
    setSystemTheme: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isSystemTheme, setIsSystemTheme] = useState(false);

    useEffect(() => {
        loadThemePreference();
    }, []);

    useEffect(() => {
        if (isSystemTheme) {
            setIsDarkMode(systemColorScheme === 'dark');
        }
    }, [systemColorScheme, isSystemTheme]);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            const savedSystemTheme = await AsyncStorage.getItem('systemTheme');

            if (savedSystemTheme === 'true') {
                setIsSystemTheme(true);
                setIsDarkMode(systemColorScheme === 'dark');
            } else if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkMode;
            setIsDarkMode(newTheme);
            setIsSystemTheme(false);
            await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
            await AsyncStorage.setItem('systemTheme', 'false');
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const handleSetSystemTheme = async (value: boolean) => {
        try {
            setIsSystemTheme(value);
            await AsyncStorage.setItem('systemTheme', value.toString());
            if (value) {
                setIsDarkMode(systemColorScheme === 'dark');
            }
        } catch (error) {
            console.error('Error saving system theme preference:', error);
        }
    };

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                toggleTheme,
                isSystemTheme,
                setSystemTheme: handleSetSystemTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
