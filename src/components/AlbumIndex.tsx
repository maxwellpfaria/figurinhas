import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Section } from '../types';
import { ColorsType, Spacing, Radius } from '../theme';
import { GROUPS } from '../data/copaData';

// ── helpers ───────────────────────────────────────────────────────────────────

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Parse search text.
 * "brasil 7"  → { query: "brasil", stickerNumber: 7 }
 * "arg"       → { query: "arg",    stickerNumber: undefined }
 */
function parseSearch(text: string): { query: string; stickerNumber?: number } {
  const trimmed = text.trim();
  const match = trimmed.match(/^(.+?)\s+(\d{1,2})$/);
  if (match) {
    const num = parseInt(match[2], 10);
    if (num >= 1 && num <= 20) {
      return { query: match[1], stickerNumber: num };
    }
  }
  return { query: trimmed };
}

type SortMode = 'album' | 'az';

type GroupHeader = { type: 'header'; id: string; label: string };
type TeamRow = {
  type: 'team';
  section: Section;
  owned: number;
  total: number;
};
type ListItem = GroupHeader | TeamRow;

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  sections: Section[];
  colors: ColorsType;
  isDark: boolean;
  syncing?: boolean;
  onSelectSection: (sectionId: string, stickerNumber?: number) => void;
}

