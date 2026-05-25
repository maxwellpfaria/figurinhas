import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { INITIAL_SECTIONS } from '../data/mockData';
import { Section } from '../types';
import { loadAlbumQuantities, saveAlbumQuantities } from '../services/firestore';

export function useAlbum(userId?: string | null) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [syncing, setSyncing] = useState(false);
  const initialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  // Refs so AppState/unmount callbacks always see the latest values without stale closures
  const latestQuantities = useRef<Record<string, number>>({});
  const latestUserId = useRef<string | null | undefined>(userId);
  const hasPendingSave = useRef(false);

  useEffect(() => { latestQuantities.current = quantities; }, [quantities]);
  useEffect(() => { latestUserId.current = userId; }, [userId]);

  // ── Load from Firestore when user authenticates ────────────────────────────
  useEffect(() => {
    if (!userId) {
      initialized.current = false;
      hasPendingSave.current = false;
      setQuantities({});
      return;
    }
    setSyncing(true);
    loadAlbumQuantities(userId)
      .then(data => {
        setQuantities(data);
        initialized.current = true;
      })
      .catch(console.error)
      .finally(() => setSyncing(false));
  }, [userId]);

  // ── Flush helper: saves immediately and clears pending flag ───────────────
  const flushSave = useCallback(() => {
    const uid = latestUserId.current;
    if (!uid || !initialized.current || !hasPendingSave.current) return;
    clearTimeout(saveTimer.current);
    hasPendingSave.current = false;
    setSyncing(true);
    saveAlbumQuantities(uid, latestQuantities.current)
      .catch(console.error)
      .finally(() => setSyncing(false));
  }, []);

  // ── Debounced save — 1.5 s after last change ──────────────────────────────
  useEffect(() => {
    if (!userId || !initialized.current) return;
    hasPendingSave.current = true;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      hasPendingSave.current = false;
      setSyncing(true);
      saveAlbumQuantities(userId, quantities)
        .catch(console.error)
        .finally(() => setSyncing(false));
    }, 1500);
    // Do NOT cancel the timer on cleanup: flush instead
    return () => {
      // Only cancel if the effect is re-running (new quantities arrived); a
      // fresh timer will be started right after. Actual unmount flush is
      // handled by the AppState listener + the unmount effect below.
      clearTimeout(saveTimer.current);
    };
  }, [quantities, userId]);

  // ── Flush when app goes to background (covers "close app" scenario) ────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'background' || nextState === 'inactive') {
        flushSave();
      }
    });
    return () => sub.remove();
  }, [flushSave]);

  // ── Flush on unmount (e.g. logout clears userId) ──────────────────────────
  useEffect(() => {
    return () => { flushSave(); };
  }, [flushSave]);

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
    setQuantities(prev => ({ ...prev, [stickerId]: (prev[stickerId] ?? 0) + 1 }));
  }, []);

  // Long-press sheet: set exact value
  const setQuantity = useCallback((stickerId: string, qty: number) => {
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
