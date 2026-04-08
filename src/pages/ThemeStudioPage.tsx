import React from 'react';
import { Layers, Palette, RotateCcw, Sparkles, Layout, Columns, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/contexts/ThemeContext';
import { CardStyle, ChromeStyle, ContentWidth, LayoutDensity, MotionPreset, SidebarPosition, ThemeSettings } from '@/lib/theme';

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

const layoutDensityOptions: Array<{ value: LayoutDensity; label: string; hint: string }> = [
  { value: 'comfortable', label: 'Comfortable', hint: 'Balanced spacing for daily operations.' },
  { value: 'compact', label: 'Compact', hint: 'Denser layout for high-volume data work.' },
];

const contentWidthOptions: Array<{ value: ContentWidth; label: string; hint: string }> = [
  { value: 'fluid', label: 'Fluid', hint: 'Stretch to full available width.' },
  { value: 'wide', label: 'Wide', hint: 'Professional wide canvas with margins.' },
  { value: 'contained', label: 'Contained', hint: 'Focused reading and cleaner rhythm.' },
];

const sidebarPositionOptions: Array<{ value: SidebarPosition; label: string; hint: string }> = [
  { value: 'left', label: 'Sidebar Left', hint: 'Classic enterprise navigation placement.' },
  { value: 'right', label: 'Sidebar Right', hint: 'Right-oriented workspace for alternate flow.' },
  { value: 'bottom', label: 'Sidebar Bottom', hint: 'Dock navigation with tooltip-style quick actions.' },
];

const chromeStyleOptions: Array<{ value: ChromeStyle; label: string; hint: string }> = [
  { value: 'gradient', label: 'Gradient', hint: 'Signature brand gradients for premium depth.' },
  { value: 'glass', label: 'Glass', hint: 'Frosted shell with modern executive tone.' },
  { value: 'solid', label: 'Solid', hint: 'Crisp structural chrome with minimal noise.' },
];

const cardStyleOptions: Array<{ value: CardStyle; label: string; hint: string }> = [
  { value: 'elevated', label: 'Elevated', hint: 'Soft shadows and layered hierarchy.' },
  { value: 'glass', label: 'Glass', hint: 'Translucent cards with blur and depth.' },
  { value: 'minimal', label: 'Minimal', hint: 'Thin borders and restrained elevation.' },
];

const motionPresetOptions: Array<{ value: MotionPreset; label: string; hint: string }> = [
  { value: 'fluid', label: 'Fluid Motion', hint: 'Smooth transitions and animated interactions.' },
  { value: 'reduced', label: 'Reduced Motion', hint: 'Low-motion mode for focus and accessibility.' },
];

const ThemeStudioPage: React.FC = () => {
  const { theme, presets, updateTheme, applyPreset, saveCurrentAsPreset, resetTheme } = useTheme();
  const [presetName, setPresetName] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('palette');

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

  const handleLayoutDensityChange = (layoutDensity: LayoutDensity) => {
    applyCustomPatch({ layoutDensity });
  };

  const handleContentWidthChange = (contentWidth: ContentWidth) => {
    applyCustomPatch({ contentWidth });
  };

  const handleSidebarPositionChange = (sidebarPosition: SidebarPosition) => {
    applyCustomPatch({ sidebarPosition });
  };

  const handleChromeStyleChange = (chromeStyle: ChromeStyle) => {
    applyCustomPatch({ chromeStyle });
  };

  const handleCardStyleChange = (cardStyle: CardStyle) => {
    applyCustomPatch({ cardStyle });
  };

  const handleMotionPresetChange = (motionPreset: MotionPreset) => {
    applyCustomPatch({ motionPreset });
  };

  const handleSidebarDefaultChange = () => {
    applyCustomPatch({ sidebarCollapsedByDefault: !theme.sidebarCollapsedByDefault });
  };

  const handlePagePaddingChange = (value: number[]) => {
    const pagePadding = Number(value[0]?.toFixed(2) || theme.pagePadding);
    applyCustomPatch({ pagePadding });
  };

  const handleTopbarHeightChange = (value: number[]) => {
    const topbarHeight = Math.round(value[0] ?? theme.topbarHeight);
    applyCustomPatch({ topbarHeight });
  };

  const handleSidebarWidthChange = (value: number[]) => {
    const sidebarExpandedWidth = Math.round(value[0] ?? theme.sidebarExpandedWidth);
    applyCustomPatch({ sidebarExpandedWidth });
  };

  const isPresetActive = (presetId: string) => theme.id === presetId;

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    saveCurrentAsPreset(presetName);
    setPresetName('');
  };

  const applySolidColor = (hex: string, name: string) => {
    const color = hex;
    updateTheme({
      name: `Solid ${name}`,
      primary: color,
      secondary: color,
      accent: color,
      layoutGradientStart: '#FFFFFF',
      layoutGradientMid: '#FFFFFF',
      layoutGradientEnd: '#FFFFFF',
      sidebarGradientStart: color,
      sidebarGradientMid: color,
      sidebarGradientEnd: color,
      topbarGradientStart: '#FFFFFF',
      topbarGradientEnd: '#FFFFFF',
      overlayGradientStart: color,
      overlayGradientMid: color,
      overlayGradientEnd: color,
    });
  };

  const solidColors = [
    { name: 'Navy', hex: '#1E3A8A' },
    { name: 'Emerald', hex: '#065F46' },
    { name: 'Crimson', hex: '#991B1B' },
    { name: 'Slate', hex: '#334155' },
    { name: 'Indigo', hex: '#3730A3' },
    { name: 'Obsidian', hex: '#09090B' },
    { name: 'Deep Sea', hex: '#0C4A6E' },
    { name: 'Forest', hex: '#114232' },
    { name: 'Midnight', hex: '#020617' },
    { name: 'Deep Purple', hex: '#4C1D95' },
    { name: 'Charcoal', hex: '#374151' },
    { name: 'Ruby', hex: '#881337' },
    { name: 'Graphite', hex: '#1F2937' },
    { name: 'Maroon', hex: '#450A0A' },
    { name: 'Espresso', hex: '#18181B' },
    { name: 'Royal', hex: '#1E40AF' },
    { name: 'Vibrant Teal', hex: '#0D9488' },
    { name: 'Electric Violet', hex: '#7C3AED' },
    { name: 'Rosewood', hex: '#9F1239' },
    { name: 'Dark Amber', hex: '#78350F' },
    { name: 'Oxide', hex: '#27272A' },
  ];

  return (
    <div className="theme-studio-v2 h-[calc(100vh-var(--layout-topbar-height))] flex flex-col animate-fade-in overflow-hidden -m-6">
      <header className="px-8 py-6 border-b bg-background/80 backdrop-blur-xl z-30 border-border/40 shadow-sm shrink-0">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <nav className="flex items-center gap-2 mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">
              <span>Studio</span>
              <span className="opacity-30">/</span>
              <span className="text-primary font-black">Architecture</span>
            </nav>
            <h1 className="text-2xl font-black tracking-tighter text-foreground flex items-center gap-3">
              Theme Studio
              <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase text-primary tracking-widest leading-none">V2.0</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-muted/20 border border-border/40 p-1.5 rounded-2xl">
              <Button variant="ghost" size="sm" onClick={() => applyPreset('solid-light')} className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-background">Light</Button>
              <Button variant="ghost" size="sm" onClick={() => applyPreset('solid-dark')} className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-background">Dark</Button>
            </div>
            <div className="px-5 py-2.5 rounded-xl border border-border/60 bg-card/50 shadow-sm flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[11px] font-black text-foreground/80 uppercase tracking-tight"><span className="opacity-40">Active:</span> {theme.name}</p>
            </div>
            <Button variant="outline" onClick={resetTheme} className="h-11 rounded-2xl px-6 text-[10px] font-black uppercase tracking-[0.2em] border-border/60 hover:bg-destructive hover:text-white transition-all">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden grid grid-cols-1 xl:grid-cols-12 bg-muted/5">
        <div className="xl:col-span-4 h-full overflow-y-auto border-r border-border/40 bg-background/40 backdrop-blur-sm p-10 space-y-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-card/40 backdrop-blur-md rounded-[1rem] border border-border/60 p-2 mb-10 shadow-sm">
              <TabsList className="h-14 w-full bg-transparent grid grid-cols-5 gap-1 p-0">
                <TabsTrigger value="palette" className="rounded-[1rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary border-none">
                  <Palette className="h-4 w-4" /> Palette
                </TabsTrigger>
                <TabsTrigger value="gradients" className="rounded-[1rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-indigo-500 border-none">
                  <Layers className="h-4 w-4" /> Gradients
                </TabsTrigger>
                <TabsTrigger value="presets" className="rounded-[1rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-amber-500 border-none">
                  <Sparkles className="h-4 w-4" /> Templates
                </TabsTrigger>
                <TabsTrigger value="solid-spectrum" className="rounded-[1rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-emerald-500 border-none">
                  <Layout className="h-4 w-4" /> Solid
                </TabsTrigger>
                <TabsTrigger value="layout-system" className="rounded-[1rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-sky-600 border-none">
                  <SlidersHorizontal className="h-4 w-4" /> Layout
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="palette" className="space-y-10">
              <section className="bg-background rounded-[1rem] border border-border/40 p-8 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 px-1">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">Core Identity</h3>
                    <p className="text-[10px] text-muted-foreground/50 font-bold uppercase">Base channel governance</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {coreColorControls.map((control) => (
                    <div key={control.key} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/30 hover:border-primary/20 transition-all">
                      <div className="min-w-0 pr-4">
                        <p className="text-[11px] font-black text-foreground/90 uppercase">{control.label}</p>
                        <p className="text-[9px] text-muted-foreground/60 font-bold mt-0.5">{control.description}</p>
                      </div>
                      <div className="relative h-10 w-10 rounded-xl border border-border shadow-sm overflow-hidden" style={{ backgroundColor: String(theme[control.key]) }}>
                        <input type="color" value={String(theme[control.key])} onChange={(e) => handleColorChange(control.key, e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="bg-background rounded-[1rem] border border-border/40 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 px-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Geometry Curve</h3>
                  <span className="text-[10px] font-black bg-muted px-2 py-1 rounded-md">{theme.radius.toFixed(2)} REM</span>
                </div>
                <Slider min={0.4} max={1.4} step={0.05} value={[theme.radius]} onValueChange={handleRadiusChange} />
              </section>
            </TabsContent>

            <TabsContent value="gradients" className="space-y-10">
              <section className="bg-background rounded-[1rem] border border-border/40 p-8 shadow-sm">
                <div className="mb-8 px-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Spectral Nodes</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {gradientColorControls.map((control) => (
                    <div key={control.key} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/30 hover:border-indigo-500/20 transition-all">
                      <p className="text-[11px] font-black text-foreground/90 uppercase">{control.label}</p>
                      <div className="relative h-10 w-10 rounded-xl border border-border shadow-sm overflow-hidden" style={{ backgroundColor: String(theme[control.key]) }}>
                        <input type="color" value={String(theme[control.key])} onChange={(e) => handleColorChange(control.key, e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="bg-background rounded-[1rem] border border-border/40 p-8 shadow-sm space-y-8">
                {angleControls.map((control) => (
                  <div key={control.key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{control.label}</p>
                      <code className="text-[10px] font-black text-indigo-500">{theme[control.key]}°</code>
                    </div>
                    <Slider min={0} max={360} step={1} value={[theme[control.key]]} onValueChange={(v) => handleAngleChange(control.key, v)} />
                  </div>
                ))}
              </section>
            </TabsContent>

            <TabsContent value="presets" className="space-y-10">
              <section className="bg-background rounded-[1rem] border border-border/40 p-8 shadow-sm space-y-6">
                <input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Theme ID..." className="h-14 w-full rounded-2xl border border-border bg-card px-5 text-xs font-black" />
                <Button className="h-14 w-full rounded-2xl font-black text-[10px] uppercase shadow-lg text-white" onClick={handleSavePreset}>Snapshot Identity</Button>
              </section>
              <div className="grid grid-cols-1 gap-4">
                {presets.map((preset) => (
                  <div key={preset.id} className={`p-6 rounded-[1rem] border transition-all ${isPresetActive(preset.id) ? 'border-primary/30 bg-primary/[0.03]' : 'border-border/60 bg-background hover:border-amber-500/30'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-black uppercase tracking-widest">{preset.name}</p>
                      {!isPresetActive(preset.id) && <Button variant="ghost" size="sm" onClick={() => applyPreset(preset.id)} className="h-10 rounded-xl px-4 text-[10px] font-black uppercase">Apply</Button>}
                    </div>
                    <div className="flex gap-1">
                      {preset.preview.map((c, i) => <div key={`${preset.id}-${c}-${i}`} className="h-6 w-full rounded-lg border border-white/10" style={{ backgroundColor: c }} />)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="solid-spectrum" className="space-y-10">
              <section className="bg-background rounded-[1rem] border border-border/40 p-8 shadow-sm">
                <div className="grid grid-cols-2 gap-3">
                  {solidColors.map((color) => (
                    <button key={color.hex} onClick={() => applySolidColor(color.hex, color.name)} className={`p-4 rounded-[1.8rem] border-2 transition-all flex items-center gap-3 ${theme.primary === color.hex ? 'border-emerald-500 bg-emerald-500/[0.03]' : 'border-border/40 hover:border-emerald-500/40'}`}>
                      <div className="h-8 w-8 rounded-xl shadow-lg border border-white/20" style={{ backgroundColor: color.hex }} />
                      <p className="text-[10px] font-black uppercase tracking-widest">{color.name}</p>
                    </button>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="layout-system" className="space-y-10">
              <section className="bg-background rounded-[1rem] border border-border/40 p-8 shadow-sm space-y-8">
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Workspace Architecture</h3>
                  <p className="text-[10px] text-muted-foreground/60 font-bold uppercase">Structural controls for premium layout behavior</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Density</p>
                  <div className="grid grid-cols-1 gap-2">
                    {layoutDensityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleLayoutDensityChange(option.value)}
                        className={`text-left rounded-2xl border px-4 py-3 transition-all ${theme.layoutDensity === option.value ? 'border-primary/40 bg-primary/[0.06]' : 'border-border/50 hover:border-primary/25 bg-card'}`}
                      >
                        <p className="text-[11px] font-black uppercase text-foreground">{option.label}</p>
                        <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Content Width</p>
                  <div className="grid grid-cols-1 gap-2">
                    {contentWidthOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleContentWidthChange(option.value)}
                        className={`text-left rounded-2xl border px-4 py-3 transition-all ${theme.contentWidth === option.value ? 'border-sky-500/40 bg-sky-500/[0.05]' : 'border-border/50 hover:border-sky-500/30 bg-card'}`}
                      >
                        <p className="text-[11px] font-black uppercase text-foreground">{option.label}</p>
                        <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sidebar Position</p>
                  <div className="grid grid-cols-1 gap-2">
                    {sidebarPositionOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSidebarPositionChange(option.value)}
                        className={`text-left rounded-2xl border px-4 py-3 transition-all ${theme.sidebarPosition === option.value ? 'border-fuchsia-500/40 bg-fuchsia-500/[0.05]' : 'border-border/50 hover:border-fuchsia-500/25 bg-card'}`}
                      >
                        <p className="text-[11px] font-black uppercase text-foreground">{option.label}</p>
                        <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Navigation Chrome</p>
                  <div className="grid grid-cols-1 gap-2">
                    {chromeStyleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChromeStyleChange(option.value)}
                        className={`text-left rounded-2xl border px-4 py-3 transition-all ${theme.chromeStyle === option.value ? 'border-indigo-500/40 bg-indigo-500/[0.05]' : 'border-border/50 hover:border-indigo-500/30 bg-card'}`}
                      >
                        <p className="text-[11px] font-black uppercase text-foreground">{option.label}</p>
                        <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Card Style</p>
                  <div className="grid grid-cols-1 gap-2">
                    {cardStyleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleCardStyleChange(option.value)}
                        className={`text-left rounded-2xl border px-4 py-3 transition-all ${theme.cardStyle === option.value ? 'border-emerald-500/40 bg-emerald-500/[0.05]' : 'border-border/50 hover:border-emerald-500/25 bg-card'}`}
                      >
                        <p className="text-[11px] font-black uppercase text-foreground">{option.label}</p>
                        <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Motion</p>
                  <div className="grid grid-cols-1 gap-2">
                    {motionPresetOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleMotionPresetChange(option.value)}
                        className={`text-left rounded-2xl border px-4 py-3 transition-all ${theme.motionPreset === option.value ? 'border-amber-500/40 bg-amber-500/[0.05]' : 'border-border/50 hover:border-amber-500/25 bg-card'}`}
                      >
                        <p className="text-[11px] font-black uppercase text-foreground">{option.label}</p>
                        <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSidebarDefaultChange}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${theme.sidebarCollapsedByDefault ? 'border-violet-500/40 bg-violet-500/[0.05]' : 'border-border/50 hover:border-violet-500/25 bg-card'}`}
                >
                  <p className="text-[11px] font-black uppercase text-foreground">Sidebar Starts Collapsed</p>
                  <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">{theme.sidebarCollapsedByDefault ? 'Enabled for focused dashboards.' : 'Disabled for broad menu visibility.'}</p>
                </button>
              </section>

              <section className="bg-background rounded-[1rem] border border-border/40 p-8 shadow-sm space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Page Padding</p>
                    <code className="text-[10px] font-black text-sky-600">{theme.pagePadding.toFixed(2)} REM</code>
                  </div>
                  <Slider min={0.75} max={2.5} step={0.05} value={[theme.pagePadding]} onValueChange={handlePagePaddingChange} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Topbar Height</p>
                    <code className="text-[10px] font-black text-sky-600">{theme.topbarHeight}px</code>
                  </div>
                  <Slider min={56} max={84} step={1} value={[theme.topbarHeight]} onValueChange={handleTopbarHeightChange} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sidebar Width</p>
                    <code className="text-[10px] font-black text-sky-600">{theme.sidebarExpandedWidth}px</code>
                  </div>
                  <Slider min={224} max={320} step={2} value={[theme.sidebarExpandedWidth]} onValueChange={handleSidebarWidthChange} />
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>

        <div className="xl:col-span-8 h-full overflow-hidden p-12 bg-muted/5 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-grid-slate-200/[0.04] pointer-events-none" />
          <div className="w-full h-full relative group">
            <div className="bg-card rounded-[1.5rem] border border-border/80 shadow-2xl relative overflow-hidden h-full flex flex-col transition-all duration-1000">
              <div className="px-8 py-6 border-b flex items-center justify-between bg-muted/10 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 mr-4">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-background border text-[10px] font-black uppercase text-muted-foreground/60 shadow-inner">
                    <Layout className="h-3 w-3" /> Live Workspace Monitor
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-[10px] font-black uppercase text-emerald-500/80">Synchronized</p>
                </div>
              </div>

              <div className="flex-1 p-10 bg-muted/5 flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-full rounded-[1rem] border border-border bg-background shadow-2xl overflow-hidden relative isolate">
                  <div className="h-14 border-b px-8 flex items-center justify-between" style={{ backgroundImage: 'linear-gradient(var(--topbar-gradient-angle, 180deg), var(--topbar-bg-start, #FFFFFF), var(--topbar-bg-end, #EEF1FB))' }}>
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-6 rounded-lg rotate-12 shadow-xl" style={{ background: 'hsl(var(--primary))' }} />
                      <div className="h-3 w-40 rounded-full bg-foreground/10" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-white/40 shadow-xl" style={{ background: 'linear-gradient(135deg, var(--sidebar-gradient-start), var(--sidebar-gradient-end))' }} />
                  </div>
                  {theme.sidebarPosition === 'bottom' ? (
                    <div className="flex h-[calc(100%-56px)] flex-col">
                      <div className="flex-1 p-8 space-y-8 overflow-hidden relative" style={{ background: 'linear-gradient(var(--layout-gradient-angle), var(--layout-bg-start), var(--layout-bg-mid), var(--layout-bg-end))' }}>
                        <div className="h-12 rounded-[1rem] border border-border bg-card shadow-sm flex items-center px-6"><div className="h-2 w-1/4 rounded-full bg-muted/60" /></div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="h-28 rounded-[1.25rem] border border-border bg-card shadow-lg p-5 space-y-3">
                            <div className="h-2 rounded-full bg-muted/40 w-1/3" />
                            <div className="h-8 rounded-lg bg-primary/10 border border-primary/20 w-1/2" />
                          </div>
                          <div className="h-28 rounded-[1.25rem] border border-border bg-card shadow-lg p-5 space-y-3">
                            <div className="h-2 rounded-full bg-muted/40 w-1/3" />
                            <div className="h-8 rounded-lg bg-secondary/10 border border-secondary/20 w-1/2" />
                          </div>
                        </div>
                        <div className="h-32 rounded-[1.5rem] border border-border bg-card shadow-xl p-8" />
                      </div>
                      <div className="h-16 mx-6 mb-5 mt-2 rounded-2xl border border-border/70 px-4 flex items-center justify-between" style={{ background: 'linear-gradient(120deg, hsl(var(--background) / 0.96), hsl(var(--card) / 0.92))' }}>
                        <div className="h-8 w-8 rounded-xl" style={{ background: 'linear-gradient(var(--sidebar-gradient-angle), var(--sidebar-gradient-start), var(--sidebar-gradient-end))' }} />
                        <div className="h-8 w-8 rounded-xl bg-card border border-border/70" />
                        <div className="h-8 w-8 rounded-xl bg-card border border-border/70" />
                        <div className="h-8 w-8 rounded-xl bg-card border border-border/70" />
                        <div className="h-8 w-8 rounded-xl bg-card border border-border/70" />
                      </div>
                    </div>
                  ) : (
                    <div className={`flex h-[calc(100%-56px)] ${theme.sidebarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-28 p-6 space-y-4 shadow-2xl" style={{ background: 'linear-gradient(var(--sidebar-gradient-angle), var(--sidebar-gradient-start), var(--sidebar-gradient-end))' }}>
                        <div className="h-3 rounded-full bg-white/40 w-full mb-8 shadow-sm" />
                        <div className="h-3 rounded-full bg-white/30 w-3/4 shadow-sm" />
                        <div className="h-3 rounded-full bg-white/20 w-1/2 shadow-sm" />
                        <div className="h-3 rounded-full bg-white/10 w-2/3 shadow-sm" />
                      </div>
                      <div className="flex-1 p-8 space-y-8 overflow-hidden relative" style={{ background: 'linear-gradient(var(--layout-gradient-angle), var(--layout-bg-start), var(--layout-bg-mid), var(--layout-bg-end))' }}>
                        <div className="h-12 rounded-[1rem] border border-border bg-card shadow-sm flex items-center px-6"><div className="h-2 w-1/4 rounded-full bg-muted/60" /></div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="h-28 rounded-[1.25rem] border border-border bg-card shadow-lg p-5 space-y-3">
                            <div className="h-2 rounded-full bg-muted/40 w-1/3" />
                            <div className="h-8 rounded-lg bg-primary/10 border border-primary/20 w-1/2" />
                          </div>
                          <div className="h-28 rounded-[1.25rem] border border-border bg-card shadow-lg p-5 space-y-3">
                            <div className="h-2 rounded-full bg-muted/40 w-1/3" />
                            <div className="h-8 rounded-lg bg-secondary/10 border border-secondary/20 w-1/2" />
                          </div>
                        </div>
                        <div className="h-32 rounded-[1.5rem] border border-border bg-card shadow-xl p-8" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-10 py-5 border-t bg-muted/5 flex items-center justify-between text-muted-foreground/60 shrink-0">
                <div className="flex items-center gap-2">
                  <Columns className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Professional Sandbox Environment</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Zero-Latency Sync Ready</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThemeStudioPage;
