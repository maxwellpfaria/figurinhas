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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius, Typography, ColorsType } from '../theme';

// ── Static content ─────────────────────────────────────────────────────────────

const PRIVACY_CONTENT = `POLÍTICA DE PRIVACIDADE
Última atualização: 25 de maio de 2026

Esta Política de Privacidade foi elaborada em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014) e demais normas aplicáveis.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. IDENTIFICAÇÃO DO CONTROLADOR

Controlador: Meu Álbum Completo (aplicativo independente)
Encarregado de Dados (DPO): [canal de contato disponível na seção 13]

O controlador é responsável pelas decisões referentes ao tratamento dos seus dados pessoais.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. DADOS PESSOAIS COLETADOS

Coletamos somente os dados estritamente necessários para o funcionamento do aplicativo:

2.1 Dados fornecidos pelo usuário:
• Nome de exibição (apelido ou nome real, conforme sua escolha)
• Endereço de e-mail
• Senha (armazenada com hash seguro pelo Firebase Authentication — nunca em texto puro)

2.2 Dados gerados automaticamente pelo uso:
• Código de convite (gerado pelo sistema no cadastro)
• Quantidade de cada item registrado no álbum
• Identificadores dos amigos adicionados voluntariamente

2.3 Dados que NÃO coletamos:
• Dados de localização geográfica
• Dados financeiros ou de pagamento
• Dados biométricos
• Identificadores de dispositivo (IMEI, IDFA, GAID)
• Histórico de navegação externo ao aplicativo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. BASE LEGAL PARA O TRATAMENTO (LGPD, Art. 7º)

Cada operação de tratamento de dados é fundamentada em uma hipótese legal específica:

3.1 Execução de contrato (Art. 7º, V):
• Criar e manter sua conta de usuário ativa
• Sincronizar o álbum entre dispositivos
• Processar a adição e gestão de amigos

3.2 Legítimo interesse (Art. 7º, IX):
• Garantir a segurança e integridade do sistema
• Prevenir uso fraudulento ou abusivo do aplicativo
• Aprimorar a experiência de uso com base em métricas agregadas e anônimas

3.3 Consentimento (Art. 7º, I):
• Funcionalidades de compartilhamento do álbum com terceiros externos
• Recebimento de comunicações sobre novidades do aplicativo (quando aplicável)

Você pode revogar seu consentimento a qualquer momento sem prejuízo às demais hipóteses legais.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. FINALIDADE DO TRATAMENTO

Seus dados pessoais são tratados exclusivamente para:
• Autenticar seu acesso ao aplicativo com segurança
• Sincronizar e manter seu álbum entre dispositivos
• Exibir seu progresso de coleção para amigos que você adicionou
• Gerar sugestões de trocas entre usuários conectados
• Permitir compartilhamento externo de resumos do álbum (WhatsApp, etc.)
• Garantir a segurança e prevenir acessos não autorizados

Seus dados NÃO são utilizados para:
• Publicidade comportamental ou segmentada
• Venda ou cessão a terceiros com fins comerciais
• Criação de perfis para fins alheios ao aplicativo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. COMPARTILHAMENTO DE DADOS

Não vendemos, alugamos, cedemos ou compartilhamos seus dados pessoais com terceiros para fins comerciais ou publicitários.

Seu nome e progresso do álbum são visíveis SOMENTE para amigos que você mesmo adicionou no aplicativo, mediante uso do código de convite.

Compartilhamos dados apenas com os seguintes prestadores de serviço essenciais (operadores), nos limites do necessário:

• Google LLC – Firebase Authentication e Firestore:
  Plataforma de autenticação e banco de dados em nuvem.
  Política de privacidade: firebase.google.com/support/privacy

Esses prestadores são contratualmente obrigados a tratar os dados com segurança, em conformidade com a LGPD e o GDPR (Regulamento Europeu de Proteção de Dados).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. TRANSFERÊNCIA INTERNACIONAL DE DADOS

Os dados podem ser armazenados e processados em servidores localizados fora do Brasil, em infraestrutura do Google Cloud Platform (EUA e outras regiões).

O Google adota mecanismos adequados de proteção para transferências internacionais, incluindo:
• Cláusulas Contratuais Padrão (Standard Contractual Clauses – SCCs) aprovadas pela União Europeia
• Certificações de conformidade com frameworks de privacidade internacionais

Essas garantias satisfazem os requisitos do Art. 33 da LGPD para transferência internacional de dados pessoais.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. SEGURANÇA DOS DADOS

Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, perda, alteração ou destruição:

• Criptografia em trânsito: comunicações protegidas por TLS 1.2/1.3 (HTTPS)
• Criptografia em repouso: dados armazenados com criptografia AES-256 pelo Google Cloud
• Autenticação segura: senhas protegidas com hash criptográfico pelo Firebase Authentication
• Controle de acesso: cada usuário acessa apenas seus próprios dados e os de amigos explicitamente adicionados
• Regras de segurança Firestore: validação de acesso no nível do banco de dados

Em caso de incidente de segurança que possa afetar seus dados, notificaremos você e a ANPD (Autoridade Nacional de Proteção de Dados) nos prazos estabelecidos pela LGPD.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. RETENÇÃO E EXCLUSÃO DE DADOS

Seus dados são mantidos enquanto sua conta estiver ativa e pelo período necessário para cumprir as finalidades descritas nesta política.

Ao excluir sua conta (Perfil › Excluir conta):
• Seus dados pessoais são removidos permanentemente do banco de dados
• Sua conta de autenticação é encerrada
• Os dados de amigos que possuem referência ao seu perfil são anonimizados
• A exclusão é irreversível e ocorre imediatamente

Após a exclusão, não é possível recuperar seus dados ou álbum.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. SEUS DIREITOS COMO TITULAR (LGPD, Art. 18)

A LGPD garante a você os seguintes direitos, que podem ser exercidos a qualquer momento:

I.   Confirmação da existência de tratamento
II.  Acesso aos seus dados pessoais
III. Correção de dados incompletos, inexatos ou desatualizados
     → Disponível em: Perfil › Alterar nome
IV.  Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade
V.   Portabilidade dos dados a outro fornecedor de serviço (mediante requisição formal)
VI.  Eliminação dos dados tratados com base em consentimento
VII. Informação sobre entidades com as quais seus dados são compartilhados
VIII.Informação sobre a possibilidade de não fornecer consentimento e suas consequências
IX.  Revogação do consentimento
X.   Peticionar à ANPD (Autoridade Nacional de Proteção de Dados)
     → Site: www.gov.br/anpd

Para exercer qualquer desses direitos, utilize o canal de contato indicado na seção 13.

Responderemos no prazo máximo de 15 dias corridos, conforme o Art. 19 da LGPD.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. ARMAZENAMENTO LOCAL (AsyncStorage)

Utilizamos armazenamento local no dispositivo (AsyncStorage) exclusivamente para:
• Manter a sessão autenticada entre usos do aplicativo
• Melhorar a performance com cache temporário de dados do álbum

Não utilizamos cookies, rastreadores, pixels de monitoramento ou qualquer tecnologia de rastreamento comportamental.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. MENORES DE IDADE

O aplicativo não é direcionado a crianças menores de 13 anos. Não coletamos intencionalmente dados de crianças sem o consentimento expresso dos pais ou responsáveis legais.

Caso identifiquemos que dados de menores de 13 anos foram coletados sem autorização adequada, os dados serão removidos imediatamente, conforme o Art. 14 da LGPD.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

12. ALTERAÇÕES NESTA POLÍTICA

Esta política pode ser atualizada periodicamente para refletir mudanças no aplicativo, na legislação ou nas práticas de privacidade.

Em caso de mudanças relevantes que afetem seus direitos:
• Você será notificado por aviso destacado no aplicativo
• A data de "última atualização" no topo deste documento será atualizada
• O uso continuado do aplicativo após a notificação implica aceite das novas condições

Recomendamos revisar esta política periodicamente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

13. CONTATO E ENCARREGADO DE DADOS (DPO)

⚠ Canal de contato em configuração.

A LGPD (Art. 41, §1) exige a divulgação do meio de contato do Encarregado de Dados. Esta informação será disponibilizada nesta seção antes da publicação oficial do aplicativo.

Para peticionar à Autoridade Nacional de Proteção de Dados (ANPD):
www.gov.br/anpd`;

