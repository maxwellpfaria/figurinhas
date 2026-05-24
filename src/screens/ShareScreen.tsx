import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme';

export default function ShareScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Text style={styles.icon}>🔗</Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Compartilhar</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Em breve — exporte sua lista de figurinhas{'\n'}repetidas para WhatsApp ou Instagram.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  icon: { fontSize: 52, marginBottom: Spacing.md },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
