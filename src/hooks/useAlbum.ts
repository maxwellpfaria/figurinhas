import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { INITIAL_SECTIONS } from '../data/copaData';
import { Section } from '../types';
import { loadAlbumQuantities, saveAlbumQuantities } from '../services/firestore';

const SAVE_DEBOUNCE_MS = 1500;

export function useAlbum(userId?: string | null) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [syncing, setSyncing] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Always-current refs — safe to read inside AppState/unmount callbacks
  const latestQuantities = useRef<Record<string, number>>({});
  const latestUserId = useRef<string | null | undefined>(userId);
  // Set ONLY when the user changes data (increment/setQuantity).
  // Prevents saving the empty initial state or just-loaded server data.
  const needsSave = useRef(false);

  useEffect(() => { latestQuantities.current = quantities; }, [quantities]);
  useEffect(() => { latestUserId.current = userId; }, [userId]);

  // ── Load from Firestore when user authenticates ────────────────────────────
  useEffect(() => {
    if (!userId) {
      needsSave.current = false;
      setQuantities({});
      return;
    }

    // `cancelled` prevents the React Strict Mode double-invocation from
    // applying the first (stale) load result after the second load starts.
    let cancelled = false;
    setSyncing(true);

    loadAlbumQuantities(userId)
      .then(data => { if (!cancelled) setQuantities(data); })
      .catch(err => { if (!cancelled) console.error('Album load error:', err); })
      .finally(() => { if (!cancelled) setSyncing(false); });

    return () => { cancelled = true; };
  }, [userId]);

  // ── Immediate save helper ─────────────────────────────────────────────────
  const persistNow = useCallback((uid: string, data: Record<string, number>) => {
    clearTimeout(saveTimer.current);
    needsSave.current = false;
    setSyncing(true);
    saveAlbumQuantities(uid, data)
      .catch(console.error)
      .finally(() => setSyncing(false));
  }, []);

  // ── Debounced save ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId || !needsSave.current) return;

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persistNow(userId, quantities);
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimer.current);
  }, [quantities, userId, persistNow]);

  // ── Flush when app goes to background (Android home / iOS swipe-up) ────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'background' && state !== 'inactive') return;
      const uid = latestUserId.current;
      if (uid && needsSave.current) persistNow(uid, latestQuantities.current);
    });
    return () => sub.remove();
  }, [persistNow]);

  // ── Flush on unmount — covers page refresh on web and logout ─────────────
  // Empty deps so cleanup runs only on true unmount, not on every re-render.
  useEffect(() => {
    return () => {
      const uid = latestUserId.current;
      if (uid && needsSave.current) {
        clearTimeout(saveTimer.current);
        saveAlbumQuantities(uid, latestQuantities.current).catch(console.error);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Merge quantities into sections ────────────────────────────────────────
  const sections = useMemo<Section[]>(
    () =>
      INITIAL_SECTIONS.map(section => ({
        ...section,
        stickers: section.stickers.map(s => ({
          ...s,
          quantity: quantities[s.id] ?? 0,
        })),
      })),
    [quantities],
  );

  // Tap: increment by 1
  const increment = useCallback((stickerId: string) => {
    needsSave.current = true;
    setQuantities(prev => ({ ...prev, [stickerId]: (prev[stickerId] ?? 0) + 1 }));
  }, []);

  // Long-press sheet: set exact value
  const setQuantity = useCallback((stickerId: string, qty: number) => {
    needsSave.current = true;
    setQuantities(prev => ({ ...prev, [stickerId]: Math.max(0, qty) }));
  }, []);

  const getSectionProgress = useCallback(
    (sectionId: string) => {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return { owned: 0, total: 0 };
      return {
        owned: section.stickers.filter(s => s.quantity > 0).length,
        total: section.stickers.length,
      };
    },
    [sections],
  );

  const totalProgress = useMemo(() => {
    const all = sections.flatMap(s => s.stickers);
    return {
      owned: all.filter(s => s.quantity > 0).length,
      total: all.length,
    };
  }, [sections]);

  return { sections, quantities, increment, setQuantity, getSectionProgress, totalProgress, syncing };
}
