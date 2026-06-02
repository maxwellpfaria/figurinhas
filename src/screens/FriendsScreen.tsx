import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius, Typography } from '../theme';
import {
  UserProfile,
  findUserByInviteCode,
  addFriend,
  getFriendsProfiles,
  getFriendQuantities,
} from '../services/firestore';
import { INITIAL_SECTIONS } from '../data/mockData';
import { useAlbumContext } from '../contexts/AlbumContext';
import AlbumIndex, { SortMode } from '../components/AlbumIndex';
import TeamDetail from '../components/TeamDetail';
import { Section, Sticker } from '../types';
import AppDialog from '../components/AppDialog';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Module-level lookup tables built once from section data
const STICKER_CODE: Record<string, string> = {};
const STICKER_ALBUM_IDX: Record<string, number> = {};
let _albumIdx = 0;
for (const section of INITIAL_SECTIONS) {
  for (const sticker of section.stickers) {
    STICKER_CODE[sticker.id] = sticker.code;
    STICKER_ALBUM_IDX[sticker.id] = _albumIdx++;
  }
}

function sortedStickerIds(ids: string[], sort: SortMode): string[] {
  if (sort === 'az') {
    return [...ids].sort((a, b) =>
      (STICKER_CODE[a] ?? a).localeCompare(STICKER_CODE[b] ?? b),
    );
  }
  return [...ids].sort(
    (a, b) => (STICKER_ALBUM_IDX[a] ?? 0) - (STICKER_ALBUM_IDX[b] ?? 0),
  );
}

// ─── Trade Suggestion Header ──────────────────────────────────────────────────

interface TradeSuggestionsProps {
  myQty: Record<string, number>;
  friendQty: Record<string, number>;
  friendName: string;
  sort: SortMode;
}

