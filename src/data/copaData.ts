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

// Copa do Mundo 2026 — ordem do álbum oficial
// FWC (20) + 48 seleções × 20 + CC (14) = 994 total
// Especiais: 20 (FWC abertura) + 48 (escudos, fig. 1 de cada seleção) = 68
const SECTION_DEFS: SectionDef[] = [
  // ── FWC — Abertura (todas holográficas) ──────────────────────────────────────
  { id: 'fwc', name: 'Copa 2026', flag: '🏆', color: '#D97706', prefix: 'FWC', count: 20, isSpecial: true },

  // ── Grupo A ──────────────────────────────────────────────────────────────────
  { id: 'mex', name: 'México',          flag: '🇲🇽', color: '#006847', prefix: 'MEX', count: 20, specialIndices: [0] },
  { id: 'rsa', name: 'África do Sul',   flag: '🇿🇦', color: '#007A4D', prefix: 'RSA', count: 20, specialIndices: [0] },
  { id: 'cor', name: 'Coreia do Sul',   flag: '🇰🇷', color: '#003478', prefix: 'KOR', count: 20, specialIndices: [0] },
  { id: 'tch', name: 'Rep. Tcheca',     flag: '🇨🇿', color: '#D7141A', prefix: 'CZE', count: 20, specialIndices: [0] },

  // ── Grupo B ──────────────────────────────────────────────────────────────────
  { id: 'can', name: 'Canadá',          flag: '🇨🇦', color: '#CC0000', prefix: 'CAN', count: 20, specialIndices: [0] },
  { id: 'bos', name: 'Bósnia',          flag: '🇧🇦', color: '#002395', prefix: 'BIH', count: 20, specialIndices: [0] },
  { id: 'qat', name: 'Catar',           flag: '🇶🇦', color: '#8D1B3D', prefix: 'QAT', count: 20, specialIndices: [0] },
  { id: 'sui', name: 'Suíça',           flag: '🇨🇭', color: '#D52B1E', prefix: 'SUI', count: 20, specialIndices: [0] },

  // ── Grupo C ──────────────────────────────────────────────────────────────────
  { id: 'bra', name: 'Brasil',          flag: '🇧🇷', color: '#009C3B', prefix: 'BRA', count: 20, specialIndices: [0] },
  { id: 'mar', name: 'Marrocos',        flag: '🇲🇦', color: '#C1272D', prefix: 'MAR', count: 20, specialIndices: [0] },
  { id: 'hai', name: 'Haiti',           flag: '🇭🇹', color: '#00209F', prefix: 'HAI', count: 20, specialIndices: [0] },
  { id: 'esc', name: 'Escócia',         flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: '#003078', prefix: 'SCO', count: 20, specialIndices: [0] },

  // ── Grupo D ──────────────────────────────────────────────────────────────────
  { id: 'usa', name: 'Estados Unidos',  flag: '🇺🇸', color: '#002868', prefix: 'USA', count: 20, specialIndices: [0] },
  { id: 'par', name: 'Paraguai',        flag: '🇵🇾', color: '#D52B1E', prefix: 'PAR', count: 20, specialIndices: [0] },
  { id: 'aus', name: 'Austrália',       flag: '🇦🇺', color: '#00843D', prefix: 'AUS', count: 20, specialIndices: [0] },
  { id: 'tur', name: 'Turquia',         flag: '🇹🇷', color: '#E30A17', prefix: 'TUR', count: 20, specialIndices: [0] },

  // ── Grupo E ──────────────────────────────────────────────────────────────────
  { id: 'ale', name: 'Alemanha',        flag: '🇩🇪', color: '#1A1A1A', prefix: 'GER', count: 20, specialIndices: [0] },
  { id: 'cur', name: 'Curaçao',         flag: '🇨🇼', color: '#002B7F', prefix: 'CUR', count: 20, specialIndices: [0] },
  { id: 'civ', name: 'Costa do Marfim', flag: '🇨🇮', color: '#F77F00', prefix: 'CIV', count: 20, specialIndices: [0] },
  { id: 'ecu', name: 'Equador',         flag: '🇪🇨', color: '#FFD100', prefix: 'ECU', count: 20, specialIndices: [0] },

  // ── Grupo F ──────────────────────────────────────────────────────────────────
  { id: 'ned', name: 'Países Baixos',   flag: '🇳🇱', color: '#FF4F00', prefix: 'NED', count: 20, specialIndices: [0] },
  { id: 'jap', name: 'Japão',           flag: '🇯🇵', color: '#BC002D', prefix: 'JPN', count: 20, specialIndices: [0] },
  { id: 'sue', name: 'Suécia',          flag: '🇸🇪', color: '#006AA7', prefix: 'SWE', count: 20, specialIndices: [0] },
  { id: 'tun', name: 'Tunísia',         flag: '🇹🇳', color: '#E70013', prefix: 'TUN', count: 20, specialIndices: [0] },

  // ── Grupo G ──────────────────────────────────────────────────────────────────
  { id: 'bel', name: 'Bélgica',         flag: '🇧🇪', color: '#EF3340', prefix: 'BEL', count: 20, specialIndices: [0] },
  { id: 'egi', name: 'Egito',           flag: '🇪🇬', color: '#CE1126', prefix: 'EGY', count: 20, specialIndices: [0] },
  { id: 'ira', name: 'Irã',             flag: '🇮🇷', color: '#239F40', prefix: 'IRN', count: 20, specialIndices: [0] },
  { id: 'nzl', name: 'Nova Zelândia',   flag: '🇳🇿', color: '#00247D', prefix: 'NZL', count: 20, specialIndices: [0] },

  // ── Grupo H ──────────────────────────────────────────────────────────────────
  { id: 'esp', name: 'Espanha',         flag: '🇪🇸', color: '#AA151B', prefix: 'ESP', count: 20, specialIndices: [0] },
  { id: 'cpv', name: 'Cabo Verde',      flag: '🇨🇻', color: '#003893', prefix: 'CPV', count: 20, specialIndices: [0] },
  { id: 'ars', name: 'Arábia Saudita',  flag: '🇸🇦', color: '#006C35', prefix: 'KSA', count: 20, specialIndices: [0] },
  { id: 'uru', name: 'Uruguai',         flag: '🇺🇾', color: '#5589B2', prefix: 'URU', count: 20, specialIndices: [0] },

  // ── Grupo I ──────────────────────────────────────────────────────────────────
  { id: 'fra', name: 'França',          flag: '🇫🇷', color: '#003189', prefix: 'FRA', count: 20, specialIndices: [0] },
  { id: 'sen', name: 'Senegal',         flag: '🇸🇳', color: '#00853F', prefix: 'SEN', count: 20, specialIndices: [0] },
  { id: 'irq', name: 'Iraque',          flag: '🇮🇶', color: '#CE1126', prefix: 'IRQ', count: 20, specialIndices: [0] },
  { id: 'nor', name: 'Noruega',         flag: '🇳🇴', color: '#EF2B2D', prefix: 'NOR', count: 20, specialIndices: [0] },

  // ── Grupo J ──────────────────────────────────────────────────────────────────
  { id: 'arg', name: 'Argentina',       flag: '🇦🇷', color: '#74ACDF', prefix: 'ARG', count: 20, specialIndices: [0] },
  { id: 'alg', name: 'Argélia',         flag: '🇩🇿', color: '#006233', prefix: 'ALG', count: 20, specialIndices: [0] },
  { id: 'aut', name: 'Áustria',         flag: '🇦🇹', color: '#ED2939', prefix: 'AUT', count: 20, specialIndices: [0] },
  { id: 'jor', name: 'Jordânia',        flag: '🇯🇴', color: '#007A3D', prefix: 'JOR', count: 20, specialIndices: [0] },

  // ── Grupo K ──────────────────────────────────────────────────────────────────
  { id: 'por', name: 'Portugal',        flag: '🇵🇹', color: '#006600', prefix: 'POR', count: 20, specialIndices: [0] },
  { id: 'drc', name: 'Congo RD',        flag: '🇨🇩', color: '#007FFF', prefix: 'COD', count: 20, specialIndices: [0] },
  { id: 'uzb', name: 'Uzbequistão',     flag: '🇺🇿', color: '#1EB53A', prefix: 'UZB', count: 20, specialIndices: [0] },
  { id: 'col', name: 'Colômbia',        flag: '🇨🇴', color: '#FCD116', prefix: 'COL', count: 20, specialIndices: [0] },

  // ── Grupo L ──────────────────────────────────────────────────────────────────
  { id: 'ing', name: 'Inglaterra',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#012169', prefix: 'ENG', count: 20, specialIndices: [0] },
  { id: 'cro', name: 'Croácia',         flag: '🇭🇷', color: '#CC0000', prefix: 'CRO', count: 20, specialIndices: [0] },
  { id: 'gha', name: 'Gana',            flag: '🇬🇭', color: '#006B3F', prefix: 'GHA', count: 20, specialIndices: [0] },
  { id: 'pan', name: 'Panamá',          flag: '🇵🇦', color: '#DA121A', prefix: 'PAN', count: 20, specialIndices: [0] },

  // ── CC — Coca-Cola ───────────────────────────────────────────────────────────
  { id: 'cc', name: 'Coca-Cola', flag: '🥤', color: '#F40009', prefix: 'CC', count: 14 },
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

// Seções: 50 | Total figurinhas: 20 (FWC) + 48×20 (seleções) + 14 (CC) = 994
// Especiais: 20 (FWC holográficas) + 48 (escudos) = 68
export const TOTAL_STICKERS = SECTION_DEFS.reduce((sum, s) => sum + s.count, 0);

export const ALBUM_CONFIG = {
  name: 'Copa do Mundo 2026',
  subtitle: '994 figurinhas',
};
