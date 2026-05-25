import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';
import {
  UserProfile,
  findUserByInviteCode,
  addFriend,
  getFriendsProfiles,
  getFriendQuantities,
} from '../services/firestore';
import { INITIAL_SECTIONS } from '../data/mockData';
import { useAlbum } from '../hooks/useAlbum';
import AlbumContent from '../components/AlbumContent';
import { Section } from '../types';

// ─── Trade Suggestion Header ──────────────────────────────────────────────────

interface TradeSuggestionsProps {
  myQty: Record<string, number>;
  friendQty: Record<string, number>;
  friendName: string;
}

function TradeSuggestions({ myQty, friendQty, friendName }: TradeSuggestionsProps) {
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

  return (
    <View style={[styles.tradeBox, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
      <Text style={[styles.tradeTitle, { color: colors.textPrimary }]}>
        🤝 Possíveis trocas com {friendName}
      </Text>
      {canGet.length > 0 && (
        <View style={styles.tradeSection}>
          <Text style={[styles.tradeLabel, { color: colors.primary }]}>
            Ele tem repetida, você falta ({canGet.length}):
          </Text>
          <Text style={[styles.tradeList, { color: colors.textSecondary }]} numberOfLines={3}>
            {canGet.slice(0, 12).join(' · ')}{canGet.length > 12 ? ` +${canGet.length - 12}` : ''}
          </Text>
        </View>
      )}
      {canGive.length > 0 && (
        <View style={styles.tradeSection}>
          <Text style={[styles.tradeLabel, { color: '#F43F5E' }]}>
            Você tem repetida, ele falta ({canGive.length}):
          </Text>
          <Text style={[styles.tradeList, { color: colors.textSecondary }]} numberOfLines={3}>
            {canGive.slice(0, 12).join(' · ')}{canGive.length > 12 ? ` +${canGive.length - 12}` : ''}
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

function FriendAlbumView({ friend, myQty, onBack }: FriendAlbumViewProps) {
  const { colors, isDark } = useTheme();
  const [friendSections, setFriendSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [friendQty, setFriendQty] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

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

  const owned = Object.values(friendQty).filter(q => q > 0).length;
  const total = INITIAL_SECTIONS.reduce((s, sec) => s + sec.stickers.length, 0);
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.friendHeader, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.friendHeaderInfo}>
          <Text style={styles.friendHeaderName} numberOfLines={1}>
            📖 {friend.displayName}
          </Text>
          <Text style={styles.friendHeaderSub}>
            {pct}% completo · {owned}/{total}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Carregando álbum...
          </Text>
        </View>
      ) : (
        <AlbumContent
          sections={friendSections}
          isDark={isDark}
          colors={colors}
          readOnly
          ListHeaderComponent={
            <TradeSuggestions
              myQty={myQty}
              friendQty={friendQty}
              friendName={friend.displayName}
            />
          }
        />
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
  const [listLoading, setListLoading] = useState(true);
  const [viewingFriend, setViewingFriend] = useState<UserProfile | null>(null);
  const { quantities: myQty } = useAlbum(user?.uid);

  useEffect(() => {
    if (!profile) return;
    getFriendsProfiles(profile.friends)
      .then(setFriends)
      .catch(console.error)
      .finally(() => setListLoading(false));
  }, [profile?.friends.join(',')]);

  const handleAddFriend = useCallback(async () => {
    if (!codeInput.trim() || !user || !profile) return;
    setAddLoading(true);
    try {
      const found = await findUserByInviteCode(codeInput);
      if (!found) {
        Alert.alert('Código não encontrado', 'Verifique o código e tente novamente.');
        return;
      }
      if (found.uid === user.uid) {
        Alert.alert('Ops!', 'Esse é o seu próprio código 😄');
        return;
      }
      if (profile.friends.includes(found.uid)) {
        Alert.alert('Já são amigos!', `${found.displayName} já está na sua lista.`);
        return;
      }
      await addFriend(user.uid, found.uid);
      await refreshProfile();
      setFriends(prev => [...prev, found]);
      setCodeInput('');
      Alert.alert('✅ Amigo adicionado!', `${found.displayName} foi adicionado à sua lista.`);
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o amigo. Tente novamente.');
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
    Alert.alert('Copiado!', `Código ${profile.inviteCode} copiado.`);
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
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
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
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 11,
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
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: '#FFFFFF' },
  friendHeaderInfo: { flex: 1 },
  friendHeaderName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  friendHeaderSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
  },

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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
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
    fontSize: 16,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
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
    fontSize: 15,
    fontWeight: '700',
  },
  friendCode: {
    fontSize: 11,
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
