import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlbumContext } from '../contexts/AlbumContext';
import { Spacing, Radius, Typography } from '../theme';
import { generateShareText, getAlbumStats } from '../utils/tradeQR';

export default function ShareScreen() {
  const { colors, isDark } = useTheme();
  const { user, profile } = useAuth();
  const { quantities } = useAlbumContext();

  const displayName = profile?.displayName || user?.displayName || 'Anônimo';
  const stats = getAlbumStats(quantities);
  const shareText = useMemo(
    () => generateShareText(quantities, displayName),
    [quantities, displayName],
  );

  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const openWhatsApp = useCallback(async () => {
    const encoded = encodeURIComponent(shareText);
    const nativeUrl = `whatsapp://send?text=${encoded}`;
    const webUrl = `https://wa.me/?text=${encoded}`;
    try {
      const can = await Linking.canOpenURL(nativeUrl);
      await Linking.openURL(can ? nativeUrl : webUrl);
    } catch {
      await Linking.openURL(webUrl);
    }
  }, [shareText]);

  const openGenericShare = useCallback(async () => {
    try {
      await Share.share({ message: shareText, title: 'Meu Álbum Completo' });
    } catch {}
  }, [shareText]);

  const copyToClipboard = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(shareText);
      } else {
        const { Clipboard } = require('react-native');
        Clipboard.setString(shareText);
      }
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [shareText]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.header}
      />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <Text style={styles.headerTitle}>Compartilhar Lista</Text>
        <Text style={styles.headerSub}>
          Envie suas repetidas e o que falta para um amigo
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <View
            style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
          >
            <Text style={[styles.statValue, { color: colors.badge }]}>{stats.missing}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>faltando</Text>
          </View>
          <View
            style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
          >
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.extras}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>repetidas</Text>
          </View>
        </View>

        {/* ── Preview ── */}
        <View
          style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
        >
          <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
            PRÉVIA DA MENSAGEM
          </Text>
          <ScrollView
            style={styles.previewScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.previewText, { color: colors.textPrimary }]}>
              {shareText}
            </Text>
          </ScrollView>
        </View>

        {/* ── Buttons ── */}
        <TouchableOpacity
          style={styles.whatsappBtn}
          onPress={openWhatsApp}
          activeOpacity={0.85}
        >
          <Text style={styles.whatsappIcon}>💬</Text>
          <Text style={styles.whatsappText}>Compartilhar no WhatsApp</Text>
        </TouchableOpacity>

        {Platform.OS !== 'web' ? (
          <>
            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
              onPress={openGenericShare}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryIcon, { color: colors.textSecondary }]}>🔗</Text>
              <Text style={[styles.secondaryText, { color: colors.textPrimary }]}>
                Outras formas de compartilhar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
              onPress={copyToClipboard}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryIcon, { color: colors.textSecondary }]}>
                {copied ? '✅' : '📋'}
              </Text>
              <Text style={[styles.secondaryText, { color: colors.textPrimary }]}>
                {copied ? 'Copiado!' : 'Copiar texto'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
            onPress={copyToClipboard}
            activeOpacity={0.85}
          >
            <Text style={[styles.secondaryIcon, { color: colors.textSecondary }]}>
              {copied ? '✅' : '📋'}
            </Text>
            <Text style={[styles.secondaryText, { color: colors.textPrimary }]}>
              {copied ? 'Copiado!' : 'Copiar texto'}
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Info ── */}
        <View style={[styles.infoBox, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            A mensagem lista suas{' '}
            <Text style={{ color: colors.primary, fontWeight: '700' }}>repetidas</Text> (para
            oferecer em troca) e suas{' '}
            <Text style={{ color: colors.badge, fontWeight: '700' }}>faltando</Text> (para
            pedir). Seu amigo pode responder com a lista dele para vocês combinarem a troca.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.screenTitle,
    color: '#FFFFFF',
  },
  headerSub: {
    ...Typography.screenSubtitle,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  statValue: {
    ...Typography.statLarge,
  },
  statLabel: {
    ...Typography.statLabel,
  },

  // ── Preview ──
  previewCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  previewLabel: {
    ...Typography.sectionLabel,
    marginBottom: Spacing.sm,
  },
  previewScroll: {
    maxHeight: 240,
  },
  previewText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // ── WhatsApp button ──
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: Radius.lg,
    paddingVertical: 15,
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  whatsappIcon: {
    fontSize: 20,
  },
  whatsappText: {
    ...Typography.buttonPrimary,
    color: '#FFFFFF',
  },

  // ── Secondary buttons ──
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  secondaryIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Info ──
  infoBox: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  infoText: {
    ...Typography.body,
    textAlign: 'center',
  },
});
