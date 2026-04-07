import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TopNavbar: React.FC = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-GB');
  const hour = new Date().getHours();

  const greeting = hour < 12
    ? 'Good morning. Wishing you a focused day ahead.'
    : hour < 17
      ? 'Good afternoon. Everything is on track today.'
      : 'Good evening. Here is your current operations snapshot.';

  return (
    <header
      className="h-16 backdrop-blur-md border-b flex items-center justify-between px-6 shrink-0 sticky top-0 z-10"
      style={{
        backgroundImage: 'linear-gradient(var(--topbar-gradient-angle, 180deg), var(--topbar-bg-start, #FFFFFF), var(--topbar-bg-end, #EEF1FB)), linear-gradient(120deg, hsl(var(--primary) / 0.14), hsl(var(--secondary) / 0.1))',
        borderColor: 'var(--topbar-border, hsl(var(--border)))',
        boxShadow: '0 12px 28px -24px var(--topbar-shadow), inset 0 -1px 0 hsl(var(--border) / 0.35)',
      }}
    >
      <div className="min-w-0">
        <p className="text-sm md:text-base font-bold leading-tight" style={{ color: 'var(--topbar-title)' }}>Hello, {user?.name || 'Admin'}</p>
        <p className="text-[11px] md:text-xs font-medium mt-0.5 truncate" style={{ color: 'var(--topbar-subtitle)' }}>{greeting}</p>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-sm hidden md:block font-semibold" style={{ color: 'var(--topbar-title)' }}>{today}</span>
        
        <button className="relative transition-all duration-200 hover:scale-105 p-2 rounded-lg border border-transparent hover:bg-white/60" style={{ color: 'var(--topbar-icon)', borderColor: 'transparent' }}>
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] text-white flex items-center justify-center font-semibold shadow-sm" style={{ background: 'hsl(var(--primary))' }}>3</span>
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
