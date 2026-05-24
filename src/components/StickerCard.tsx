import React, { memo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sticker, getStickerState } from '../types';
import { Radius } from '../theme';
import { ColorsType } from '../theme';

// ─── grid geometry (computed once) ───────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;
export const NUM_COLUMNS = 4;
const H_PADDING = 12;
const CARD_GAP = 5;

export const CARD_WIDTH =
  (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP * 2 * NUM_COLUMNS) / NUM_COLUMNS;
export const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.35); // 3:4 proportion
export const ROW_HEIGHT = CARD_HEIGHT + CARD_GAP * 2;

// Gold gradient colors for legendary owned cards
const LEGEND_GRADIENT_LIGHT: [string, string, string, string, string] = [
  '#FEF3C7', '#FCD34D', '#FFFBEB', '#FCD34D', '#FEF3C7',
];
const LEGEND_GRADIENT_DARK: [string, string, string, string, string] = [
  '#451A03', '#92400E', '#D97706', '#92400E', '#451A03',
];

interface Props {
  sticker: Sticker;
  isDark: boolean;
  colors: ColorsType;
  onPress: (id: string) => void;
  onLongPress: (sticker: Sticker) => void;
}

function areEqual(prev: Props, next: Props) {
  return (
    prev.sticker.quantity === next.sticker.quantity &&
    prev.sticker.id === next.sticker.id &&
    prev.isDark === next.isDark &&
    prev.onPress === next.onPress &&
    prev.onLongPress === next.onLongPress
  );
}

const StickerCard = memo(({ sticker, isDark, colors, onPress, onLongPress }: Props) => {
  const { id, code, quantity, isSpecial } = sticker;
  const state = getStickerState(quantity);
  const isOwned = state !== 'missing';
  const isRepeated = state === 'repeated';
  const isSpecialOwned = !!isSpecial && isOwned;

  const handlePress = useCallback(() => onPress(id), [onPress, id]);
  const handleLongPress = useCallback(() => onLongPress(sticker), [onLongPress, sticker]);

  // Shimmer sweep animation for legendary owned cards
  const shimmerX = useRef(new Animated.Value(-CARD_WIDTH)).current;
  useEffect(() => {
    if (!isSpecialOwned) return;
    shimmerX.setValue(-CARD_WIDTH);
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: CARD_WIDTH * 1.5,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(shimmerX, {
          toValue: -CARD_WIDTH,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [isSpecialOwned]);

  const prefix = code.split(' ')[0];
  const num = sticker.number;

  // ── Legendary owned card ──────────────────────────────────────────────────
  if (isSpecialOwned) {
    const gradColors = isDark ? LEGEND_GRADIENT_DARK : LEGEND_GRADIENT_LIGHT;
    const textColor = isDark ? '#FEF3C7' : '#78350F';

    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        activeOpacity={0.8}
        style={styles.cardWrapper}
      >
        <LinearGradient
          colors={gradColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.cardSpecial]}
        >
          {/* Shimmer sweep */}
          <Animated.View
            pointerEvents="none"
            style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
          />

          {/* Repeated badge */}
          {isRepeated && (
            <View style={[styles.badge, { backgroundColor: colors.badge }]}>
              <Text style={[styles.badgeText, { color: colors.badgeText }]}>
                +{quantity - 1}
              </Text>
            </View>
          )}

          {/* LENDÁRIA tag */}
          <View style={styles.legendTag}>
            <Text style={[styles.legendTagText, { color: textColor }]}>★</Text>
          </View>

          <Text style={[styles.prefix, { color: textColor, opacity: 0.7 }]}>{prefix}</Text>
          <Text style={[styles.number, { color: textColor }]}>{num}</Text>
          <Text style={[styles.statusLabel, { color: textColor, opacity: 0.8 }]}>
            LENDÁRIA
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // ── Legendary missing card ────────────────────────────────────────────────
  if (isSpecial && !isOwned) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        activeOpacity={0.6}
        style={styles.cardWrapper}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.specialMissingBg,
              borderColor: colors.specialMissingBorder,
              borderWidth: 1.5,
              borderStyle: 'dashed',
            },
          ]}
        >
          <Text style={[styles.prefix, { color: colors.specialMissingText, opacity: 0.6 }]}>
            {prefix}
          </Text>
          <Text style={[styles.number, { color: colors.specialMissingText, opacity: 0.5 }]}>
            {num}
          </Text>
          <Text style={[styles.statusLabel, { color: colors.specialMissingText, opacity: 0.6 }]}>
            ★ falta
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Regular owned card ────────────────────────────────────────────────────
  if (isOwned) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        activeOpacity={0.75}
        style={styles.cardWrapper}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.ownedBg,
              borderColor: colors.ownedBorder,
              borderWidth: 1.5,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 3,
            },
          ]}
        >
          {isRepeated && (
            <View style={[styles.badge, { backgroundColor: colors.badge }]}>
              <Text style={[styles.badgeText, { color: colors.badgeText }]}>
                +{quantity - 1}
              </Text>
            </View>
          )}
          <Text style={[styles.prefix, { color: colors.ownedText, opacity: 0.65 }]}>
            {prefix}
          </Text>
          <Text style={[styles.number, { color: colors.ownedText }]}>{num}</Text>
          <Text style={[styles.statusLabel, { color: colors.ownedText, opacity: 0.7 }]}>
            ✓ tenho
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Regular missing card ──────────────────────────────────────────────────
  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
      activeOpacity={0.5}
      style={styles.cardWrapper}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.missing,
            borderColor: colors.missingBorder,
            borderWidth: 1.5,
            borderStyle: 'dashed',
          },
        ]}
      >
        <Text style={[styles.prefix, { color: colors.missingText, opacity: 0.5 }]}>
          {prefix}
        </Text>
        <Text style={[styles.number, { color: colors.missingText }]}>{num}</Text>
        <Text style={[styles.statusLabel, { color: colors.missingText, opacity: 0.6 }]}>
          falta
        </Text>
      </View>
    </TouchableOpacity>
  );
}, areEqual);

StickerCard.displayName = 'StickerCard';
export default StickerCard;

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: CARD_GAP,
  },
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: 6,
  },
  cardSpecial: {
    borderWidth: 1.5,
    borderColor: 'rgba(251,191,36,0.6)',
  },

  prefix: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  number: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 3,
    textTransform: 'lowercase',
  },

  legendTag: {
    position: 'absolute',
    top: 4,
    left: 5,
  },
  legendTagText: {
    fontSize: 9,
    fontWeight: '900',
  },

  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 18,
    height: 18,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },

  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 22,
    backgroundColor: 'rgba(255,255,255,0.38)',
    zIndex: 2,
  },
});
