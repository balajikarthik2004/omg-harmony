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
  BadgeCheck,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';
import { DEFAULT_TIER, TIERS, type ModuleId, type TierId } from '@/lib/tiers';

export interface NavigationLink {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Module this link belongs to — links outside the active tier are hidden. */
  module: ModuleId;
}

const adminLinks: NavigationLink[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'admin' },
  { to: '/devotees', label: 'Devotees', icon: Users, module: 'devotees' },
  { to: '/membership', label: 'Membership', icon: BadgeCheck, module: 'membership' },
  { to: '/pooja-seva', label: 'Pooja & Seva', icon: CalendarDays, module: 'pooja' },
  { to: '/annadhanam', label: 'Annadhanam', icon: UtensilsCrossed, module: 'annadhanam' },
  { to: '/hr', label: 'HR', icon: Briefcase, module: 'hr' },
  { to: '/donations', label: 'Donations', icon: ShoppingCart, module: 'donation' },
  { to: '/hall-booking', label: 'Rental Venue', icon: Hotel, module: 'venue' },
  { to: '/events', label: 'Events & Calendar', icon: CalendarCheck, module: 'events' },
  { to: '/campaign', label: 'Campaigns', icon: Megaphone, module: 'campaigns' },
  { to: '/inventory', label: 'Inventory', icon: Package, module: 'inventory' },
  { to: '/assets', label: 'Assets', icon: Building2, module: 'asset' },
  { to: '/parking', label: 'Parking', icon: Car, module: 'parking' },
  { to: '/reports', label: 'Documents', icon: BarChart3, module: 'documents' },
  { to: '/settings', label: 'Settings', icon: Settings, module: 'admin' },
];

const managerLinks = adminLinks.filter(link => !['/reports', '/settings', '/assets'].includes(link.to));

const devoteeLinks: NavigationLink[] = [
  { to: '/pooja-seva', label: 'Pooja & Seva Desk', icon: CalendarDays, module: 'pooja' },
  { to: '/events', label: 'Events', icon: CalendarCheck, module: 'events' },
  { to: '/donate', label: 'Donate', icon: Heart, module: 'donation' },
];

const linksForRole = (role?: UserRole | null): NavigationLink[] => {
  if (role === 'admin') return adminLinks;
  if (role === 'manager') return managerLinks;
  return devoteeLinks;
};

export const getNavigationLinks = (
  role?: UserRole | null,
  tier: TierId = DEFAULT_TIER,
): NavigationLink[] => {
  const allowed = new Set(TIERS[tier]?.modules ?? TIERS[DEFAULT_TIER].modules);
  return linksForRole(role).filter(link => allowed.has(link.module));
};

/** Where a user should land after login / after hitting a module their tier lacks. */
export const getLandingRoute = (role?: UserRole | null, tier: TierId = DEFAULT_TIER): string => {
  if (role === 'devotee') return '/donate';
  const [first] = getNavigationLinks(role, tier);
  return first?.to ?? '/login';
};
