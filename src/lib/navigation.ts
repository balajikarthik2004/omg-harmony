import {
  Building2,
  CalendarCheck,
  CalendarDays,
  Car,
  Heart,
  Hotel,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  Briefcase,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';

export interface NavigationLink {
  to: string;
  label: string;
  icon: LucideIcon;
}

const adminLinks: NavigationLink[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/devotees', label: 'Devotees', icon: Users },
  { to: '/pooja-seva', label: 'Pooja & Seva', icon: CalendarDays },
  { to: '/annadhanam', label: 'Annadhanam', icon: UtensilsCrossed },
  { to: '/hr', label: 'HR', icon: Briefcase },
  { to: '/donations', label: 'Donations', icon: ShoppingCart },
  { to: '/hall-booking', label: 'Rental Venue', icon: Hotel },
  { to: '/events', label: 'Events & Calendar', icon: CalendarCheck },
  { to: '/campaign', label: 'Campaigns', icon: Megaphone },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/assets', label: 'Assets', icon: Building2 },
  { to: '/parking', label: 'Parking', icon: Car },
  { to: '/reports', label: 'Documents', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const managerLinks = adminLinks.filter(link => !['/reports', '/settings', '/assets'].includes(link.to));

const devoteeLinks: NavigationLink[] = [
  { to: '/pooja-seva', label: 'Pooja & Seva Desk', icon: CalendarDays },
  { to: '/events', label: 'Events', icon: CalendarCheck },
  { to: '/donate', label: 'Donate', icon: Heart },
];

export const getNavigationLinks = (role?: UserRole | null): NavigationLink[] => {
  if (role === 'admin') return adminLinks;
  if (role === 'manager') return managerLinks;
  return devoteeLinks;
};
