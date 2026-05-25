import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

// Custom persistence adapter using AsyncStorage (Firebase v12 compatible)
const SENTINEL = '__firebase_sentinel__';
const rnPersistence = {
  type: 'LOCAL' as const,
  async _isAvailable(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(SENTINEL, '1');
      await AsyncStorage.removeItem(SENTINEL);
      return true;
    } catch {
      return false;
    }
  },
  async _set(key: string, value: object): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async _get(key: string): Promise<object | null> {
    const item = await AsyncStorage.getItem(key);
    return item ? (JSON.parse(item) as object) : null;
  },
  async _remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
  _addListener(_key: string, _listener: (...args: unknown[]) => unknown): void {},
  _removeListener(_key: string, _listener: (...args: unknown[]) => unknown): void {},
};

let _auth: ReturnType<typeof initializeAuth> | ReturnType<typeof getAuth>;
let _db: ReturnType<typeof getFirestore>;
let _initError: Error | null = null;

try {
  const isNew = getApps().length === 0;
  const app = isNew ? initializeApp(firebaseConfig) : getApp();
  const persistence = Platform.OS === 'web' ? browserLocalPersistence : rnPersistence;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _auth = isNew ? initializeAuth(app, { persistence: persistence as any }) : getAuth(app);
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
