import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors, ThemeMode, ColorsType } from './index';

const THEME_STORAGE_KEY = '@app_theme_mode';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ColorsType;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  colors: DarkColors,
  toggleTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null

  // Initialize immediately from system so there's no flash on first render
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'light' ? 'light' : 'dark');

  // After mount: override with persisted user preference if it exists
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(saved => {
        if (saved === 'light' || saved === 'dark') {
          setMode(saved);
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setMode(prev => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  };

  const colors = mode === 'dark' ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, isDark: mode === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
