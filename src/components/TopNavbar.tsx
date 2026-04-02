import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

const TopNavbar: React.FC = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-9 bg-muted/50 border-0" />
      </div>

      <div className="flex items-center gap-5">
        <span className="text-sm text-muted-foreground hidden md:block">{today}</span>
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center">3</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
