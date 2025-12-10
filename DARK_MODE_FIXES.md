# 🔧 Quick Fixes for Dark Mode Issues

## Issues Reported
1. Profile page - profile pic error
2. Settings page - dark mode not working
3. Search page - problems in dark & light mode

## Fixes

### 1. Profile Page - Profile Pic Size

**Problem**: Invalid Tailwind classes `w-25 h-25`

**Fix**: In `app/profile/[username].tsx`, find the Image component around line 161-163:

```tsx
// WRONG
<Image
    source={{ uri: profile.profile_pic || "https://i.pravatar.cc/150" }}
    className="w-25 h-25 rounded-full mb-3 border-2 border-green-500"
/>

// CORRECT
<Image
    source={{ uri: profile.profile_pic || "https://i.pravatar.cc/150" }}
    style={{ width: 100, height: 100 }}
    className="rounded-full mb-3 border-2 border-green-500"
/>
```

Also check suggestion avatars around line 260:
```tsx
// Change from w-15 h-15 to:
style={{ width: 60, height: 60 }}
className="rounded-full mb-2"
```

### 2. Settings Page - Dark Mode Not Working

**Problem**: StyleSheet has hardcoded dark colors

**Fix**: In `app/settings.tsx`, update the SafeAreaView and styles to be dynamic:

#### Step 1: Update SafeAreaView (around line 74)
```tsx
// BEFORE
<SafeAreaView style={styles.container} edges={['top']}>

// AFTER
<SafeAreaView 
    style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f9fafb' }]} 
    edges={['top']}
>
```

#### Step 2: Update Header (around line 79)
```tsx
// BEFORE
<View style={styles.header}>

// AFTER
<View style={[styles.header, { borderBottomColor: isDarkMode ? '#333' : '#e5e7eb' }]}>
```

#### Step 3: Update Header Title (around line 86)
```tsx
// BEFORE
<Text style={styles.headerTitle}>Settings</Text>

// AFTER
<Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>Settings</Text>
```

#### Step 4: Update Section Headers
Find the `SectionHeader` component and update:
```tsx
const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: isDarkMode ? '#888' : '#6b7280' }]}>
        {title}
    </Text>
);
```

#### Step 5: Update Setting Items
In the `SettingItem` component, update text colors:
```tsx
<Text style={[styles.settingTitle, { color: isDarkMode ? '#FFF' : '#111827' }]}>
    {title}
</Text>
<Text style={[styles.settingSubtitle, { color: isDarkMode ? '#888' : '#6b7280' }]}>
    {subtitle}
</Text>
```

#### Step 6: Update Footer (around line 228-230)
```tsx
<Text style={[styles.footerText, { color: isDarkMode ? '#888' : '#6b7280' }]}>
    Made with ❤️ by Pixel Class Team
</Text>
<Text style={[styles.footerSubtext, { color: isDarkMode ? '#666' : '#9ca3af' }]}>
    © 2024 Pixel Class. All rights reserved.
</Text>
```

### 3. Search Page - Dark & Light Mode Problems

**Problem**: Background wrapper might be incorrect

**Fix**: In `app/(tabs)/search.tsx`, check the wrapper (around line 220):

```tsx
// CORRECT VERSION
return (
    <View className={`${isDarkMode ? 'dark' : ''}`} style={{ flex: 1 }}>
        <View className="flex-1 bg-gray-50 dark:bg-[#121212] p-4 pt-[60px]">
            <StatusBar style="auto" animated />
            {/* Rest of content */}
        </View>
    </View>
);
```

Make sure:
1. Outer View has the dark class wrapper
2. Inner View has bg-gray-50 dark:bg-[#121212]
3. StatusBar is set to "auto"

## Quick Test Checklist

After applying fixes:

### Profile Page
- [ ] Profile picture shows correctly (100x100)
- [ ] Avatar is round
- [ ] Border is green
- [ ] Suggestion avatars show (60x60)

### Settings Page
- [ ] Background changes (light gray → dark)
- [ ] Header text changes color
- [ ] Section headers change color
- [ ] Setting item text changes color
- [ ] Footer text changes color
- [ ] Toggle switches work

### Search Page
- [ ] Background changes
- [ ] Search bar adapts
- [ ] User cards change colors
- [ ] Text is readable in both modes

## Alternative: Full TailwindCSS Conversion

If StyleSheet issues persist in Settings, convert to full Tailwind:

```tsx
// Replace StyleSheet components with Tailwind classes
<View className="flex-1 bg-gray-50 dark:bg-[#121212]">
    <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        {/* Header content */}
    </View>
    {/* Rest of content */}
</View>
```

## Common Issues

### Issue: Colors not changing
**Solution**: Make sure the wrapper View has `className={isDarkMode ? 'dark' : ''}`

### Issue: Text not visible
**Solution**: Add dark: variants to all text: `className="text-gray-900 dark:text-white"`

### Issue: Images not showing
**Solution**: Use `style={{ width: X, height: X }}` instead of Tailwind size classes for images

### Issue: Borders not visible
**Solution**: Add dark variants: `className="border-gray-200 dark:border-gray-800"`

## Need Help?

Check these files for working examples:
- `app/(tabs)/index.tsx` - Perfect home page implementation
- `app/settings/about.tsx` - Full Tailwind with dark mode
- `app/settings/privacy.tsx` - Full Tailwind with dark mode

## Color Reference

```tsx
// Backgrounds
bg-gray-50 dark:bg-[#121212]      // Main container
bg-white dark:bg-[#1E1E1E]        // Cards
bg-gray-100 dark:bg-white/5       // Subtle backgrounds

// Text
text-gray-900 dark:text-white     // Primary text
text-gray-600 dark:text-gray-400  // Secondary text
text-gray-500 dark:text-gray-500  // Tertiary text

// Borders
border-gray-200 dark:border-gray-800   // Main borders
border-gray-300 dark:border-white/10   // Subtle borders
```

Apply these fixes and your dark mode should work perfectly! 🌙☀️
