import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_THEME,
  THEME_PRESETS,
  ThemeSettings,
  ThemePreset,
  applyThemeToDocument,
  loadThemeFromStorage,
  persistTheme,
  sanitizeTheme,
} from '@/lib/theme';

interface ThemeContextValue {
  theme: ThemeSettings;
  presets: ThemePreset[];
  updateTheme: (patch: Partial<ThemeSettings>) => void;
  applyPreset: (presetId: string) => void;
  saveCurrentAsPreset: (name?: string) => void;
  deletePreset: (presetId: string) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const CUSTOM_PRESET_STORAGE_KEY = 'omg_theme_custom_presets_v1';

const isHex = (value: string) => /^#([0-9a-fA-F]{6})$/.test(value);

const buildPresetPreview = (theme: ThemeSettings): string[] => [
  theme.primary,
  theme.secondary,
  theme.accent,
  theme.background,
  theme.layoutGradientEnd,
  theme.success,
];

const sanitizePreview = (preview: unknown, fallback: ThemeSettings): string[] => {
  if (!Array.isArray(preview)) return buildPresetPreview(fallback);

  const cleaned = preview
    .filter((item): item is string => typeof item === 'string')
    .map(color => color.trim().toUpperCase())
    .filter(isHex)
    .slice(0, 8);

  return cleaned.length > 0 ? cleaned : buildPresetPreview(fallback);
};

const loadCustomPresets = (): ThemePreset[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESET_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map((item, index) => {
        const safeTheme = sanitizeTheme(item.theme as Partial<ThemeSettings>);
        const id = typeof item.id === 'string' && item.id.trim() ? item.id : `user-preset-${Date.now()}-${index}`;
        const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : `My Theme ${index + 1}`;
        const description = typeof item.description === 'string' && item.description.trim()
          ? item.description.trim()
          : 'Custom palette saved by user.';

        return {
          id,
          name,
          description,
          preview: sanitizePreview(item.preview, safeTheme),
          theme: {
            ...safeTheme,
            id,
            name,
          },
        } as ThemePreset;
      });
  } catch {
    return [];
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    return loadThemeFromStorage();
  });
  const [customPresets, setCustomPresets] = useState<ThemePreset[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadCustomPresets();
  });

  const presets = useMemo(() => [...customPresets, ...THEME_PRESETS], [customPresets]);

  useEffect(() => {
    applyThemeToDocument(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_PRESET_STORAGE_KEY, JSON.stringify(customPresets));
  }, [customPresets]);

  const updateTheme = useCallback((patch: Partial<ThemeSettings>) => {
    setTheme(prev => sanitizeTheme({ ...prev, ...patch }));
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const matched = presets.find(preset => preset.id === presetId);
    if (!matched) return;
    setTheme((prev) =>
      sanitizeTheme({
        ...prev,
        ...matched.theme,
        id: matched.id,
        name: matched.name,
      }),
    );
  }, [presets]);

  const saveCurrentAsPreset = useCallback((name?: string) => {
    const presetId = `user-preset-${Date.now()}`;
    const presetName = name?.trim() ? name.trim() : `My Theme ${customPresets.length + 1}`;
    const savedTheme = sanitizeTheme({
      ...theme,
      id: presetId,
      name: presetName,
    });

    const preset: ThemePreset = {
      id: presetId,
      name: presetName,
      description: 'Custom palette saved by user.',
      preview: buildPresetPreview(savedTheme),
      theme: savedTheme,
    };

    setCustomPresets(prev => [preset, ...prev]);
    setTheme(savedTheme);
  }, [theme, customPresets.length]);

  const deletePreset = useCallback((presetId: string) => {
    setCustomPresets(prev => prev.filter(preset => preset.id !== presetId));
    setTheme(prev => {
      if (prev.id !== presetId) return prev;
      return sanitizeTheme({ ...prev, id: 'custom-theme', name: 'Custom Theme' });
    });
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      presets,
      updateTheme,
      applyPreset,
      saveCurrentAsPreset,
      deletePreset,
      resetTheme,
    }),
    [theme, presets, updateTheme, applyPreset, saveCurrentAsPreset, deletePreset, resetTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
