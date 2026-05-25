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
  ActivityIndicator,
  StyleSheet,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius, Typography, ColorsType } from '../theme';

// ── Static content ─────────────────────────────────────────────────────────────

const PRIVACY_CONTENT = `POLÍTICA DE PRIVACIDADE
Última atualização: maio de 2026

1. CONTROLADOR DE DADOS

O Meu Álbum Completo é desenvolvido e operado de forma independente. Para dúvidas ou solicitações relacionadas a esta política, entre em contato pelo e-mail: contato@meualbumdacopa.com.br

2. QUAIS DADOS COLETAMOS

• Dados de identificação: nome e endereço de e-mail fornecidos no cadastro
• Dados de uso: quantidade de cada figurinha registrada no aplicativo
• Dados de relacionamento: identificadores dos usuários adicionados como amigos
• Código de convite: gerado automaticamente para conectar usuários

3. BASE LEGAL (LGPD – Art. 7º da Lei 13.709/2018)

O tratamento dos seus dados é realizado com base nas seguintes hipóteses legais:
• Execução de contrato (Art. 7º, V): para manter sua conta ativa e sincronizar seu álbum
• Legítimo interesse (Art. 7º, IX): para melhorar a experiência de uso e prevenir fraudes
• Consentimento (Art. 7º, I): para funcionalidades opcionais de compartilhamento

4. FINALIDADE DO TRATAMENTO

Seus dados são utilizados exclusivamente para:
• Autenticação e manutenção da sua conta
• Sincronização do álbum entre dispositivos
• Exibição do seu progresso e comparação com amigos adicionados
• Geração de sugestões de trocas de figurinhas

5. COMPARTILHAMENTO DE DADOS

Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais ou publicitários. Seu nome e progresso ficam visíveis somente para amigos que você mesmo adicionou. Compartilhamos dados apenas com:

• Firebase (Google LLC): plataforma de autenticação e armazenamento de dados

Para mais informações, consulte a Política de Privacidade do Firebase em firebase.google.com/support/privacy.

6. ARMAZENAMENTO E SEGURANÇA

Todos os dados são armazenados no Firebase (Google Cloud Platform), com:
• Criptografia em trânsito (TLS/HTTPS)
• Criptografia em repouso
• Controles de acesso por autenticação Firebase

7. TRANSFERÊNCIA INTERNACIONAL DE DADOS

Os dados podem ser armazenados em servidores localizados fora do Brasil, conforme a infraestrutura do Google Cloud. O Google adota mecanismos adequados de proteção, como cláusulas contratuais padrão (SCCs).

8. RETENÇÃO DE DADOS

Seus dados são mantidos enquanto sua conta estiver ativa. Ao excluir sua conta, todos os dados pessoais são removidos permanentemente de nossos sistemas.

9. SEUS DIREITOS (LGPD – Art. 18)

Como titular dos dados, você tem direito a:
• Confirmar a existência do tratamento
• Acessar seus dados pessoais
• Corrigir dados incompletos, inexatos ou desatualizados (Perfil › Alterar nome)
• Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários
• Portabilidade dos dados a outro fornecedor de serviço
• Eliminar dados tratados com base em consentimento
• Obter informações sobre compartilhamento com terceiros
• Revogar o consentimento a qualquer momento
• Excluir sua conta e todos os dados (Perfil › Excluir conta)

Para exercer qualquer um desses direitos, entre em contato: contato@meualbumdacopa.com.br

10. ARMAZENAMENTO LOCAL

Utilizamos armazenamento local (AsyncStorage) apenas para manter a sessão ativa e melhorar a performance do aplicativo, sem fins de rastreamento ou publicidade.

11. MENORES DE IDADE

O aplicativo não é direcionado a menores de 13 anos. Não coletamos intencionalmente dados de crianças. Caso identifiquemos tal situação, os dados serão removidos imediatamente.

12. ALTERAÇÕES NESTA POLÍTICA

Esta política pode ser atualizada a qualquer momento. Em caso de mudanças relevantes, você será notificado por meio de aviso no aplicativo. O uso continuado após a notificação implica aceite das novas condições.

13. CONTATO E ENCARREGADO DE DADOS (DPO)

Para exercer seus direitos, esclarecer dúvidas ou realizar solicitações relacionadas à proteção de dados:

contato@meualbumdacopa.com.br`;

