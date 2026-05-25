import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ColorsType, Spacing, Radius } from '../theme';
import { TradeMatch, StickerInfo } from '../utils/tradeQR';

interface Props {
  visible: boolean;
  match: TradeMatch | null;
  colors: ColorsType;
  onClose: () => void;
}

function StickerChip({ sticker, colors }: { sticker: StickerInfo; colors: ColorsType }) {
  const bg = sticker.isSpecial ? colors.goldLight : colors.surface;
  const border = sticker.isSpecial ? colors.gold : colors.navBorder;
  const textColor = sticker.isSpecial ? colors.gold : colors.textPrimary;

  return (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: border }]}>
      <Text style={styles.chipFlag}>{sticker.sectionFlag}</Text>
      <Text style={[styles.chipCode, { color: textColor }]}>{sticker.code}</Text>
    </View>
  );
}

function StickerSection({
  title,
  stickers,
  accentColor,
  emptyText,
  colors,
}: {
  title: string;
  stickers: StickerInfo[];
  accentColor: string;
  emptyText: string;
  colors: ColorsType;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionAccent, { backgroundColor: accentColor }]} />
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        <View style={[styles.countBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.countText}>{stickers.length}</Text>
        </View>
      </View>

      {stickers.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{emptyText}</Text>
      ) : (
        <View style={styles.chips}>
          {stickers.map(s => (
            <StickerChip key={s.id} sticker={s} colors={colors} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function TradeMatchModal({ visible, match, colors, onClose }: Props) {
  if (!match) return null;

  const hasAnyMatch = match.theyGiveMe.length > 0 || match.iGiveThem.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.handle }]} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Troca com {match.friendName}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {hasAnyMatch
                  ? 'Figurinhas que combinam entre vocês'
                  : 'Nenhuma figurinha combinou desta vez'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {!hasAnyMatch ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🤷</Text>
              <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>
                Nenhuma troca possível
              </Text>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {match.friendName} não tem repetidas que você precisa,{'\n'}
                e você não tem repetidas que ele(a) precisa.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <StickerSection
                title={`${match.friendName} te dá`}
                stickers={match.theyGiveMe}
                accentColor="#10B981"
                emptyText={`${match.friendName} não tem repetidas que você precisa.`}
                colors={colors}
              />
              <View style={[styles.divider, { backgroundColor: colors.navBorder }]} />
              <StickerSection
                title="Você dá"
                stickers={match.iGiveThem}
                accentColor="#3B82F6"
                emptyText={`Você não tem repetidas que ${match.friendName} precisa.`}
                colors={colors}
              />
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: Radius.full,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 4,
  },
  chipFlag: {
    fontSize: 14,
  },
  chipCode: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingLeft: 12,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  doneBtn: {
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
