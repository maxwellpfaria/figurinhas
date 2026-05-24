export interface Sticker {
  id: string;
  code: string;   // "BRA 10"
  number: number;
  sectionId: string;
  quantity: number;   // 0=missing · 1=owned · 2+=repeated
  isSpecial?: boolean; // legendary/holographic sticker
}

export interface Section {
  id: string;
  name: string;
  flag: string;    // emoji
  color: string;   // hex accent color
  stickers: Sticker[];
  isSpecial?: boolean;
}

export type StickerState = 'missing' | 'owned' | 'repeated';

export function getStickerState(quantity: number): StickerState {
  if (quantity === 0) return 'missing';
  if (quantity === 1) return 'owned';
  return 'repeated';
}
