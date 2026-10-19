import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('stroitx_theme') as ThemeMode;
    return saved || 'light';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    let enableDark = false;

    if (mode === 'dark') {
      enableDark = true;
    } else if (mode === 'system') {
      enableDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      enableDark = false;
    }

    if (enableDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    setIsDark(enableDark);
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('stroitx_theme', theme);
  }, [theme]);

  // System theme listener
  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
