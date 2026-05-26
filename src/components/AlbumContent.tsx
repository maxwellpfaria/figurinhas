import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, Animated, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import StickerCard, { NUM_COLUMNS } from './StickerCard';
import SectionTabs from './SectionTabs';
import GroupTabs from './GroupTabs';
import { Section, Sticker } from '../types';
import { ColorsType } from '../theme';
import { GROUPS } from '../data/copaData';

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
  const [selectedGroupId, setSelectedGroupId] = useState<string>(GROUPS[0].id);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id ?? '',
  );

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Sections that belong to the currently selected group
  const groupSections = useMemo(() => {
    const group = GROUPS.find(g => g.id === selectedGroupId);
    if (!group) return sections;
    return group.sectionIds
      .map(id => sections.find(s => s.id === id))
      .filter((s): s is Section => s !== undefined);
  }, [selectedGroupId, sections]);

  const groupSectionIds = useMemo(
    () => groupSections.map(s => s.id),
    [groupSections],
  );

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
    const isTeam =
      (currentSection?.stickers.length ?? 0) === 20 && !currentSection?.isSpecial;
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
  // newGroupId is set when crossing a group boundary (swipe past last/first section).
  const changeSection = useCallback(
    (
      newSectionId: string,
      direction: 'next' | 'prev',
      fromDrag = false,
      newGroupId?: string,
    ) => {
      const outX = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      const inX = direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH;

      const slideIn = () => {
        slideAnim.setValue(inX);
        setSelectedSectionId(newSectionId);
        if (newGroupId) setSelectedGroupId(newGroupId);
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

  // Tapping a group pill: jump to first section of that group
  const handleGroupSelect = useCallback(
    (newGroupId: string) => {
      if (newGroupId === selectedGroupId) return;
      const group = GROUPS.find(g => g.id === newGroupId);
      if (!group) return;
      const currentIdx = GROUPS.findIndex(g => g.id === selectedGroupId);
      const newIdx = GROUPS.findIndex(g => g.id === newGroupId);
      changeSection(
        group.sectionIds[0],
        newIdx > currentIdx ? 'next' : 'prev',
        false,
        newGroupId,
      );
    },
    [selectedGroupId, changeSection],
  );

  // Tapping a section tab within the current group
  const handleTabSelect = useCallback(
    (newId: string) => {
      const currentIdx = groupSectionIds.indexOf(selectedSectionId);
      const newIdx = groupSectionIds.indexOf(newId);
      if (newIdx === currentIdx) return;
      changeSection(newId, newIdx > currentIdx ? 'next' : 'prev', false);
    },
    [groupSectionIds, selectedSectionId, changeSection],
  );

  // ── Horizontal swipe ──────────────────────────────────────────────────────────
  // Swiping past the last/first section of a group crosses into the adjacent group.
  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-35, 35])
    .failOffsetY([-12, 12])
    .onUpdate(event => {
      slideAnim.setValue(event.translationX);
    })
    .onEnd(event => {
      const { translationX } = event;
      const idx = groupSectionIds.indexOf(selectedSectionId);
      const groupIdx = GROUPS.findIndex(g => g.id === selectedGroupId);

      if (translationX < -50) {
        if (idx < groupSectionIds.length - 1) {
          changeSection(groupSectionIds[idx + 1], 'next', true);
        } else if (groupIdx < GROUPS.length - 1) {
          const nextGroup = GROUPS[groupIdx + 1];
          changeSection(nextGroup.sectionIds[0], 'next', true, nextGroup.id);
        } else {
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
        }
      } else if (translationX > 50) {
        if (idx > 0) {
          changeSection(groupSectionIds[idx - 1], 'prev', true);
        } else if (groupIdx > 0) {
          const prevGroup = GROUPS[groupIdx - 1];
          const lastId = prevGroup.sectionIds[prevGroup.sectionIds.length - 1];
          changeSection(lastId, 'prev', true, prevGroup.id);
        } else {
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
        }
      } else {
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
      }
    });

  return (
    <View style={styles.root}>
      {ListHeaderComponent}

      {/* Level 1 — group selector (fixed, independent of swipe) */}
      <GroupTabs
        groups={GROUPS}
        selectedGroupId={selectedGroupId}
        colors={colors}
        onSelect={handleGroupSelect}
      />

      {/* Level 2 — sections within the selected group (fixed, independent of swipe) */}
      <SectionTabs
        sections={groupSections}
        selectedId={selectedSectionId}
        isDark={isDark}
        colors={colors}
        onSelect={handleTabSelect}
        getProgress={getSectionProgress}
      />

      {/* Sliding sticker grid — gesture only covers this area */}
      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={[styles.slideContainer, { transform: [{ translateX: slideAnim }] }]}
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
                    onLongPress={
                      readOnly ? (noOp as any) : (onLongPress ?? (noOp as any))
                    }
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
