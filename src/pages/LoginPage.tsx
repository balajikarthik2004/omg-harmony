import { useState } from 'react';
import { AlignCenter, Columns, Layout } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import logo from '@/assets/img/logo1.png';
import templeBg from '@/assets/img/temple.webp';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const BRAND_NAME = 'OMG Temple';

function LoginPage() {
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');
  const [formSide, setFormSide] = useState<'left' | 'right'>('left');
  const [isLogoBroken, setIsLogoBroken] = useState(false);
  const { logoUrl } = useTheme();
  const { user } = useAuth();

  const customLogo = !isLogoBroken && logoUrl ? logoUrl : null;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex items-center justify-center font-sans transition-all duration-700 p-3 sm:p-6 relative overflow-hidden bg-background">
      {/* Backdrop - photo on mobile, soft gradient wash on desktop */}
      <div className="md:hidden absolute inset-0 z-0">
        <img src={templeBg} alt="" aria-hidden className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 login-image-overlay opacity-[0.72] backdrop-blur-[3px]" />
      </div>
      <div className="hidden md:block pointer-events-none absolute inset-0 z-0">
        <div
          className="login-floating-orb animate-float"
          style={{ width: 420, height: 420, background: 'hsl(var(--primary))', top: '-12%', left: '-6%' }}
        />
        <div
          className="login-floating-orb animate-float"
          style={{
            width: 320,
            height: 320,
            background: 'hsl(var(--secondary))',
            bottom: '-10%',
            right: '-4%',
            animationDelay: '1.5s',
          }}
        />
      </div>

      <div
        className={cn(
          'w-full overflow-hidden flex flex-col relative z-10 animate-scale-in transition-all duration-500',
          'shadow-[0_28px_70px_-24px_rgba(15,23,42,0.45)] ring-1 ring-black/[0.04]',
          'border border-white/25 md:border-border/50',
          'bg-card/95 md:bg-card backdrop-blur-xl md:backdrop-blur-none',
          'min-h-[420px] md:min-h-[520px] lg:min-h-[560px]',
          viewMode === 'full' ? 'max-w-4xl lg:max-w-5xl' : 'max-w-[380px] md:max-w-md',
          viewMode === 'full' && formSide === 'left' ? 'md:flex-row' : '',
          viewMode === 'full' && formSide === 'right' ? 'md:flex-row-reverse' : ''
        )}
        style={{ borderRadius: 'calc(var(--radius) + 0.75rem)' }}
      >
        {/* Form side */}
        <div className="flex-1 p-5 sm:p-8 md:p-9 lg:p-12 flex flex-col justify-center items-center bg-transparent md:bg-card relative z-20">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-11 h-11 rounded-xl bg-card border border-border/60 flex items-center justify-center shadow-sm overflow-hidden p-1.5">
              <img
                src={customLogo || logo}
                alt="Brand Logo"
                className="w-full h-full object-contain"
                onError={() => setIsLogoBroken(true)}
              />
            </div>
            <span className="text-base font-display font-bold capitalize tracking-tight text-foreground">
              {BRAND_NAME}
            </span>
          </div>

          <LoginForm isCustomized={!!customLogo} />

          <div className="w-full mt-5 md:mt-6 pt-4 md:pt-6 border-t border-border/40 flex flex-wrap items-center justify-center gap-3 lg:gap-4">
            {isAdmin && <div className="w-px h-4 bg-border hidden md:block" />}

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setViewMode(prev => (prev === 'full' ? 'compact' : 'full'))}
                className="group flex items-center gap-2 rounded-full border border-transparent px-2.5 py-1.5 text-[9px] font-bold text-muted-foreground capitalize tracking-widest transition-all duration-300 hover:border-border/60 hover:bg-muted/40 hover:text-foreground"
              >
                <span className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center transition-colors group-hover:bg-background">
                  {viewMode === 'full' ? <AlignCenter className="w-3 h-3" /> : <Columns className="w-3 h-3" />}
                </span>
                {viewMode === 'full' ? 'Compact' : 'Full'}
              </button>

              {viewMode === 'full' && (
                <button
                  onClick={() => setFormSide(prev => (prev === 'left' ? 'right' : 'left'))}
                  className="group flex items-center gap-2 rounded-full border border-transparent px-2.5 py-1.5 text-[9px] font-bold text-muted-foreground capitalize tracking-widest transition-all duration-300 hover:border-border/60 hover:bg-muted/40 hover:text-foreground"
                >
                  <span className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center transition-colors group-hover:bg-background">
                    <Layout className="w-3 h-3" />
                  </span>
                  Swap
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Showcase side */}
        {viewMode === 'full' && (
          <div className="hidden md:block md:w-[50%] relative overflow-hidden transition-all duration-500 group animate-slide-in-right">
            <img
              src={templeBg}
              alt="Temple Sanctuary"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 login-image-overlay opacity-[0.88] transition-opacity duration-700 group-hover:opacity-95" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />

            <div className="relative z-30 flex h-full flex-col justify-between p-8 lg:p-10">
              <p className="animate-fade-in text-white/70 text-[10px] font-bold uppercase tracking-[0.22em]">
                Temple Governance System
              </p>

              <div className="animate-fade-in">
                <p className="text-white/80 text-xs lg:text-sm font-medium capitalize tracking-[0.2em] drop-shadow-md">
                  Divine Governance &bull; {BRAND_NAME}
                </p>
                <h2 className="text-white text-xl lg:text-3xl font-display font-semibold capitalize tracking-tight drop-shadow-lg mt-1.5 lg:mt-2">
                  Unified Temple ERP
                </h2>
                <div
                  className="mt-4 h-[3px] w-14 rounded-full"
                  style={{ background: 'var(--sidebar-highlight)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
