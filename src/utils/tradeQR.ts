import { INITIAL_SECTIONS } from '../data/mockData';

// Canonical ordered list built once at module load
const ALL_STICKERS = INITIAL_SECTIONS.flatMap(s =>
  s.stickers.map(st => ({
    id: st.id,
    code: st.code,
    isSpecial: st.isSpecial ?? false,
    sectionName: s.name,
    sectionFlag: s.flag,
    sectionColor: s.color,
  })),
);

const ALL_IDS = ALL_STICKERS.map(s => s.id);
const STICKER_INFO_MAP = new Map(ALL_STICKERS.map(s => [s.id, s]));

export interface StickerInfo {
  id: string;
  code: string;
  isSpecial: boolean;
  sectionName: string;
  sectionFlag: string;
  sectionColor: string;
}

export interface QRPayload {
  version: number;
  name: string;
  missing: string[];   // sticker IDs with quantity === 0
  extras: string[];    // sticker IDs with quantity >= 2
}

export interface TradeMatch {
  friendName: string;
  theyGiveMe: StickerInfo[];  // friend has extras that I'm missing
  iGiveThem: StickerInfo[];   // I have extras that friend is missing
}

// ─── Bitmask helpers ─────────────────────────────────────────────────────────

function encodeBitmask(flags: boolean[]): string {
  const bytes = new Uint8Array(Math.ceil(flags.length / 8));
  flags.forEach((flag, i) => {
    if (flag) bytes[Math.floor(i / 8)] |= 1 << (i % 8);
  });
  let str = '';
  bytes.forEach(b => { str += String.fromCharCode(b); });
  return btoa(str);
}

function decodeBitmask(b64: string, count: number): boolean[] {
  const str = atob(b64);
  return Array.from({ length: count }, (_, i) => {
    const byte = str.charCodeAt(Math.floor(i / 8));
    return !!(byte & (1 << (i % 8)));
  });
}

// ─── Encode / Decode ─────────────────────────────────────────────────────────

export function encodeQRPayload(
  quantities: Record<string, number>,
  displayName: string,
): string {
  const missingFlags = ALL_IDS.map(id => (quantities[id] ?? 0) === 0);
  const extrasFlags = ALL_IDS.map(id => (quantities[id] ?? 0) >= 2);
  return JSON.stringify({
    v: 1,
    n: displayName.slice(0, 30),
    m: encodeBitmask(missingFlags),
    e: encodeBitmask(extrasFlags),
  });
}

export function decodeQRPayload(raw: string): QRPayload | null {
  try {
    const obj = JSON.parse(raw);
    if (obj.v !== 1 || !obj.n || !obj.m || !obj.e) return null;
    const n = ALL_IDS.length;
    const missingBits = decodeBitmask(obj.m, n);
    const extrasBits = decodeBitmask(obj.e, n);
    return {
      version: obj.v,
      name: obj.n,
      missing: ALL_IDS.filter((_, i) => missingBits[i]),
      extras: ALL_IDS.filter((_, i) => extrasBits[i]),
    };
  } catch {
    return null;
  }
}

// ─── Match computation ────────────────────────────────────────────────────────

export function computeTradeMatches(
  myQuantities: Record<string, number>,
  friend: QRPayload,
): TradeMatch {
  const myMissing = new Set(ALL_IDS.filter(id => (myQuantities[id] ?? 0) === 0));
  const myExtras = new Set(ALL_IDS.filter(id => (myQuantities[id] ?? 0) >= 2));
  const friendMissing = new Set(friend.missing);

  const toInfo = (id: string): StickerInfo => STICKER_INFO_MAP.get(id)!;

  return {
    friendName: friend.name,
    theyGiveMe: friend.extras.filter(id => myMissing.has(id)).map(toInfo),
    iGiveThem: Array.from(myExtras).filter(id => friendMissing.has(id)).map(toInfo),
  };
}

// ─── Stats helpers ────────────────────────────────────────────────────────────

export function getAlbumStats(quantities: Record<string, number>) {
  let missing = 0;
  let extras = 0;
  ALL_IDS.forEach(id => {
    const q = quantities[id] ?? 0;
    if (q === 0) missing++;
    else if (q >= 2) extras++;
  });
  return { missing, extras };
}

// ─── WhatsApp share text ──────────────────────────────────────────────────────

export function generateShareText(
  quantities: Record<string, number>,
  displayName: string,
): string {
  const lines: string[] = [];
  lines.push(`🏆 Álbum Copa 2026 — ${displayName}`);
  lines.push('');

  // Repetidas
  const sectionsWithExtras = INITIAL_SECTIONS.filter(s =>
    s.stickers.some(st => (quantities[st.id] ?? 0) >= 2),
  );
  if (sectionsWithExtras.length > 0) {
    lines.push('📦 *REPETIDAS* (posso trocar):');
    for (const section of sectionsWithExtras) {
      const nums = section.stickers
        .filter(st => (quantities[st.id] ?? 0) >= 2)
        .map(st => st.number)
        .join(', ');
      lines.push(`${section.flag} ${section.name}: ${nums}`);
    }
  } else {
    lines.push('📦 *REPETIDAS*: nenhuma ainda');
  }

  lines.push('');

  // Faltando
  const sectionsWithMissing = INITIAL_SECTIONS.filter(s =>
    s.stickers.some(st => (quantities[st.id] ?? 0) === 0),
  );
  if (sectionsWithMissing.length > 0) {
    lines.push('❌ *FALTANDO*:');
    for (const section of sectionsWithMissing) {
      const missing = section.stickers.filter(st => (quantities[st.id] ?? 0) === 0);
      const label =
        missing.length === section.stickers.length
          ? 'todas'
          : missing.map(st => st.number).join(', ');
      lines.push(`${section.flag} ${section.name}: ${label}`);
    }
  } else {
    lines.push('✅ Álbum completo!');
  }

  lines.push('');
  lines.push('_Compartilhado pelo app Meu Álbum Completo_ 📱');

  return lines.join('\n');
}
