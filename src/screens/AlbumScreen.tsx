import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlbumContent from '../components/AlbumContent';
import BottomSheetEditor from '../components/BottomSheetEditor';
import { useAlbumContext } from '../contexts/AlbumContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Sticker } from '../types';
import { Spacing, Typography } from '../theme';
import { ALBUM_CONFIG } from '../data/copaData';

const TUTORIAL_KEY = '@album_tutorial_seen';

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

  // ── One-time tutorial ────────────────────────────────────────────────────────
  const [showTutorial, setShowTutorial] = useState(false);
  const tutorialAnim = useRef(new Animated.Value(0)).current;

  const dismissTutorial = useCallback(() => {
    Animated.timing(tutorialAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setShowTutorial(false);
      AsyncStorage.setItem(TUTORIAL_KEY, '1');
    });
  }, [tutorialAnim]);

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    AsyncStorage.getItem(TUTORIAL_KEY).then(v => {
      if (!v) {
        setShowTutorial(true);
        Animated.timing(tutorialAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        tid = setTimeout(dismissTutorial, 7000);
      }
    });
    return () => clearTimeout(tid);
  }, [dismissTutorial, tutorialAnim]);

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

      {/* ── One-time tutorial (shown only on first access) ── */}
      {showTutorial && (
        <Animated.View
          style={[
            styles.tutorial,
            {
              opacity: tutorialAnim,
              backgroundColor: colors.surface,
              borderBottomColor: colors.navBorder,
            },
          ]}
        >
          <Text style={styles.tutorialIcon}>💡</Text>
          <View style={styles.tutorialBody}>
            <Text style={[styles.tutorialTitle, { color: colors.textPrimary }]}>
              Como usar o álbum
            </Text>
            <Text style={[styles.tutorialDesc, { color: colors.textMuted }]}>
              Toque 1× para adicionar · Segure para editar quantidade
            </Text>
          </View>
          <TouchableOpacity
            onPress={dismissTutorial}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.tutorialClose, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

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

  tutorial: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  tutorialIcon: {
    fontSize: 22,
  },
  tutorialBody: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  tutorialDesc: {
    fontSize: 11,
    fontWeight: '500',
  },
  tutorialClose: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
});
