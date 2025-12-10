# Dark Mode Implementation Guide

## Overview
A global dark mode system has been implemented across the Pixel Class app. Users can toggle between light and dark themes from the Settings page, and the preference is persisted across app sessions.

## What Was Implemented

### 1. Theme Context (`contexts/ThemeContext.tsx`)
- **Global State Management**: Created a React Context to manage dark mode state across the entire app
- **Persistence**: Uses AsyncStorage to save user's theme preference
- **System Theme Support**: Can follow the device's system theme setting
- **Hook**: Provides `useTheme()` hook for easy access to theme state and controls

### 2. Root Layout Update (`app/_layout.tsx`)
- Wrapped the entire app with `<ThemeProvider>` to make theme state available everywhere
- Installed `@react-native-async-storage/async-storage` for theme persistence

### 3. Settings Page (`app/settings.tsx`)
- Connected the Dark Mode toggle to the global theme context
- Toggle now controls the app-wide theme instead of just local state
- Changes are immediately reflected across all pages

### 4. About Page (`app/settings/about.tsx`)
- Already uses TailwindCSS with `dark:` variants
- Now wrapped with theme-aware View component
- Automatically switches between light/dark mode based on global state

## How to Use

### For Users
1. Open the app and navigate to **Settings**
2. Find the **Dark Mode** toggle under **PREFERENCES**
3. Toggle it ON for dark theme, OFF for light theme
4. The change applies immediately across all pages
5. Your preference is saved and will persist when you reopen the app

### For Developers

#### Using the Theme in a Component
```tsx
import { useTheme } from '../contexts/ThemeContext';

export default function MyComponent() {
    const { isDarkMode, toggleTheme } = useTheme();
    
    return (
        <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
            <View className="bg-white dark:bg-gray-900">
                <Text className="text-black dark:text-white">
                    Hello World
                </Text>
            </View>
        </View>
    );
}
```

#### Theme Context API
```tsx
const {
    isDarkMode,      // boolean: current theme state
    toggleTheme,     // function: toggle between light/dark
    isSystemTheme,   // boolean: whether following system theme
    setSystemTheme   // function: enable/disable system theme
} = useTheme();
```

## Pages That Support Dark Mode

### ✅ Fully Implemented
- **Settings Page** (`app/settings.tsx`) - Uses StyleSheet (needs conversion to Tailwind)
- **About Page** (`app/settings/about.tsx`) - Uses TailwindCSS with dark mode

### 🔄 Need Implementation
The following pages need to be updated to use the theme context:

1. **Home/Index** (`app/(tabs)/index.tsx`)
2. **Chat** (`app/(tabs)/chat.tsx`)
3. **Search** (`app/(tabs)/search.tsx`)
4. **Profile** (`app/(tabs)/profile.tsx`)
5. **Privacy Policy** (`app/settings/privacy.tsx`)
6. **Terms & Conditions** (`app/settings/terms.tsx`)
7. **Auth Pages** (login, signup, etc.)

## Implementation Steps for Other Pages

### For Pages Using TailwindCSS
```tsx
import { useTheme } from '../contexts/ThemeContext';

export default function MyPage() {
    const { isDarkMode } = useTheme();
    
    return (
        <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
            {/* Your existing Tailwind components */}
            <View className="bg-white dark:bg-gray-900">
                <Text className="text-gray-900 dark:text-white">
                    Content
                </Text>
            </View>
        </View>
    );
}
```

### For Pages Using StyleSheet
1. Import the theme hook
2. Create conditional styles based on `isDarkMode`
3. Or convert to TailwindCSS for easier dark mode support

## Color Palette Reference

### Light Mode
- Background: `bg-white`, `bg-gray-50`, `bg-gray-100`
- Text: `text-gray-900`, `text-gray-700`, `text-gray-600`
- Borders: `border-gray-200`, `border-gray-300`

### Dark Mode
- Background: `dark:bg-[#121212]`, `dark:bg-[#1A1A1A]`, `dark:bg-[#1E1E1E]`
- Text: `dark:text-white`, `dark:text-gray-300`, `dark:text-gray-400`
- Borders: `dark:border-gray-800`, `dark:border-[#2A2A2A]`

### Accent Colors (Same in both modes)
- Primary: `#4ade80` (green)
- Success: `#10b981`
- Error: `#ef4444`
- Warning: `#f59e0b`

## StatusBar Handling
Use `style="auto"` for automatic StatusBar color based on theme:
```tsx
<StatusBar style="auto" animated />
```

## Testing Checklist
- [ ] Toggle dark mode in Settings
- [ ] Verify About page switches themes
- [ ] Close and reopen app - theme should persist
- [ ] Check all text is readable in both modes
- [ ] Verify borders and backgrounds look good
- [ ] Test on both iOS and Android

## Next Steps
1. Convert remaining pages to support dark mode
2. Consider adding a "System Default" option
3. Add smooth transition animations when switching themes
4. Test accessibility in both themes

## Dependencies
- `@react-native-async-storage/async-storage` - For theme persistence
- `nativewind` - For Tailwind CSS dark mode support
- React Context API - For global state management
