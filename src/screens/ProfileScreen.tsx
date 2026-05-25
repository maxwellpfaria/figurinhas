import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius, Typography, ColorsType } from '../theme';

// ── Static content ─────────────────────────────────────────────────────────────

const PRIVACY_CONTENT = `POLÍTICA DE PRIVACIDADE
Última atualização: maio de 2026

O Meu Álbum Completo valoriza sua privacidade. Este documento descreve quais dados coletamos e como os utilizamos.

1. DADOS COLETADOS

• Nome e e-mail: fornecidos por você no cadastro
• Figurinhas: quantidade de cada figurinha registrada no app
• Amigos: identificadores dos usuários conectados ao seu perfil
• Código de convite: gerado automaticamente para conectar amigos

2. FINALIDADE

Seus dados são utilizados exclusivamente para:
• Identificar e manter sua conta ativa
• Sincronizar seu álbum entre dispositivos
• Exibir seu progresso e comparar com amigos

3. ARMAZENAMENTO E SEGURANÇA

Todos os dados são armazenados de forma segura no Firebase (Google Cloud), com criptografia em trânsito (TLS) e em repouso. Não mantemos servidores próprios.

4. COMPARTILHAMENTO

Não compartilhamos seus dados com anunciantes ou terceiros. Seu nome e progresso ficam visíveis apenas para amigos que você mesmo adicionou.

5. SEUS DIREITOS

A qualquer momento você pode:
• Alterar seu nome na tela de Perfil
• Excluir sua conta e todos os dados associados (Perfil › Excluir conta)
• Entrar em contato para solicitar informações sobre seus dados

6. CONTATO

Em caso de dúvidas ou solicitações: contato@meualbumdacopa.com.br

7. ALTERAÇÕES

Esta política pode ser atualizada a qualquer momento. O uso continuado do aplicativo após alterações implica no aceite das novas condições.`;

const TERMS_CONTENT = `TERMOS DE USO
Última atualização: maio de 2026

Ao utilizar o Meu Álbum Completo, você concorda com os termos abaixo.

1. SOBRE O APLICATIVO

O Meu Álbum Completo é um aplicativo independente para gerenciar coleções de figurinhas da Copa do Mundo FIFA 2026. Não possui vínculo com a FIFA, Panini ou qualquer organização oficial relacionada ao torneio.

2. USO PERMITIDO

• Registrar e acompanhar suas figurinhas pessoais
• Conectar-se com amigos para comparar coleções
• Compartilhar sua lista de figurinhas via outros aplicativos

3. RESPONSABILIDADES DO USUÁRIO

• Manter suas credenciais de acesso em sigilo
• Fornecer informações verdadeiras no cadastro
• Não criar contas falsas ou múltiplas contas
• Não utilizar o app para fins ilegais ou que prejudiquem outros usuários

4. LIMITAÇÃO DE RESPONSABILIDADE

O aplicativo é fornecido "como está", sem garantia de disponibilidade ininterrupta. Não nos responsabilizamos por perda de dados decorrente de falhas técnicas ou de terceiros, incluindo o Firebase.

5. PROPRIEDADE INTELECTUAL

O código-fonte, design e identidade visual do Meu Álbum Completo são propriedade de seus desenvolvedores. As marcas Copa do Mundo, FIFA e Panini pertencem aos seus respectivos titulares, sem qualquer relação com este aplicativo.

6. CANCELAMENTO

Você pode excluir sua conta a qualquer momento pelo menu Perfil. A exclusão é irreversível e remove permanentemente todos os seus dados.

7. ALTERAÇÕES NOS TERMOS

Estes termos podem ser atualizados a qualquer momento. Notificaremos por meio de atualização do aplicativo em caso de mudanças significativas.

8. CONTATO

contato@meualbumdacopa.com.br`;

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
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.header} />
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={HIT_SLOP}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
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
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
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

// ── Menu row ──────────────────────────────────────────────────────────────────

function MenuRow({
  icon,
  label,
  onPress,
  danger = false,
  rightElement,
  colors,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
  colors: ColorsType;
}) {
  const labelColor = danger ? '#F43F5E' : colors.textPrimary;
  // Use View when there's no press handler (e.g. the Switch row)
  const Wrapper: React.ElementType = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, { color: labelColor }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {rightElement ?? (
          <Text style={[styles.rowArrow, { color: colors.textMuted }]}>›</Text>
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

  const [policyPage, setPolicyPage] = useState<PolicyPage | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Sub-views ──────────────────────────────────────────────────────────────

  if (policyPage === 'privacy') {
    return (
      <PolicyView
        title="Política de Privacidade"
        content={PRIVACY_CONTENT}
        colors={colors}
        onBack={() => setPolicyPage(null)}
      />
    );
  }
  if (policyPage === 'terms') {
    return (
      <PolicyView
        title="Termos de Uso"
        content={TERMS_CONTENT}
        colors={colors}
        onBack={() => setPolicyPage(null)}
      />
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const displayName = profile?.displayName || user?.displayName || 'Usuário';
  const email = user?.email ?? '';
  const initials = displayName.charAt(0).toUpperCase();

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      '⚠️ Excluir conta',
      'Seus dados, figurinhas e conexões com amigos serão apagados permanentemente. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir permanentemente',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
            } catch (e: unknown) {
              setDeleting(false);
              const code = (e as { code?: string })?.code ?? '';
              if (code === 'auth/requires-recent-login') {
                Alert.alert(
                  'Sessão expirada',
                  'Por segurança, saia do aplicativo, entre novamente e tente excluir a conta.',
                );
              } else {
                Alert.alert('Erro', 'Não foi possível excluir a conta. Tente novamente.');
              }
            }
          },
        },
      ],
    );
  }, [deleteAccount]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sair', 'Deseja sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  }, [signOut]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
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
            icon="✏️"
            label="Alterar nome"
            onPress={() => setEditingName(true)}
            colors={colors}
          />
          <RowDivider color={colors.navBorder} />
          <MenuRow
            icon={isDark ? '🌙' : '☀️'}
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

        {/* ── Aplicativo ── */}
        <SectionGroup label="APLICATIVO" colors={colors}>
          <MenuRow
            icon="🔒"
            label="Política de Privacidade"
            onPress={() => setPolicyPage('privacy')}
            colors={colors}
          />
          <RowDivider color={colors.navBorder} />
          <MenuRow
            icon="📄"
            label="Termos de Uso"
            onPress={() => setPolicyPage('terms')}
            colors={colors}
          />
        </SectionGroup>

        {/* ── Zona de perigo ── */}
        <SectionGroup label="ZONA DE PERIGO" colors={colors}>
          <MenuRow
            icon="🗑️"
            label={deleting ? 'Excluindo conta...' : 'Excluir conta'}
            onPress={deleting ? undefined : handleDeleteAccount}
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
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <Text style={styles.signOutText}>Sair do aplicativo</Text>
        </TouchableOpacity>
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
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header ──
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'android' ? Spacing.lg : Spacing.md,
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
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: '#FFFFFF' },

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
  rowIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
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
  rowArrow: {
    fontSize: 20,
    fontWeight: '400',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 28 + Spacing.sm,
  },

  // ── Sign out button ──
  signOutBtn: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.sm,
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

  // ── Edit name modal ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
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
  modalTitle: {
    ...Typography.cardTitle,
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