const TERMS_CONTENT = `TERMOS DE USO
Última atualização: 25 de maio de 2026

Bem-vindo ao Meu Álbum Completo. Ao utilizar nosso aplicativo, você concorda com estes Termos de Uso. Leia-os com atenção antes de criar sua conta.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SOBRE O APLICATIVO

O Meu Álbum Completo é um aplicativo independente para gerenciar coleções digitais de figurinhas. O aplicativo permite ao usuário registrar itens de sua coleção, comparar com amigos e identificar possíveis trocas.

Este aplicativo não possui vínculo, patrocínio, endosso ou qualquer relação com organizações esportivas, fabricantes de produtos colecionáveis, detentores de direitos sobre competições esportivas ou quaisquer outras entidades cujas marcas, imagens ou conteúdos possam estar associados ao universo de colecionáveis.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. ACEITAÇÃO DOS TERMOS

Ao criar uma conta ou utilizar o aplicativo, você declara:
• Ter capacidade legal para celebrar este contrato (ser maior de 13 anos, ou ter autorização expressa dos responsáveis legais)
• Ter lido, compreendido e concordado com estes Termos de Uso
• Ter lido e concordado com nossa Política de Privacidade

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. CADASTRO E CONTA

• Você é responsável por manter a confidencialidade de suas credenciais de acesso
• É proibida a criação de contas falsas, múltiplas contas ou contas em nome de terceiros sem autorização
• Você deve fornecer informações verdadeiras e mantê-las atualizadas
• Você é integralmente responsável por todas as atividades realizadas em sua conta

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. USO PERMITIDO

Você pode utilizar o aplicativo para:
• Registrar e acompanhar os itens da sua coleção pessoal de figurinhas
• Conectar-se com amigos para comparar coleções e identificar possíveis trocas
• Compartilhar informações sobre seu álbum por meios externos (WhatsApp, etc.)
• Utilizar o leitor de QR Code para identificar trocas presenciais

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. CONDUTA DO USUÁRIO

É expressamente proibido:
• Usar o aplicativo para fins ilegais ou que violem direitos de terceiros
• Tentar burlar, hackear ou comprometer a segurança do aplicativo ou de outros usuários
• Utilizar bots, scripts ou qualquer meio automatizado de acesso
• Realizar engenharia reversa do código-fonte do aplicativo
• Criar perfis falsos ou se passar por outra pessoa

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. PROPRIEDADE INTELECTUAL

O código-fonte, design, identidade visual, nome "Meu Álbum Completo" e demais elementos originais do aplicativo são propriedade exclusiva de seus desenvolvedores, protegidos pela legislação de direitos autorais (Lei nº 9.610/1998).

O aplicativo não reivindica direitos sobre marcas, logotipos, imagens ou nomes de terceiros. Quaisquer referências a produtos, organizações ou eventos têm caráter meramente descritivo e não implicam associação, patrocínio ou endosso por parte de seus titulares.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. DISPONIBILIDADE DO SERVIÇO

O aplicativo é fornecido "no estado em que se encontra" (as is), sem garantia de disponibilidade ininterrupta. Podemos, a nosso critério:
• Realizar manutenções programadas ou de emergência
• Atualizar, modificar ou remover funcionalidades
• Descontinuar o serviço mediante aviso prévio razoável

Não nos responsabilizamos por interrupções decorrentes de falhas de infraestrutura de terceiros (provedores de nuvem, serviços de autenticação, etc.).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. LIMITAÇÃO DE RESPONSABILIDADE

Na máxima extensão permitida pela legislação brasileira, não nos responsabilizamos por:
• Perda ou corrupção de dados decorrente de falhas técnicas ou de terceiros
• Danos indiretos, incidentais ou consequentes
• Perdas decorrentes do uso indevido do aplicativo por terceiros com suas credenciais

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. CANCELAMENTO E EXCLUSÃO DE CONTA

Você pode excluir sua conta a qualquer momento pelo menu Perfil › Excluir conta. A exclusão é irreversível e remove permanentemente todos os seus dados do nosso sistema. Também podemos suspender ou encerrar contas que violem estes termos, sem aviso prévio.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. MODIFICAÇÕES NOS TERMOS

Estes termos podem ser atualizados a qualquer momento. Notificaremos você por meio de aviso no aplicativo em caso de mudanças significativas. O uso continuado após a notificação implica aceite das novas condições.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. LEI APLICÁVEL E FORO

Estes termos são regidos pela legislação brasileira, em especial:
• Código de Defesa do Consumidor (Lei nº 8.078/1990)
• Marco Civil da Internet (Lei nº 12.965/2014)
• Lei Geral de Proteção de Dados – LGPD (Lei nº 13.709/2018)

Eventuais disputas serão submetidas ao foro da comarca do domicílio do usuário.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

12. CONTATO

⚠ Canal de contato em configuração.

Para dúvidas, sugestões ou reclamações sobre estes termos, utilize o canal de contato que será disponibilizado nesta seção antes da publicação oficial do aplicativo.`;

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    id: '1',
    q: 'Como adicionar uma figurinha?',
    a: 'Toque 1× no card da figurinha. Cada toque adiciona 1 cópia. O progresso é salvo automaticamente na nuvem.',
  },
  {
    id: '2',
    q: 'Como editar ou remover uma figurinha?',
    a: 'Pressione e segure o card por cerca de 0,4 segundos para abrir o editor de quantidade. Lá você define o número exato de cópias ou pode zerar.',
  },
  {
    id: '3',
    q: 'Como navegar entre as seleções?',
    a: 'Use as abas de grupo (FWC, A–L, CC) para saltar direto ao grupo. Dentro do grupo, toque na aba da seleção ou deslize horizontalmente. O swipe também avança entre grupos automaticamente.',
  },
  {
    id: '4',
    q: 'O que são figurinhas especiais?',
    a: 'São as 20 figurinhas holográficas da seção FWC e os 48 escudos (figurinha nº 1 de cada seleção). Total: 68 figurinhas especiais no álbum.',
  },
  {
    id: '5',
    q: 'Como funciona a contagem de repetidas?',
    a: 'Conta o total de cópias extras. Exemplo: 3 cópias da mesma figurinha = 2 repetidas. Figurinhas com muitas cópias são somadas corretamente.',
  },
  {
    id: '6',
    q: 'Como adicionar amigos?',
    a: 'Na aba Amigos, informe o código de convite do seu amigo. O seu próprio código está aqui na tela de Perfil, abaixo do seu nome.',
  },
  {
    id: '7',
    q: 'O álbum é salvo automaticamente?',
    a: 'Sim. As alterações são sincronizadas com a nuvem automaticamente alguns segundos após cada mudança. Um indicador aparece no cabeçalho enquanto o salvamento ocorre.',
  },
  {
    id: '8',
    q: 'Como funciona a troca via QR Code?',
    a: 'Na aba Troca, gere o seu QR Code e peça ao amigo para escanear com o app. O aplicativo calcula automaticamente quais figurinhas vocês podem trocar entre si.',
  },
];

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

        {/* ── Perguntas frequentes ── */}
        <SectionGroup label="PERGUNTAS FREQUENTES" colors={colors}>
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={item.id}
              q={item.q}
              a={item.a}
              isLast={i === FAQ_ITEMS.length - 1}
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
