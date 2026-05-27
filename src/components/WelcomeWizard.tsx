/**
 * WelcomeWizard
 *
 * First-time onboarding overlay for the Album screen.
 * Shown once via AsyncStorage; never shown again after dismissal.
 *
 * Three steps:
 *   1. Buscar seleção  — index with search bar
 *   2. Adicionar       — tap a grey card to mark as owned
 *   3. Editar/Remover  — tap an owned card to open the BottomSheetEditor
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { ColorsType, Radius, Spacing } from '../theme';

const { width: SW } = Dimensions.get('window');
const CARD_W = Math.min(SW - 48, 360);

// ── Step definitions ──────────────────────────────────────────────────────────

interface Step {
  accentColor: string;
  title: string;
  description: string;
  Demo: React.FC<{ accent: string; colors: ColorsType }>;
}

// ── Demo visuals ──────────────────────────────────────────────────────────────

/** Step 1 — search bar + two team rows */
function SearchDemo({ accent, colors }: { accent: string; colors: ColorsType }) {
  return (
    <View style={demo.searchRoot}>
      {/* Fake search bar */}
      <View style={[demo.searchBar, { backgroundColor: colors.surfaceAlt, borderColor: colors.navBorder }]}>
        <Text style={demo.searchIcon}>🔍</Text>
        <Text style={[demo.searchPlaceholder, { color: colors.textMuted }]}>
          Buscar seleção...
        </Text>
      </View>

      {/* Fake team rows */}
      {[
        { flag: '🇧🇷', name: 'Brasil',    pct: 0.6 },
        { flag: '🇦🇷', name: 'Argentina', pct: 0.35 },
        { flag: '🇵🇹', name: 'Portugal',  pct: 0.05 },
      ].map(row => (
        <View key={row.name} style={[demo.teamRow, { borderBottomColor: colors.navBorder }]}>
          <Text style={demo.teamFlag}>{row.flag}</Text>
          <View style={demo.teamInfo}>
            <View style={demo.teamNameRow}>
              <Text style={[demo.teamName, { color: colors.textPrimary }]}>{row.name}</Text>
              <Text style={[demo.teamCount, { color: colors.textMuted }]}>
                {Math.round(row.pct * 20)}/20
              </Text>
            </View>
            <View style={[demo.progressTrack, { backgroundColor: colors.navBorder }]}>
              <View style={[demo.progressFill, { backgroundColor: accent, width: `${row.pct * 100}%` as any }]} />
            </View>
          </View>
          <Text style={[demo.chevron, { color: colors.textMuted }]}>›</Text>
        </View>
      ))}
    </View>
  );
}

/** Step 2 — grey card → tap → green card */
function AddDemo({ accent, colors }: { accent: string; colors: ColorsType }) {
  return (
    <View style={demo.addRoot}>
      {/* Grey / missing card */}
      <View style={demo.cardGroup}>
        <View style={[demo.stickerCard, { backgroundColor: colors.missing, borderColor: colors.missingBorder, borderStyle: 'dashed' }]}>
          <Text style={[demo.stickerNum, { color: colors.missingText }]}>7</Text>
          <Text style={[demo.stickerLabel, { color: colors.missingText }]}>falta</Text>
        </View>
        <Text style={[demo.cardCaption, { color: colors.textMuted }]}>Não tenho</Text>
      </View>

      {/* Arrow */}
      <View style={demo.arrowWrap}>
        <Text style={[demo.tapHint, { color: colors.textMuted }]}>1 toque</Text>
        <Text style={[demo.arrow, { color: accent }]}>→</Text>
      </View>

      {/* Green / owned card */}
      <View style={demo.cardGroup}>
        <View style={[demo.stickerCard, { backgroundColor: colors.ownedBg, borderColor: colors.ownedBorder }]}>
          <Text style={[demo.stickerNum, { color: colors.ownedText }]}>7</Text>
          <Text style={[demo.stickerLabel, { color: colors.ownedText }]}>✓ tenho</Text>
        </View>
        <Text style={[demo.cardCaption, { color: colors.textMuted }]}>Adicionada!</Text>
      </View>
    </View>
  );
}

