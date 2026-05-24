import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LightColors, DarkColors, ThemeMode, ColorsType } from './index';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ColorsType;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: LightColors,
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const toggleTheme = () => setMode(m => (m === 'light' ? 'dark' : 'light'));
  const colors = mode === 'dark' ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, isDark: mode === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
