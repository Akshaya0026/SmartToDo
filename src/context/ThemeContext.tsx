import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { THEME_STORAGE_KEY } from '../utils/constants';

export type ThemeType = 'light' | 'dark' | 'aurora' | 'midnight' | 'sunset' | 'ocean';

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  accent: string;
  isDark: boolean;
}

export const THEMES: Record<ThemeType, ThemeColors> = {
  light: {
    primary: '#3B82F6',
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    subtext: '#6B7280',
    border: '#E5E7EB',
    accent: '#60A5FA',
    isDark: false,
  },
  dark: {
    primary: '#3B82F6',
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    subtext: '#9CA3AF',
    border: '#374151',
    accent: '#60A5FA',
    isDark: true,
  },
  aurora: {
    primary: '#10B981',
    background: '#064E3B',
    card: '#065F46',
    text: '#ECFDF5',
    subtext: '#A7F3D0',
    border: '#047857',
    accent: '#34D399',
    isDark: true,
  },
  midnight: {
    primary: '#6366F1',
    background: '#000000',
    card: '#111111',
    text: '#FFFFFF',
    subtext: '#94A3B8',
    border: '#1E293B',
    accent: '#818CF8',
    isDark: true,
  },
  sunset: {
    primary: '#F59E0B',
    background: '#FFF7ED',
    card: '#FFEDD5',
    text: '#7C2D12',
    subtext: '#9A3412',
    border: '#FED7AA',
    accent: '#FB923C',
    isDark: false,
  },
  ocean: {
    primary: '#0891B2',
    background: '#ECFEFF',
    card: '#CFFAFE',
    text: '#164E63',
    subtext: '#0E7490',
    border: '#A5F3FC',
    accent: '#22D3EE',
    isDark: false,
  },
};

interface ThemeContextType {
  theme: ThemeColors;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeTypeState] = useState<ThemeType>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored: string | null) => {
      if (stored && Object.keys(THEMES).includes(stored)) {
        setThemeTypeState(stored as ThemeType);
      } else {
        setThemeTypeState(systemColorScheme === 'dark' ? 'dark' : 'light');
      }
    });
  }, [systemColorScheme]);

  const setThemeType = useCallback(async (type: ThemeType) => {
    setThemeTypeState(type);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, type);
  }, []);

  const theme = THEMES[themeType];

  return (
    <ThemeContext.Provider value={{ theme, themeType, setThemeType, isDark: theme.isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
