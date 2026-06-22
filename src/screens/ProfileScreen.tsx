import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius, Typography, ColorsType } from '../theme';
import { useFaq } from '../hooks/useFaq';
import { useLegal } from '../hooks/useLegal';


// ── FAQ data ──────────────────────────────────────────────────────────────────

// FAQ_ITEMS foi movido para src/hooks/useFaq.ts (fallback) e src/services/faq.ts (Firestore).

// ── Policy sub-view ───────────────────────────────────────────────────────────

function PolicyView({
  title,
  content,
  colors,
  onBack,
}: {
  title: string;
  content: string;
  colors: ColorsType;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.header }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.header} />
      <View style={[styles.header, styles.headerRow, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={HIT_SLOP}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center' }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.policyContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.policyText, { color: colors.textSecondary }]}>{content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Confirm modal (shared for delete and sign-out) ────────────────────────────

function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  danger,
  loading,
  colors,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  colors: ColorsType;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const confirmBg = danger ? '#F43F5E' : colors.primary;
  const confirmText = '#FFFFFF';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[styles.modalSheet, { backgroundColor: colors.surface, paddingBottom: Spacing.xl + bottomInset }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.handle }]} />

          <View style={styles.modalIconRow}>
            <View
              style={[
                styles.modalIconBadge,
                { backgroundColor: danger ? 'rgba(244,63,94,0.12)' : 'rgba(100,116,139,0.12)' },
              ]}
            >
              <Ionicons
                name={danger ? 'warning-outline' : 'log-out-outline'}
                size={28}
                color={danger ? '#F43F5E' : colors.textSecondary}
              />
            </View>
          </View>

          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: confirmBg }]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={confirmText} size="small" />
              ) : (
                <Text style={[styles.modalBtnText, { color: confirmText }]}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Edit name modal ───────────────────────────────────────────────────────────

function EditNameModal({
  visible,
  currentName,
  colors,
  isDark,
  onClose,
  onSave,
}: {
  visible: boolean;
  currentName: string;
  colors: ColorsType;
  isDark: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed === currentName) { onClose(); return; }
    setLoading(true);
    try {
      await onSave(trimmed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[styles.modalSheet, { backgroundColor: colors.surface, paddingBottom: Spacing.xl + bottomInset }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.handle }]} />
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Alterar nome</Text>
          <TextInput
            style={[
              styles.nameInput,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.navBorder,
                color: colors.textPrimary,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            maxLength={40}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={isDark ? '#0F172A' : '#FFFFFF'} size="small" />
              ) : (
                <Text style={[styles.modalBtnText, { color: isDark ? '#0F172A' : '#FFFFFF' }]}>
                  Salvar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── FAQ item ──────────────────────────────────────────────────────────────────

function FaqItem({
  q,
  a,
  isLast,
  colors,
}: {
  q: string;
  a: string;
  isLast: boolean;
  colors: ColorsType;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={styles.faqRow}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.7}
      >
        <Text style={[styles.faqQ, { color: colors.textPrimary }]}>{q}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {open && (
        <Text style={[styles.faqA, { color: colors.textSecondary }]}>{a}</Text>
      )}
      {!isLast && (
        <View style={[styles.rowDivider, { backgroundColor: colors.navBorder }]} />
      )}
    </View>
  );
}

// ── Menu row ──────────────────────────────────────────────────────────────────

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function MenuRow({
  iconName,
  label,
  onPress,
  danger = false,
  rightElement,
  colors,
}: {
  iconName: IoniconName;
  label: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
  colors: ColorsType;
}) {
  const iconColor = danger ? '#F43F5E' : colors.textSecondary;
  const labelColor = danger ? '#F43F5E' : colors.textPrimary;
  const Wrapper: React.ElementType = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowIconContainer}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>
      <Text style={[styles.rowLabel, { color: labelColor }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {rightElement ?? (
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        )}
      </View>
    </Wrapper>
  );
}

function RowDivider({ color }: { color: string }) {
  return <View style={[styles.rowDivider, { backgroundColor: color }]} />;
}

function SectionGroup({
  label,
  colors,
  children,
}: {
  label: string;
  colors: ColorsType;
  children: React.ReactNode;
}) {
  return (
    <>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
      <View
        style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
      >
        {children}
      </View>
    </>
  );
}

// ── ProfileScreen ─────────────────────────────────────────────────────────────

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
type PolicyPage = 'privacy' | 'terms';

export default function ProfileScreen() {
  const { user, profile, signOut, updateName, deleteAccount } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { items: faqItems } = useFaq();
  const { privacyContent, termsContent } = useLegal();

  const [policyPage, setPolicyPage] = useState<PolicyPage | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // ── Handlers (must be declared before any early returns to obey Rules of Hooks) ──

  const handleConfirmDelete = useCallback(async () => {
    setDeleting(true);
    setShowDeleteModal(false);
    try {
      await deleteAccount();
    } catch (e: unknown) {
      setDeleting(false);
      const code = (e as { code?: string })?.code ?? '';
      if (code === 'auth/requires-recent-login') {
        setShowDeleteModal(false);
        setTimeout(() => {
          setShowDeleteModal(true);
        }, 300);
      }
    }
  }, [deleteAccount]);

  const handleConfirmSignOut = useCallback(async () => {
    setShowSignOutModal(false);
    await signOut();
  }, [signOut]);

  // ── Derived values ─────────────────────────────────────────────────────────

  const displayName = profile?.displayName || user?.displayName || 'Usuário';
  const email = user?.email ?? '';
  const initials = displayName.charAt(0).toUpperCase();

  // ── Sub-views (early returns must come after all hooks) ────────────────────

  if (policyPage === 'privacy') {
    return (
      <PolicyView
        title="Política de Privacidade"
        content={privacyContent}
        colors={colors}
        onBack={() => setPolicyPage(null)}
      />
    );
  }
  if (policyPage === 'terms') {
    return (
      <PolicyView
        title="Termos de Uso"
        content={termsContent}
        colors={colors}
        onBack={() => setPolicyPage(null)}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.header }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.header} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <Text style={styles.headerSub}>Configurações da sua conta</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar card ── */}
        <View
          style={[styles.avatarCard, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarInitial, { color: isDark ? '#0F172A' : '#FFFFFF' }]}>
              {initials}
            </Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textMuted }]} numberOfLines={1}>
              {email}
            </Text>
            {profile?.inviteCode ? (
              <Text style={[styles.inviteCode, { color: colors.textSecondary }]}>
                Código:{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {profile.inviteCode}
                </Text>
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Conta ── */}
        <SectionGroup label="CONTA" colors={colors}>
          <MenuRow
            iconName="pencil-outline"
            label="Alterar nome"
            onPress={() => setEditingName(true)}
            colors={colors}
          />
          <RowDivider color={colors.navBorder} />
          <MenuRow
            iconName={isDark ? 'moon-outline' : 'sunny-outline'}
            label={isDark ? 'Tema escuro' : 'Tema claro'}
            colors={colors}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.navBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.navBorder}
              />
            }
          />
        </SectionGroup>

        {/* ── Perguntas frequentes ── */}
        <SectionGroup label="PERGUNTAS FREQUENTES" colors={colors}>
          {faqItems.map((item, i) => (
            <FaqItem
              key={item.id}
              q={item.q}
              a={item.a}
              isLast={i === faqItems.length - 1}
              colors={colors}
            />
          ))}
        </SectionGroup>

        {/* ── Políticas e termos ── */}
        <SectionGroup label="POLÍTICAS E TERMOS" colors={colors}>
          <MenuRow
            iconName="shield-checkmark-outline"
            label="Política de Privacidade"
            onPress={() => setPolicyPage('privacy')}
            colors={colors}
          />
          <RowDivider color={colors.navBorder} />
          <MenuRow
            iconName="document-text-outline"
            label="Termos de Uso"
            onPress={() => setPolicyPage('terms')}
            colors={colors}
          />
        </SectionGroup>

        {/* ── Zona de perigo ── */}
        <SectionGroup label="ZONA DE PERIGO" colors={colors}>
          <MenuRow
            iconName="trash-outline"
            label={deleting ? 'Excluindo conta...' : 'Excluir conta'}
            onPress={deleting ? undefined : () => setShowDeleteModal(true)}
            danger
            colors={colors}
            rightElement={
              deleting ? <ActivityIndicator color="#F43F5E" size="small" /> : undefined
            }
          />
        </SectionGroup>

        {/* ── Sair ── */}
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}
          onPress={() => setShowSignOutModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color="#F43F5E" style={styles.signOutIcon} />
          <Text style={styles.signOutText}>Sair do aplicativo</Text>
        </TouchableOpacity>

        {/* ── Versão ── */}
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          Versão {Constants.expoConfig?.version ?? '—'}
        </Text>
      </ScrollView>

      {/* Edit name modal */}
      <EditNameModal
        visible={editingName}
        currentName={profile?.displayName || user?.displayName || ''}
        colors={colors}
        isDark={isDark}
        onClose={() => setEditingName(false)}
        onSave={async (name) => {
          await updateName(name);
          setEditingName(false);
        }}
      />

      {/* Delete account confirm modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Excluir conta"
        message="Seus dados, figurinhas e conexões com amigos serão apagados permanentemente. Esta ação não pode ser desfeita."
        confirmLabel="Excluir permanentemente"
        danger
        loading={deleting}
        colors={colors}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Sign-out confirm modal */}
      <ConfirmModal
        visible={showSignOutModal}
        title="Sair do aplicativo"
        message="Você será desconectado da sua conta. Seus dados ficam salvos na nuvem e estarão disponíveis ao fazer login novamente."
        confirmLabel="Sair"
        colors={colors}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header ──
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
    marginTop: 1,
  },

  // ── Back button (policy views) ──
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 4,
    width: 40,
    alignItems: 'flex-start',
  },

  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.xs,
  },

  // ── Avatar card ──
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '900',
  },
  avatarInfo: { flex: 1 },
  userName: {
    ...Typography.cardTitle,
  },
  userEmail: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  inviteCode: {
    ...Typography.bodySmall,
    marginTop: 4,
  },

  // ── Section label ──
  sectionLabel: {
    ...Typography.sectionLabel,
    paddingHorizontal: 4,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  // ── Group card ──
  group: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // ── Menu row ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  rowIconContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    ...Typography.body,
    flex: 1,
    fontWeight: '500',
  },
  rowRight: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 28 + Spacing.sm,
  },

  // ── FAQ ──
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  faqQ: {
    ...Typography.body,
    flex: 1,
    fontWeight: '500',
  },
  faqA: {
    ...Typography.body,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    lineHeight: 20,
  },

  // ── Version ──
  versionText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.md,
  },

  // ── Sign out button ──
  signOutBtn: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  signOutIcon: {
    marginRight: 2,
  },
  signOutText: {
    ...Typography.buttonPrimary,
    color: '#F43F5E',
  },

  // ── Policy content ──
  policyContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  policyText: {
    ...Typography.body,
    lineHeight: 22,
  },

  // ── Modals ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalIconRow: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...Typography.cardTitle,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalMessage: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  nameInput: {
    ...Typography.inputText,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
  },
  modalBtnPrimary: {},
  modalBtnText: {
    ...Typography.buttonSecondary,
  },
});