/** Step 3 — owned card + tap → BottomSheetEditor real */
function EditDemo({ accent, colors }: { accent: string; colors: ColorsType }) {
  return (
    <View style={demo.editRoot}>
      {/* Green owned card + tap hint */}
      <View style={demo.editCardWrap}>
        <View style={[demo.stickerCardLg, { backgroundColor: colors.ownedBg, borderColor: colors.ownedBorder }]}>
          <Text style={[demo.stickerNumLg, { color: colors.ownedText }]}>7</Text>
          <Text style={[demo.stickerLabel, { color: colors.ownedText }]}>✓ tenho</Text>
        </View>
        <View style={[demo.tapRipple, { borderColor: accent }]} />
        <Text style={[demo.tapLabel, { color: accent }]}>toque longo</Text>
      </View>

      {/* Down arrow */}
      <Text style={[demo.downArrow, { color: accent }]}>↓</Text>

      {/* BottomSheetEditor fiel ao componente real */}
      <View style={[demo.sheet, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
        {/* Handle */}
        <View style={[demo.sheetHandle, { backgroundColor: colors.handle }]} />

        {/* Identity row */}
        <View style={demo.sheetIdentity}>
          <View>
            <Text style={[demo.sheetCode, { color: colors.textPrimary }]}>BRA 7</Text>
            <Text style={[demo.sheetStatus, { color: colors.textSecondary }]}>1 repetida</Text>
          </View>
        </View>

        {/* ± controls */}
        <View style={demo.sheetControls}>
          <View style={[demo.sheetCtrlBtn, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[demo.sheetCtrlText, { color: colors.textMuted }]}>−</Text>
          </View>
          <Text style={[demo.sheetQty, { color: colors.textPrimary }]}>2</Text>
          <View style={[demo.sheetCtrlBtn, { backgroundColor: accent }]}>
            <Text style={[demo.sheetCtrlText, { color: '#fff' }]}>+</Text>
          </View>
        </View>

        {/* Remove link */}
        <Text style={demo.sheetRemove}>Remover da Coleção</Text>

        {/* Done button */}
        <View style={[demo.sheetDoneBtn, { backgroundColor: accent }]}>
          <Text style={[demo.sheetDoneText, { color: '#0F172A' }]}>Pronto</Text>
        </View>
      </View>
    </View>
  );
}

// ── Steps config ──────────────────────────────────────────────────────────────

function buildSteps(): Step[] {
  return [
    {
      accentColor: '#3B82F6',
      title: 'Encontre sua seleção',
      description:
        'Use a busca para encontrar qualquer seleção pelo nome, ou ordene de A a Z. Toque na seleção para abrir a grade de figurinhas.',
      Demo: SearchDemo,
    },
    {
      accentColor: '#10B981',
      title: 'Toque para adicionar',
      description:
        'Figurinha cinza = você não tem. Toque uma vez nela para marcá-la como sua. Simples assim!',
      Demo: AddDemo,
    },
    {
      accentColor: '#F59E0B',
      title: 'Pressione para editar',
      description:
        'Figurinha verde = você já tem. Pressione e segure para abrir o editor: ajuste a quantidade exata, registre repetidas ou remova da coleção.',
      Demo: EditDemo,
    },
  ];
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  colors: ColorsType;
  isDark: boolean;
  onDismiss: () => void;
}

export default function WelcomeWizard({ colors, isDark, onDismiss }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const steps = useRef(buildSteps()).current;

  const isLast = stepIdx === steps.length - 1;
  const current = steps[stepIdx];
  const accent = current.accentColor;

  // Fade out → change step → fade in
  const goToStep = useCallback(
    (next: number) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        setStepIdx(next);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim],
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      onDismiss();
    } else {
      goToStep(stepIdx + 1);
    }
  }, [isLast, stepIdx, goToStep, onDismiss]);

  const handleBack = useCallback(() => {
    if (stepIdx > 0) goToStep(stepIdx - 1);
  }, [stepIdx, goToStep]);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>

          {/* ── Top bar: step indicator + skip ── */}
          <View style={styles.topBar}>
            <View style={styles.dotsRow}>
              {steps.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === stepIdx ? accent : colors.navBorder,
                      width: i === stepIdx ? 22 : 8,
                    },
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={onDismiss}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[styles.skipText, { color: colors.textMuted }]}>Pular</Text>
            </TouchableOpacity>
          </View>

          {/* ── Animated content (demo + title + description) ── */}
          <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
            {/* Visual demo */}
            <View style={[styles.demoBox, { backgroundColor: colors.background, borderColor: colors.navBorder }]}>
              <current.Demo accent={accent} colors={colors} />
            </View>

            {/* Accent line */}
            <View style={[styles.accentLine, { backgroundColor: accent }]} />

            {/* Title */}
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {current.title}
            </Text>

            {/* Description */}
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {current.description}
            </Text>
          </Animated.View>

          {/* ── Navigation buttons ── */}
          <View style={styles.navRow}>
            {/* Back (invisible on step 0) */}
            <TouchableOpacity
              onPress={handleBack}
              style={[styles.backBtn, { opacity: stepIdx === 0 ? 0 : 1 }]}
              disabled={stepIdx === 0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.backBtnText, { color: colors.textMuted }]}>← Voltar</Text>
            </TouchableOpacity>

            {/* Next / Finish */}
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: accent }]}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.nextBtnText,
                  { color: isDark ? '#0F172A' : '#FFFFFF' },
                ]}
              >
                {isLast ? '✓  Entendi!' : 'Próximo  →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Wizard card styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: CARD_W,
    borderRadius: Radius.xl,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: { elevation: 20 },
    }),
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  body: {
    gap: 12,
  },

  demoBox: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 180,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  accentLine: {
    height: 3,
    borderRadius: 2,
    marginTop: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  backBtn: {
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nextBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.lg,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

// ── Demo inner styles ─────────────────────────────────────────────────────────

const demo = StyleSheet.create({
  // ── Step 1 – Search ──────────────────────────────────────────────────────────
  searchRoot: { gap: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
    marginBottom: 4,
  },
  searchIcon: { fontSize: 12 },
  searchPlaceholder: { fontSize: 12, fontWeight: '500' },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    gap: 8,
    borderBottomWidth: 1,
  },
  teamFlag: { fontSize: 18, width: 26, textAlign: 'center' },
  teamInfo: { flex: 1, gap: 4 },
  teamNameRow: { flexDirection: 'row', justifyContent: 'space-between' },
  teamName: { fontSize: 11, fontWeight: '700' },
  teamCount: { fontSize: 10, fontWeight: '600' },
  progressTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2 },
  chevron: { fontSize: 16 },

  // ── Step 2 – Add ─────────────────────────────────────────────────────────────
  addRoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  cardGroup: { alignItems: 'center', gap: 6 },
  stickerCard: {
    width: 60,
    height: 78,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stickerNum: { fontSize: 22, fontWeight: '900' },
  stickerLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  cardCaption: { fontSize: 10, fontWeight: '600' },
  arrowWrap: { alignItems: 'center', gap: 2 },
  tapHint: { fontSize: 9, fontWeight: '600' },
  arrow: { fontSize: 28, fontWeight: '300' },

  // ── Step 3 – Edit (BottomSheetEditor) ────────────────────────────────────────
  editRoot: { alignItems: 'center', gap: 6, paddingVertical: 2 },
  editCardWrap: { alignItems: 'center' },
  stickerCardLg: {
    width: 60,
    height: 76,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stickerNumLg: { fontSize: 22, fontWeight: '900' },
  tapRipple: {
    position: 'absolute',
    width: 72,
    height: 88,
    borderRadius: 13,
    borderWidth: 2,
    opacity: 0.5,
  },
  tapLabel: { fontSize: 10, fontWeight: '700', marginTop: 4 },
  downArrow: { fontSize: 20, fontWeight: '300' },

  // BottomSheet fiel
  sheet: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 6,
    gap: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: 2,
  },
  sheetIdentity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetCode: { fontSize: 14, fontWeight: '900' },
  sheetStatus: { fontSize: 11, marginTop: 1 },
  sheetControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sheetCtrlBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCtrlText: { fontSize: 22, fontWeight: '300', lineHeight: 26, marginTop: -2 },
  sheetQty: { fontSize: 28, fontWeight: '900', width: 36, textAlign: 'center' },
  sheetRemove: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#F43F5E',
    textDecorationLine: 'underline',
  },
  sheetDoneBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  sheetDoneText: { fontSize: 13, fontWeight: '800' },
});
