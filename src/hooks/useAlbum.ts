import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { INITIAL_SECTIONS, SEED_QUANTITIES } from '../data/mockData';
import { Section } from '../types';
import { loadAlbumQuantities, saveAlbumQuantities } from '../services/firestore';

export function useAlbum(userId?: string | null) {
  const [quantities, setQuantities] = useState<Record<string, number>>(SEED_QUANTITIES);
  const [syncing, setSyncing] = useState(false);
  const initialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load from Firestore when user authenticates
  useEffect(() => {
    if (!userId) {
      initialized.current = false;
      setQuantities(SEED_QUANTITIES);
      return;
    }
    setSyncing(true);
    loadAlbumQuantities(userId)
      .then(data => {
        setQuantities(Object.keys(data).length > 0 ? data : {});
        initialized.current = true;
      })
      .catch(console.error)
      .finally(() => setSyncing(false));
  }, [userId]);

  // Debounced save to Firestore (1.5 s after last change)
  useEffect(() => {
    if (!userId || !initialized.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveAlbumQuantities(userId, quantities).catch(console.error);
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [quantities, userId]);

  // Merge quantities into sections
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
