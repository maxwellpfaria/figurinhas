import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlbumContent from '../components/AlbumContent';
import BottomSheetEditor from '../components/BottomSheetEditor';
import { useAlbumContext } from '../contexts/AlbumContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Sticker } from '../types';
import { Spacing, Typography } from '../theme';
import { ALBUM_CONFIG } from '../data/copaData';

export default function AlbumScreen() {
  const { user } = useAuth();
  const { sections, increment, setQuantity, getSectionProgress, totalProgress, syncing } =
    useAlbumContext();
  const { colors, isDark } = useTheme();
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
          {syncing && (
            <ActivityIndicator
              size="small"
              color="rgba(255,255,255,0.6)"
            />
          )}
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
    alignItems: 'flex-end',
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
