import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlbumContext } from '../contexts/AlbumContext';
import { Spacing, Radius, Typography } from '../theme';
import { INITIAL_SECTIONS, TOTAL_STICKERS } from '../data/mockData';
import { getFriendsProfiles, getFriendQuantities, UserProfile } from '../services/firestore';
import { getAlbumStats } from '../utils/tradeQR';

// ─── Friends progress hook ────────────────────────────────────────────────────

interface FriendProgress extends UserProfile {
  owned: number;
  pct: number;
}

function useFriendsProgress(friendUids: string[]) {
  const [friends, setFriends] = useState<FriendProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const key = friendUids.join(',');

  useEffect(() => {
    if (!friendUids.length) {
      setFriends([]);
      return;
    }
    setLoading(true);
    getFriendsProfiles(friendUids)
      .then(async profiles => {
        const results = await Promise.all(
          profiles.map(async friend => {
            const qty = await getFriendQuantities(friend.uid);
            const owned = Object.values(qty).filter(q => q > 0).length;
            return { ...friend, owned, pct: Math.round((owned / TOTAL_STICKERS) * 100) };
          }),
        );
        setFriends(results.sort((a, b) => b.pct - a.pct));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [key]);

  return { friends, loading };
}

// ─── Color helper ─────────────────────────────────────────────────────────────

function readableColor(hex: string, isDark: boolean): string {
  if (!isDark || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance >= 0.35) return hex;
  const blend = (c: number) => Math.round(c + (255 - c) * 0.55);
  return `#${[blend(r), blend(g), blend(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user, profile } = useAuth();
  const { sections, quantities, totalProgress, syncing } = useAlbumContext();
  const { friends, loading: friendsLoading } = useFriendsProgress(profile?.friends ?? []);

  const firstName = (profile?.displayName || user?.displayName || '').split(' ')[0] || 'você';
  const stats = getAlbumStats(quantities);

  const overallPct =
    totalProgress.total > 0
      ? Math.round((totalProgress.owned / totalProgress.total) * 100)
      : 0;

  const allStickers = useMemo(() => sections.flatMap(s => s.stickers), [sections]);
  const specialsOwned = useMemo(
    () => allStickers.filter(s => s.isSpecial && s.quantity > 0).length,
    [allStickers],
  );

  // Top 5 sections by completion %
  const topSections = useMemo(
    () =>
      sections
        .map(s => {
          const owned = s.stickers.filter(st => st.quantity > 0).length;
          return {
            id: s.id,
            name: s.name,
            flag: s.flag,
            color: s.color,
            owned,
            total: s.stickers.length,
            pct: Math.round((owned / s.stickers.length) * 100),
          };
        })
        .filter(s => s.pct > 0)
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 5),
    [sections],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.header} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Olá, {firstName}! 👋</Text>
            <Text style={styles.headerSub}>Copa do Mundo 2026</Text>
          </View>
          {syncing && (
            <ActivityIndicator
              size="small"
              color="rgba(255,255,255,0.55)"
            />
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero progress card ── */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textMuted }]}>PROGRESSO GERAL</Text>
              <View style={styles.pctRow}>
                <Text style={[styles.pctValue, { color: colors.gold }]}>{overallPct}</Text>
                <Text style={[styles.pctSym, { color: colors.gold }]}>%</Text>
              </View>
            </View>
            <View style={styles.heroRight}>
              <Text style={[styles.heroFraction, { color: colors.textPrimary }]}>
                {totalProgress.owned}
                <Text style={[styles.heroFractionTotal, { color: colors.textMuted }]}>
                  {' '}/ {totalProgress.total}
                </Text>
              </Text>
              <Text style={[styles.heroFractionLabel, { color: colors.textMuted }]}>
                figurinhas coletadas
              </Text>
            </View>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: colors.progressTrack }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${overallPct}%` as any, backgroundColor: colors.progressFill },
              ]}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatCell value={totalProgress.owned} label="coletadas" color={colors.primary} />
            <View style={[styles.statDivider, { backgroundColor: colors.navBorder }]} />
            <StatCell value={stats.missing} label="faltando" color={colors.badge} />
            <View style={[styles.statDivider, { backgroundColor: colors.navBorder }]} />
            <StatCell value={stats.extras} label="repetidas" color="#3B82F6" />
            <View style={[styles.statDivider, { backgroundColor: colors.navBorder }]} />
            <StatCell value={specialsOwned} label="especiais" color={colors.gold} />
          </View>
        </View>

        {/* ── Section highlights ── */}
        {topSections.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              SEÇÕES MAIS COMPLETAS
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
              {topSections.map((sec, i) => (
                <View key={sec.id}>
                  {i > 0 && (
                    <View style={[styles.divider, { backgroundColor: colors.navBorder }]} />
                  )}
                  <View style={styles.sectionRow}>
                    <Text style={styles.sectionFlag}>{sec.flag}</Text>
                    <View style={styles.sectionInfo}>
                      <View style={styles.sectionNameRow}>
                        <Text
                          style={[styles.sectionName, { color: colors.textPrimary }]}
                          numberOfLines={1}
                        >
                          {sec.name}
                        </Text>
                        <Text style={[styles.sectionPct, { color: readableColor(sec.color, isDark) }]}>
                          {sec.pct}%
                        </Text>
                      </View>
                      <View
                        style={[styles.miniTrack, { backgroundColor: colors.progressTrack }]}
                      >
                        <View
                          style={[
                            styles.miniFill,
                            { width: `${sec.pct}%` as any, backgroundColor: readableColor(sec.color, isDark) },
                          ]}
                        />
                      </View>
                      <Text style={[styles.sectionFraction, { color: colors.textMuted }]}>
                        {sec.owned}/{sec.total} figurinhas
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Friends engagement ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          ENGAJAMENTO DOS AMIGOS
        </Text>

        {friendsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: Spacing.md }} />
        ) : friends.length === 0 ? (
          <View
            style={[
              styles.card,
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.navBorder },
            ]}
          >
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Nenhum amigo conectado
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              Adicione amigos na aba Amigos para ver o progresso de cada um aqui.
            </Text>
          </View>
        ) : (
          <View
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
          >
            {/* Minha própria entrada para comparação */}
            <FriendRow
              initials={firstName.charAt(0).toUpperCase()}
              name="Você"
              owned={totalProgress.owned}
              total={totalProgress.total}
              pct={overallPct}
              avatarBg={colors.primary}
              avatarTextColor={isDark ? '#0F172A' : '#FFFFFF'}
              barColor={colors.progressFill}
              trackColor={colors.progressTrack}
              nameColor={colors.textPrimary}
              mutedColor={colors.textMuted}
              pctColor={colors.gold}
            />

            {friends.map(friend => (
              <View key={friend.uid}>
                <View style={[styles.divider, { backgroundColor: colors.navBorder }]} />
                <FriendRow
                  initials={friend.displayName.charAt(0).toUpperCase()}
                  name={friend.displayName}
                  owned={friend.owned}
                  total={TOTAL_STICKERS}
                  pct={friend.pct}
                  avatarBg={colors.surfaceAlt}
                  avatarTextColor={colors.textSecondary}
                  barColor={colors.primary}
                  trackColor={colors.progressTrack}
                  nameColor={colors.textPrimary}
                  mutedColor={colors.textMuted}
                  pctColor={colors.primary}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCell({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel]}>{label}</Text>
    </View>
  );
}

function FriendRow({
  initials,
  name,
  owned,
  total,
  pct,
  avatarBg,
  avatarTextColor,
  barColor,
  trackColor,
  nameColor,
  mutedColor,
  pctColor,
}: {
  initials: string;
  name: string;
  owned: number;
  total: number;
  pct: number;
  avatarBg: string;
  avatarTextColor: string;
  barColor: string;
  trackColor: string;
  nameColor: string;
  mutedColor: string;
  pctColor: string;
}) {
  return (
    <View style={styles.friendRow}>
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={[styles.avatarText, { color: avatarTextColor }]}>{initials}</Text>
      </View>
      <View style={styles.friendInfo}>
        <View style={styles.friendNameRow}>
          <Text style={[styles.friendName, { color: nameColor }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.friendPct, { color: pctColor }]}>{pct}%</Text>
        </View>
        <View style={[styles.miniTrack, { backgroundColor: trackColor }]}>
          <View
            style={[styles.miniFill, { width: `${pct}%` as any, backgroundColor: barColor }]}
          />
        </View>
        <Text style={[styles.friendFraction, { color: mutedColor }]}>
          {owned} / {total} figurinhas
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
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
    gap: Spacing.xs,
    paddingBottom: Spacing.xl,
  },

  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  cardLabel: {
    ...Typography.sectionLabel,
    marginBottom: 4,
  },

  // Hero
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  pctValue: {
    fontSize: 52,
    fontWeight: '900',
    lineHeight: 58,
  },
  pctSym: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    marginLeft: 2,
  },
  heroRight: {
    alignItems: 'flex-end',
  },
  heroFraction: {
    fontSize: 22,
    fontWeight: '800',
  },
  heroFractionTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  heroFractionLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.statMedium,
  },
  statLabel: {
    ...Typography.statLabel,
    color: '#94A3B8',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },

  // Section label
  sectionLabel: {
    ...Typography.sectionLabel,
    paddingHorizontal: 4,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },

  // Section row
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionFlag: {
    fontSize: 28,
    width: 38,
    textAlign: 'center',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionName: {
    ...Typography.name,
    flex: 1,
  },
  sectionPct: {
    ...Typography.pctLabel,
    marginLeft: 8,
  },
  sectionFraction: {
    ...Typography.bodySmall,
    marginTop: 3,
  },

  miniTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Friends
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '900',
  },
  friendInfo: {
    flex: 1,
  },
  friendNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    ...Typography.name,
    flex: 1,
  },
  friendPct: {
    ...Typography.pctLabel,
    marginLeft: 8,
  },
  friendFraction: {
    ...Typography.bodySmall,
    marginTop: 3,
  },

  // Empty
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.cardTitle,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
