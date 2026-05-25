import React, { useState, useCallback } from 'react';
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
import { Spacing, Typography } from '../theme';
import { ALBUM_CONFIG } from '../data/copaData';

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

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.header} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Meu Álbum</Text>
            <Text style={styles.headerSub}>{ALBUM_CONFIG.name}</Text>
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
  },
  headerTitle: {
    ...Typography.screenTitle,
    color: '#FFFFFF',
  },
  headerSub: {
    ...Typography.screenSubtitle,
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
