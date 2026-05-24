import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AlbumContent from '../components/AlbumContent';
import BottomSheetEditor from '../components/BottomSheetEditor';
import { useAlbum } from '../hooks/useAlbum';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Sticker } from '../types';
import { Spacing } from '../theme';
import { useState } from 'react';

export default function AlbumScreen() {
  const { user } = useAuth();
  const { sections, increment, setQuantity, getSectionProgress, totalProgress, syncing } =
    useAlbum(user?.uid);
  const { colors, isDark, toggleTheme } = useTheme();
  const [editingSticker, setEditingSticker] = useState<Sticker | null>(null);

  // Keep liveEditingSticker in sync across sticker list
  const liveEditingSticker = editingSticker
    ? sections
        .flatMap(s => s.stickers)
        .find(s => s.id === editingSticker.id) ?? editingSticker
    : null;

  const handlePress = useCallback((id: string) => increment(id), [increment]);
  const handleLongPress = useCallback((s: Sticker) => setEditingSticker(s), []);
  const handleCloseSheet = useCallback(() => setEditingSticker(null), []);

  const overallPct =
    totalProgress.total > 0
      ? Math.round((totalProgress.owned / totalProgress.total) * 100)
      : 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.header} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>⚽ FiguCopa 2026</Text>
            <Text style={styles.headerSub}>Álbum da Copa do Mundo</Text>
          </View>
          <View style={styles.headerActions}>
            {syncing && (
              <ActivityIndicator
                size="small"
                color="rgba(255,255,255,0.6)"
                style={{ marginRight: 8 }}
              />
            )}
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.7}
              style={styles.themeToggle}
            >
              <Text style={styles.themeToggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalProgress.owned}</Text>
            <Text style={styles.statLabel}>coletadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalProgress.total - totalProgress.owned}</Text>
            <Text style={styles.statLabel}>faltando</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.gold }]}>{overallPct}%</Text>
            <Text style={styles.statLabel}>completo</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: colors.progressTrack }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${overallPct}%` as any, backgroundColor: colors.progressFill },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.progressFill }]}>
            {totalProgress.owned}/{totalProgress.total}
          </Text>
        </View>
      </View>

      {/* ── Hint ── */}
      <View
        style={[
          styles.hintRow,
          { backgroundColor: colors.surface, borderBottomColor: colors.navBorder },
        ]}
      >
        <Text style={[styles.hintText, { color: colors.textMuted }]}>
          👆 Toque para adicionar · Segure para editar quantidade
        </Text>
      </View>

      {/* ── Album grid (tabs + stickers) ── */}
      <AlbumContent
        sections={sections}
        isDark={isDark}
        colors={colors}
        onPress={handlePress}
        onLongPress={handleLongPress}
      />

      {/* ── Bottom sheet ── */}
      <BottomSheetEditor
        sticker={liveEditingSticker}
        onClose={handleCloseSheet}
        onQuantityChange={setQuantity}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleIcon: { fontSize: 18 },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm + 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    minWidth: 52,
    textAlign: 'right',
  },

  hintRow: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
