export interface ThemeSettings {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  layoutGradientStart: string;
  layoutGradientMid: string;
  layoutGradientEnd: string;
  sidebarGradientStart: string;
  sidebarGradientMid: string;
  sidebarGradientEnd: string;
  topbarGradientStart: string;
  topbarGradientEnd: string;
  overlayGradientStart: string;
  overlayGradientMid: string;
  overlayGradientEnd: string;
  layoutGradientAngle: number;
  sidebarGradientAngle: number;
  topbarGradientAngle: number;
  overlayGradientAngle: number;
  radius: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: string[];
  theme: Partial<ThemeSettings>;
}

type Hsl = {
  h: number;
  s: number;
  l: number;
};

const THEME_STORAGE_KEY = 'omg_theme_settings_v1';

export const DEFAULT_THEME: ThemeSettings = {
  id: 'divine-crimson',
  name: 'Divine Crimson',
  primary: '#E22E26',
  secondary: '#293088',
  accent: '#4F58CA',
  background: '#F6F7FB',
  surface: '#FFFFFF',
  foreground: '#1F2740',
  muted: '#EEF1FA',
  border: '#CCD2E8',
  success: '#1E9C68',
  warning: '#D98C1A',
  layoutGradientStart: '#F5F8FD',
  layoutGradientMid: '#F7F8FF',
  layoutGradientEnd: '#FBF6F4',
  sidebarGradientStart: '#293088',
  sidebarGradientMid: '#353EB0',
  sidebarGradientEnd: '#E22E26',
  topbarGradientStart: '#FFFFFF',
  topbarGradientEnd: '#EEF1FB',
  overlayGradientStart: '#1A256C',
  overlayGradientMid: '#3E3B7E',
  overlayGradientEnd: '#E55C52',
  layoutGradientAngle: 180,
  sidebarGradientAngle: 185,
  topbarGradientAngle: 180,
  overlayGradientAngle: 135,
  radius: 0.75,
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'divine-crimson',
    name: 'Divine Crimson',
    description: 'Ceremonial crimson with royal indigo depth.',
    preview: ['#E22E26', '#293088', '#4F58CA', '#F6F7FB', '#EEF1FA'],
    theme: {},
  },
  {
    id: 'heritage-gold',
    name: 'Heritage Gold',
    description: 'Warm saffron highlights with deep bronze accents.',
    preview: ['#B96911', '#6A4513', '#A8722A', '#FCF8F1', '#F4EBDD'],
    theme: {
      primary: '#B96911',
      secondary: '#6A4513',
      accent: '#A8722A',
      background: '#FCF8F1',
      muted: '#F4EBDD',
      border: '#D7C1A1',
      layoutGradientStart: '#FDF8EF',
      layoutGradientMid: '#FBF5E8',
      layoutGradientEnd: '#F8EED9',
      sidebarGradientStart: '#5D3B10',
      sidebarGradientMid: '#8A5A1A',
      sidebarGradientEnd: '#C47A1D',
      overlayGradientStart: '#5D3B10',
      overlayGradientMid: '#7A4E16',
      overlayGradientEnd: '#BC7C2C',
      radius: 0.85,
    },
  },
  {
    id: 'emerald-sanctum',
    name: 'Emerald Sanctum',
    description: 'Balanced emerald tones for a calm premium workspace.',
    preview: ['#0A8F6A', '#145B4A', '#12977A', '#F2FAF7', '#E5F3ED'],
    theme: {
      primary: '#0A8F6A',
      secondary: '#145B4A',
      accent: '#12977A',
      background: '#F2FAF7',
      muted: '#E5F3ED',
      border: '#B9DACF',
      layoutGradientStart: '#F2FAF7',
      layoutGradientMid: '#EFF8F4',
      layoutGradientEnd: '#E5F3ED',
      sidebarGradientStart: '#114A3D',
      sidebarGradientMid: '#1C705B',
      sidebarGradientEnd: '#16906E',
      overlayGradientStart: '#0F4A3B',
      overlayGradientMid: '#125B49',
      overlayGradientEnd: '#18A27B',
      radius: 0.7,
    },
  },
  {
    id: 'ocean-royal',
    name: 'Ocean Royal',
    description: 'Refined blue palette with clean modern neutrals.',
    preview: ['#0F5FA8', '#0A3C73', '#247BC7', '#F2F7FD', '#E7EEF8'],
    theme: {
      primary: '#0F5FA8',
      secondary: '#0A3C73',
      accent: '#247BC7',
      background: '#F2F7FD',
      muted: '#E7EEF8',
      border: '#BFD0E8',
      layoutGradientStart: '#F2F8FE',
      layoutGradientMid: '#F3F7FC',
      layoutGradientEnd: '#E6EFFA',
      sidebarGradientStart: '#0B355F',
      sidebarGradientMid: '#0E4A85',
      sidebarGradientEnd: '#1E76C1',
      overlayGradientStart: '#072E57',
      overlayGradientMid: '#114981',
      overlayGradientEnd: '#2D83CF',
      radius: 0.65,
    },
  },
  {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    description: 'Coral, bronze, and warm ivory for ceremonial elegance.',
    preview: ['#D94735', '#8A3A2B', '#E08F3C', '#FFF4EC', '#F8D9C4'],
    theme: {
      primary: '#D94735',
      secondary: '#8A3A2B',
      accent: '#E08F3C',
      background: '#FFF4EC',
      muted: '#FBE6D7',
      border: '#EAC4AB',
      layoutGradientStart: '#FFF4EC',
      layoutGradientMid: '#FFEFE5',
      layoutGradientEnd: '#FBE2CF',
      sidebarGradientStart: '#7C3125',
      sidebarGradientMid: '#A5432D',
      sidebarGradientEnd: '#E08F3C',
      topbarGradientStart: '#FFF9F5',
      topbarGradientEnd: '#FCEBDD',
      overlayGradientStart: '#6D2C20',
      overlayGradientMid: '#9A3A2B',
      overlayGradientEnd: '#D27539',
      radius: 0.82,
    },
  },
  {
    id: 'midnight-teal',
    name: 'Midnight Teal',
    description: 'Dark teal profile with premium cool contrast and clarity.',
    preview: ['#0E7A7D', '#0F3F47', '#22A6B3', '#EEF8F9', '#CFEAEC'],
    theme: {
      primary: '#0E7A7D',
      secondary: '#0F3F47',
      accent: '#22A6B3',
      background: '#EEF8F9',
      muted: '#DEEFF1',
      border: '#B7D7DB',
      layoutGradientStart: '#EFF9FA',
      layoutGradientMid: '#E8F4F6',
      layoutGradientEnd: '#DDEDEF',
      sidebarGradientStart: '#0C3034',
      sidebarGradientMid: '#11545A',
      sidebarGradientEnd: '#158287',
      topbarGradientStart: '#F6FCFC',
      topbarGradientEnd: '#E3F0F2',
      overlayGradientStart: '#0B2F35',
      overlayGradientMid: '#11545A',
      overlayGradientEnd: '#1B8F98',
      radius: 0.72,
    },
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    description: 'Regal amethyst with polished slate neutrals.',
    preview: ['#764BA2', '#2F2647', '#A47AD8', '#F5F1FA', '#DDCFF0'],
    theme: {
      primary: '#764BA2',
      secondary: '#2F2647',
      accent: '#A47AD8',
      background: '#F5F1FA',
      muted: '#E8DFF3',
      border: '#CDBDE4',
      layoutGradientStart: '#F6F2FB',
      layoutGradientMid: '#F1EAF8',
      layoutGradientEnd: '#E8DCF4',
      sidebarGradientStart: '#261D3D',
      sidebarGradientMid: '#4B3376',
      sidebarGradientEnd: '#7E56AC',
      topbarGradientStart: '#FBF8FE',
      topbarGradientEnd: '#EFE5F8',
      overlayGradientStart: '#211934',
      overlayGradientMid: '#4A2F76',
      overlayGradientEnd: '#9168C6',
      radius: 0.9,
    },
  },
  {
    id: 'monochrome-steel',
    name: 'Monochrome Steel',
    description: 'Professional grayscale with subtle deep navy accents.',
    preview: ['#3E4A5B', '#1E2836', '#6A7A90', '#F3F5F8', '#D8DEE7'],
    theme: {
      primary: '#3E4A5B',
      secondary: '#1E2836',
      accent: '#6A7A90',
      background: '#F3F5F8',
      muted: '#E6EBF1',
      border: '#CAD3DF',
      layoutGradientStart: '#F5F7FA',
      layoutGradientMid: '#EFF2F7',
      layoutGradientEnd: '#E3E9F1',
      sidebarGradientStart: '#1A2330',
      sidebarGradientMid: '#2A3A4E',
      sidebarGradientEnd: '#4D6077',
      topbarGradientStart: '#FDFEFF',
      topbarGradientEnd: '#E9EEF4',
      overlayGradientStart: '#1A2230',
      overlayGradientMid: '#2F3E53',
      overlayGradientEnd: '#61738A',
      radius: 0.6,
    },
  },
  {
    id: 'sandal-rose',
    name: 'Sandal Rose',
    description: 'Sandalwood neutrals blended with soft rose highlights.',
    preview: ['#A44B59', '#7A3E4A', '#C88379', '#FDF3F1', '#F2DAD6'],
    theme: {
      primary: '#A44B59',
      secondary: '#7A3E4A',
      accent: '#C88379',
      background: '#FDF3F1',
      muted: '#F7E7E3',
      border: '#E3C3BC',
      layoutGradientStart: '#FEF5F3',
      layoutGradientMid: '#FBEDE9',
      layoutGradientEnd: '#F5DDD8',
      sidebarGradientStart: '#6E3540',
      sidebarGradientMid: '#91505B',
      sidebarGradientEnd: '#C17B72',
      topbarGradientStart: '#FFF9F8',
      topbarGradientEnd: '#F7E6E2',
      overlayGradientStart: '#643039',
      overlayGradientMid: '#8F4A55',
      overlayGradientEnd: '#C07A70',
      radius: 0.88,
    },
  },
  {
    id: 'solid-light',
    name: 'Solid Light',
    description: 'Crystal clean workspace with solid surface logic.',
    preview: ['#1F2937', '#64748B', '#94A3B8', '#FFFFFF', '#F8FAFC'],
    theme: {
      primary: '#1F2937',
      secondary: '#64748B',
      accent: '#3B82F6',
      background: '#FFFFFF',
      foreground: '#0F172A',
      surface: '#FFFFFF',
      muted: '#F1F5F9',
      border: '#E2E8F0',
      layoutGradientStart: '#FFFFFF',
      layoutGradientMid: '#FFFFFF',
      layoutGradientEnd: '#FFFFFF',
      sidebarGradientStart: '#0F172A',
      sidebarGradientMid: '#0F172A',
      sidebarGradientEnd: '#0F172A',
      topbarGradientStart: '#FFFFFF',
      topbarGradientEnd: '#FFFFFF',
      overlayGradientStart: '#0F172A',
      overlayGradientMid: '#0F172A',
      overlayGradientEnd: '#0F172A',
    },
  },
  {
    id: 'solid-dark',
    name: 'Solid Dark',
    description: 'Deep carbon surfaces with sharp neon accents.',
    preview: ['#3B82F6', '#0F172A', '#60A5FA', '#020617', '#1E293B'],
    theme: {
      primary: '#3B82F6',
      secondary: '#1E293B',
      accent: '#60A5FA',
      background: '#020617',
      foreground: '#F8FAFC',
      surface: '#0F172A',
      muted: '#1E293B',
      border: '#334155',
      layoutGradientStart: '#020617',
      layoutGradientMid: '#020617',
      layoutGradientEnd: '#020617',
      sidebarGradientStart: '#0F172A',
      sidebarGradientMid: '#0F172A',
      sidebarGradientEnd: '#0F172A',
      topbarGradientStart: '#020617',
      topbarGradientEnd: '#020617',
      overlayGradientStart: '#020617',
      overlayGradientMid: '#020617',
      overlayGradientEnd: '#020617',
    },
  },
  {
    id: 'modern-minimal-light',
    name: 'Modern Minimal (Light)',
    description: 'Soft porcelain layout with intelligent gray depth.',
    preview: ['#E22E26', '#1E293B', '#475569', '#F9FAFB', '#F1F5F9'],
    theme: {
      primary: '#0F172A',
      secondary: '#475569',
      accent: '#94A3B8',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      foreground: '#1F2937',
      muted: '#F8FAFC',
      border: '#F1F5F9',
      layoutGradientStart: '#FFFFFF',
      layoutGradientMid: '#F9FAFB',
      layoutGradientEnd: '#F3F4F6',
      sidebarGradientStart: '#1E293B',
      sidebarGradientMid: '#334155',
      sidebarGradientEnd: '#475569',
      topbarGradientStart: '#FFFFFF',
      topbarGradientEnd: '#F9FAFB',
      overlayGradientStart: '#1E293B',
      overlayGradientMid: '#334155',
      overlayGradientEnd: '#475569',
    },
  },
  {
    id: 'carbon-black-dark',
    name: 'Carbon Black (Dark)',
    description: 'Professional dark suite for focused engineering.',
    preview: ['#FFFFFF', '#09090B', '#27272A', '#000000', '#18181B'],
    theme: {
      primary: '#FFFFFF',
      secondary: '#18181B',
      accent: '#3F3F46',
      background: '#000000',
      surface: '#09090B',
      foreground: '#FAFAFA',
      muted: '#27272A',
      border: '#3F3F46',
      layoutGradientStart: '#09090B',
      layoutGradientMid: '#030712',
      layoutGradientEnd: '#000000',
      sidebarGradientStart: '#09090B',
      sidebarGradientMid: '#000000',
      sidebarGradientEnd: '#18181B',
      topbarGradientStart: '#000000',
      topbarGradientEnd: '#09090B',
      overlayGradientStart: '#09090B',
      overlayGradientMid: '#18181B',
      overlayGradientEnd: '#000000',
    },
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isHexColor = (value: string) => /^#([0-9a-fA-F]{6})$/.test(value);

const normalizeHex = (value: string, fallback: string) => {
  const candidate = value.trim().startsWith('#') ? value.trim() : `#${value.trim()}`;
  return isHexColor(candidate) ? candidate.toUpperCase() : fallback;
};

const hexToRgb = (hex: string) => {
  const clean = normalizeHex(hex, '#000000').slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const rgbToHsl = ({ r, g, b }: { r: number; g: number; b: number }): Hsl => {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rr) {
      h = ((gg - bb) / delta) % 6;
    } else if (max === gg) {
      h = (bb - rr) / delta + 2;
    } else {
      h = (rr - gg) / delta + 4;
    }
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const withShift = (color: Hsl, shift: Partial<Hsl>): Hsl => ({
  h: (color.h + (shift.h ?? 0) + 360) % 360,
  s: clamp(color.s + (shift.s ?? 0), 0, 100),
  l: clamp(color.l + (shift.l ?? 0), 0, 100),
});

const toHslVariable = (color: Hsl) => `${Math.round(color.h)} ${Math.round(color.s)}% ${Math.round(color.l)}%`;

const toHslColor = (color: Hsl) => `hsl(${toHslVariable(color)})`;

const toHslaColor = (color: Hsl, alpha: number) => `hsl(${toHslVariable(color)} / ${clamp(alpha, 0, 1)})`;

const readableForeground = (background: Hsl) => (background.l > 58 ? '222 47% 11%' : '0 0% 100%');

export const sanitizeTheme = (value: Partial<ThemeSettings>): ThemeSettings => ({
  id: value.id || DEFAULT_THEME.id,
  name: value.name || DEFAULT_THEME.name,
  primary: normalizeHex(value.primary ?? DEFAULT_THEME.primary, DEFAULT_THEME.primary),
  secondary: normalizeHex(value.secondary ?? DEFAULT_THEME.secondary, DEFAULT_THEME.secondary),
  accent: normalizeHex(value.accent ?? DEFAULT_THEME.accent, DEFAULT_THEME.accent),
  background: normalizeHex(value.background ?? DEFAULT_THEME.background, DEFAULT_THEME.background),
  surface: normalizeHex(value.surface ?? DEFAULT_THEME.surface, DEFAULT_THEME.surface),
  foreground: normalizeHex(value.foreground ?? DEFAULT_THEME.foreground, DEFAULT_THEME.foreground),
  muted: normalizeHex(value.muted ?? DEFAULT_THEME.muted, DEFAULT_THEME.muted),
  border: normalizeHex(value.border ?? DEFAULT_THEME.border, DEFAULT_THEME.border),
  success: normalizeHex(value.success ?? DEFAULT_THEME.success, DEFAULT_THEME.success),
  warning: normalizeHex(value.warning ?? DEFAULT_THEME.warning, DEFAULT_THEME.warning),
  layoutGradientStart: normalizeHex(value.layoutGradientStart ?? DEFAULT_THEME.layoutGradientStart, DEFAULT_THEME.layoutGradientStart),
  layoutGradientMid: normalizeHex(value.layoutGradientMid ?? DEFAULT_THEME.layoutGradientMid, DEFAULT_THEME.layoutGradientMid),
  layoutGradientEnd: normalizeHex(value.layoutGradientEnd ?? DEFAULT_THEME.layoutGradientEnd, DEFAULT_THEME.layoutGradientEnd),
  sidebarGradientStart: normalizeHex(value.sidebarGradientStart ?? DEFAULT_THEME.sidebarGradientStart, DEFAULT_THEME.sidebarGradientStart),
  sidebarGradientMid: normalizeHex(value.sidebarGradientMid ?? DEFAULT_THEME.sidebarGradientMid, DEFAULT_THEME.sidebarGradientMid),
  sidebarGradientEnd: normalizeHex(value.sidebarGradientEnd ?? DEFAULT_THEME.sidebarGradientEnd, DEFAULT_THEME.sidebarGradientEnd),
  topbarGradientStart: normalizeHex(value.topbarGradientStart ?? DEFAULT_THEME.topbarGradientStart, DEFAULT_THEME.topbarGradientStart),
  topbarGradientEnd: normalizeHex(value.topbarGradientEnd ?? DEFAULT_THEME.topbarGradientEnd, DEFAULT_THEME.topbarGradientEnd),
  overlayGradientStart: normalizeHex(value.overlayGradientStart ?? DEFAULT_THEME.overlayGradientStart, DEFAULT_THEME.overlayGradientStart),
  overlayGradientMid: normalizeHex(value.overlayGradientMid ?? DEFAULT_THEME.overlayGradientMid, DEFAULT_THEME.overlayGradientMid),
  overlayGradientEnd: normalizeHex(value.overlayGradientEnd ?? DEFAULT_THEME.overlayGradientEnd, DEFAULT_THEME.overlayGradientEnd),
  layoutGradientAngle: clamp(Number(value.layoutGradientAngle ?? DEFAULT_THEME.layoutGradientAngle), 0, 360),
  sidebarGradientAngle: clamp(Number(value.sidebarGradientAngle ?? DEFAULT_THEME.sidebarGradientAngle), 0, 360),
  topbarGradientAngle: clamp(Number(value.topbarGradientAngle ?? DEFAULT_THEME.topbarGradientAngle), 0, 360),
  overlayGradientAngle: clamp(Number(value.overlayGradientAngle ?? DEFAULT_THEME.overlayGradientAngle), 0, 360),
  radius: clamp(Number(value.radius ?? DEFAULT_THEME.radius), 0.4, 1.4),
});

export const persistTheme = (theme: ThemeSettings) => {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
};

export const loadThemeFromStorage = (): ThemeSettings => {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const parsed = JSON.parse(raw) as Partial<ThemeSettings>;
    return sanitizeTheme(parsed);
  } catch {
    return DEFAULT_THEME;
  }
};

export const applyThemeToDocument = (theme: ThemeSettings, root: HTMLElement = document.documentElement) => {
  const safeTheme = sanitizeTheme(theme);
  const primary = rgbToHsl(hexToRgb(safeTheme.primary));
  const secondary = rgbToHsl(hexToRgb(safeTheme.secondary));
  const accent = rgbToHsl(hexToRgb(safeTheme.accent));
  const background = rgbToHsl(hexToRgb(safeTheme.background));
  const surface = rgbToHsl(hexToRgb(safeTheme.surface));
  const foreground = rgbToHsl(hexToRgb(safeTheme.foreground));
  const muted = rgbToHsl(hexToRgb(safeTheme.muted));
  const border = rgbToHsl(hexToRgb(safeTheme.border));
  const success = rgbToHsl(hexToRgb(safeTheme.success));
  const warning = rgbToHsl(hexToRgb(safeTheme.warning));
  const input = withShift(border, { l: 4, s: -4 });

  root.style.setProperty('--background', toHslVariable(background));
  root.style.setProperty('--foreground', toHslVariable(foreground));

  root.style.setProperty('--card', toHslVariable(surface));
  root.style.setProperty('--card-foreground', toHslVariable(foreground));

  root.style.setProperty('--popover', toHslVariable(surface));
  root.style.setProperty('--popover-foreground', toHslVariable(foreground));

  root.style.setProperty('--primary', toHslVariable(primary));
  root.style.setProperty('--primary-foreground', readableForeground(primary));

  root.style.setProperty('--secondary', toHslVariable(secondary));
  root.style.setProperty('--secondary-foreground', readableForeground(secondary));

  root.style.setProperty('--muted', toHslVariable(muted));
  root.style.setProperty('--muted-foreground', toHslVariable(withShift(foreground, { s: -14, l: 22 })));

  root.style.setProperty('--accent', toHslVariable(accent));
  root.style.setProperty('--accent-foreground', readableForeground(accent));

  root.style.setProperty('--border', toHslVariable(border));
  root.style.setProperty('--input', toHslVariable(input));
  root.style.setProperty('--ring', toHslVariable(primary));
  root.style.setProperty('--radius', `${safeTheme.radius.toFixed(2)}rem`);

  const sidebarBase = withShift(secondary, { l: -6, s: 4 });
  root.style.setProperty('--sidebar-background', toHslVariable(sidebarBase));
  root.style.setProperty('--sidebar-foreground', '0 0% 100%');
  root.style.setProperty('--sidebar-primary', toHslVariable(primary));
  root.style.setProperty('--sidebar-primary-foreground', readableForeground(primary));
  root.style.setProperty('--sidebar-accent', toHslVariable(withShift(sidebarBase, { l: -7 })));
  root.style.setProperty('--sidebar-accent-foreground', '0 0% 100%');
  root.style.setProperty('--sidebar-border', toHslVariable(withShift(sidebarBase, { l: -10, s: -6 })));
  root.style.setProperty('--sidebar-ring', toHslVariable(primary));

  root.style.setProperty('--success', toHslVariable(success));
  root.style.setProperty('--warning', toHslVariable(warning));

  root.style.setProperty('--brand-primary', safeTheme.primary);
  root.style.setProperty('--brand-secondary', safeTheme.secondary);
  root.style.setProperty('--brand-blue-50', toHslColor(withShift(secondary, { s: -20, l: 58 })));
  root.style.setProperty('--brand-blue-100', toHslColor(withShift(secondary, { s: -16, l: 46 })));
  root.style.setProperty('--brand-blue-200', toHslColor(withShift(secondary, { s: -10, l: 34 })));
  root.style.setProperty('--brand-blue-300', toHslColor(withShift(secondary, { s: -4, l: 22 })));
  root.style.setProperty('--brand-blue-400', toHslColor(withShift(secondary, { l: 12 })));
  root.style.setProperty('--brand-blue-500', toHslColor(withShift(secondary, { l: 6 })));
  root.style.setProperty('--brand-blue-600', toHslColor(withShift(secondary, { l: -2 })));
  root.style.setProperty('--brand-red-100', toHslColor(withShift(primary, { s: -22, l: 46 })));
  root.style.setProperty('--brand-red-200', toHslColor(withShift(primary, { s: -18, l: 36 })));
  root.style.setProperty('--brand-red-300', toHslColor(withShift(primary, { s: -12, l: 24 })));
  root.style.setProperty('--brand-red-400', toHslColor(withShift(primary, { s: -8, l: 12 })));
  root.style.setProperty('--brand-red-500', toHslColor(withShift(primary, { l: 4 })));
  root.style.setProperty('--brand-red-600', toHslColor(withShift(primary, { l: -6 })));

  root.style.setProperty('--layout-bg-start', safeTheme.layoutGradientStart);
  root.style.setProperty('--layout-bg-mid', safeTheme.layoutGradientMid);
  root.style.setProperty('--layout-bg-end', safeTheme.layoutGradientEnd);
  root.style.setProperty('--layout-gradient-angle', `${safeTheme.layoutGradientAngle}deg`);

  root.style.setProperty('--topbar-bg-start', safeTheme.topbarGradientStart);
  root.style.setProperty('--topbar-bg-end', safeTheme.topbarGradientEnd);
  root.style.setProperty('--topbar-gradient-angle', `${safeTheme.topbarGradientAngle}deg`);
  root.style.setProperty('--topbar-border', toHslColor(withShift(secondary, { s: -14, l: 38 })));
  root.style.setProperty('--topbar-shadow', toHslaColor(withShift(secondary, { s: -8, l: -10 }), 0.52));
  root.style.setProperty('--topbar-title', toHslColor(withShift(secondary, { l: 3 })));
  root.style.setProperty('--topbar-subtitle', toHslColor(withShift(secondary, { s: -8, l: 24 })));
  root.style.setProperty('--topbar-icon', toHslColor(withShift(accent, { s: -8, l: 8 })));

  root.style.setProperty('--sidebar-gradient-start', safeTheme.sidebarGradientStart);
  root.style.setProperty('--sidebar-gradient-mid', safeTheme.sidebarGradientMid);
  root.style.setProperty('--sidebar-gradient-end', safeTheme.sidebarGradientEnd);
  root.style.setProperty('--sidebar-gradient-angle', `${safeTheme.sidebarGradientAngle}deg`);
  root.style.setProperty('--sidebar-glow-a', toHslaColor(withShift(secondary, { s: -12, l: 28 }), 0.27));
  root.style.setProperty('--sidebar-glow-b', toHslaColor(withShift(primary, { s: -8, l: 22 }), 0.25));
  root.style.setProperty('--sidebar-highlight', toHslColor(withShift(accent, { l: 26, s: -18 })));
  root.style.setProperty('--sidebar-highlight-soft', toHslColor(withShift(accent, { l: 36, s: -24 })));
  root.style.setProperty('--sidebar-avatar-mid', toHslColor(withShift(secondary, { l: 14 })));

  root.style.setProperty('--theme-overlay-start', safeTheme.overlayGradientStart);
  root.style.setProperty('--theme-overlay-mid', safeTheme.overlayGradientMid);
  root.style.setProperty('--theme-overlay-end', safeTheme.overlayGradientEnd);
  root.style.setProperty('--overlay-gradient-angle', `${safeTheme.overlayGradientAngle}deg`);

  root.style.setProperty('--chart-accent-a', toHslColor(withShift(secondary, { l: -2 })));
  root.style.setProperty('--chart-accent-b', toHslColor(withShift(primary, { l: 2 })));
  root.style.setProperty('--chart-accent-c', toHslColor(withShift(accent, { l: 0 })));
  root.style.setProperty('--chart-accent-d', toHslColor(withShift(primary, { h: 16, s: -5, l: 8 })));
  root.style.setProperty('--chart-grid', toHslColor(withShift(border, { l: 8, s: -8 })));
  root.style.setProperty('--chart-cursor', toHslColor(withShift(muted, { l: 2 })));
};
