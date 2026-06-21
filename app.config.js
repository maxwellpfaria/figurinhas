const path = require('path');
const fs = require('fs');

// Load .env manually so it works in all build contexts (local EAS, cloud EAS, expo start)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: "Meu Álbum",
  slug: "figurinha",
  version: "1.0.8",
  orientation: "portrait",
  backgroundColor: "#0B0F19",
  icon: "./assets/icon_v2.png",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: false,
    icon: "./assets/icon_v2.png",
    infoPlist: {
      NSCameraUsageDescription: "Necessário para escanear o QR Code de troca de figurinhas do seu amigo.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptative-icon-android.png",
      backgroundColor: "#0B0F19",
    },
    package: "com.figurinha.copa2026",
    permissions: ["android.permission.CAMERA"],
    versionCode: 12,
  },
  plugins: [
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0B0F19",
        image: "./assets/adaptative-icon_v2.png",
        imageWidth: 240,
        resizeMode: "contain",
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Necessário para escanear o QR Code de troca de figurinhas do seu amigo.",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 35,
        },
      },
    ],
  ],
  web: {
    bundler: "metro",
    output: "single",
  },
  extra: {
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    eas: {
      projectId: "dbba3105-e1cd-4067-83be-2aaa5f4e646e",
    },
  },
  owner: "maxwellfaria",
};
