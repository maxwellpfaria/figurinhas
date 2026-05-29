import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlbumIndex, { SortMode } from '../components/AlbumIndex';
import TeamDetail from '../components/TeamDetail';
import BottomSheetEditor from '../components/BottomSheetEditor';
import WelcomeWizard from '../components/WelcomeWizard';
import { useAlbumContext } from '../contexts/AlbumContext';
import { useTheme } from '../theme/ThemeContext';
import { Sticker } from '../types';
import { Radius } from '../theme';

/** AsyncStorage key — bump the suffix to force re-show after major UI changes */
const WIZARD_KEY = '@album_wizard_v1';

const SCREEN_WIDTH = Dimensions.get('window').width;

type AlbumView = 'index' | 'team';

export default function AlbumScreen() {
  const { sections, increment, setQuantity, syncing } = useAlbumContext();
  const { colors, isDark } = useTheme();

  // ── Wizard ────────────────────────────────────────────────────────────────
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(WIZARD_KEY).then(seen => {
      if (!seen) setShowWizard(true);
    });
  }, []);

  const handleDismissWizard = useCallback(() => {
    setShowWizard(false);
    AsyncStorage.setItem(WIZARD_KEY, '1');
  }, []);

  // ── View state ────────────────────────────────────────────────────────────
  const [view, setView] = useState<AlbumView>('index');
  const [sectionIndex, setSectionIndex] = useState(0);

  /**
   * Sort mode lives here (not inside AlbumIndex) so it survives the
   * unmount/remount cycle that happens when the user navigates to a team
   * and comes back.
   */
  const [sort, setSort] = useState<SortMode>('album');

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
    (sectionId: string) => {
      const idx = sections.findIndex(s => s.id === sectionId);
      if (idx < 0) return;
      setSectionIndex(idx);
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
      slideX.setValue(0);
    });
  }, [slideX]);

  // ── Sticker interactions ──────────────────────────────────────────────────

  /**
   * Contextual press handler:
   *  - Missing → add 1 immediately
   *  - Owned   → open BottomSheetEditor so the user can adjust or remove
   */
  const handleStickerPress = useCallback(
    (sticker: Sticker) => {
      if (sticker.quantity === 0) {
        increment(sticker.id);
      } else {
        setEditingSticker(sticker);
      }
    },
    [increment],
  );

  /** Long press always opens the full editor */
  const handleStickerLongPress = useCallback((sticker: Sticker) => {
    setEditingSticker(sticker);
  }, []);

  const handleCloseEditor = useCallback(() => setEditingSticker(null), []);

  // ── Header data ───────────────────────────────────────────────────────────

  const { totalOwned, totalStickers, globalPct } = useMemo(() => {
    let owned = 0;
    let total = 0;
    for (const s of sections) {
      owned += s.stickers.filter(st => st.quantity > 0).length;
      total += s.stickers.length;
    }
    const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
    return { totalOwned: owned, totalStickers: total, globalPct: pct };
  }, [sections]);

  const currentSection = view === 'team' ? (sections[sectionIndex] ?? null) : null;

  const teamOwned = currentSection
    ? currentSection.stickers.filter(s => s.quantity > 0).length
    : 0;
  const teamTotal = currentSection?.stickers.length ?? 0;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.header }]}
      edges={['top']}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.header} />

      {/* ══ Persistent dark header — always visible ══════════════════════════ */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>

        {view === 'index' ? (
          /* ── Index header content ── */
          <>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Meu Álbum</Text>
              <Text style={styles.headerSub}>Copa do Mundo 2026</Text>
            </View>
            <View style={styles.headerRight}>
              {syncing && (
                <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
              )}
              <View style={styles.globalProgress}>
                <Text style={styles.globalPct}>{globalPct}%</Text>
                <Text style={styles.globalCount}>
                  {totalOwned}/{totalStickers}
                </Text>
              </View>
            </View>
          </>
        ) : (
          /* ── Team header content ── */
          <>
            {/* Back button */}
            <TouchableOpacity
              onPress={goBack}
              style={styles.backBtn}
              hitSlop={{ top: 14, bottom: 14, left: 4, right: 12 }}
              activeOpacity={0.7}
            >
              <Text style={[styles.backArrow, { color: colors.primary }]}>‹</Text>
            </TouchableOpacity>

            {/* Team identity */}
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Meu Álbum</Text>
              {currentSection && (
                <Text style={styles.headerSub} numberOfLines={1}>
                  {currentSection.flag}  {currentSection.name}
                  {'  ·  '}{teamOwned}/{teamTotal}
                </Text>
              )}
            </View>

            {/* Syncing indicator */}
            <View style={styles.headerRight}>
              {syncing && (
                <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
              )}
            </View>
          </>
        )}
      </View>

      {/* ══ Content area ════════════════════════════════════════════════════ */}
      {view === 'index' ? (
        <AlbumIndex
          sections={sections}
          colors={colors}
          isDark={isDark}
          sort={sort}
          onSortChange={setSort}
          onSelectSection={goToTeam}
        />
      ) : (
        <Animated.View
          style={[styles.detail, { transform: [{ translateX: slideX }] }]}
        >
          <TeamDetail
            sections={sections}
            sectionIndex={sectionIndex}
            isDark={isDark}
            colors={colors}
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

      {/* ── First-time onboarding wizard ── */}
      {showWizard && (
        <WelcomeWizard
          colors={colors}
          isDark={isDark}
          onDismiss={handleDismissWizard}
        />
      )}
    </SafeAreaView>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Shared persistent header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },

  // Index layout: left title block + right progress
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  globalProgress: {
    alignItems: 'flex-end',
  },
  globalPct: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  globalCount: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
  },

  // Team layout: back + center block + right actions
  backBtn: {
    paddingRight: 4,
    flexShrink: 0,
  },
  backArrow: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 36,
  },
  headerCenter: {
    flex: 1,
    minWidth: 0, // allows text truncation
  },

  detail: { flex: 1 },
});
