import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let _auth: ReturnType<typeof initializeAuth> | ReturnType<typeof getAuth>;
let _db: ReturnType<typeof getFirestore>;
let _initError: Error | null = null;

try {
  const isNew = getApps().length === 0;
  const app = isNew ? initializeApp(firebaseConfig) : getApp();

  // On native, Metro automatically resolves 'firebase/auth' to the React Native
  // bundle (dist/rn/index.js) which exports getReactNativePersistence.
  // On web, use Firebase's built-in browserLocalPersistence.
  let persistence;
  if (Platform.OS === 'web') {
    persistence = browserLocalPersistence;
  } else {
    // Dynamic require so Metro resolves the rn bundle at runtime on native
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getReactNativePersistence } = require('firebase/auth');
    persistence = getReactNativePersistence(AsyncStorage);
  }

  _auth = isNew ? initializeAuth(app, { persistence }) : getAuth(app);
  _db = getFirestore(app);
} catch (e) {
  _initError = e instanceof Error ? e : new Error(String(e));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _auth = null as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _db = null as any;
}

export const auth = _auth!;
export const db = _db!;
export const firebaseInitError = _initError;
