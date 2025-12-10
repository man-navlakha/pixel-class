---
description: How to get SHA-1 Certificate Fingerprint for Android
---

# Getting SHA-1 Certificate Fingerprint

The SHA-1 Certificate Fingerprint is required for:
- Google Sign-In setup
- Firebase configuration
- Google Maps API
- Other Google services

## Method 1: Using Gradle (Recommended)

For debug keystore:
```bash
cd android
./gradlew signingReport
```

On Windows:
```bash
cd android
gradlew signingReport
```

This will display SHA-1 fingerprints for both debug and release keystores.

## Method 2: Using Keytool Directly

### For Debug Keystore:

**Windows:**
```bash
keytool -list -v -keystore "C:\Users\navla\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**Mac/Linux:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### For Release Keystore:

```bash
keytool -list -v -keystore [PATH_TO_YOUR_KEYSTORE] -alias [YOUR_KEY_ALIAS]
```

You'll be prompted for the keystore password.

## Method 3: Using Expo (For Expo Projects)

```bash
npx expo credentials:manager
```

Then select your project → Android credentials → View SHA-1

## Method 4: Google Play Console

If your app is already published:
1. Go to Google Play Console
2. Select your app
3. Navigate to **Release** → **Setup** → **App Integrity**
4. Find SHA-1 fingerprints for all app signing keys

## Important Notes

- **Debug SHA-1**: Used during development
- **Release SHA-1**: Used for production apps
- You may need to add **both** to your Google Console/Firebase project
- The SHA-1 changes if you use Google Play App Signing
