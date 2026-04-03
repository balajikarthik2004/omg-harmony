import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

const TopNavbar: React.FC = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-GB');

  return (
    <header className="h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,252,0.95))] backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 shadow-[0_12px_28px_-24px_rgba(12,22,34,0.6)]">
      <div className="relative w-72 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors duration-200 group-focus-within:text-sky-700" />
        <Input placeholder="Search..." className="pl-9 bg-white border border-slate-200/90 hover:border-slate-300 focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 transition-all duration-200 shadow-[0_1px_2px_rgba(15,23,42,0.03)]" />
      </div>

      <div className="flex items-center gap-5">
        <span className="text-sm text-slate-600 hidden md:block font-medium">{today}</span>
        
        <button className="relative text-slate-500 hover:text-slate-800 transition-all duration-200 hover:scale-105 p-2 rounded-lg hover:bg-slate-100/90 border border-transparent hover:border-slate-200">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] text-white flex items-center justify-center font-semibold shadow-sm">3</span>
        </button>
        
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm" style={{
            background: 'linear-gradient(135deg, hsl(209, 64%, 30%) 0%, hsl(218, 52%, 24%) 55%, hsl(38, 49%, 45%) 100%)',
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
