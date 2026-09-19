/**
 * Subscription tiers — Foundation (4 modules), Growth (9), Enterprise (12).
 *
 * Each tier is entered through its own link: /foundation, /growth, /enterprise.
 * The entry route stores the tier, then hands off to /login.
 *
 * Two kinds of module live here:
 *  - MODULES: the 12 modules the tiers are sold on.
 *  - EXTRA_MODULES: supporting pages this app has that aren't part of that
 *    line-up (Annadhanam, Events, Tasks, Documents, Parking). They're gated per
 *    tier the same way, they just don't count toward the 4 / 9 / 12 headline.
 *
 * NOTE: `priest` and `finance` are real modules in the tier line-up but have no
 * page in this app yet, so they carry no routes. They stay listed here (the
 * counts stay honest) and simply contribute no navigation.
 */

export type TierId = 'foundation' | 'growth' | 'enterprise';

export type CoreModuleId =
  | 'devotees'
  | 'pooja'
  | 'donation'
  | 'admin'
  | 'hr'
  | 'priest'
  | 'inventory'
  | 'venue'
  | 'membership'
  | 'asset'
  | 'campaigns'
  | 'finance';

export type ExtraModuleId = 'annadhanam' | 'events' | 'tasks' | 'documents' | 'parking';

export type ModuleId = CoreModuleId | ExtraModuleId;

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  /** Routes this module unlocks. Empty = module has no page yet. */
  routes: string[];
}

/** The 12 modules the tiers are sold on. */
export const MODULES: ModuleDefinition[] = [
  { id: 'devotees', label: 'Devotees', routes: ['/devotees'] },
  { id: 'pooja', label: 'Pooja Booking', routes: ['/pooja-seva', '/services', '/bookings'] },
  { id: 'donation', label: 'Donation', routes: ['/donations', '/donate'] },
  { id: 'admin', label: 'Admin Management', routes: ['/dashboard', '/settings', '/theme-studio'] },
  { id: 'hr', label: 'HR Management', routes: ['/hr', '/volunteers'] },
  { id: 'priest', label: 'Priest Management', routes: [] },
  { id: 'inventory', label: 'Inventory Management', routes: ['/inventory', '/procurement'] },
  { id: 'venue', label: 'Venue Booking', routes: ['/hall-booking'] },
  { id: 'membership', label: 'Membership', routes: ['/membership'] },
  { id: 'asset', label: 'Asset Management', routes: ['/assets'] },
  { id: 'campaigns', label: 'Campaigns', routes: ['/campaign'] },
  { id: 'finance', label: 'Finance Ledger Management', routes: [] },
];

/** Supporting pages, gated per tier but outside the headline module count. */
export const EXTRA_MODULES: ModuleDefinition[] = [
  { id: 'annadhanam', label: 'Annadhanam', routes: ['/annadhanam'] },
  { id: 'events', label: 'Events & Calendar', routes: ['/events'] },
  { id: 'tasks', label: 'Tasks', routes: ['/tasks'] },
  { id: 'documents', label: 'Documents', routes: ['/reports'] },
  { id: 'parking', label: 'Parking', routes: ['/parking'] },
];

export const ALL_MODULES: ModuleDefinition[] = [...MODULES, ...EXTRA_MODULES];

/** Foundation: Dashboard, Devotees, Pooja & Seva, Donations, Settings. */
const FOUNDATION_MODULES: ModuleId[] = ['devotees', 'pooja', 'donation', 'admin'];

const GROWTH_MODULES: ModuleId[] = [
  ...FOUNDATION_MODULES,
  'hr',
  'priest',
  'inventory',
  'venue',
  'membership',
  // supporting pages that open up alongside the Growth modules
  'annadhanam',
  'events',
  'tasks',
];

const ENTERPRISE_MODULES: ModuleId[] = [
  ...GROWTH_MODULES,
  'asset',
  'campaigns',
  'finance',
  'documents',
  'parking',
];

export interface TierDefinition {
  id: TierId;
  name: string;
  tagline: string;
  path: string;
  modules: ModuleId[];
}

export const TIERS: Record<TierId, TierDefinition> = {
  foundation: {
    id: 'foundation',
    name: 'Foundation',
    tagline: '4 modules',
    path: '/foundation',
    modules: FOUNDATION_MODULES,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    tagline: '9 modules',
    path: '/growth',
    modules: GROWTH_MODULES,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: '12 modules — all included',
    path: '/enterprise',
    modules: ENTERPRISE_MODULES,
  },
};

export const TIER_ORDER: TierId[] = ['foundation', 'growth', 'enterprise'];

export const DEFAULT_TIER: TierId = 'enterprise';

export const isTierId = (value: unknown): value is TierId =>
  typeof value === 'string' && TIER_ORDER.includes(value as TierId);

/** The headline (sellable) modules a tier unlocks, in line-up order. */
export const getTierModules = (tier: TierId): ModuleDefinition[] => {
  const allowed = new Set(TIERS[tier].modules);
  return MODULES.filter(module => allowed.has(module.id));
};

/** Every route a tier unlocks, supporting pages included. */
export const getTierRoutes = (tier: TierId): Set<string> => {
  const allowed = new Set(TIERS[tier].modules);
  const routes = new Set<string>();
  ALL_MODULES.filter(module => allowed.has(module.id)).forEach(module =>
    module.routes.forEach(route => routes.add(route)),
  );
  return routes;
};

export const hasModule = (tier: TierId, moduleId: ModuleId): boolean =>
  TIERS[tier].modules.includes(moduleId);
