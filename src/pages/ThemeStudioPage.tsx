import React from 'react';
import { Check, Palette, RotateCcw, Save, SlidersHorizontal, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSettings } from '@/lib/theme';

type ColorField = keyof Pick<
  ThemeSettings,
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'foreground'
  | 'background'
  | 'surface'
  | 'muted'
  | 'border'
  | 'success'
  | 'warning'
  | 'layoutGradientStart'
  | 'layoutGradientMid'
  | 'layoutGradientEnd'
  | 'sidebarGradientStart'
  | 'sidebarGradientMid'
  | 'sidebarGradientEnd'
  | 'topbarGradientStart'
  | 'topbarGradientEnd'
  | 'overlayGradientStart'
  | 'overlayGradientMid'
  | 'overlayGradientEnd'
>;

type AngleField = keyof Pick<
  ThemeSettings,
  'layoutGradientAngle' | 'sidebarGradientAngle' | 'topbarGradientAngle' | 'overlayGradientAngle'
>;

const coreColorControls: Array<{ key: ColorField; label: string; description: string }> = [
  { key: 'primary', label: 'Primary Brand', description: 'Buttons, highlights, and action accents.' },
  { key: 'secondary', label: 'Secondary Brand', description: 'Sidebar, structure surfaces, and top accents.' },
  { key: 'accent', label: 'Accent Color', description: 'Tags, indicators, and secondary highlights.' },
  { key: 'foreground', label: 'Main Text', description: 'Global typography color throughout the app.' },
  { key: 'background', label: 'Application Background', description: 'Main page canvas and neutral layout tone.' },
  { key: 'surface', label: 'Card Surface', description: 'Cards, popovers, and elevated surfaces.' },
  { key: 'muted', label: 'Muted Surface', description: 'Subtle backgrounds, chips, and neutral blocks.' },
  { key: 'border', label: 'Border Color', description: 'Input and panel border color system.' },
  { key: 'success', label: 'Success Color', description: 'Success labels and positive status indicators.' },
  { key: 'warning', label: 'Warning Color', description: 'Warning badges and caution highlights.' },
];

const gradientColorControls: Array<{ key: ColorField; label: string; description: string }> = [
  { key: 'layoutGradientStart', label: 'Layout Gradient Start', description: 'Main workspace background start color.' },
  { key: 'layoutGradientMid', label: 'Layout Gradient Mid', description: 'Main workspace background middle color.' },
  { key: 'layoutGradientEnd', label: 'Layout Gradient End', description: 'Main workspace background end color.' },
  { key: 'sidebarGradientStart', label: 'Sidebar Gradient Start', description: 'Sidebar header/depth start color.' },
  { key: 'sidebarGradientMid', label: 'Sidebar Gradient Mid', description: 'Sidebar center blending tone.' },
  { key: 'sidebarGradientEnd', label: 'Sidebar Gradient End', description: 'Sidebar destination color.' },
  { key: 'topbarGradientStart', label: 'Topbar Gradient Start', description: 'Top navigation start color.' },
  { key: 'topbarGradientEnd', label: 'Topbar Gradient End', description: 'Top navigation end color.' },
  { key: 'overlayGradientStart', label: 'Overlay Gradient Start', description: 'Login media overlay start.' },
  { key: 'overlayGradientMid', label: 'Overlay Gradient Mid', description: 'Login media overlay center.' },
  { key: 'overlayGradientEnd', label: 'Overlay Gradient End', description: 'Login media overlay destination.' },
];

const angleControls: Array<{ key: AngleField; label: string; description: string }> = [
  { key: 'layoutGradientAngle', label: 'Layout Gradient Angle', description: 'Direction of the main workspace gradient.' },
  { key: 'sidebarGradientAngle', label: 'Sidebar Gradient Angle', description: 'Direction of the sidebar premium gradient.' },
  { key: 'topbarGradientAngle', label: 'Topbar Gradient Angle', description: 'Direction of the top navigation gradient.' },
  { key: 'overlayGradientAngle', label: 'Overlay Gradient Angle', description: 'Direction of login image overlay gradient.' },
];

