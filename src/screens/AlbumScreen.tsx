import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlbumIndex from '../components/AlbumIndex';
import TeamDetail from '../components/TeamDetail';
import BottomSheetEditor from '../components/BottomSheetEditor';
import { useAlbumContext } from '../contexts/AlbumContext';
import { useTheme } from '../theme/ThemeContext';
import { Sticker } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;

type AlbumView = 'index' | 'team';

export default function AlbumScreen() {
  const { sections, increment, setQuantity, syncing } = useAlbumContext();
  const { colors, isDark } = useTheme();

  // ── View state ────────────────────────────────────────────────────────────
  const [view, setView] = useState<AlbumView>('index');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  // ── Bottom sheet editor ───────────────────────────────────────────────────
  const [editingSticker, setEditingSticker] = useState<Sticker | null>(null);

  // Keep liveEditingSticker in sync across sticker list re-renders
  const liveEditingSticker = editingSticker
    ? sections.flatMap(s => s.stickers).find(s => s.id === editingSticker.id) ??
      editingSticker
    : null;

  // ── Slide animation (Index ↔ TeamDetail) ─────────────────────────────────
  const slideX = useRef(new Animated.Value(0)).current;

  const goToTeam = useCallback(
    (sectionId: string, _stickerNumber?: number) => {
      const idx = sections.findIndex(s => s.id === sectionId);
      if (idx < 0) return;
      setSectionIndex(idx);
      // Slide in from the right
      slideX.setValue(SCREEN_WIDTH * 0.35);
      setView('team');
      Animated.spring(slideX, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
        overshootClamping: true,
      }).start();
    },
    [sections, slideX],
  );

  const goBack = useCallback(() => {
    Animated.timing(slideX, {
      toValue: SCREEN_WIDTH * 0.35,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setView('index');
      setIsEditMode(false);
      slideX.setValue(0);
    });
  }, [slideX]);

  // ── Sticker interactions ──────────────────────────────────────────────────

  /**
   * Contextual press handler:
   *  - Edit mode  → toggle owned / missing (batch mark)
   *  - Missing    → add 1 immediately
   *  - Owned      → open BottomSheetEditor so the user can remove or adjust
   */
  const handleStickerPress = useCallback(
    (sticker: Sticker) => {
      if (isEditMode) {
        setQuantity(sticker.id, sticker.quantity > 0 ? 0 : 1);
        return;
      }
      if (sticker.quantity === 0) {
        increment(sticker.id);
      } else {
        setEditingSticker(sticker);
      }
    },
    [isEditMode, increment, setQuantity],
  );

  /** Long press always opens the full editor (useful outside edit mode too) */
  const handleStickerLongPress = useCallback((sticker: Sticker) => {
    setEditingSticker(sticker);
  }, []);

  const handleCloseEditor = useCallback(() => setEditingSticker(null), []);

  const handleToggleEditMode = useCallback(
    () => setIsEditMode(v => !v),
    [],
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.header} />

      {view === 'index' ? (
        // ── Team index ──────────────────────────────────────────────────────
        <AlbumIndex
          sections={sections}
          colors={colors}
          isDark={isDark}
          syncing={syncing}
          onSelectSection={goToTeam}
        />
      ) : (
        // ── Team detail (slides in from right) ──────────────────────────────
        <Animated.View
          style={[styles.detail, { transform: [{ translateX: slideX }] }]}
        >
          <TeamDetail
            sections={sections}
            sectionIndex={sectionIndex}
            isDark={isDark}
            colors={colors}
            isEditMode={isEditMode}
            onToggleEditMode={handleToggleEditMode}
            onBack={goBack}
            onSectionChange={setSectionIndex}
            onStickerPress={handleStickerPress}
            onStickerLongPress={handleStickerLongPress}
          />
        </Animated.View>
      )}

      {/* ── Quantity editor bottom sheet ── */}
      <BottomSheetEditor
        sticker={liveEditingSticker}
        onClose={handleCloseEditor}
        onQuantityChange={setQuantity}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  detail: { flex: 1 },
});
