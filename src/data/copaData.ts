import { Section, Sticker } from '../types';

function makeStickers(
  sectionId: string,
  prefix: string,
  count: number,
  isSpecial = false,
  specialIndices: number[] = [],
): Sticker[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${sectionId}_${i + 1}`,
    code: `${prefix} ${i + 1}`,
    number: i + 1,
    sectionId,
    quantity: 0,
    isSpecial: isSpecial || specialIndices.includes(i),
  }));
}

interface SectionDef {
  id: string;
  name: string;
  flag: string;
  color: string;
  prefix: string;
  count: number;
  isSpecial?: boolean;
  specialIndices?: number[];
}

// Copa do Mundo 2026 — 49 seções: FWC (abertura, 20 especiais) + 48 seleções (20 fig. cada)
// Sticker #1 de cada seleção = escudo holográfico (isSpecial)
// Total: 20 + 48×20 = 980 figurinhas | Especiais: 20 (FWC) + 48 (escudos) = 68
const SECTION_DEFS: SectionDef[] = [
  // ── Abertura (todas holográficas) ────────────────────────────────────────────
  { id: 'fwc', name: 'Copa 2026', flag: '🏆', color: '#D97706', prefix: 'FWC', count: 20, isSpecial: true },

  // ── CONMEBOL (6) — escudo = fig. 1 ──────────────────────────────────────────
  { id: 'bra', name: 'Brasil',    flag: '🇧🇷', color: '#009C3B', prefix: 'BRA', count: 20, specialIndices: [0] },
  { id: 'arg', name: 'Argentina', flag: '🇦🇷', color: '#74ACDF', prefix: 'ARG', count: 20, specialIndices: [0] },
  { id: 'uru', name: 'Uruguai',   flag: '🇺🇾', color: '#5589B2', prefix: 'URU', count: 20, specialIndices: [0] },
  { id: 'col', name: 'Colômbia',  flag: '🇨🇴', color: '#FCD116', prefix: 'COL', count: 20, specialIndices: [0] },
  { id: 'ecu', name: 'Equador',   flag: '🇪🇨', color: '#FFD100', prefix: 'ECU', count: 20, specialIndices: [0] },
  { id: 'ven', name: 'Venezuela', flag: '🇻🇪', color: '#CF142B', prefix: 'VEN', count: 20, specialIndices: [0] },

  // ── UEFA (16) ───────────────────────────────────────────────────────────────
  { id: 'ing', name: 'Inglaterra',    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#012169', prefix: 'ING', count: 20, specialIndices: [0] },
  { id: 'fra', name: 'França',        flag: '🇫🇷', color: '#003189', prefix: 'FRA', count: 20, specialIndices: [0] },
  { id: 'ale', name: 'Alemanha',      flag: '🇩🇪', color: '#1A1A1A', prefix: 'ALE', count: 20, specialIndices: [0] },
  { id: 'esp', name: 'Espanha',       flag: '🇪🇸', color: '#AA151B', prefix: 'ESP', count: 20, specialIndices: [0] },
  { id: 'por', name: 'Portugal',      flag: '🇵🇹', color: '#006600', prefix: 'POR', count: 20, specialIndices: [0] },
  { id: 'ned', name: 'Países Baixos', flag: '🇳🇱', color: '#FF4F00', prefix: 'NED', count: 20, specialIndices: [0] },
  { id: 'ita', name: 'Itália',        flag: '🇮🇹', color: '#003399', prefix: 'ITA', count: 20, specialIndices: [0] },
  { id: 'aut', name: 'Áustria',       flag: '🇦🇹', color: '#ED2939', prefix: 'AUT', count: 20, specialIndices: [0] },
  { id: 'sui', name: 'Suíça',         flag: '🇨🇭', color: '#D52B1E', prefix: 'SUI', count: 20, specialIndices: [0] },
  { id: 'din', name: 'Dinamarca',     flag: '🇩🇰', color: '#C60C30', prefix: 'DIN', count: 20, specialIndices: [0] },
  { id: 'cro', name: 'Croácia',       flag: '🇭🇷', color: '#CC0000', prefix: 'CRO', count: 20, specialIndices: [0] },
  { id: 'ser', name: 'Sérvia',        flag: '🇷🇸', color: '#C6363C', prefix: 'SER', count: 20, specialIndices: [0] },
  { id: 'hun', name: 'Hungria',       flag: '🇭🇺', color: '#436F4D', prefix: 'HUN', count: 20, specialIndices: [0] },
  { id: 'esc', name: 'Escócia',       flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: '#003078', prefix: 'ESC', count: 20, specialIndices: [0] },
  { id: 'tur', name: 'Turquia',       flag: '🇹🇷', color: '#E30A17', prefix: 'TUR', count: 20, specialIndices: [0] },
  { id: 'gre', name: 'Grécia',        flag: '🇬🇷', color: '#0D5EAF', prefix: 'GRE', count: 20, specialIndices: [0] },

  // ── CONCACAF (6) ────────────────────────────────────────────────────────────
  { id: 'usa', name: 'Estados Unidos', flag: '🇺🇸', color: '#002868', prefix: 'USA', count: 20, specialIndices: [0] },
  { id: 'mex', name: 'México',         flag: '🇲🇽', color: '#006847', prefix: 'MEX', count: 20, specialIndices: [0] },
  { id: 'can', name: 'Canadá',         flag: '🇨🇦', color: '#CC0000', prefix: 'CAN', count: 20, specialIndices: [0] },
  { id: 'pan', name: 'Panamá',         flag: '🇵🇦', color: '#DA121A', prefix: 'PAN', count: 20, specialIndices: [0] },
  { id: 'crc', name: 'Costa Rica',     flag: '🇨🇷', color: '#002B7F', prefix: 'CRC', count: 20, specialIndices: [0] },
  { id: 'jam', name: 'Jamaica',        flag: '🇯🇲', color: '#000000', prefix: 'JAM', count: 20, specialIndices: [0] },

  // ── CAF — África (9) ────────────────────────────────────────────────────────
  { id: 'mar', name: 'Marrocos',      flag: '🇲🇦', color: '#C1272D', prefix: 'MAR', count: 20, specialIndices: [0] },
  { id: 'sen', name: 'Senegal',       flag: '🇸🇳', color: '#00853F', prefix: 'SEN', count: 20, specialIndices: [0] },
  { id: 'nga', name: 'Nigéria',       flag: '🇳🇬', color: '#008751', prefix: 'NGA', count: 20, specialIndices: [0] },
  { id: 'egi', name: 'Egito',         flag: '🇪🇬', color: '#CE1126', prefix: 'EGI', count: 20, specialIndices: [0] },
  { id: 'cam', name: 'Camarões',      flag: '🇨🇲', color: '#007A5E', prefix: 'CAM', count: 20, specialIndices: [0] },
  { id: 'mli', name: 'Mali',          flag: '🇲🇱', color: '#009A00', prefix: 'MLI', count: 20, specialIndices: [0] },
  { id: 'rsa', name: 'África do Sul', flag: '🇿🇦', color: '#007A4D', prefix: 'RSA', count: 20, specialIndices: [0] },
  { id: 'drc', name: 'Congo DR',      flag: '🇨🇩', color: '#007FFF', prefix: 'DRC', count: 20, specialIndices: [0] },
  { id: 'alg', name: 'Argélia',       flag: '🇩🇿', color: '#006233', prefix: 'ALG', count: 20, specialIndices: [0] },

  // ── AFC — Ásia (8) ──────────────────────────────────────────────────────────
  { id: 'jap', name: 'Japão',          flag: '🇯🇵', color: '#BC002D', prefix: 'JAP', count: 20, specialIndices: [0] },
  { id: 'cor', name: 'Coreia do Sul',  flag: '🇰🇷', color: '#003478', prefix: 'COR', count: 20, specialIndices: [0] },
  { id: 'aus', name: 'Austrália',      flag: '🇦🇺', color: '#00843D', prefix: 'AUS', count: 20, specialIndices: [0] },
  { id: 'ars', name: 'Arábia Saudita', flag: '🇸🇦', color: '#006C35', prefix: 'ARS', count: 20, specialIndices: [0] },
  { id: 'ira', name: 'Irã',            flag: '🇮🇷', color: '#239F40', prefix: 'IRA', count: 20, specialIndices: [0] },
  { id: 'irq', name: 'Iraque',         flag: '🇮🇶', color: '#CE1126', prefix: 'IRQ', count: 20, specialIndices: [0] },
  { id: 'jor', name: 'Jordânia',       flag: '🇯🇴', color: '#007A3D', prefix: 'JOR', count: 20, specialIndices: [0] },
  { id: 'uzb', name: 'Uzbequistão',    flag: '🇺🇿', color: '#1EB53A', prefix: 'UZB', count: 20, specialIndices: [0] },

  // ── OFC — Oceania (1) ───────────────────────────────────────────────────────
  { id: 'nzl', name: 'Nova Zelândia', flag: '🇳🇿', color: '#00247D', prefix: 'NZL', count: 20, specialIndices: [0] },

  // ── Playoffs Intercontinentais (2) ──────────────────────────────────────────
  { id: 'pl1', name: 'Playoff 1', flag: '🏳️', color: '#6B7280', prefix: 'PL1', count: 20, specialIndices: [0] },
  { id: 'pl2', name: 'Playoff 2', flag: '🏳️', color: '#6B7280', prefix: 'PL2', count: 20, specialIndices: [0] },
];

export const INITIAL_SECTIONS: Section[] = SECTION_DEFS.map(
  ({ id, name, flag, color, prefix, count, isSpecial, specialIndices }) => ({
    id,
    name,
    flag,
    color,
    isSpecial: isSpecial ?? false,
    stickers: makeStickers(id, prefix, count, isSpecial ?? false, specialIndices ?? []),
  }),
);

// Seed de demonstração
export const SEED_QUANTITIES: Record<string, number> = {
  bra_1: 1, bra_2: 2, bra_3: 1, bra_5: 3,
  bra_6: 1, bra_8: 2, bra_9: 1,
  fwc_1: 1, fwc_3: 2, fwc_5: 1, fwc_7: 3,
  arg_2: 1, arg_4: 2, arg_6: 1,
};

// Total: 20 (FWC) + 48 × 20 (seleções) = 980
// Especiais: 20 (FWC holográficas) + 48 (escudos) = 68
export const TOTAL_STICKERS = SECTION_DEFS.reduce((sum, s) => sum + s.count, 0);
