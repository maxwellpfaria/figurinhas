import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius, Typography } from '../theme';
import AppLogo from '../components/AppLogo';

type Mode = 'login' | 'register' | 'reset';

export default function AuthScreen() {
  const { signIn, signUp, resetPassword, authError, clearError } = useAuth();
  const { colors, isDark } = useTheme();

  const [mode, setMode] = useState<Mode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const switchMode = (m: Mode) => {
    clearError();
    setResetSent(false);
    setMode(m);
  };

  const handleSubmit = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else if (mode === 'register') {
        if (!displayName.trim()) {
          setLoading(false);
          return;
        }
        await signUp(email.trim(), password, displayName.trim());
      } else {
        await resetPassword(email.trim());
        setResetSent(true);
      }
    } catch {
      // error already set in context
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, displayName, loading, signIn, signUp, resetPassword]);

  const inputStyle = {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.navBorder,
    color: colors.textPrimary,
  };

  const labelStyle = { color: colors.textMuted };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / branding */}
        <View style={styles.logoArea}>
          <AppLogo size={110} />
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Meu Álbum</Text>
          <Text style={[styles.appTagline, { color: colors.textMuted }]}>
            Seu álbum inteligente da Copa
          </Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: '#000' }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Recuperar senha'}
          </Text>

          {/* Error banner */}
          {authError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          {/* Reset sent confirmation */}
          {resetSent ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>
                ✓ E-mail de recuperação enviado! Verifique sua caixa de entrada.
              </Text>
            </View>
          ) : null}

          {/* Display name (register only) */}
          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={[styles.label, labelStyle]}>Nome</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="Seu nome"
                placeholderTextColor={colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          {/* E-mail */}
          <View style={styles.field}>
            <Text style={[styles.label, labelStyle]}>E-mail</Text>
            <TextInput
              style={[styles.input, inputStyle]}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType={mode === 'reset' ? 'send' : 'next'}
              onSubmitEditing={mode === 'reset' ? handleSubmit : undefined}
            />
          </View>

          {/* Password (not shown in reset mode) */}
          {mode !== 'reset' && (
            <View style={styles.field}>
              <Text style={[styles.label, labelStyle]}>Senha</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={isDark ? '#0F172A' : '#FFFFFF'} />
            ) : (
              <Text style={[styles.submitText, { color: isDark ? '#0F172A' : '#FFFFFF' }]}>
                {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Enviar e-mail'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Links */}
          <View style={styles.links}>
            {mode === 'login' && (
              <>
                <TouchableOpacity onPress={() => switchMode('reset')}>
                  <Text style={[styles.link, { color: colors.primary }]}>Esqueci minha senha</Text>
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: colors.navBorder }]} />
                <TouchableOpacity onPress={() => switchMode('register')}>
                  <Text style={[styles.link, { color: colors.textSecondary }]}>
                    Não tenho conta —{' '}
                    <Text style={{ color: colors.primary }}>Criar agora</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {mode === 'register' && (
              <TouchableOpacity onPress={() => switchMode('login')}>
                <Text style={[styles.link, { color: colors.textSecondary }]}>
                  Já tenho conta —{' '}
                  <Text style={{ color: colors.primary }}>Entrar</Text>
                </Text>
              </TouchableOpacity>
            )}
            {mode === 'reset' && (
              <TouchableOpacity onPress={() => switchMode('login')}>
                <Text style={[styles.link, { color: colors.primary }]}>← Voltar ao login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },

  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appName: {
    ...Typography.appName,
  },
  appTagline: {
    ...Typography.appTagline,
    marginTop: 4,
  },

  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    ...Typography.screenTitle,
    marginBottom: Spacing.md,
  },

  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  successText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
  },

  field: { marginBottom: Spacing.sm + 4 },
  label: {
    ...Typography.inputLabel,
    marginBottom: 6,
  },
  input: {
    ...Typography.inputText,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },

  submitBtn: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 6,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitText: {
    ...Typography.buttonPrimary,
  },

  links: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  link: {
    ...Typography.link,
    textAlign: 'center',
  },
  divider: {
    width: '80%',
    height: 1,
  },
});
