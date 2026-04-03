import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TopNavbar: React.FC = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const hour = new Date().getHours();

  const greeting = hour < 12
    ? 'Good morning. Wishing you a focused day ahead.'
    : hour < 17
      ? 'Good afternoon. Everything is on track today.'
      : 'Good evening. Here is your current operations snapshot.';

  return (
    <header className="h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,241,251,0.94))] backdrop-blur-md border-b border-[#C4C7ED]/80 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 shadow-[0_12px_28px_-24px_rgba(41,48,136,0.52)]">
      <div className="min-w-0">
        <p className="text-sm md:text-base font-bold text-[#293088] leading-tight">Hello, {user?.name || 'Admin'}</p>
        <p className="text-[11px] md:text-xs text-[#767DD6] font-medium mt-0.5 truncate">{greeting}</p>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-sm text-[#293088] hidden md:block font-semibold">{today}</span>
        
        <button className="relative text-[#4F58CA] hover:text-[#293088] transition-all duration-200 hover:scale-105 p-2 rounded-lg hover:bg-[#EBECF9]/90 border border-transparent hover:border-[#C4C7ED]">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#E22E26] rounded-full text-[10px] text-white flex items-center justify-center font-semibold shadow-sm">3</span>
        </button>
        
        <div className="flex items-center gap-3 pl-3 border-l border-[#C4C7ED]/80">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm" style={{
            background: 'linear-gradient(135deg, #293088 0%, #4F58CA 55%, #E22E26 100%)',
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-[#293088] leading-tight">{user?.name}</p>
            <p className="text-xs text-[#767DD6] capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
