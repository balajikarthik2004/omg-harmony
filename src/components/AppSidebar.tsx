import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, CalendarDays, Heart,
  CalendarCheck, CheckSquare, Package, Building2, BarChart3,Briefcase,
  Settings, LogOut,ShoppingCart, UtensilsCrossed, Megaphone
} from 'lucide-react';

import logo from '@/assets/img/logo.png'; 

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/devotees', label: 'Devotees', icon: Users },
  { to: '/pooja-seva', label: 'Pooja & Seva Desk', icon: CalendarDays },
  { to: '/annadhanam', label: 'Annadhanam', icon: UtensilsCrossed },
  { to: '/hr', label: 'HR', icon: Briefcase},
  // { to: '/procurement', label: 'Procurement', icon: ShoppingCart},
  { to: '/donations', label: 'Donations', icon: ShoppingCart  },
  { to: '/events', label: 'Events & Calendar', icon: CalendarCheck },
  { to: '/campaign', label: 'Campaigns', icon: Megaphone },
  // { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/assets', label: 'Assets', icon: Building2 },
  { to: '/reports', label: 'Documents', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const managerLinks = adminLinks.filter(l => !['/reports', '/settings', '/assets'].includes(l.to));
const devoteeLinks = [
  { to: '/pooja-seva', label: 'Pooja & Seva Desk', icon: CalendarDays },
  { to: '/events', label: 'Events', icon: CalendarCheck },
  { to: '/donate', label: 'Donate', icon: Heart },
];

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'manager' ? managerLinks : devoteeLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex flex-col h-screen shrink-0 sticky top-0 overflow-hidden" style={{
      background: 'linear-gradient(180deg, hsl(233, 53%, 30%) 0%, hsl(233, 53%, 22%) 100%)',
      color: 'hsl(0, 0%, 100%)',
    }}>
      {/* Logo area */}
      <div className="p-5 border-b border-white/10">
        <img 
          src={logo} 
          alt="OMG Temple" 
          className="h-[50px] object-contain bg-white px-4 rounded-lg shadow-sm" 
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm backdrop-blur-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className={`h-4 w-4 transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                }`} />
                <span>{link.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info & logout */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {/* User info pill */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-semibold text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white/90 truncate">{user?.name}</p>
            <p className="text-[10px] text-white/50 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 w-full transition-all duration-200 group"
        >
          <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