function TradeSuggestions({ myQty, friendQty, friendName, sort }: TradeSuggestionsProps) {
  const { colors } = useTheme();

  const canGet: string[] = [];
  const canGive: string[] = [];

  for (const [id, qty] of Object.entries(friendQty)) {
    if (qty >= 2 && !myQty[id]) canGet.push(id);
  }
  for (const [id, qty] of Object.entries(myQty)) {
    if (qty >= 2 && !friendQty[id]) canGive.push(id);
  }

  if (canGet.length === 0 && canGive.length === 0) {
    return (
      <View style={[styles.tradeBox, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
        <Text style={[styles.tradeTitle, { color: colors.textMuted }]}>
          🤷 Sem trocas possíveis no momento
        </Text>
      </View>
    );
  }

  const sortedGet = sortedStickerIds(canGet, sort);
  const sortedGive = sortedStickerIds(canGive, sort);

  return (
    <View style={[styles.tradeBox, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
      <Text style={[styles.tradeTitle, { color: colors.textPrimary }]}>
        🤝 Possíveis trocas com {friendName}
      </Text>
      {sortedGet.length > 0 && (
        <View style={styles.tradeSection}>
          <Text style={[styles.tradeLabel, { color: colors.primary }]}>
            Ele tem repetida, você falta ({sortedGet.length}):
          </Text>
          <Text style={[styles.tradeList, { color: colors.textSecondary }]}>
            {sortedGet.map(id => STICKER_CODE[id] ?? id).join(' · ')}
          </Text>
        </View>
      )}
      {sortedGive.length > 0 && (
        <View style={styles.tradeSection}>
          <Text style={[styles.tradeLabel, { color: '#F43F5E' }]}>
            Você tem repetida, ele falta ({sortedGive.length}):
          </Text>
          <Text style={[styles.tradeList, { color: colors.textSecondary }]}>
            {sortedGive.map(id => STICKER_CODE[id] ?? id).join(' · ')}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Friend Album Screen ──────────────────────────────────────────────────────

interface FriendAlbumViewProps {
  friend: UserProfile;
  myQty: Record<string, number>;
  onBack: () => void;
}

type FriendView = 'index' | 'team';

function FriendAlbumView({ friend, myQty, onBack }: FriendAlbumViewProps) {
  const { colors, isDark } = useTheme();
  const [friendSections, setFriendSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [friendQty, setFriendQty] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // ── View state (mirrors AlbumScreen) ─────────────────────────────────────
  const [view, setView] = useState<FriendView>('index');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [sort, setSort] = useState<SortMode>('album');
  const slideX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getFriendQuantities(friend.uid)
      .then(qty => {
        setFriendQty(qty);
        setFriendSections(
          INITIAL_SECTIONS.map(section => ({
            ...section,
            stickers: section.stickers.map(s => ({
              ...s,
              quantity: qty[s.id] ?? 0,
            })),
          })),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [friend.uid]);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goToTeam = useCallback(
    (sectionId: string) => {
      const idx = friendSections.findIndex(s => s.id === sectionId);
      if (idx < 0) return;
      setSectionIndex(idx);
      slideX.setValue(SCREEN_WIDTH * 0.35);
      setView('team');
      Animated.spring(slideX, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
        overshootClamping: true,
      }).start();
    },
    [friendSections, slideX],
  );

  const goBackToIndex = useCallback(() => {
    Animated.timing(slideX, {
      toValue: SCREEN_WIDTH * 0.35,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setView('index');
      slideX.setValue(0);
    });
  }, [slideX]);

  // Read-only: sticker interactions are no-ops
  const noop = useCallback((_: Sticker) => {}, []);

  // ── Header data ───────────────────────────────────────────────────────────
  const owned = Object.values(friendQty).filter(q => q > 0).length;
  const total = INITIAL_SECTIONS.reduce((s, sec) => s + sec.stickers.length, 0);
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;

  const currentSection = view === 'team' ? (friendSections[sectionIndex] ?? null) : null;
  const teamOwned = currentSection ? currentSection.stickers.filter(s => s.quantity > 0).length : 0;
  const teamTotal = currentSection?.stickers.length ?? 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.header }]} edges={['top']}>
      {/* ── Header ── */}
      <View style={[styles.friendHeader, { backgroundColor: colors.header }]}>
        <TouchableOpacity
          onPress={view === 'team' ? goBackToIndex : onBack}
          style={styles.backBtn}
          hitSlop={{ top: 14, bottom: 14, left: 4, right: 12 }}
          activeOpacity={0.7}
        >
          <Text style={[styles.backIcon, { color: colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.friendHeaderInfo}>
          <Text style={styles.friendHeaderName} numberOfLines={1}>
            {view === 'team' && currentSection
              ? `${currentSection.flag}  ${currentSection.name}`
              : `📖 ${friend.displayName}`}
          </Text>
          <Text style={styles.friendHeaderSub}>
            {view === 'team' && currentSection
              ? `${teamOwned}/${teamTotal} figurinhas`
              : `${pct}% completo · ${owned}/${total}`}
          </Text>
        </View>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Carregando álbum...
          </Text>
        </View>
      ) : view === 'index' ? (
        <AlbumIndex
          sections={friendSections}
          colors={colors}
          isDark={isDark}
          sort={sort}
          onSortChange={setSort}
          onSelectSection={goToTeam}
          ListHeaderComponent={
            <TradeSuggestions
              myQty={myQty}
              friendQty={friendQty}
              friendName={friend.displayName}
              sort={sort}
            />
          }
        />
      ) : (
        <Animated.View
          style={[styles.detail, { transform: [{ translateX: slideX }] }]}
        >
          <TeamDetail
            sections={friendSections}
            sectionIndex={sectionIndex}
            isDark={isDark}
            colors={colors}
            onSectionChange={setSectionIndex}
            onStickerPress={noop}
            onStickerLongPress={noop}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ─── Friends List Screen ──────────────────────────────────────────────────────

export default function FriendsScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const [codeInput, setCodeInput] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  // Inicia true apenas se o perfil ainda não carregou; caso já esteja disponível
  // na montagem (fluxo normal pós-verificação de e-mail), evita spinner desnecessário.
  const [listLoading, setListLoading] = useState(!profile);
  const [viewingFriend, setViewingFriend] = useState<UserProfile | null>(null);
  const { quantities: myQty } = useAlbumContext();
  const [dialog, setDialog] = useState<{ title: string; message?: string } | null>(null);

  useEffect(() => {
    if (!profile) {
      setListLoading(false);
      return;
    }
    setListLoading(true);
    getFriendsProfiles(profile.friends)
      .then(setFriends)
      .catch(console.error)
      .finally(() => setListLoading(false));
  }, [profile?.friends.join(',')]);

  const handleAddFriend = useCallback(async () => {
    if (!codeInput.trim() || !user || !profile) return;
    Keyboard.dismiss();
    setAddLoading(true);
    try {
      const found = await findUserByInviteCode(codeInput);
      if (!found) {
        setDialog({ title: 'Código não encontrado', message: 'Verifique o código e tente novamente.' });
        return;
      }
      if (found.uid === user.uid) {
        setDialog({ title: 'Ops!', message: 'Esse é o seu próprio código 😄' });
        return;
      }
      if (profile.friends.includes(found.uid)) {
        setDialog({ title: 'Já são amigos!', message: `${found.displayName} já está na sua lista.` });
        return;
      }
      await addFriend(user.uid, found.uid);
      await refreshProfile();
      setFriends(prev => [...prev, found]);
      setCodeInput('');
      setDialog({ title: '✅ Amigo adicionado!', message: `${found.displayName} foi adicionado à sua lista.` });
    } catch {
      setDialog({ title: 'Erro', message: 'Não foi possível adicionar o amigo. Tente novamente.' });
    } finally {
      setAddLoading(false);
    }
  }, [codeInput, user, profile, refreshProfile]);

  const copyInviteCode = useCallback(async () => {
    if (!profile) return;
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(profile.inviteCode);
      } else {
        // Clipboard is deprecated but still works on RN native; access via require
        // to avoid undefined reference on web
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Clipboard: RNClipboard } = require('react-native');
        RNClipboard?.setString(profile.inviteCode);
      }
    } catch {}
    setDialog({ title: 'Copiado! 📋', message: `Código ${profile.inviteCode} copiado para a área de transferência.` });
  }, [profile]);

  // If viewing a friend's album
  if (viewingFriend) {
    return (
      <FriendAlbumView
        friend={viewingFriend}
        myQty={myQty}
        onBack={() => setViewingFriend(null)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.header }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <Text style={styles.headerTitle}>👥 Amigos</Text>
        <Text style={styles.headerSub}>Conecte, compare e troque figurinhas</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Invite code card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Seu código de convite</Text>
          <View style={styles.codeRow}>
            <Text style={[styles.codeText, { color: colors.textPrimary }]}>
              {profile?.inviteCode ?? '------'}
            </Text>
            <TouchableOpacity
              onPress={copyInviteCode}
              style={[styles.copyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.copyBtnText, { color: isDark ? '#0F172A' : '#FFFFFF' }]}>
                Copiar
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.codeHint, { color: colors.textMuted }]}>
            Compartilhe este código com seus amigos para se conectarem
          </Text>
        </View>

        {/* Add friend */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Adicionar amigo</Text>
          <View style={styles.addRow}>
            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.navBorder,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Código do amigo (ex: ABC123)"
              placeholderTextColor={colors.textMuted}
              value={codeInput}
              onChangeText={t => setCodeInput(t.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleAddFriend}
            />
            <TouchableOpacity
              onPress={handleAddFriend}
              disabled={addLoading || codeInput.length < 6}
              style={[
                styles.addBtn,
                {
                  backgroundColor:
                    codeInput.length === 6 ? colors.primary : colors.surfaceAlt,
                },
              ]}
            >
              {addLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={[styles.addBtnText, { color: codeInput.length === 6 ? (isDark ? '#0F172A' : '#FFFFFF') : colors.textMuted }]}>
                  Adicionar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Friends list */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          {friends.length > 0 ? `SEUS AMIGOS (${friends.length})` : 'SEUS AMIGOS'}
        </Text>

        {listLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.lg }} />
        ) : friends.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
            <Text style={styles.emptyEmoji}>🤝</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Nenhum amigo ainda
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              Compartilhe seu código e adicione amigos para comparar álbuns e descobrir trocas!
            </Text>
          </View>
        ) : (
          friends.map(friend => (
            <TouchableOpacity
              key={friend.uid}
              style={[styles.friendCard, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
              onPress={() => setViewingFriend(friend)}
              activeOpacity={0.75}
            >
              <View style={[styles.friendAvatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.friendAvatarText, { color: isDark ? '#0F172A' : '#FFFFFF' }]}>
                  {friend.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: colors.textPrimary }]}>
                  {friend.displayName}
                </Text>
                <Text style={[styles.friendCode, { color: colors.textMuted }]}>
                  Código: {friend.inviteCode}
                </Text>
              </View>
              <Text style={[styles.viewAlbum, { color: colors.primary }]}>Ver álbum →</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <AppDialog
        visible={!!dialog}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        onClose={() => setDialog(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadingText: { fontSize: 14 },

  // Header (friends list)
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md + 2,
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

  // Header (friend album view)
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.sm,
  },
  backBtn: { paddingRight: 4, flexShrink: 0 },
  backIcon: { fontSize: 32, fontWeight: '300', lineHeight: 36 },
  friendHeaderInfo: { flex: 1, minWidth: 0 },
  friendHeaderName: {
    ...Typography.cardTitle,
    color: '#FFFFFF',
  },
  friendHeaderSub: {
    ...Typography.screenSubtitle,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  detail: { flex: 1 },

  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.sm + 4,
    paddingBottom: Spacing.xl,
  },

  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardLabel: {
    ...Typography.sectionLabel,
    marginBottom: Spacing.sm,
  },

  // Invite code
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  codeText: {
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
  },
  copyBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  codeHint: {
    fontSize: 11,
    lineHeight: 16,
  },

  // Add friend
  addRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm + 4,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
  },
  addBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radius.md,
    justifyContent: 'center',
    minWidth: 90,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  sectionTitle: {
    ...Typography.sectionLabel,
    paddingHorizontal: 4,
    marginTop: Spacing.xs,
  },

  // Empty state
  emptyCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyTitle: {
    ...Typography.cardTitle,
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    ...Typography.body,
    textAlign: 'center',
  },

  // Friend card
  friendCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: '900',
  },
  friendInfo: { flex: 1 },
  friendName: {
    ...Typography.name,
  },
  friendCode: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  viewAlbum: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Trade suggestions
  tradeBox: {
    margin: Spacing.md,
    marginBottom: 0,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  tradeTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  tradeSection: { gap: 4 },
  tradeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  tradeList: {
    fontSize: 11,
    lineHeight: 16,
  },
});
