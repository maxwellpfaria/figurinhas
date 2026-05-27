/**
 * FAQ remote content service
 *
 * Reads from Firestore document `/config/faq`:
 *   {
 *     items: [
 *       { id: "1", q: "Pergunta?", a: "Resposta.", order: 1 },
 *       ...
 *     ]
 *   }
 *
 * Strategy:
 *   1. Return AsyncStorage cache if it exists and is younger than CACHE_TTL_MS.
 *   2. Otherwise fetch from Firestore, update cache and return.
 *   3. On any error, return null so the caller falls back to hardcoded content.
 *
 * To populate the document for the first time, call seedFaqItems() once
 * (e.g., from a one-off admin screen or the Firebase Console).
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  /** Lower numbers appear first. Defaults to 0 if omitted. */
  order?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FIRESTORE_DOC = { collection: 'config', id: 'faq' } as const;
const CACHE_KEY = '@faq_cache_v1';
/** Re-fetch after 6 hours; the app can still work offline with stale cache. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

interface FaqCache {
  items: FaqItem[];
  cachedAt: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function readCache(): Promise<FaqItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: FaqCache = JSON.parse(raw);
    if (Date.now() - cache.cachedAt > CACHE_TTL_MS) return null;
    return cache.items;
  } catch {
    return null;
  }
}

async function writeCache(items: FaqItem[]): Promise<void> {
  try {
    const cache: FaqCache = { items, cachedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Non-critical: if caching fails the app still works
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the FAQ items from cache (if fresh) or Firestore.
 * Returns `null` if both fail (caller should use hardcoded fallback).
 */
export async function fetchFaqItems(): Promise<FaqItem[] | null> {
  // 1. Try fresh cache
  const cached = await readCache();
  if (cached) return cached;

  // 2. Fetch from Firestore
  try {
    const snap = await getDoc(doc(db, FIRESTORE_DOC.collection, FIRESTORE_DOC.id));
    if (!snap.exists()) return null;

    const data = snap.data() as { items?: FaqItem[] };
    const items: FaqItem[] = (data.items ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (items.length === 0) return null;

    await writeCache(items);
    return items;
  } catch {
    return null;
  }
}

/**
 * Writes the FAQ items to Firestore.
 * Call this once to seed the initial content, or whenever you want to
 * programmatically update the remote FAQ.
 *
 * Requires the calling user to have write access to /config/faq in
 * your Firestore security rules.
 */
export async function seedFaqItems(items: FaqItem[]): Promise<void> {
  await setDoc(doc(db, FIRESTORE_DOC.collection, FIRESTORE_DOC.id), { items });
  await writeCache(items);
}

/**
 * Forces a cache invalidation so the next fetchFaqItems() call hits Firestore.
 * Useful after calling seedFaqItems() in the same session.
 */
export async function invalidateFaqCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {}
}
