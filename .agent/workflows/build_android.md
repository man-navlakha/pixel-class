---
description: How to build the Android App (APK)
---

To export your app as an installable Android APK, follow these steps:

1.  **Install EAS CLI** (if you haven't already):
    ```powershell
    npm install -g eas-cli
    ```

2.  **Login to Expo**:
    ```powershell
    eas login
    ```

3.  **Configure the Build**:
    ```powershell
    eas build:configure
    ```
    - Select `Android` when asked.
    - This will create an `eas.json` file.

4.  **Edit `eas.json`** (Optional but recommended for APK):
    - Open `eas.json` and ensure the `preview` profile looks like this to generate an APK instead of an AAB (which is for the Play Store):
    ```json
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
    ```

5.  **Run the Build**:
    ```powershell
    eas build -p android --profile preview
    ```
    - This will upload your code to Expo's servers, build it, and give you a download link for the `.apk` file.

---
**Note:** If you want to build for the Google Play Store (AAB format), use:
```powershell
eas build -p android --profile production
```