export default function AlbumIndex({
  sections,
  colors,
  isDark,
  syncing,
  onSelectSection,
}: Props) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('album');

  const { query, stickerNumber } = useMemo(() => parseSearch(search), [search]);

  // Sections matching the search query
  const filteredSections = useMemo(() => {
    if (!query) return sections;
    const q = normalize(query);
    return sections.filter(
      s => normalize(s.name).includes(q) || normalize(s.id).includes(q),
    );
  }, [sections, query]);

  // Build FlatList data (group headers + team rows)
  const listData = useMemo<ListItem[]>(() => {
    const toRow = (s: Section): TeamRow => ({
      type: 'team',
      section: s,
      owned: s.stickers.filter(st => st.quantity > 0).length,
      total: s.stickers.length,
    });

    // While searching: flat list, preserve album order
    if (query) return filteredSections.map(toRow);

    // A–Z sort: flat alphabetical list
    if (sort === 'az') {
      return [...sections]
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        .map(toRow);
    }

    // Album order with group headers
    const result: ListItem[] = [];
    for (const group of GROUPS) {
      const groupSections = group.sectionIds
        .map(id => sections.find(s => s.id === id))
        .filter((s): s is Section => s !== undefined);
      if (groupSections.length === 0) continue;

      let label: string;
      if (group.id === 'fwc') label = '⭐ ESPECIAIS';
      else if (group.id === 'cc') label = '🥤 PATROCINADOR';
      else label = `GRUPO ${group.label}`;

      result.push({ type: 'header', id: group.id, label });
      result.push(...groupSections.map(toRow));
    }
    return result;
  }, [sections, filteredSections, query, sort]);

  // Global progress totals
  const { totalOwned, totalStickers } = useMemo(() => {
    let owned = 0;
    let total = 0;
    for (const s of sections) {
      owned += s.stickers.filter(st => st.quantity > 0).length;
      total += s.stickers.length;
    }
    return { totalOwned: owned, totalStickers: total };
  }, [sections]);

  const globalPct =
    totalStickers > 0 ? Math.round((totalOwned / totalStickers) * 100) : 0;

  // ── render helpers ─────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      // Group header row
      if (item.type === 'header') {
        return (
          <View
            style={[styles.groupHeader, { borderBottomColor: colors.navBorder }]}
          >
            <Text style={[styles.groupLabel, { color: colors.textMuted }]}>
              {item.label}
            </Text>
          </View>
        );
      }

      // Team row
      const { section, owned, total } = item;
      const pct = total > 0 ? owned / total : 0;
      const isComplete = owned === total && total > 0;

      return (
        <TouchableOpacity
          style={[styles.teamRow, { backgroundColor: colors.surface }]}
          onPress={() => {
            Keyboard.dismiss();
            onSelectSection(section.id, stickerNumber);
          }}
          activeOpacity={0.7}
        >
          {/* Flag */}
          <Text style={styles.teamFlag}>{section.flag}</Text>

          {/* Name + progress */}
          <View style={styles.teamInfo}>
            <View style={styles.teamNameRow}>
              <Text
                style={[styles.teamName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {section.name}
              </Text>

              {isComplete ? (
                <View
                  style={[
                    styles.completeBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.completeBadgeText}>✓</Text>
                </View>
              ) : (
                <Text style={[styles.countLabel, { color: colors.textMuted }]}>
                  {owned}/{total}
                </Text>
              )}
            </View>

            {/* Progress bar */}
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.navBorder },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: isComplete
                      ? colors.primary
                      : colors.progressFill,
                    width: `${Math.round(pct * 100)}%` as any,
                  },
                ]}
              />
            </View>
          </View>

          {/* Chevron */}
          <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>
      );
    },
    [colors, onSelectSection, stickerNumber],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Header bar ── */}
      <View style={[styles.headerBar, { backgroundColor: colors.header }]}>
        <View>
          <Text style={styles.headerTitle}>Meu Álbum</Text>
          <Text style={styles.headerSub}>Copa do Mundo 2026</Text>
        </View>
        <View style={styles.headerRight}>
          {syncing && (
            <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
          )}
          <View style={styles.globalProgress}>
            <Text style={styles.globalPct}>{globalPct}%</Text>
            <Text style={styles.globalCount}>
              {totalOwned}/{totalStickers}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Search bar ── */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.surface, borderBottomColor: colors.navBorder },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.navBorder },
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Buscar seleção... (ex: brasil, arg 7)"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Sort toggle (hidden while searching) ── */}
      {!query && (
        <View
          style={[
            styles.controlsRow,
            { borderBottomColor: colors.navBorder },
          ]}
        >
          <View
            style={[styles.sortToggle, { backgroundColor: colors.surfaceAlt }]}
          >
            <TouchableOpacity
              style={[
                styles.sortOption,
                sort === 'album' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setSort('album')}
            >
              <Text
                style={[
                  styles.sortLabel,
                  {
                    color:
                      sort === 'album'
                        ? isDark ? '#0F172A' : '#fff'
                        : colors.textMuted,
                  },
                ]}
              >
                📖  Álbum
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortOption,
                sort === 'az' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setSort('az')}
            >
              <Text
                style={[
                  styles.sortLabel,
                  {
                    color:
                      sort === 'az'
                        ? isDark ? '#0F172A' : '#fff'
                        : colors.textMuted,
                  },
                ]}
              >
                🔤  A – Z
              </Text>
            </TouchableOpacity>
          </View>

          {/* Completion section count */}
          <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
            {sections.filter(s => s.stickers.every(st => st.quantity > 0)).length}
            /{sections.length} completas
          </Text>
        </View>
      )}

      {/* ── Search hint when number detected ── */}
      {!!stickerNumber && (
        <View
          style={[
            styles.hintBar,
            { backgroundColor: colors.primary + '22', borderBottomColor: colors.primary + '55' },
          ]}
        >
          <Text style={[styles.hintText, { color: colors.primary }]}>
            🔢  Figurinha nº {stickerNumber} — selecione a seleção para abri-la
          </Text>
        </View>
      )}

      {/* ── Empty state ── */}
      {listData.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Nenhuma seleção encontrada
          </Text>
        </View>
      )}

      {/* ── Team list ── */}
      <FlatList
        data={listData}
        keyExtractor={item =>
          item.type === 'header' ? `h_${item.id}` : item.section.id
        }
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: 1,
              backgroundColor: colors.navBorder,
              marginLeft: 62,
            }}
          />
        )}
      />
    </View>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  headerBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  clearBtn: { fontSize: 14, fontWeight: '700' },

  // Controls row
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sortToggle: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    overflow: 'hidden',
    gap: 0,
  },
  sortOption: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Hint bar
  hintBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // List
  list: {
    paddingBottom: 32,
  },

  // Group header
  groupHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Team row
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: 12,
  },
  teamFlag: {
    fontSize: 28,
    width: 38,
    textAlign: 'center',
  },
  teamInfo: {
    flex: 1,
    gap: 6,
  },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  completeBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
  },
  countLabel: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 0,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  chevron: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '300',
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    gap: 12,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
