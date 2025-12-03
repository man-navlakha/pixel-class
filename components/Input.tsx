import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native';

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
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                error ? styles.inputContainerError : null
            ]}>
                {iconName && (
                    <Ionicons
                        name={iconName}
                        size={20}
                        color={isFocused ? '#4A90E2' : '#666'}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholderTextColor="#666"
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
                            color="#666"
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
        color: '#CCC',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        height: 56,
        paddingHorizontal: 16,
    },
    inputContainerFocused: {
        borderColor: '#4A90E2',
        backgroundColor: '#252525',
    },
    inputContainerError: {
        borderColor: '#FF5252',
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    errorText: {
        color: '#FF5252',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
