# 📋 Remaining Pages - Dark Mode Implementation Plan

## Pages That Need Dark Mode

### ✅ Already Complete
1. Home/Index (`app/(tabs)/index.tsx`) - ✅ Done
2. Search (`app/(tabs)/search.tsx`) - ✅ Done
3. Settings (`app/settings.tsx`) - ✅ Done
4. About (`app/settings/about.tsx`) - ✅ Done
5. Privacy (`app/settings/privacy.tsx`) - ✅ Done
6. Terms (`app/settings/terms.tsx`) - ✅ Done
7. Tab Bar (`components/CustomTabBar.tsx`) - ✅ Done

### 🔄 To Be Implemented

#### High Priority (Main User-Facing Pages)
1. **Profile** (`app/profile/[username].tsx`) - 420 lines, StyleSheet
2. **Chat** (`app/(tabs)/chat.tsx`) - Needs conversion
3. **Chat Detail** (`app/(tabs)/chat/[username].tsx`) - Needs conversion
4. **Semester** (`app/subjects/[sem].tsx`) - Needs conversion
5. **Subject Resources** (`app/resources/[subject].tsx`) - Needs conversion

#### Medium Priority
6. **Edit Profile** (`app/profile/edit.tsx`) - Needs conversion
7. **Followers** (`app/followers.tsx`) - Needs conversion
8. **Following** (`app/following.tsx`) - Needs conversion
9. **PDF Viewer** (`app/pdf-viewer.tsx`) - Needs conversion

#### Low Priority (Auth Pages)
10. **Login** (`app/auth/login.tsx`) - Needs conversion
11. **Signup** (`app/auth/signup.tsx`) - Needs conversion
12. **Forget Password** (`app/auth/forgetpassword.tsx`) - Needs conversion
13. **Reset Password** (`app/auth/password/[token].tsx`) - Needs conversion

## Implementation Pattern

For each page, follow this pattern:

### 1. Import useTheme
```tsx
import { useTheme } from '../../contexts/ThemeContext';
```

### 2. Get Theme State
```tsx
const { isDarkMode } = useTheme();
```

### 3. Wrap Component
```tsx
return (
    <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
        <View className="flex-1 bg-gray-50 dark:bg-[#121212]">
            {/* Content */}
        </View>
    </View>
);
```

### 4. Convert StyleSheet to TailwindCSS

#### Background Colors
```tsx
// Before
style={{ backgroundColor: '#121212' }}

// After
className="bg-gray-50 dark:bg-[#121212]"
```

#### Text Colors
```tsx
// Before
style={{ color: '#FFF' }}

// After
className="text-gray-900 dark:text-white"
```

#### Borders
```tsx
// Before
style={{ borderColor: '#333' }}

// After
className="border-gray-200 dark:border-gray-800"
```

## Quick Reference - Color Mappings

### Backgrounds
| StyleSheet | Light Mode | Dark Mode |
|------------|------------|-----------|
| `#121212` | `bg-gray-50` | `dark:bg-[#121212]` |
| `#1E1E1E` | `bg-gray-100` | `dark:bg-[#1E1E1E]` |
| `#000` | `bg-white` | `dark:bg-black` |
| `rgba(255,255,255,0.05)` | `bg-gray-100` | `dark:bg-white/5` |

### Text
| StyleSheet | Light Mode | Dark Mode |
|------------|------------|-----------|
| `#FFF` | `text-gray-900` | `dark:text-white` |
| `#888` | `text-gray-500` | `dark:text-gray-400` |
| `#666` | `text-gray-600` | `dark:text-gray-500` |
| `rgba(255,255,255,0.6)` | `text-gray-600` | `dark:text-white/60` |

### Borders
| StyleSheet | Light Mode | Dark Mode |
|------------|------------|-----------|
| `#333` | `border-gray-200` | `dark:border-gray-800` |
| `rgba(255,255,255,0.1)` | `border-gray-300` | `dark:border-white/10` |
| `rgba(255,255,255,0.2)` | `border-gray-300` | `dark:border-white/20` |

### Buttons
| Type | Light Mode | Dark Mode |
|------|------------|-----------|
| Primary | `bg-green-500` | `bg-green-500` (same) |
| Secondary | `bg-gray-200` | `dark:bg-gray-800` |
| Outline | `border-gray-300` | `dark:border-white` |

## Profile Page Specific Notes

The profile page (`app/profile/[username].tsx`) is complex with:
- 420 lines of code
- Multiple sections (header, stats, suggestions, posts)
- StyleSheet-based styling
- Complex state management

### Recommended Approach:
1. Keep functionality intact
2. Convert styles section by section:
   - Container & Loading
   - Header & Avatar
   - Stats Row
   - Action Buttons
   - Suggestions Cards
   - Posts List
   - Settings Icon

### Key Components to Update:
```tsx
// Container
className="flex-1 bg-gray-50 dark:bg-[#121212]"

// Avatar
className="w-25 h-25 rounded-full border-2 border-green-500"

// Stats
className="text-gray-900 dark:text-white text-lg font-bold"

// Buttons
className="bg-green-500 py-2.5 px-8 rounded-full"

// Post Cards
className="flex-row items-center bg-gray-100 dark:bg-[#1E1E1E] p-4 rounded-xl mb-3 mx-5"
```

## Semester & Subject Pages

These pages likely follow similar patterns:
- List of items
- Card-based layouts
- Navigation to detail pages

### Common Pattern:
```tsx
// Card
className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl mb-3"

// Title
className="text-gray-900 dark:text-white text-lg font-semibold"

// Subtitle
className="text-gray-600 dark:text-gray-400 text-sm"
```

## Testing Checklist

For each page after conversion:
- [ ] Light mode looks good
- [ ] Dark mode looks good
- [ ] Text is readable in both modes
- [ ] Buttons have good contrast
- [ ] Borders are visible
- [ ] Images/avatars look good
- [ ] Loading states work
- [ ] Empty states are readable
- [ ] Navigation works
- [ ] Theme switches smoothly

## Priority Order

1. **Profile Page** - Most used, high visibility
2. **Chat Pages** - Core functionality
3. **Semester/Subject Pages** - Academic content
4. **Edit Profile** - User settings
5. **Followers/Following** - Social features
6. **Auth Pages** - Less frequently seen

## Estimated Effort

- Profile Page: 2-3 hours (complex)
- Chat Pages: 1-2 hours each
- Semester/Subject: 1 hour each
- Simpler pages: 30 minutes each

## Notes

- Keep all functionality intact
- Test thoroughly after each conversion
- Use the same color scheme across all pages
- Maintain consistent spacing and sizing
- Ensure StatusBar adapts (`style="auto"`)

## Current Status

**Completed**: 7/20 pages (35%)
**Remaining**: 13 pages
**Next Priority**: Profile Page

Would you like me to proceed with converting the Profile page or any other specific page?
