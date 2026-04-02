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
    <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col h-screen shrink-0 sticky top-0 overflow-hidden">
      <div className="p-5 border-b border-sidebar-border">
        <img 
  src={logo} 
  alt="OMG Temple" 
  className="h-[50px] object-contain bg-white px-4 rounded-md" 
/>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-sidebar-accent/50'
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
