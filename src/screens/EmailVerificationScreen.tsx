import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius, Typography } from '../theme';
import AppLogo from '../components/AppLogo';

export default function EmailVerificationScreen() {
  const { user, signOut, resendVerificationEmail, verifyEmailToken, authError, clearError } = useAuth();
  const { colors, isDark } = useTheme();

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (verifying || code.length !== 6) return;
    clearError();
    setVerifying(true);
    try {
      await verifyEmailToken(code.trim());
      // AppGate detecta emailVerified=true e redireciona para MainTabs
    } catch {
      // erro já está em authError via context
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;
    clearError();
    setResendSent(false);
    setResending(true);
    try {
      await resendVerificationEmail();
      setResendSent(true);
      setCode('');
    } catch {
      // erro já está em authError
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <AppLogo size={80} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Verifique seu e-mail
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Enviamos um código de 6 dígitos para:
        </Text>
        <Text style={[styles.email, { color: colors.primary }]}>{user?.email}</Text>

        {authError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        {resendSent ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Novo código enviado!</Text>
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={[styles.codeBox, { borderColor: code.length > 0 ? colors.primary : colors.navBorder, backgroundColor: colors.surfaceAlt }]}
        >
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={v => setCode(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
            style={[styles.codeInput, { color: colors.textPrimary }]}
            placeholder="000000"
            placeholderTextColor={colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { backgroundColor: code.length === 6 ? colors.primary : colors.navBorder },
          ]}
          onPress={handleVerify}
          disabled={verifying || code.length !== 6}
          activeOpacity={0.8}
        >
          {verifying ? (
            <ActivityIndicator color={isDark ? '#0F172A' : '#fff'} />
          ) : (
            <Text style={[styles.primaryBtnText, { color: isDark ? '#0F172A' : '#fff' }]}>
              Verificar
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.navBorder }]}
          onPress={handleResend}
          disabled={resending}
          activeOpacity={0.8}
        >
          {resending ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
              Reenviar código
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={signOut} style={styles.logoutLink}>
          <Text style={[styles.logoutText, { color: colors.textMuted }]}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    ...Typography.screenTitle,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    width: '100%',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    width: '100%',
  },
  successText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  codeBox: {
    borderWidth: 2,
    borderRadius: Radius.lg,
    width: '100%',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  codeInput: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 12,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  primaryBtn: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 6,
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnText: {
    ...Typography.buttonPrimary,
  },
  secondaryBtn: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 6,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
  },
  secondaryBtnText: {
    ...Typography.buttonPrimary,
  },
  logoutLink: {
    marginTop: Spacing.xs,
  },
  logoutText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
