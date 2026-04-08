import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TopNavbar: React.FC = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-GB');
  const hour = new Date().getHours();

  const getGreeting = (hour: number) => {
    if (hour < 12) return 'Good morning. Wishing you a focused day ahead.';
    if (hour < 17) return 'Good afternoon. Everything is on track today.';
    return 'Good evening. Here is your current operations snapshot.';
  };

  const greeting = getGreeting(hour);

  return (
    <header
      className="topbar-shell h-[var(--layout-topbar-height)] min-h-[var(--layout-topbar-height)] border flex items-center justify-between px-6 shrink-0 sticky top-0 z-10"
      style={{
        backgroundImage: 'linear-gradient(var(--topbar-gradient-angle, 180deg), var(--topbar-bg-start, #FFFFFF), var(--topbar-bg-end, #EEF1FB)), linear-gradient(120deg, hsl(var(--primary) / 0.14), hsl(var(--secondary) / 0.1))',
        backgroundColor: 'var(--layout-frame-background)',
        borderColor: 'var(--layout-frame-border)',
        boxShadow: 'var(--layout-topbar-frame-shadow), inset 0 -1px 0 hsl(var(--border) / 0.35)',
        borderRadius: 'var(--layout-topbar-radius)',
        backdropFilter: 'var(--layout-frame-backdrop)',
        WebkitBackdropFilter: 'var(--layout-frame-backdrop)',
      }}
    >
      <div className="min-w-0">
        <p className="text-sm md:text-base font-bold leading-tight" style={{ color: 'var(--topbar-title)' }}>Hello, {user?.name || 'Admin'}</p>
        <p className="text-[11px] md:text-xs font-medium mt-0.5 truncate" style={{ color: 'var(--topbar-subtitle)' }}>{greeting}</p>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-sm hidden md:block font-semibold" style={{ color: 'var(--topbar-title)' }}>{today}</span>
        
        <Link
          to="/theme-studio"
          title="Theme Studio"
          className="relative transition-all duration-300 p-2 rounded-xl border border-border/40 bg-background/50 hover:bg-background hover:border-primary/30 shadow-sm hover:shadow-md group active:scale-95"
          style={{ color: 'var(--topbar-icon)' }}
        >
          <Palette className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <button className="relative transition-all duration-300 p-2 rounded-xl border border-border/40 bg-background/50 hover:bg-background shadow-sm hover:shadow-md group active:scale-95" style={{ color: 'var(--topbar-icon)' }}>
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[9px] text-white flex items-center justify-center font-black shadow-lg" style={{ background: 'hsl(var(--primary))' }}>3</span>
        </button>
        
        <div className="flex items-center gap-3 pl-3 border-l" style={{ borderColor: 'var(--topbar-border)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm" style={{
            background: 'linear-gradient(135deg, var(--sidebar-gradient-start) 0%, var(--sidebar-gradient-mid) 55%, var(--sidebar-gradient-end) 100%)',
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--topbar-title)' }}>{user?.name}</p>
            <p className="text-xs capitalize" style={{ color: 'var(--topbar-subtitle)' }}>{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
