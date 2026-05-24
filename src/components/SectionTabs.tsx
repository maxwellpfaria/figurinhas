import React, { memo, useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { Section } from '../types';
import { Spacing, Radius } from '../theme';
import { ColorsType } from '../theme';

interface Props {
  sections: Section[];
  selectedId: string;
  isDark: boolean;
  colors: ColorsType;
  onSelect: (id: string) => void;
  getProgress: (id: string) => { owned: number; total: number };
}

const SectionTab = memo(
  ({
    section,
    isSelected,
    progress,
    isDark,
    colors,
    onPress,
    onLayout,
  }: {
    section: Section;
    isSelected: boolean;
    progress: { owned: number; total: number };
    isDark: boolean;
    colors: ColorsType;
    onPress: () => void;
    onLayout: (x: number, width: number) => void;
  }) => {
    const activeBg = isDark ? colors.primary : '#0F172A';
    const activeText = isDark ? '#0F172A' : '#FFFFFF';
    const inactiveBg = colors.surfaceAlt;
    const inactiveText = colors.textSecondary;
    const badgeBg = isSelected
      ? isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.2)'
      : isDark ? colors.surface : '#E2E8F0';
    const badgeText = isSelected ? activeText : colors.textMuted;

    return (
      <TouchableOpacity
        onPress={onPress}
        onLayout={(e: LayoutChangeEvent) =>
          onLayout(e.nativeEvent.layout.x, e.nativeEvent.layout.width)
        }
        activeOpacity={0.75}
        style={[
          styles.tab,
          {
            backgroundColor: isSelected ? activeBg : inactiveBg,
            shadowColor: isSelected ? activeBg : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isSelected ? 0.3 : 0,
            shadowRadius: 4,
            elevation: isSelected ? 3 : 0,
          },
        ]}
      >
        <Text style={styles.tabFlag}>{section.flag}</Text>
        <Text style={[styles.tabName, { color: isSelected ? activeText : inactiveText }]}>
          {section.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeLabel, { color: badgeText }]}>
            {progress.owned}/{progress.total}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

SectionTab.displayName = 'SectionTab';

const SectionTabs = memo(({ sections, selectedId, isDark, colors, onSelect, getProgress }: Props) => {
  const scrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const viewportWidth = useRef(0);

  useEffect(() => {
    const layout = tabLayouts.current[selectedId];
    if (!layout || !viewportWidth.current) return;
    const targetX = layout.x - (viewportWidth.current - layout.width) / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, targetX), animated: true });
  }, [selectedId]);

  return (
    <View
      style={[styles.wrapper, { backgroundColor: colors.surface, borderBottomColor: colors.navBorder }]}
      onLayout={(e) => { viewportWidth.current = e.nativeEvent.layout.width; }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sections.map((section) => (
          <SectionTab
            key={section.id}
            section={section}
            isSelected={section.id === selectedId}
            progress={getProgress(section.id)}
            isDark={isDark}
            colors={colors}
            onPress={() => onSelect(section.id)}
            onLayout={(x, width) => {
              tabLayouts.current[section.id] = { x, width };
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
});

SectionTabs.displayName = 'SectionTabs';
export default SectionTabs;

const TAB_MIN_WIDTH = 72;

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
  },

  tab: {
    minWidth: TAB_MIN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },

  tabFlag: {
    fontSize: 14,
  },
  tabName: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  badge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
});
