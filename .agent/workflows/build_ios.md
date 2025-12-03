---
description: How to build the iOS App (IPA)
---

Building for iOS requires a **paid Apple Developer Account ($99/year)** to install the app on physical devices (Ad-hoc) or publish to the App Store.

### Option 1: Build for Real Devices (Requires Paid Account)

1.  **Prerequisites**:
    - You must have an Apple Developer Account.
    - You must be logged in to EAS (`eas login`).

2.  **Run the Build**:
    ```powershell
    eas build -p ios --profile production
    ```
    - **Production**: For App Store distribution (TestFlight).
    - **Preview**: For installing directly on registered devices (Ad-hoc). You will need to register your device's UDID with Apple.

3.  **Follow the Prompts**:
    - EAS will ask you to log in to your Apple ID.
    - It will handle certificate and provisioning profile generation for you.

### Option 2: Build for iOS Simulator (No Paid Account Needed)

If you just want to test on an iOS Simulator (requires a Mac to run the simulator, but you can build the file on Windows):

1.  **Edit `eas.json`**:
    Add a simulator profile:
    ```json
    "simulator": {
      "ios": {
        "simulator": true
      }
    }
    ```

2.  **Run the Build**:
    ```powershell
    eas build -p ios --profile simulator
    ```
    - This generates a `.tar.gz` file containing the `.app` bundle, which can be dragged and dropped into an iOS Simulator.