const ThemeStudioPage: React.FC = () => {
  const { theme, presets, updateTheme, applyPreset, saveCurrentAsPreset, deletePreset, resetTheme } = useTheme();
  const [presetName, setPresetName] = React.useState('');

  const applyCustomPatch = (patch: Partial<ThemeSettings>) => {
    updateTheme({
      ...patch,
      id: 'custom-theme',
      name: 'Custom Theme',
    });
  };

  const handleColorChange = (field: ColorField, value: string) => {
    applyCustomPatch({ [field]: value });
  };

  const handleRadiusChange = (value: number[]) => {
    const radius = Number(value[0]?.toFixed(2) || theme.radius);
    applyCustomPatch({ radius });
  };

  const handleAngleChange = (field: AngleField, value: number[]) => {
    const angle = Math.round(value[0] ?? (theme[field] as number));
    applyCustomPatch({ [field]: angle });
  };

  const isPresetActive = (presetId: string) => theme.id === presetId;

  const isUserPreset = (presetId: string) => presetId.startsWith('user-preset-');

  const handleSavePreset = () => {
    saveCurrentAsPreset(presetName);
    setPresetName('');
  };

  return (
    <div className="theme-studio-page space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <section className="theme-studio-hero rounded-2xl border border-border px-6 py-6 sm:px-8 sm:py-8 relative overflow-hidden">
        <div className="theme-studio-hero-orb absolute -top-16 -left-10 h-44 w-44 rounded-full" />
        <div className="theme-studio-hero-orb absolute -bottom-20 right-12 h-48 w-48 rounded-full" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-white/75">Design Control</p>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Palette className="h-6 w-6" />
              Theme Studio
            </h1>
            <p className="mt-2 text-sm text-white/80 max-w-2xl">
              Craft your workspace identity with premium palette controls. Changes apply instantly across the app and are saved automatically on this device.
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/70">Current Theme</p>
            <p className="text-sm font-semibold text-white mt-1">{theme.name}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Premium Presets
              </CardTitle>
              <CardDescription>
                Start with a curated visual direction, then fine-tune every tone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-xl border border-border/70 bg-background/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">Save Current Colors To Premium Presets</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={presetName}
                    onChange={(event) => setPresetName(event.target.value)}
                    placeholder="Enter preset name (optional)"
                    className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button type="button" className="h-10 sm:w-auto w-full" onClick={handleSavePreset}>
                    <Save className="h-4 w-4 mr-2" />
                    Save As Preset
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className={`group relative rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-[1px] ${
                      isPresetActive(preset.id)
                        ? 'border-primary/60 bg-primary/5 shadow-[0_14px_30px_-22px_hsl(var(--primary))]'
                        : 'border-border bg-card hover:border-primary/35 hover:bg-primary/[0.04]'
                    }`}
                  >
                    {isUserPreset(preset.id) && (
                      <button
                        type="button"
                        onClick={() => deletePreset(preset.id)}
                        className="absolute right-3 top-3 h-7 w-7 rounded-md border border-border bg-background text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors flex items-center justify-center"
                        aria-label={`Delete ${preset.name}`}
                        title="Delete custom preset"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{preset.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                      </div>
                      {isPresetActive(preset.id) && (
                        <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {preset.preview.map((color) => (
                        <span key={color} className="h-6 w-6 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant={isPresetActive(preset.id) ? 'default' : 'outline'}
                      className="mt-4 h-9 w-full"
                      onClick={() => applyPreset(preset.id)}
                    >
                      {isPresetActive(preset.id) ? 'Applied' : 'Apply Preset'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Manual Theme Controls
              </CardTitle>
              <CardDescription>
                Tune full system palette, gradients, and geometry for complete website control.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Core Colors</p>
                <div className="space-y-3">
                  {coreColorControls.map((control) => (
                    <div key={control.key} className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{control.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{control.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={theme[control.key] as string}
                            onChange={(event) => handleColorChange(control.key, event.target.value)}
                            className="h-11 w-14 rounded-lg border border-border bg-transparent cursor-pointer"
                            aria-label={control.label}
                          />
                          <span className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground min-w-[84px] text-right">
                            {theme[control.key] as string}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Gradient Colors</p>
                <div className="space-y-3">
                  {gradientColorControls.map((control) => (
                    <div key={control.key} className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{control.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{control.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={theme[control.key] as string}
                            onChange={(event) => handleColorChange(control.key, event.target.value)}
                            className="h-11 w-14 rounded-lg border border-border bg-transparent cursor-pointer"
                            aria-label={control.label}
                          />
                          <span className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground min-w-[84px] text-right">
                            {theme[control.key] as string}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Gradient Direction</p>
                <div className="space-y-4">
                  {angleControls.map((control) => (
                    <div key={control.key} className="rounded-xl border border-border/70 bg-background/70 px-4 py-4">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{control.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{control.description}</p>
                        </div>
                        <span className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                          {theme[control.key] as number} deg
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={360}
                        step={1}
                        value={[theme[control.key] as number]}
                        onValueChange={(value) => handleAngleChange(control.key, value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Corner Radius</p>
                    <p className="text-xs text-muted-foreground mt-1">Controls card, input, and button curvature across the app.</p>
                  </div>
                  <span className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">{theme.radius.toFixed(2)} rem</span>
                </div>
                <Slider min={0.4} max={1.4} step={0.05} value={[theme.radius]} onValueChange={handleRadiusChange} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <p className="text-xs text-muted-foreground">All changes are instant, applied globally, and saved in local storage for this browser.</p>
                <Button type="button" variant="outline" onClick={resetTheme} className="sm:w-auto w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <Card className="border-border/80 shadow-sm sticky top-20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Live Preview</CardTitle>
              <CardDescription>Preview how your current theme feels in the real interface context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border overflow-hidden bg-background shadow-[0_20px_38px_-30px_rgba(0,0,0,0.5)]">
                <div
                  className="h-11 border-b px-3 flex items-center justify-between"
                  style={{
                    backgroundImage: 'linear-gradient(var(--topbar-gradient-angle, 180deg), var(--topbar-bg-start, #FFFFFF), var(--topbar-bg-end, #EEF1FB)), linear-gradient(120deg, hsl(var(--primary) / 0.14), hsl(var(--secondary) / 0.1))',
                    borderColor: 'var(--topbar-border, hsl(var(--border)))',
                    boxShadow: 'inset 0 -1px 0 hsl(var(--border) / 0.35)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'hsl(var(--primary))' }} />
                    <span className="h-2 w-16 rounded-full" style={{ background: 'var(--topbar-title, hsl(var(--secondary)))', opacity: 0.75 }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-10 rounded-full" style={{ background: 'var(--topbar-subtitle, hsl(var(--muted-foreground)))', opacity: 0.75 }} />
                    <span className="h-6 w-6 rounded-full" style={{ background: 'linear-gradient(135deg, var(--sidebar-gradient-start), var(--sidebar-gradient-end))' }} />
                  </div>
                </div>
                <div className="flex">
                  <div className="w-20 p-2" style={{ background: 'linear-gradient(var(--sidebar-gradient-angle), var(--sidebar-gradient-start), var(--sidebar-gradient-end))' }}>
                    <div className="h-2.5 rounded-full bg-white/65 mb-2" />
                    <div className="h-2.5 rounded-full bg-white/45 mb-2" />
                    <div className="h-2.5 rounded-full bg-white/35" />
                  </div>
                  <div className="flex-1 p-3 space-y-2.5" style={{ background: 'linear-gradient(var(--layout-gradient-angle), var(--layout-bg-start), var(--layout-bg-mid), var(--layout-bg-end))' }}>
                    <div className="h-7 rounded-md border border-border bg-card" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 rounded-md border border-border bg-card" />
                      <div className="h-12 rounded-md border border-border bg-card" />
                    </div>
                    <div className="h-16 rounded-md border border-border bg-card" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">Component Tone Check</p>
                <div className="flex flex-wrap gap-2">
                  <Button className="h-9">Primary Action</Button>
                  <Button variant="secondary" className="h-9">Secondary</Button>
                  <Button variant="outline" className="h-9">Outline</Button>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Typography, gradients, states, and surfaces are now synced from your custom palette.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThemeStudioPage;
