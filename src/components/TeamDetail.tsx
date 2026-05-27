import React, { useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import StickerCard, { NUM_COLUMNS } from './StickerCard';
import { Section, Sticker } from '../types';
import { ColorsType, Spacing } from '../theme';

type StickerRow = { id: string; stickers: Sticker[]; hasFormation: boolean };

const SCREEN_WIDTH = Dimensions.get('window').width;

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  /** Full sections list — used for swipe prev/next navigation */
  sections: Section[];
  /** Index of the currently displayed section */
  sectionIndex: number;
  isDark: boolean;
  colors: ColorsType;
  /** Called when swipe navigates to a different section */
  onSectionChange: (newIndex: number) => void;
  /** Contextual press: missing → add · owned → open editor */
  onStickerPress: (sticker: Sticker) => void;
  /** Always opens the quantity editor */
  onStickerLongPress: (sticker: Sticker) => void;
}

export default function TeamDetail({
  sections,
  sectionIndex,
  isDark,
  colors,
  onSectionChange,
  onStickerPress,
  onStickerLongPress,
}: Props) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentSection = sections[sectionIndex] ?? null;

  // ── sticker rows (formation logic preserved) ──────────────────────────────
  const stickerRows = useMemo<StickerRow[]>(() => {
    if (!currentSection) return [];
    const stickers = currentSection.stickers;
    const isTeam = stickers.length === 20 && !currentSection.isSpecial;
    const result: StickerRow[] = [];
    let i = 0;
    while (i < stickers.length) {
      const s = stickers[i];
      if (isTeam && s.number === 13) {
        // Formation row: sticker 13 is wide, 14 and 15 follow in same row
        const row: Sticker[] = [s];
        if (stickers[i + 1]) row.push(stickers[i + 1]);
        if (stickers[i + 2]) row.push(stickers[i + 2]);
        result.push({ id: s.id, stickers: row, hasFormation: true });
        i += 3;
      } else {
        const row = stickers.slice(i, i + NUM_COLUMNS);
        result.push({ id: row[0].id, stickers: row, hasFormation: false });
        i += NUM_COLUMNS;
      }
    }
    return result;
  }, [currentSection]);

  // ── section navigation (swipe) ────────────────────────────────────────────
  const changeSection = useCallback(
    (newIndex: number, direction: 'next' | 'prev') => {
      const outX = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      const inX = direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH;

      Animated.timing(slideAnim, {
        toValue: outX,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        slideAnim.setValue(inX);
        onSectionChange(newIndex);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 220,
          overshootClamping: true,
        }).start();
      });
    },
    [slideAnim, onSectionChange],
  );

  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-35, 35])
    .failOffsetY([-12, 12])
    .onUpdate(e => {
      slideAnim.setValue(e.translationX);
    })
    .onEnd(e => {
      const { translationX } = e;
      if (translationX < -50 && sectionIndex < sections.length - 1) {
        changeSection(sectionIndex + 1, 'next');
      } else if (translationX > 50 && sectionIndex > 0) {
        changeSection(sectionIndex - 1, 'prev');
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }).start();
      }
    });

  if (!currentSection) return null;

  const owned = currentSection.stickers.filter(s => s.quantity > 0).length;
  const total = currentSection.stickers.length;
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
  const isComplete = owned === total && total > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Progress bar ── */}
      <View
        style={[
          styles.progressContainer,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.navBorder,
          },
        ]}
      >
        <View style={styles.progressRow}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {owned} de {total} figurinhas
          </Text>
          <Text
            style={[
              styles.progressPct,
              { color: isComplete ? colors.primary : colors.progressFill },
            ]}
          >
            {pct}%{isComplete ? '  ✓' : ''}
          </Text>
        </View>
        <View
          style={[styles.progressTrack, { backgroundColor: colors.navBorder }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: isComplete ? colors.primary : colors.progressFill,
                width: `${pct}%` as any,
              },
            ]}
          />
        </View>
      </View>

      {/* ── Sticker grid with swipe navigation ── */}
      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={[
            styles.slideContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <FlatList
            data={stickerRows}
            keyExtractor={row => row.id}
            contentContainerStyle={[
              styles.gridContent,
              { backgroundColor: colors.background },
            ]}
            removeClippedSubviews
            initialNumToRender={6}
            maxToRenderPerBatch={4}
            windowSize={5}
            ListFooterComponent={
              sections.length > 1 ? (
                <View style={styles.swipeHint}>
                  <Text
                    style={[styles.swipeHintText, { color: colors.textMuted }]}
                  >
                    ← Deslize para ir à próxima seleção →
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item: row }) => (
              <View style={styles.row}>
                {row.stickers.map((sticker, idx) => (
                  <StickerCard
                    key={sticker.id}
                    sticker={sticker}
                    isDark={isDark}
                    colors={colors}
                    isWide={row.hasFormation && idx === 0}
                    onPress={onStickerPress}
                    onLongPress={onStickerLongPress}
                  />
                ))}
              </View>
            )}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Progress
  progressContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },

  // Grid
  slideContainer: { flex: 1 },
  gridContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
  },

  // Swipe hint footer
  swipeHint: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },
  swipeHintText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
