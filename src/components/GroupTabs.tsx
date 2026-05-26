import React, { useRef, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { ColorsType, Radius } from '../theme';
import { GroupDef } from '../data/copaData';

interface Props {
  groups: GroupDef[];
  selectedGroupId: string;
  colors: ColorsType;
  onSelect: (groupId: string) => void;
}

export default function GroupTabs({ groups, selectedGroupId, colors, onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const idx = groups.findIndex(g => g.id === selectedGroupId);
    if (idx < 0) return;
    // Estimate scroll offset to keep selected pill centered (each pill ~40px avg)
    const approxOffset = Math.max(0, idx * 40 - 120);
    scrollRef.current?.scrollTo({ x: approxOffset, animated: true });
  }, [selectedGroupId, groups]);

  return (
    <View style={[styles.container, { borderBottomColor: colors.navBorder, borderBottomWidth: 1 }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.inner}
      >
        {groups.map(g => {
          const active = g.id === selectedGroupId;
          return (
            <TouchableOpacity
              key={g.id}
              onPress={() => onSelect(g.id)}
              activeOpacity={0.7}
              style={[
                styles.pill,
                { backgroundColor: active ? colors.primary : 'transparent' },
              ]}
            >
              <Text style={[styles.label, { color: active ? '#FFFFFF' : colors.textMuted }]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
  },
  inner: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    height: 26,
    minWidth: 32,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
