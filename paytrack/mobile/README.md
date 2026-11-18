# Paytrack mobile

Expo / React Native companion app for iOS and Android. The existing Vite web app
remains in the parent directory.

## Run locally

1. Install Node.js and the Expo Go app on a device, or set up an iOS Simulator
   (macOS) or Android emulator.
2. From this directory, run `npm install` and then `npm start`.
3. Scan the QR code with Expo Go, or press `a` to open an Android emulator.

The app uses the deployed Paytrack API by default. To point it at another API,
set `EXPO_PUBLIC_API_URL` before starting Expo. For example, use the machine's
LAN address rather than `localhost` when testing from a physical device.

Login credentials are stored with Expo SecureStore on the device. The app
includes registration, dashboard, transaction management, savings goals, and
reports.

## Build an Android APK

Sign in to Expo, then run:

```sh
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

The `preview` profile produces an installable APK. EAS prints a build page and
download link when the build completes.
