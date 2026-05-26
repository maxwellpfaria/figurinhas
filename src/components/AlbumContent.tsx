import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, Animated, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import StickerCard, { NUM_COLUMNS } from './StickerCard';
import SectionTabs from './SectionTabs';
import { Section, Sticker } from '../types';
import { ColorsType } from '../theme';

type StickerRow = { id: string; stickers: Sticker[]; hasFormation: boolean };

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  sections: Section[];
  isDark: boolean;
  colors: ColorsType;
  readOnly?: boolean;
  onPress?: (id: string) => void;
  onLongPress?: (sticker: Sticker) => void;
  /** Optional header rendered above the tabs */
  ListHeaderComponent?: React.ReactElement | null;
}

export default function AlbumContent({
  sections,
  isDark,
  colors,
  readOnly = false,
  onPress,
  onLongPress,
  ListHeaderComponent,
}: Props) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id ?? '',
  );

  const slideAnim = useRef(new Animated.Value(0)).current;

  const sectionIds = useMemo(() => sections.map(s => s.id), [sections]);

  const currentSection = useMemo(
    () => sections.find(s => s.id === selectedSectionId) ?? null,
    [sections, selectedSectionId],
  );

  const currentStickers = useMemo(
    () => currentSection?.stickers ?? [],
    [currentSection],
  );

  // Group stickers into rows; sticker 13 in team sections spans 2 columns
  const stickerRows = useMemo<StickerRow[]>(() => {
    const isTeam = (currentSection?.stickers.length ?? 0) === 20 && !currentSection?.isSpecial;
    const result: StickerRow[] = [];
    let i = 0;
    while (i < currentStickers.length) {
      const s = currentStickers[i];
      if (isTeam && s.number === 13) {
        const row: Sticker[] = [s];
        if (currentStickers[i + 1]) row.push(currentStickers[i + 1]);
        if (currentStickers[i + 2]) row.push(currentStickers[i + 2]);
        result.push({ id: s.id, stickers: row, hasFormation: true });
        i += 3;
      } else {
        const row = currentStickers.slice(i, i + NUM_COLUMNS);
        result.push({ id: row[0].id, stickers: row, hasFormation: false });
        i += NUM_COLUMNS;
      }
    }
    return result;
  }, [currentStickers, currentSection]);

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

  const noOp = useCallback(() => {}, []);

  // ── Animated section transition ───────────────────────────────────────────────
  // fromDrag=true: content is already partially moved by the finger, use shorter
  // slide-out duration so the hand-off feels instant.
  const changeSection = useCallback(
    (newId: string, direction: 'next' | 'prev', fromDrag = false) => {
      const outX = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      const inX = direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH;

      const slideIn = () => {
        slideAnim.setValue(inX);
        setSelectedSectionId(newId);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 220,
          overshootClamping: true,
        }).start();
      };

      Animated.timing(slideAnim, {
        toValue: outX,
        duration: fromDrag ? 100 : 160,
        useNativeDriver: true,
      }).start(slideIn);
    },
    [slideAnim],
  );

  // Animate when a tab is tapped; direction inferred from index difference.
  const handleTabSelect = useCallback(
    (newId: string) => {
      const currentIdx = sectionIds.indexOf(selectedSectionId);
      const newIdx = sectionIds.indexOf(newId);
      if (newIdx === currentIdx) return;
      changeSection(newId, newIdx > currentIdx ? 'next' : 'prev', false);
    },
    [sectionIds, selectedSectionId, changeSection],
  );

  // ── Horizontal swipe to navigate between sections ─────────────────────────
  // onUpdate follows the finger; onEnd decides whether to commit or snap back.
  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-35, 35])
    .failOffsetY([-12, 12])
    .onUpdate(event => {
      slideAnim.setValue(event.translationX);
    })
    .onEnd(event => {
      const { translationX } = event;
      const idx = sectionIds.indexOf(selectedSectionId);
      if (translationX < -50 && idx < sectionIds.length - 1) {
        changeSection(sectionIds[idx + 1], 'next', true);
      } else if (translationX > 50 && idx > 0) {
        changeSection(sectionIds[idx - 1], 'prev', true);
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }).start();
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.root}>
        {/* Header and tabs stay fixed while the grid slides */}
        {ListHeaderComponent}
        <SectionTabs
          sections={sections}
          selectedId={selectedSectionId}
          isDark={isDark}
          colors={colors}
          onSelect={handleTabSelect}
          getProgress={getSectionProgress}
        />
        <Animated.View style={[styles.slideContainer, { transform: [{ translateX: slideAnim }] }]}>
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
            renderItem={({ item: row }) => (
              <View style={styles.row}>
                {row.stickers.map((sticker, idx) => (
                  <StickerCard
                    key={sticker.id}
                    sticker={sticker}
                    isDark={isDark}
                    colors={colors}
                    isWide={row.hasFormation && idx === 0}
                    onPress={readOnly ? noOp : (onPress ?? noOp)}
                    onLongPress={readOnly ? noOp as any : (onLongPress ?? noOp as any)}
                  />
                ))}
              </View>
            )}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slideContainer: { flex: 1 },
  gridContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
  },
});
