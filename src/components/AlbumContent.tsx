import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import StickerCard, { NUM_COLUMNS, ROW_HEIGHT } from './StickerCard';
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
