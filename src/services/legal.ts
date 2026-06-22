/**
 * Legal content service (Privacy Policy + Terms of Use)
 *
 * Reads from Firestore document `/config/legal`:
 *   { privacy: "...", terms: "..." }
 *
 * Strategy:
 *   1. Return AsyncStorage cache if fresh (< CACHE_TTL_MS).
 *   2. Otherwise fetch from Firestore, update cache and return.
 *   3. On any error, return null so the caller falls back to hardcoded content.
 *
 * To update the content without a release, write to /config/legal in Firestore.
 */

import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';

export interface LegalContent {
  privacy: string;
  terms: string;
}

const CACHE_KEY = '@legal_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface LegalCache {
  content: LegalContent;
  cachedAt: number;
}

async function readCache(): Promise<LegalContent | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: LegalCache = JSON.parse(raw);
    if (Date.now() - cache.cachedAt > CACHE_TTL_MS) return null;
    return cache.content;
  } catch {
    return null;
  }
}

async function writeCache(content: LegalContent): Promise<void> {
  try {
    const cache: LegalCache = { content, cachedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Non-critical
  }
}

export async function fetchLegalContent(): Promise<LegalContent | null> {
  const cached = await readCache();
  if (cached) return cached;

  try {
    const snap = await getDoc(doc(db, 'config', 'legal'));
    if (!snap.exists()) return null;
    const data = snap.data() as Partial<LegalContent>;
    if (!data.privacy || !data.terms) return null;
    const content: LegalContent = { privacy: data.privacy, terms: data.terms };
    await writeCache(content);
    return content;
  } catch {
    return null;
  }
}
