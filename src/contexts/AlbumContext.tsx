import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useAlbum } from '../hooks/useAlbum';
import { Section } from '../types';

interface AlbumContextValue {
  sections: Section[];
  quantities: Record<string, number>;
  increment: (stickerId: string) => void;
  setQuantity: (stickerId: string, qty: number) => void;
  getSectionProgress: (sectionId: string) => { owned: number; total: number };
  totalProgress: { owned: number; total: number };
  syncing: boolean;
}

const AlbumContext = createContext<AlbumContextValue | null>(null);

export function AlbumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const album = useAlbum(user?.uid);
  return <AlbumContext.Provider value={album}>{children}</AlbumContext.Provider>;
}

export function useAlbumContext(): AlbumContextValue {
  const ctx = useContext(AlbumContext);
  if (!ctx) throw new Error('useAlbumContext must be used within AlbumProvider');
  return ctx;
}
