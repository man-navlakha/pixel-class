# 📚 TailwindCSS Conversion Guide - Remaining Pages

## Pages to Convert

1. **Subject/Resources Page** (`app/resources/[subject].tsx`) - 448 lines
2. **Edit Profile** (`app/profile/edit.tsx`)
3. **PDF Viewer** (`app/pdf-viewer.tsx`)
4. **Answers/Solutions** (`app/answers/[id].tsx`)
5. **Upload Modal** (`components/UploadModal.tsx`)

## Quick Conversion Pattern

### Step 1: Add Theme Hook
```tsx
import { useTheme } from '../../contexts/ThemeContext';

const { isDarkMode } = useTheme();
```

### Step 2: Wrap Component
```tsx
return (
    <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
        <View className="flex-1 bg-gray-50 dark:bg-[#121212]">
            {/* Content */}
        </View>
    </View>
);
```

### Step 3: Convert Common Styles

## StyleSheet to TailwindCSS Mapping

### Container
```tsx
// BEFORE
style={styles.container}
// styles.container: { flex: 1, backgroundColor: '#121212' }

// AFTER
className="flex-1 bg-gray-50 dark:bg-[#121212]"
```

### Header
```tsx
// BEFORE
style={styles.header}
// styles.header: { flexDirection: 'row', alignItems: 'center', ... }

// AFTER
className="flex-row items-center justify-between px-5 pb-5 bg-gray-50 dark:bg-[#121212]"
```

### Back Button
```tsx
// BEFORE
style={styles.backBtn}
// styles.backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#252525' }

// AFTER
className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#252525] justify-center items-center"
```

### Header Title
```tsx
// BEFORE
style={styles.headerTitle}
// styles.headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }

// AFTER
className="text-gray-900 dark:text-white text-lg font-bold flex-1 text-center mx-2.5"
```

### Cards
```tsx
// BEFORE
style={styles.card}
// styles.card: { flexDirection: 'row', padding: 16, borderRadius: 20, ... }

// AFTER (with LinearGradient)
<LinearGradient
    colors={isDarkMode ? ['#2A2A2A', '#1A1A1A'] : ['#ffffff', '#f3f4f6']}
    className="flex-row items-center justify-between p-4 rounded-3xl border border-gray-200 dark:border-white/5"
>
```

### Card Content
```tsx
// Card Icon Container
className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-white/5 justify-center items-center mr-4"

// Card Title
className="text-gray-900 dark:text-white text-base font-bold mb-1"

// Card Subtitle
className="text-gray-600 dark:text-gray-400 text-xs font-medium"
```

### Tabs
```tsx
// Tab Container
className="h-15 mb-2.5"

// Active Tab (with LinearGradient)
<LinearGradient
    colors={['#4ade80', '#357ABD']}
    className="px-5 h-full justify-center items-center rounded-full"
>
    <Text className="text-white font-bold text-sm">{label}</Text>
</LinearGradient>

// Inactive Tab
<View className="px-5 h-full justify-center items-center rounded-full bg-gray-200 dark:bg-[#1E1E1E] border border-gray-300 dark:border-gray-800">
    <Text className="text-gray-600 dark:text-gray-400 font-semibold text-sm">{label}</Text>
</View>
```

### Action Buttons
```tsx
// Icon Button
className="w-9 h-9 rounded-full justify-center items-center"

// Share Button
className="w-9 h-9 rounded-full bg-green-500/10 justify-center items-center mr-2"

// View Button (Direct Open)
className="w-9 h-9 rounded-full bg-blue-500/15 justify-center items-center"

// Navigate Button
className="w-9 h-9 rounded-full bg-white/10 justify-center items-center"
```

### FAB (Floating Action Button)
```tsx
<TouchableOpacity
    className="absolute bottom-[100px] right-5 w-14 h-14 rounded-full shadow-lg z-50"
    onPress={() => setIsUploadVisible(true)}
>
    <LinearGradient
        colors={['#4ade80', '#357ABD']}
        className="w-full h-full rounded-full justify-center items-center"
    >
        <Ionicons name="add" size={30} color="#FFF" />
    </LinearGradient>
</TouchableOpacity>
```

### Empty State
```tsx
<View className="items-center mt-25 opacity-50">
    <Ionicons name="document-text-outline" size={64} color={isDarkMode ? "#333" : "#9ca3af"} />
    <Text className="text-gray-500 dark:text-gray-400 mt-4 text-base">No documents found.</Text>
</View>
```

### Loading State
```tsx
<View className="flex-1 justify-center items-center">
    <ActivityIndicator size="large" color="#4ade80" />
</View>
```

## Subject/Resources Page Specific

