# 📱 System Theme Sync - How It Works

## ✨ New Feature: Use System Theme

Your app now has a **"Use System Theme"** option that automatically syncs with your device's dark/light mode settings!

## 🎯 How to Use

### Option 1: Manual Theme Control
1. Go to **Settings** → **Preferences**
2. Make sure **"Use System Theme"** is **OFF**
3. Toggle **"Dark Mode"** ON/OFF manually
4. Your choice is saved and persists

### Option 2: Sync with Device (Recommended)
1. Go to **Settings** → **Preferences**
2. Toggle **"Use System Theme"** **ON**
3. The app will now automatically follow your device's theme
4. The **"Dark Mode"** toggle becomes disabled (grayed out)
5. Change your device's theme, and the app updates instantly!

## 🔧 How It Works Technically

### Theme Context (`contexts/ThemeContext.tsx`)

The theme context now includes:

```tsx
{
    isDarkMode: boolean,        // Current theme state
    toggleTheme: () => void,    // Manual toggle function
    isSystemTheme: boolean,     // Whether using system theme
    setSystemTheme: (value: boolean) => void  // Enable/disable system theme
}
```

### Automatic Detection

When **Use System Theme** is enabled:
1. The app uses React Native's `useColorScheme()` hook
2. It detects your device's current theme (light/dark)
3. Updates automatically when you change device settings
4. No manual toggling needed!

### Persistence

Your preference is saved using AsyncStorage:
- `theme`: 'dark' or 'light' (manual mode)
- `systemTheme`: 'true' or 'false' (system sync mode)

## 📱 Device Theme Settings

### iOS
1. Open **Settings**
2. Go to **Display & Brightness**
3. Choose **Light** or **Dark**
4. Or enable **Automatic** (based on time)

### Android
1. Open **Settings**
2. Go to **Display**
3. Choose **Light** or **Dark** theme
4. Or enable **Dark theme schedule**

## 🎨 UI Behavior

### When System Theme is OFF
- **Dark Mode toggle**: Enabled (you can toggle it)
- **Subtitle**: "Use dark theme"
- **Behavior**: Manual control

### When System Theme is ON
- **Dark Mode toggle**: Disabled (grayed out)
- **Subtitle**: "Controlled by system"
- **Behavior**: Follows device automatically

## ✅ Benefits

1. **Convenience**: No need to manually switch
2. **Consistency**: Matches your device's appearance
3. **Automatic**: Updates when you change device theme
4. **Battery Saving**: Dark mode at night (if device is set to auto)
5. **Eye Comfort**: Follows your preferred schedule

## 🔄 Priority Order

The app determines the theme in this order:

1. **If System Theme is ON**:
   - Use device's current theme
   - Ignore manual Dark Mode setting

2. **If System Theme is OFF**:
   - Use manual Dark Mode setting
   - Saved preference from AsyncStorage

## 🧪 Testing

### Test Manual Mode
1. Turn OFF "Use System Theme"
2. Toggle "Dark Mode" ON → App goes dark
3. Toggle "Dark Mode" OFF → App goes light
4. Close and reopen app → Theme persists

### Test System Sync
1. Turn ON "Use System Theme"
2. Change device to Dark Mode → App goes dark
3. Change device to Light Mode → App goes light
4. Notice "Dark Mode" toggle is disabled
5. Close and reopen app → Still syncs with device

### Test Switching Between Modes
1. Enable "Use System Theme" (syncs with device)
2. Disable "Use System Theme" (switches to manual)
3. The last device theme becomes your manual setting
4. Now you can toggle manually again

## 💡 Best Practices

### For Most Users
- **Enable "Use System Theme"**
- Let your device control the theme
- Set your device to auto-switch based on time

### For Manual Control
- **Disable "Use System Theme"**
- Toggle "Dark Mode" as needed
- Good for testing or specific preferences

## 🎯 Example Scenarios

### Scenario 1: Night Owl
- Device: Auto dark mode at 8 PM
- App Setting: Use System Theme ON
- Result: App automatically goes dark at 8 PM

### Scenario 2: Always Dark
- Device: Always light mode
- App Setting: Use System Theme OFF, Dark Mode ON
- Result: App stays dark regardless of device

### Scenario 3: Follow Device
- Device: Changes throughout the day
- App Setting: Use System Theme ON
- Result: App always matches device

## 🔍 Troubleshooting

### App doesn't follow device theme
- Check if "Use System Theme" is enabled
- Try toggling it OFF and ON again
- Restart the app

### Can't toggle Dark Mode
- This is normal when "Use System Theme" is ON
- Turn OFF "Use System Theme" to regain manual control

### Theme doesn't persist
- Make sure AsyncStorage permissions are granted
- Check if app has storage access

## 📝 Code Example

```tsx
// In any component
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
    const { isDarkMode, isSystemTheme } = useTheme();
    
    return (
        <View>
            <Text>
                Current Mode: {isDarkMode ? 'Dark' : 'Light'}
            </Text>
            <Text>
                Source: {isSystemTheme ? 'Device' : 'Manual'}
            </Text>
        </View>
    );
};
```

## 🎉 Summary

You now have **two ways** to control the theme:

1. **Manual**: Toggle Dark Mode yourself
2. **Automatic**: Sync with your device

Choose what works best for you! The app remembers your preference and makes it easy to switch between modes.

**Recommended**: Enable "Use System Theme" for the best experience! 🌙☀️
