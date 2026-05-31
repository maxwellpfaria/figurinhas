import React, { memo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Sticker } from '../types';
import { Spacing, Radius, Typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';

const SHEET_HEIGHT = 300;
const ANIM_DURATION = 220;

interface Props {
  sticker: Sticker | null;
  onClose: () => void;
  onQuantityChange: (id: string, qty: number) => void;
}

const BottomSheetEditor = memo(({ sticker, onClose, onQuantityChange }: Props) => {
  const { colors, isDark } = useTheme();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sticker) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 75,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sticker?.id]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      translateY.setValue(SHEET_HEIGHT);
      onClose();
    });
  }, [onClose, translateY, backdropOpacity]);

  if (!sticker) return null;

  const qty = sticker.quantity;
  const isSpecial = !!sticker.isSpecial;
  const statusLabel =
    qty === 0
      ? 'Faltando'
      : qty === 1
      ? isSpecial ? '★ Na coleção' : 'Na coleção'
      : `${qty - 1} repetida${qty - 1 > 1 ? 's' : ''}`;

  const decreaseDisabled = qty <= 0;
  const ctrlBtnActive = {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  };
  const ctrlBtnDisabled = {
    backgroundColor: colors.surfaceAlt,
    shadowOpacity: 0,
    elevation: 0,
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { backgroundColor: colors.overlay, opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            transform: [{ translateY }],
            shadowColor: '#000',
          },
          Platform.OS === 'android' && styles.sheetAndroid,
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.handle }]} />

        <View style={styles.identity}>
          <View>
            <Text style={[styles.stickerCode, { color: colors.textPrimary }]}>
              {sticker.code}
            </Text>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              {statusLabel}
            </Text>
          </View>
          {isSpecial && (
            <View style={[styles.specialBadge, { backgroundColor: isDark ? '#1C1205' : '#FEF3C7', borderColor: isDark ? '#78350F' : '#FDE68A' }]}>
              <Text style={[styles.specialBadgeText, { color: colors.gold }]}>★ LENDÁRIA</Text>
            </View>
          )}
        </View>

        {/* ± controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.ctrlBtn, decreaseDisabled ? ctrlBtnDisabled : ctrlBtnActive]}
            onPress={() => onQuantityChange(sticker.id, qty - 1)}
            disabled={decreaseDisabled}
            activeOpacity={0.7}
          >
            <Text style={[styles.ctrlBtnText, { color: decreaseDisabled ? colors.textMuted : '#FFFFFF' }]}>−</Text>
          </TouchableOpacity>

          <View style={styles.qtyDisplay}>
            <Text style={[styles.qtyNumber, { color: colors.textPrimary }]}>{qty}</Text>
          </View>

          <TouchableOpacity
            style={[styles.ctrlBtn, ctrlBtnActive]}
            onPress={() => onQuantityChange(sticker.id, qty + 1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.ctrlBtnText, { color: '#FFFFFF' }]}>+</Text>
          </TouchableOpacity>
        </View>

        {qty > 0 && (
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => {
              onQuantityChange(sticker.id, 0);
              handleClose();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.removeBtnText}>Remover da Coleção</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: colors.primary }]}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={[styles.doneBtnText, { color: isDark ? '#0F172A' : '#FFFFFF' }]}>Pronto</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
});

BottomSheetEditor.displayName = 'BottomSheetEditor';
export default BottomSheetEditor;

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  sheetAndroid: {
    elevation: 24,
  },

  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },

  identity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stickerCode: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusLabel: {
    ...Typography.body,
    marginTop: 2,
  },
  specialBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  specialBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  ctrlBtn: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnText: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 36,
    marginTop: -2,
  },

  qtyDisplay: {
    width: 72,
    alignItems: 'center',
  },
  qtyNumber: {
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 44,
  },

  removeBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  removeBtnText: {
    fontSize: 13,
    color: '#F43F5E',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  doneBtn: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
  },
  doneBtnText: {
    ...Typography.buttonPrimary,
  },
});
