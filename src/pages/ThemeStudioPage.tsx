import React from 'react';
import { Layers, Palette, RotateCcw, Sparkles, Layout, Columns, SlidersHorizontal, Sun, Moon, ImageUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import defaultLogo from '@/assets/img/logo.png';
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

const PREVIEW_CANVAS_WIDTH = 1060;
const PREVIEW_CANVAS_HEIGHT = 680;
const MAX_LOGO_FILE_SIZE = 1024 * 1024;

const isSupportedLogoSource = (value: string) => {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || /^data:image\//i.test(trimmed);
};

const ThemeStudioPage: React.FC = () => {
  const { theme, presets, logoUrl, updateTheme, updateLogo, applyPreset, saveCurrentAsPreset, resetTheme } = useTheme();
  const [presetName, setPresetName] = React.useState('');
  const [logoInputValue, setLogoInputValue] = React.useState(logoUrl ?? '');
  const [logoError, setLogoError] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('palette');
  const previewHostRef = React.useRef<HTMLDivElement | null>(null);
  const leftContentScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = React.useState(1);

  React.useEffect(() => {
    const host = previewHostRef.current;
    if (!host) return;

    const updateScale = () => {
      const { width, height } = host.getBoundingClientRect();
      const nextScale = Math.min(width / PREVIEW_CANVAS_WIDTH, height / PREVIEW_CANVAS_HEIGHT, 1);
      setPreviewScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(host);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  React.useEffect(() => {
    setLogoInputValue(logoUrl ?? '');
  }, [logoUrl]);

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
  const isLightPresetActive = theme.id === 'solid-light';
  const isDarkPresetActive = theme.id === 'solid-dark';

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    saveCurrentAsPreset(presetName);
    setPresetName('');
  };

  const handleLogoUrlApply = () => {
    const next = logoInputValue.trim();
    if (!next) {
      setLogoError('Enter a valid logo URL or upload an image.');
      toast.error('Logo not updated', {
        description: 'Enter a valid logo URL or upload an image file.',
      });
      return;
    }

    if (!isSupportedLogoSource(next)) {
      setLogoError('Use an absolute URL, app-relative path, or data image URL.');
      toast.error('Logo URL format is not supported');
      return;
    }

    setLogoError('');
    updateLogo(next);
    toast.success('Logo updated successfully');
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoError('Please upload a valid image file.');
      toast.error('Only image files are supported');
      return;
    }

    if (file.size > MAX_LOGO_FILE_SIZE) {
      setLogoError('Image is too large. Use a file up to 1 MB.');
      toast.error('Image is too large', {
        description: 'Please upload an image up to 1 MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result.startsWith('data:image/')) {
        setLogoError('Unable to read image. Please try a different file.');
        toast.error('Failed to process selected image');
        return;
      }

      setLogoError('');
      setLogoInputValue(result);
      updateLogo(result);
      toast.success('Logo uploaded and saved');
    };
    reader.onerror = () => {
      setLogoError('Unable to read image. Please try again.');
      toast.error('Failed to read image file');
    };

    reader.readAsDataURL(file);
  };

  const handleLogoReset = () => {
    setLogoError('');
    setLogoInputValue('');
    updateLogo(null);
    toast.success('Logo reset to default');
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

  const scaledPreviewWidth = PREVIEW_CANVAS_WIDTH * previewScale;
  const scaledPreviewHeight = PREVIEW_CANVAS_HEIGHT * previewScale;

  const handleStudioWheelCapture = (event: React.WheelEvent<HTMLElement>) => {
    const leftScrollHost = leftContentScrollRef.current;
    if (!leftScrollHost || Math.abs(event.deltaY) < Math.abs(event.deltaX) || event.deltaY === 0) {
      return;
    }

    const canScrollLeftPane = leftScrollHost.scrollHeight > leftScrollHost.clientHeight + 1;
    if (!canScrollLeftPane) return;

    if (!leftScrollHost.contains(event.target as Node)) {
      leftScrollHost.scrollTop += event.deltaY;
      event.preventDefault();
    }
  };

  return (
    <div className="theme-studio-v2 h-full min-h-0 flex flex-col animate-fade-in overflow-hidden">
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
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-border/50 bg-card/60 px-2 py-1.5 shadow-sm">
              <span className="px-2 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/75">Mode</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyPreset('solid-light')}
                aria-label="Apply light preset"
                title="Light"
                className={`h-8 w-8 rounded-xl p-0 transition-all ${
                  isLightPresetActive
                    ? 'bg-background border border-border/60 text-foreground shadow-sm'
                    : 'text-foreground/65 hover:bg-background/80 hover:text-foreground'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span className="sr-only">Light</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyPreset('solid-dark')}
                aria-label="Apply dark preset"
                title="Dark"
                className={`h-8 w-8 rounded-xl p-0 transition-all ${
                  isDarkPresetActive
                    ? 'bg-background border border-border/60 text-foreground shadow-sm'
                    : 'text-foreground/65 hover:bg-background/80 hover:text-foreground'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span className="sr-only">Dark</span>
              </Button>
            </div>
            <div className="px-5 py-2.5 rounded-xl border border-border/60 bg-card/50 shadow-sm flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[11px] font-black text-foreground/80 uppercase tracking-tight"><span className="opacity-40">Active:</span> {theme.name}</p>
            </div>
            <Button variant="outline" onClick={resetTheme} className="h-11 rounded-2xl px-6 text-[10px] font-black uppercase tracking-[0.2em] border-border/60 hover:bg-destructive hover:text-white transition-all shrink-0">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main onWheelCapture={handleStudioWheelCapture} className="flex-1 min-h-0 overflow-hidden grid grid-cols-1 xl:grid-cols-12 bg-muted/5">
        <div className="xl:col-span-4 h-full min-h-0 overflow-hidden border-r border-border/40 bg-background/40 backdrop-blur-sm p-4 lg:p-5 xl:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full min-h-0 flex flex-col">
            <div className="bg-card/40 backdrop-blur-md rounded-[1rem] border border-border/60 p-2 mb-4 shadow-sm shrink-0">
              <TabsList className="h-14 w-full bg-transparent grid grid-cols-5 gap-1 p-0">
                <TabsTrigger value="palette" className="rounded-[1rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-foreground border-none">
                  <Palette className="h-4 w-4" /> Palette
                </TabsTrigger>
                <TabsTrigger value="gradients" className="rounded-[1rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-foreground border-none">
                  <Layers className="h-4 w-4" /> Gradients
                </TabsTrigger>
                <TabsTrigger value="presets" className="rounded-[1rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-foreground border-none">
                  <Sparkles className="h-4 w-4" /> Templates
                </TabsTrigger>
                <TabsTrigger value="solid-spectrum" className="rounded-[1rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-foreground border-none">
                  <Layout className="h-4 w-4" /> Solid
                </TabsTrigger>
                <TabsTrigger value="layout-system" className="rounded-[1rem] flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-foreground border-none">
                  <SlidersHorizontal className="h-4 w-4" /> Layout
                </TabsTrigger>
              </TabsList>
            </div>

            <div ref={leftContentScrollRef} className="theme-studio-left-scroll flex-1 min-h-0 overflow-y-auto pr-1 pb-8">
            <TabsContent value="palette" className="space-y-6 mt-0">
              <section className="bg-background rounded-[1rem] border border-border/40 p-6 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Brand Logo</h3>
                  <p className="text-[10px] text-muted-foreground/60 font-bold uppercase">Upload or link a custom logo. Saved in browser local storage.</p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-card/70 p-4 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl border border-border/50 bg-white/80 p-2 flex items-center justify-center">
                    <img
                      src={logoUrl || defaultLogo}
                      alt="Current logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <label className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] cursor-pointer hover:bg-muted/40 transition-colors">
                      <ImageUp className="h-3.5 w-3.5" /> Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
                    </label>
                    <p className="text-[10px] text-muted-foreground/70 font-medium">PNG, JPG, SVG supported. Max file size: 1 MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
                  <input
                    value={logoInputValue}
                    onChange={(e) => setLogoInputValue(e.target.value)}
                    placeholder="https://example.com/logo.png or /logo.png"
                    className="h-11 min-w-0 rounded-xl border border-border bg-card px-3 text-xs font-semibold"
                  />
                  <Button type="button" variant="outline" onClick={handleLogoUrlApply} className="h-11 rounded-xl px-4 text-[10px] font-black uppercase tracking-[0.16em] md:whitespace-nowrap">Apply URL</Button>
                  <Button type="button" variant="outline" onClick={handleLogoReset} className="h-11 rounded-xl px-4 text-[10px] font-black uppercase tracking-[0.16em] md:whitespace-nowrap">Reset</Button>
                </div>
                {logoError && <p className="text-[11px] font-semibold text-destructive">{logoError}</p>}
              </section>

              <section className="bg-background rounded-[1rem] border border-border/40 p-6 shadow-sm relative overflow-hidden">
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
              <section className="bg-background rounded-[1rem] border border-border/40 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8 px-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Geometry Curve</h3>
                  <span className="text-[10px] font-black bg-muted px-2 py-1 rounded-md">{theme.radius.toFixed(2)} REM</span>
                </div>
                <Slider min={0.4} max={1.4} step={0.05} value={[theme.radius]} onValueChange={handleRadiusChange} />
              </section>
            </TabsContent>

            <TabsContent value="gradients" className="space-y-6 mt-0">
              <section className="bg-background rounded-[1rem] border border-border/40 p-6 shadow-sm">
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
              <section className="bg-background rounded-[1rem] border border-border/40 p-6 shadow-sm space-y-6">
                {angleControls.map((control) => (
                  <div key={control.key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{control.label}</p>
                      <code className="text-[10px] font-black text-foreground rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5">{theme[control.key]}°</code>
                    </div>
                    <Slider min={0} max={360} step={1} value={[theme[control.key]]} onValueChange={(v) => handleAngleChange(control.key, v)} />
                  </div>
                ))}
              </section>
            </TabsContent>

            <TabsContent value="presets" className="space-y-6 mt-0">
              <section className="bg-background rounded-[1rem] border border-border/40 p-6 shadow-sm space-y-6">
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

            <TabsContent value="solid-spectrum" className="space-y-6 mt-0">
              <section className="bg-background rounded-[1rem] border border-border/40 p-6 shadow-sm">
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

            <TabsContent value="layout-system" className="space-y-6 mt-0">
              <section className="bg-background rounded-[1rem] border border-border/40 p-6 shadow-sm space-y-6">
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

              <section className="bg-background rounded-[1rem] border border-border/40 p-6 shadow-sm space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Page Padding</p>
                    <code className="text-[10px] font-black text-foreground rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5">{theme.pagePadding.toFixed(2)} REM</code>
                  </div>
                  <Slider min={0.75} max={2.5} step={0.05} value={[theme.pagePadding]} onValueChange={handlePagePaddingChange} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Topbar Height</p>
                    <code className="text-[10px] font-black text-foreground rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5">{theme.topbarHeight}px</code>
                  </div>
                  <Slider min={56} max={84} step={1} value={[theme.topbarHeight]} onValueChange={handleTopbarHeightChange} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sidebar Width</p>
                    <code className="text-[10px] font-black text-foreground rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5">{theme.sidebarExpandedWidth}px</code>
                  </div>
                  <Slider min={224} max={320} step={2} value={[theme.sidebarExpandedWidth]} onValueChange={handleSidebarWidthChange} />
                </div>
              </section>
            </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="xl:col-span-8 h-full min-h-0 overflow-hidden p-4 md:p-6 xl:p-8 bg-muted/5 flex items-start justify-center relative">
          <div className="absolute inset-0 bg-grid-slate-200/[0.04] pointer-events-none" />
          <div ref={previewHostRef} className="w-full h-full min-h-0 relative group flex items-start justify-center overflow-hidden">
            <div className="absolute -top-16 left-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl opacity-75 pointer-events-none" />
            <div className="absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl opacity-80 pointer-events-none" />
            <div className="relative" style={{ width: scaledPreviewWidth, height: scaledPreviewHeight }}>
              <div
                className="bg-card/90 rounded-[1.75rem] shadow-[0_24px_70px_hsl(var(--foreground)/0.14)] relative overflow-hidden flex flex-col transition-all duration-700 backdrop-blur-xl"
                style={{
                  width: PREVIEW_CANVAS_WIDTH,
                  height: PREVIEW_CANVAS_HEIGHT,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                }}
              >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.16),transparent_45%),radial-gradient(circle_at_80%_100%,hsl(var(--secondary)/0.14),transparent_50%)]" />
              <div className="px-8 py-6 border-b flex items-center justify-between bg-background/60 backdrop-blur-md shrink-0 relative">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5 mr-4">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/15 via-secondary/10 to-transparent shadow-inner">
                    <Layout className="h-4 w-4 text-foreground/85" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/90">Live Workspace Monitor</p>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">Executive visual telemetry</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-end gap-1 rounded-lg border border-border/60 bg-background/70 px-2.5 py-2 shadow-sm">
                    <span className="h-3 w-1 rounded-full bg-primary/40" />
                    <span className="h-4 w-1 rounded-full bg-primary/60" />
                    <span className="h-2 w-1 rounded-full bg-primary/30" />
                    <span className="h-5 w-1 rounded-full bg-emerald-500/70" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <p className="text-[10px] font-black uppercase text-foreground/85">Synchronized</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 md:p-8 bg-muted/[0.07] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-x-12 top-8 h-24 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                <div className="w-full h-full rounded-[1.2rem] border border-border/70 bg-background/95 shadow-[0_30px_70px_hsl(var(--foreground)/0.12)] overflow-hidden relative isolate">
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_90%_5%,hsl(var(--primary)/0.1),transparent_36%),radial-gradient(circle_at_15%_88%,hsl(var(--secondary)/0.09),transparent_44%)]" />
                  <div className="h-14 border-b px-8 flex items-center justify-between relative" style={{ backgroundImage: 'linear-gradient(var(--topbar-gradient-angle, 180deg), var(--topbar-bg-start, #FFFFFF), var(--topbar-bg-end, #EEF1FB))' }}>
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-6 rounded-lg rotate-12 shadow-xl" style={{ background: 'hsl(var(--primary))' }} />
                      <div className="space-y-1.5">
                        <div className="h-2.5 w-32 rounded-full bg-foreground/15" />
                        <div className="h-2 w-20 rounded-full bg-foreground/10" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-16 rounded-full border border-white/40 bg-white/40" />
                      <div className="h-10 w-10 rounded-full border-2 border-white/40 shadow-xl" style={{ background: 'linear-gradient(135deg, var(--sidebar-gradient-start), var(--sidebar-gradient-end))' }} />
                    </div>
                  </div>
                  {theme.sidebarPosition === 'bottom' ? (
                    <div className="flex h-[calc(100%-56px)] flex-col">
                      <div className="flex-1 p-8 space-y-8 overflow-hidden relative" style={{ background: 'linear-gradient(var(--layout-gradient-angle), var(--layout-bg-start), var(--layout-bg-mid), var(--layout-bg-end))' }}>
                        <div className="absolute top-4 right-10 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
                        <div className="h-12 rounded-[1rem] border border-border/70 bg-card/90 shadow-sm flex items-center px-6 justify-between backdrop-blur-sm">
                          <div className="h-2 w-1/4 rounded-full bg-muted/60" />
                          <div className="h-6 w-24 rounded-full bg-primary/10 border border-primary/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="h-28 rounded-[1.25rem] border border-border/70 bg-card/90 shadow-lg p-5 space-y-3 backdrop-blur-sm">
                            <div className="h-2 rounded-full bg-muted/40 w-1/3" />
                            <div className="h-8 rounded-lg bg-primary/10 border border-primary/20 w-1/2" />
                            <div className="h-2 rounded-full bg-muted/30 w-2/3" />
                          </div>
                          <div className="h-28 rounded-[1.25rem] border border-border/70 bg-card/90 shadow-lg p-5 space-y-3 backdrop-blur-sm">
                            <div className="h-2 rounded-full bg-muted/40 w-1/3" />
                            <div className="h-8 rounded-lg bg-secondary/10 border border-secondary/20 w-1/2" />
                            <div className="h-2 rounded-full bg-muted/30 w-2/3" />
                          </div>
                        </div>
                        <div className="h-32 rounded-[1.5rem] border border-border/70 bg-card/90 shadow-xl p-8 backdrop-blur-sm">
                          <div className="h-2 w-1/3 rounded-full bg-muted/40 mb-4" />
                          <div className="h-3 w-1/2 rounded-full bg-primary/15 mb-3" />
                          <div className="h-3 w-2/5 rounded-full bg-secondary/15" />
                        </div>
                      </div>
                      <div className="h-16 mx-6 mb-5 mt-2 rounded-2xl border border-border/70 px-4 flex items-center justify-between shadow-lg" style={{ background: 'linear-gradient(120deg, hsl(var(--background) / 0.96), hsl(var(--card) / 0.92))' }}>
                        <div className="h-8 w-8 rounded-xl" style={{ background: 'linear-gradient(var(--sidebar-gradient-angle), var(--sidebar-gradient-start), var(--sidebar-gradient-end))' }} />
                        <div className="h-8 w-8 rounded-xl bg-card border border-border/70" />
                        <div className="h-8 w-8 rounded-xl bg-card border border-border/70" />
                        <div className="h-8 w-8 rounded-xl bg-card border border-border/70" />
                        <div className="h-8 w-8 rounded-xl bg-card border border-border/70" />
                      </div>
                    </div>
                  ) : (
                    <div className={`flex h-[calc(100%-56px)] ${theme.sidebarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-32 p-6 space-y-4 shadow-2xl border-r border-white/10" style={{ background: 'linear-gradient(var(--sidebar-gradient-angle), var(--sidebar-gradient-start), var(--sidebar-gradient-end))' }}>
                        <div className="h-3 rounded-full bg-white/40 w-full mb-8 shadow-sm" />
                        <div className="h-3 rounded-full bg-white/30 w-3/4 shadow-sm" />
                        <div className="h-3 rounded-full bg-white/20 w-1/2 shadow-sm" />
                        <div className="h-3 rounded-full bg-white/10 w-2/3 shadow-sm" />
                        <div className="h-20 rounded-2xl border border-white/20 bg-white/10 mt-8" />
                      </div>
                      <div className="flex-1 p-8 space-y-8 overflow-hidden relative" style={{ background: 'linear-gradient(var(--layout-gradient-angle), var(--layout-bg-start), var(--layout-bg-mid), var(--layout-bg-end))' }}>
                        <div className="absolute top-4 right-10 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
                        <div className="h-12 rounded-[1rem] border border-border/70 bg-card/90 shadow-sm flex items-center px-6 justify-between backdrop-blur-sm">
                          <div className="h-2 w-1/4 rounded-full bg-muted/60" />
                          <div className="h-6 w-24 rounded-full bg-primary/10 border border-primary/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="h-28 rounded-[1.25rem] border border-border/70 bg-card/90 shadow-lg p-5 space-y-3 backdrop-blur-sm">
                            <div className="h-2 rounded-full bg-muted/40 w-1/3" />
                            <div className="h-8 rounded-lg bg-primary/10 border border-primary/20 w-1/2" />
                            <div className="h-2 rounded-full bg-muted/30 w-2/3" />
                          </div>
                          <div className="h-28 rounded-[1.25rem] border border-border/70 bg-card/90 shadow-lg p-5 space-y-3 backdrop-blur-sm">
                            <div className="h-2 rounded-full bg-muted/40 w-1/3" />
                            <div className="h-8 rounded-lg bg-secondary/10 border border-secondary/20 w-1/2" />
                            <div className="h-2 rounded-full bg-muted/30 w-2/3" />
                          </div>
                        </div>
                        <div className="h-32 rounded-[1.5rem] border border-border/70 bg-card/90 shadow-xl p-8 backdrop-blur-sm">
                          <div className="h-2 w-1/3 rounded-full bg-muted/40 mb-4" />
                          <div className="h-3 w-1/2 rounded-full bg-primary/15 mb-3" />
                          <div className="h-3 w-2/5 rounded-full bg-secondary/15" />
                        </div>
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
        </div>
      </main>
    </div>
  );
};

export default ThemeStudioPage;