### PDF Card Component
```tsx
const renderPdfCard = ({ item }: { item: PdfResource }) => {
    const category = (item.choose || '').trim().toLowerCase();
    const isDirectOpen = DIRECT_OPEN_CATEGORIES.includes(category);
    const isSharing = loadingId === item.id;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleView(item)}
            className="mb-4 rounded-3xl shadow-lg"
        >
            <LinearGradient
                colors={isDarkMode ? ['#2A2A2A', '#1A1A1A'] : ['#ffffff', '#f3f4f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-row items-center justify-between p-4 rounded-3xl border border-gray-200 dark:border-white/5"
            >
                <View className="flex-row items-center flex-1 mr-2.5">
                    <View className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-white/5 justify-center items-center mr-4">
                        <Text className="text-2xl">
                            {isDirectOpen ? '📄' : '❓'}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white text-base font-bold mb-1" numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                            {item.username || 'Admin'} • {item.year || '2025'}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="w-9 h-9 rounded-full bg-green-500/10 justify-center items-center mr-2"
                        onPress={() => sharePdf(item.pdf, item.name, item.id)}
                        disabled={isSharing}
                    >
                        {isSharing ? (
                            <ActivityIndicator size="small" color="#4ade80" />
                        ) : (
                            <Ionicons name="share-social-outline" size={18} color="#4ade80" />
                        )}
                    </TouchableOpacity>

                    <View className={`w-9 h-9 rounded-full justify-center items-center ${
                        isDirectOpen ? 'bg-blue-500/15' : 'bg-white/10'
                    }`}>
                        <Ionicons
                            name={isDirectOpen ? "eye-outline" : "chevron-forward"}
                            size={18}
                            color={isDirectOpen ? "#4ade80" : isDarkMode ? "#FFF" : "#6b7280"}
                        />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};
```

## Edit Profile Page

### Form Input
```tsx
<View className="mb-4">
    <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
        Username
    </Text>
    <TextInput
        className="bg-gray-100 dark:bg-[#1E1E1E] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800"
        placeholderTextColor={isDarkMode ? "#888" : "#9ca3af"}
        value={username}
        onChangeText={setUsername}
    />
</View>
```

### Save Button
```tsx
<TouchableOpacity
    className="bg-green-500 py-4 rounded-xl items-center mt-6"
    onPress={handleSave}
>
    <Text className="text-white text-base font-bold">Save Changes</Text>
</TouchableOpacity>
```

## PDF Viewer Page

### Toolbar
```tsx
<View className="flex-row items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800">
    <TouchableOpacity
        className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#252525] justify-center items-center"
        onPress={() => router.back()}
    >
        <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFF" : "#000"} />
    </TouchableOpacity>
    
    <Text className="text-gray-900 dark:text-white text-base font-bold flex-1 mx-4" numberOfLines={1}>
        {title}
    </Text>
    
    <TouchableOpacity
        className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#252525] justify-center items-center"
        onPress={handleShare}
    >
        <Ionicons name="share-outline" size={24} color={isDarkMode ? "#FFF" : "#000"} />
    </TouchableOpacity>
</View>
```

## Color Reference

### Backgrounds
```tsx
bg-gray-50 dark:bg-[#121212]      // Main container
bg-white dark:bg-[#1E1E1E]        // Cards/Sections
bg-gray-100 dark:bg-[#2A2A2A]     // Input fields
bg-gray-200 dark:bg-white/5       // Icon containers
```

### Text
```tsx
text-gray-900 dark:text-white     // Primary
text-gray-600 dark:text-gray-400  // Secondary
text-gray-500 dark:text-gray-500  // Tertiary
```

### Borders
```tsx
border-gray-200 dark:border-gray-800   // Main
border-gray-300 dark:border-white/10   // Subtle
```

### Buttons
```tsx
bg-green-500                      // Primary (same both)
bg-gray-200 dark:bg-gray-800      // Secondary
bg-blue-500/15                    // Accent with opacity
```

## Implementation Steps

1. **Import useTheme** at the top
2. **Add wrapper View** with dark class
3. **Convert container** background
4. **Convert header** section
5. **Convert cards/items** one by one
6. **Convert buttons** and actions
7. **Convert empty/loading** states
8. **Test both modes**

## Testing Checklist

For each page:
- [ ] Light mode looks good
- [ ] Dark mode looks good
- [ ] All text readable
- [ ] All icons visible
- [ ] Buttons have contrast
- [ ] Borders visible
- [ ] Gradients work
- [ ] Animations smooth
- [ ] No StyleSheet errors
- [ ] Theme switches smoothly

## Time Estimates

- Resources Page: 1-2 hours
- Edit Profile: 30-45 minutes
- PDF Viewer: 30-45 minutes
- Answers Page: 45-60 minutes
- Upload Modal: 30 minutes

**Total**: ~4-5 hours for all pages

## Pro Tips

1. **Start small** - Convert one section at a time
2. **Test frequently** - Toggle dark mode after each section
3. **Use examples** - Reference completed pages (Home, Search, Profile)
4. **Keep gradients** - They look great in both modes
5. **Dynamic colors** - Use `isDarkMode` for icon colors
6. **Consistent spacing** - Use same padding/margins as other pages

You now have everything you need to convert the remaining pages! 🚀
