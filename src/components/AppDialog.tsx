import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Spacing, Radius, Typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DialogButton {
  label: string;
  onPress?: () => void;
  /** @default 'primary' */
  style?: 'primary' | 'secondary' | 'danger';
}

export interface AppDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Defaults to a single "OK" button that dismisses the dialog. */
  buttons?: DialogButton[];
  /** Called when the backdrop is tapped (also closes the dialog). */
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ANIM_DURATION = 180;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppDialog({
  visible,
  title,
  message,
  buttons,
  onClose,
}: AppDialogProps) {
  const { colors, isDark } = useTheme();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Animate in when visible becomes true
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 90,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset for next time
      backdropOpacity.setValue(0);
      cardScale.setValue(0.88);
      cardOpacity.setValue(0);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.88,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [onClose, backdropOpacity, cardOpacity, cardScale]);

  const resolvedButtons: DialogButton[] = buttons?.length
    ? buttons
    : [{ label: 'OK', style: 'primary' }];

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
      <View style={styles.fullScreen}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: colors.overlay, opacity: backdropOpacity },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Card */}
      <View style={styles.centeredWrapper} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.navBorder,
              transform: [{ scale: cardScale }],
              opacity: cardOpacity,
            },
          ]}
        >
          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>

          {/* Message */}
          {!!message && (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.navBorder }]} />

          {/* Buttons */}
          <View
            style={[
              styles.buttonsRow,
              resolvedButtons.length === 1 && styles.buttonsRowSingle,
            ]}
          >
            {resolvedButtons.map((btn, idx) => {
              const isPrimary = btn.style === 'primary' || !btn.style;
              const isDanger = btn.style === 'danger';
              const isSecondary = btn.style === 'secondary';

              const handlePress = () => {
                btn.onPress?.();
                handleClose();
              };

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.button,
                    resolvedButtons.length > 1 && styles.buttonFlex,
                    isPrimary && {
                      backgroundColor: colors.primary,
                    },
                    isDanger && styles.buttonDanger,
                    isSecondary && {
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.navBorder,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={handlePress}
                  activeOpacity={0.78}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isPrimary && {
                        color: isDark ? '#0F172A' : '#FFFFFF',
                      },
                      isDanger && { color: '#FFFFFF' },
                      isSecondary && { color: colors.textSecondary },
                    ]}
                  >
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centeredWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  title: {
    ...Typography.cardTitle,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  buttonsRowSingle: {
    justifyContent: 'center',
  },
  buttonFlex: {
    flex: 1,
  },
  button: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    minWidth: 88,
  },
  buttonDanger: {
    backgroundColor: '#F43F5E',
  },
  buttonText: {
    ...Typography.buttonSecondary,
  },
});