const TERMS_CONTENT = `TERMOS DE USO
Última atualização: maio de 2026

Bem-vindo ao Meu Álbum Completo. Ao utilizar nosso aplicativo, você concorda com estes Termos de Uso. Leia-os com atenção antes de criar sua conta.

1. SOBRE O APLICATIVO

O Meu Álbum Completo é um aplicativo independente para gerenciar coleções de figurinhas da Copa do Mundo FIFA 2026. Este aplicativo não possui vínculo, patrocínio, endosso ou qualquer relação oficial com a FIFA, Panini Group ou qualquer organização relacionada ao torneio ou às figurinhas.

2. ACEITAÇÃO DOS TERMOS

Ao criar uma conta ou utilizar o aplicativo, você declara:
• Ter capacidade legal para celebrar este contrato (ser maior de 13 anos, ou ter autorização expressa dos responsáveis legais)
• Ter lido, compreendido e concordado com estes Termos de Uso
• Ter lido e concordado com nossa Política de Privacidade

3. CADASTRO E CONTA

• Você é responsável por manter a confidencialidade de suas credenciais de acesso
• É proibida a criação de contas falsas, múltiplas contas ou contas em nome de terceiros sem autorização
• Você deve fornecer informações verdadeiras e mantê-las atualizadas
• Você é integralmente responsável por todas as atividades realizadas em sua conta

4. USO PERMITIDO

Você pode utilizar o aplicativo para:
• Registrar e acompanhar suas figurinhas pessoais da Copa do Mundo FIFA 2026
• Conectar-se com amigos para comparar coleções e identificar possíveis trocas
• Compartilhar informações sobre seu álbum por meios externos (WhatsApp, etc.)
• Utilizar o leitor de QR Code para identificar trocas presenciais

5. CONDUTA DO USUÁRIO

É expressamente proibido:
• Usar o aplicativo para fins ilegais ou que violem direitos de terceiros
• Tentar burlar, hackear ou comprometer a segurança do aplicativo ou de outros usuários
• Utilizar bots, scripts ou qualquer meio automatizado de acesso
• Realizar engenharia reversa do código-fonte do aplicativo
• Criar perfis falsos ou se passar por outra pessoa

6. PROPRIEDADE INTELECTUAL

O código-fonte, design, identidade visual e demais elementos do Meu Álbum Completo são propriedade exclusiva de seus desenvolvedores, protegidos pela legislação de direitos autorais (Lei 9.610/98). As marcas FIFA®, Copa do Mundo® e Panini® pertencem aos seus respectivos titulares, sem qualquer relação com este aplicativo.

7. DISPONIBILIDADE DO SERVIÇO

O aplicativo é fornecido "no estado em que se encontra" (as is), sem garantia de disponibilidade ininterrupta. Podemos, a nosso critério:
• Realizar manutenções programadas ou de emergência
• Atualizar, modificar ou remover funcionalidades
• Descontinuar o serviço mediante aviso prévio razoável

Não nos responsabilizamos por interrupções decorrentes de falhas de infraestrutura de terceiros, como o Firebase (Google).

8. LIMITAÇÃO DE RESPONSABILIDADE

Na máxima extensão permitida pela legislação brasileira, não nos responsabilizamos por:
• Perda ou corrupção de dados decorrente de falhas técnicas ou de terceiros
• Danos indiretos, incidentais ou consequentes
• Perdas decorrentes do uso indevido do aplicativo por terceiros com suas credenciais

9. CANCELAMENTO E EXCLUSÃO DE CONTA

Você pode excluir sua conta a qualquer momento pelo menu Perfil › Excluir conta. A exclusão é irreversível e remove permanentemente todos os seus dados do nosso sistema. Também podemos suspender ou encerrar contas que violem estes termos, sem aviso prévio.

10. MODIFICAÇÕES NOS TERMOS

Estes termos podem ser atualizados a qualquer momento. Notificaremos você por meio de aviso no aplicativo em caso de mudanças significativas. O uso continuado após a notificação implica aceite das novas condições.

11. LEI APLICÁVEL E FORO

Estes termos são regidos pela legislação brasileira, em especial:
• Código de Defesa do Consumidor (Lei 8.078/90)
• Marco Civil da Internet (Lei 12.965/14)
• Lei Geral de Proteção de Dados – LGPD (Lei 13.709/18)

Eventuais disputas serão submetidas ao foro da comarca do domicílio do usuário.

12. CONTATO

Para dúvidas, sugestões ou reclamações sobre estes termos:

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
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
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
  const confirmBg = danger ? '#F43F5E' : colors.primary;
  const confirmText = '#FFFFFF';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
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

  const [policyPage, setPolicyPage] = useState<PolicyPage | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

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
          setShowDeleteModal(true); // won't show error, handled below
        }, 300);
      }
    }
  }, [deleteAccount]);

  const handleConfirmSignOut = useCallback(async () => {
    setShowSignOutModal(false);
    await signOut();
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
