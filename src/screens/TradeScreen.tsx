import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlbumContext } from '../contexts/AlbumContext';
import { Spacing, Radius, Typography } from '../theme';
import {
  encodeQRPayload,
  decodeQRPayload,
  computeTradeMatches,
  getAlbumStats,
  TradeMatch,
} from '../utils/tradeQR';
import TradeMatchModal from '../components/TradeMatchModal';

type Tab = 'generate' | 'scan';

export default function TradeScreen() {
  const { colors, isDark } = useTheme();
  const { user, profile } = useAuth();
  const { quantities } = useAlbumContext();

  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [scanned, setScanned] = useState(false);
  const [matchResult, setMatchResult] = useState<TradeMatch | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const displayName = profile?.displayName || user?.displayName || 'Anônimo';
  const qrValue = encodeQRPayload(quantities, displayName);
  const stats = getAlbumStats(quantities);

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) return;
      setScanned(true);

      const payload = decodeQRPayload(data);
      if (!payload) {
        setScanned(false);
        return;
      }

      const match = computeTradeMatches(quantities, payload);
      setMatchResult(match);
      setModalVisible(true);
    },
    [scanned, quantities],
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setMatchResult(null);
    setScanned(false);
  }, []);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setScanned(false);
  }, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.header} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <Text style={styles.headerTitle}>Troca via QR Code</Text>
        <Text style={styles.headerSub}>Troque figurinhas presencialmente com seu amigo</Text>
      </View>

      {/* ── Tab switcher ── */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
        {(['generate', 'scan'] as Tab[]).map(tab => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                active && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleTabChange(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                {tab === 'generate' ? '📱 Meu QR Code' : '📷 Escanear'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Content ── */}
      {activeTab === 'generate' ? (
        <GenerateTab
          qrValue={qrValue}
          displayName={displayName}
          stats={stats}
          isDark={isDark}
          colors={colors}
        />
      ) : (
        <ScanTab
          cameraPermission={cameraPermission}
          requestCameraPermission={requestCameraPermission}
          scanned={scanned}
          onScanned={handleBarCodeScanned}
          onRetry={() => setScanned(false)}
          colors={colors}
        />
      )}

      {/* ── Match modal ── */}
      <TradeMatchModal
        visible={modalVisible}
        match={matchResult}
        colors={colors}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

// ─── Generate tab ─────────────────────────────────────────────────────────────

function GenerateTab({
  qrValue,
  displayName,
  stats,
  isDark,
  colors,
}: {
  qrValue: string;
  displayName: string;
  stats: { missing: number; extras: number };
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.generateContainer}>
      {/* QR Card */}
      <View style={[styles.qrCard, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
        <View style={[styles.qrWrapper, { backgroundColor: '#FFFFFF' }]}>
          <QRCode
            value={qrValue}
            size={220}
            color="#0F172A"
            backgroundColor="#FFFFFF"
            ecl="M"
          />
        </View>
        <Text style={[styles.qrName, { color: colors.textPrimary }]}>{displayName}</Text>
        <Text style={[styles.qrSub, { color: colors.textSecondary }]}>
          Mostre este QR Code para um amigo escanear
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
          <Text style={[styles.statValue, { color: colors.badge }]}>{stats.missing}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>faltando</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.navBorder }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.extras}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>repetidas</Text>
        </View>
      </View>

      {/* Info */}
      <View style={[styles.infoBox, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          O QR Code contém suas figurinhas <Text style={{ color: colors.badge, fontWeight: '700' }}>faltando</Text> e{' '}
          <Text style={{ color: colors.primary, fontWeight: '700' }}>repetidas</Text>. Quando
          seu amigo escanear, o app mostrará quais trocas são possíveis entre vocês.
        </Text>
      </View>
    </View>
  );
}

// ─── Scan tab ─────────────────────────────────────────────────────────────────

function ScanTab({
  cameraPermission,
  requestCameraPermission,
  scanned,
  onScanned,
  onRetry,
  colors,
}: {
  cameraPermission: ReturnType<typeof useCameraPermissions>[0];
  requestCameraPermission: ReturnType<typeof useCameraPermissions>[1];
  scanned: boolean;
  onScanned: (event: { data: string }) => void;
  onRetry: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  if (!cameraPermission) {
    return (
      <View style={styles.permCenter}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permCenter}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={[styles.permTitle, { color: colors.textPrimary }]}>
          Câmera necessária
        </Text>
        <Text style={[styles.permSub, { color: colors.textSecondary }]}>
          Para escanear o QR Code do seu amigo,{'\n'}precisamos de acesso à câmera.
        </Text>
        <TouchableOpacity
          style={[styles.permBtn, { backgroundColor: colors.primary }]}
          onPress={requestCameraPermission}
          activeOpacity={0.85}
        >
          <Text style={styles.permBtnText}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : onScanned}
      />

      {/* Overlay com moldura */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={[styles.overlaySide, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={[styles.overlaySide, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.scanHint}>
            {scanned ? '✅ QR Code lido! Calculando trocas...' : 'Aponte para o QR Code do seu amigo'}
          </Text>
          {scanned && (
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
              <Text style={styles.retryText}>Escanear novamente</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const FRAME_SIZE = 240;
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
    marginTop: 2,
  },

  // ── Tabs ──
  tabBar: {
    flexDirection: 'row',
    margin: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Generate ──
  generateContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  qrCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  qrWrapper: {
    padding: 16,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  qrName: {
    ...Typography.cardTitle,
    marginBottom: 4,
  },
  qrSub: {
    ...Typography.body,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  statValue: {
    ...Typography.statLarge,
  },
  statLabel: {
    ...Typography.statLabel,
  },
  infoBox: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  infoText: {
    ...Typography.body,
    textAlign: 'center',
  },

  // ── Permission ──
  permCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  permIcon: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  permTitle: {
    ...Typography.screenTitle,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permSub: {
    ...Typography.bodyLarge,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  permBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
  permBtnText: {
    ...Typography.buttonPrimary,
    color: '#FFFFFF',
  },

  // ── Camera ──
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  overlaySide: {
    flex: 1,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#10B981',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },
  scanHint: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
