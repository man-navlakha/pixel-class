import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    iconName?: keyof typeof Ionicons.glyphMap;
    isPassword?: boolean;
}

export default function Input({
    label,
    error,
    containerStyle,
    iconName,
    isPassword = false,
    ...props
}: InputProps) {
    const { isDarkMode } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, { color: isDarkMode ? '#CCC' : '#374151' }]}>{label}</Text>}

            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: isDarkMode ? '#1E1E1E' : '#f3f4f6',
                    borderColor: error ? '#ef4444' : (isFocused ? '#10b981' : (isDarkMode ? '#333' : '#d1d5db'))
                }
            ]}>
                {iconName && (
                    <Ionicons
                        name={iconName}
                        size={20}
                        color={isFocused ? '#10b981' : (isDarkMode ? '#666' : '#9ca3af')}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={[styles.input, { color: isDarkMode ? '#FFF' : '#111827' }]}
                    placeholderTextColor={isDarkMode ? '#666' : '#9ca3af'}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isPassword && !showPassword}
                    {...props}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={isDarkMode ? '#666' : '#9ca3af'}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        width: '100%',
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        height: 56,
        paddingHorizontal: 16,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
