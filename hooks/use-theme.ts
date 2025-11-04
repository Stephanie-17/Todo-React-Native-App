import { useColorScheme } from 'react-native';
import { useState, } from 'react';

export interface ColorScheme {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Nested backgrounds object for specific use cases
  backgrounds: {
    input: string;
    editInput: string;
    card: string;
    modal: string;
  };
  
  // Text colors
  text: string;
  textMuted: string;
  textSecondary: string;
  
  // UI colors
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  
  // Status colors
  success: string;
  warning: string;
  danger: string;
  info: string;
  
  // Card/Surface colors
  card: string;
  cardHighlight: string;
  
  // Interactive states
  buttonBackground: string;
  buttonText: string;
  
  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
}

const lightColors: ColorScheme = {
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundTertiary: '#E9ECEF',
  
  backgrounds: {
    input: '#FFFFFF',
    editInput: '#F8F9FA',
    card: '#FFFFFF',
    modal: '#FFFFFF',
  },
  
  text: '#1A1A1A',
  textMuted: '#6C757D',
  textSecondary: '#495057',
  
  primary: '#3A7CFD',
  secondary: '#6C757D',
  accent: '#5E93F5',
  border: '#DEE2E6',
  
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  info: '#17A2B8',
  
  card: '#FFFFFF',
  cardHighlight: '#F8F9FA',
  
  buttonBackground: '#3A7CFD',
  buttonText: '#FFFFFF',
  
  inputBackground: '#FFFFFF',
  inputBorder: '#CED4DA',
  inputText: '#1A1A1A',
  placeholder: '#ADB5BD',
};

const darkColors: ColorScheme = {
  background: '#171823',
  backgroundSecondary: '#25273D',
  backgroundTertiary: '#2E3144',
  
  backgrounds: {
    input: '#25273D',
    editInput: '#2E3144',
    card: '#25273D',
    modal: '#2E3144',
  },
  
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  textSecondary: '#C8CBE7',
  
  primary: '#5E93F5',
  secondary: '#6C757D',
  accent: '#3A7CFD',
  border: '#393A4B',
  
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#EF4444',
  info: '#3B82F6',
  
  card: '#25273D',
  cardHighlight: '#2E3144',
  
  buttonBackground: '#5E93F5',
  buttonText: '#FFFFFF',
  
  inputBackground: '#25273D',
  inputBorder: '#393A4B',
  inputText: '#FFFFFF',
  placeholder: '#6B7280',
};

type ThemeMode = 'light' | 'dark' | 'auto';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');

  const getColors = (): ColorScheme => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark' ? darkColors : lightColors;
    }
    return themeMode === 'dark' ? darkColors : lightColors;
  };

  const colors = getColors();
  const isDark = themeMode === 'auto' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'auto';
      return 'light';
    });
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  return {
    colors,
    isDark,
    themeMode,
    toggleTheme,
    setTheme,
  };
};