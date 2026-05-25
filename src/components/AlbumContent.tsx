import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import StickerCard, { NUM_COLUMNS } from './StickerCard';
import SectionTabs from './SectionTabs';
import { Section, Sticker } from '../types';
import { ColorsType } from '../theme';

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

  const currentStickers = useMemo(
    () => sections.find(s => s.id === selectedSectionId)?.stickers ?? [],
    [sections, selectedSectionId],
  );

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
          data={currentStickers}
          keyExtractor={item => item.id}
          numColumns={NUM_COLUMNS}
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
          initialNumToRender={24}
          maxToRenderPerBatch={16}
          windowSize={5}
          renderItem={({ item }) => (
            <StickerCard
              sticker={item}
              isDark={isDark}
              colors={colors}
              onPress={readOnly ? noOp : (onPress ?? noOp)}
              onLongPress={readOnly ? noOp as any : (onLongPress ?? noOp as any)}
            />
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
});
