import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import StickerCard, { NUM_COLUMNS } from './StickerCard';
import SectionTabs from './SectionTabs';
import { Section, Sticker } from '../types';
import { ColorsType } from '../theme';

type StickerRow = { id: string; stickers: Sticker[]; hasFormation: boolean };

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

  // ── Horizontal swipe to navigate between sections ─────────────────────────
  // activeOffsetX activates only on clear horizontal movement;
  // failOffsetY cancels if vertical scroll starts first.
  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-35, 35])
    .failOffsetY([-12, 12])
    .onEnd(event => {
      const { translationX } = event;
      if (Math.abs(translationX) < 50) return;
      const idx = sectionIds.indexOf(selectedSectionId);
      if (translationX < 0 && idx < sectionIds.length - 1) {
        setSelectedSectionId(sectionIds[idx + 1]);
      } else if (translationX > 0 && idx > 0) {
        setSelectedSectionId(sectionIds[idx - 1]);
      }
    });

  const tabsHeader = (
    <SectionTabs
      sections={sections}
      selectedId={selectedSectionId}
      isDark={isDark}
      colors={colors}
      onSelect={setSelectedSectionId}
      getProgress={getSectionProgress}
    />
  );

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.root}>
        <FlatList
          data={stickerRows}
          keyExtractor={row => row.id}
          contentContainerStyle={[
            styles.gridContent,
            { backgroundColor: colors.background },
          ]}
          ListHeaderComponent={
            <>
              {ListHeaderComponent}
              {tabsHeader}
            </>
          }
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
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gridContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
  },
});
