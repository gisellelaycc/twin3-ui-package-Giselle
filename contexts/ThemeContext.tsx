import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ColorMode = 'cream' | 'dark';

interface ThemeContextValue {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ colorMode: 'cream', setColorMode: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    const saved = localStorage.getItem('twin3-color-mode');
    return (saved as ColorMode) || 'cream';
  });

  useEffect(() => {
    localStorage.setItem('twin3-color-mode', colorMode);
    document.documentElement.setAttribute('data-theme', colorMode);
  }, [colorMode]);

  return (
    <ThemeContext.Provider value={{ colorMode, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
