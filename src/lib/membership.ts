import { toISODate } from '@/lib/utils';

export interface Membership {
  id: string;
  /** Links back to the devotee record in mockDevotees. */
  devoteeId: string;
  membershipNo: string;
  name: string;
  phone: string;
  email?: string;
  /** Same vocabulary as a devotee's `membershipType`. */
  membershipType: string;
  startDate: string;
  /** Empty for lifetime categories. */
  expiryDate: string;
  fee: number;
  paymentMode: string;
  notes?: string;
}

export type MembershipStatus = 'Active' | 'Expiring Soon' | 'Expired';

export interface MembershipTypeDefinition {
  id: string;
  label: string;
  /** Standard fee in rupees. Service categories are ₹0. */
  fee: number;
  /** Validity in months; null = lifetime. */
  durationMonths: number | null;
  summary: string;
}

/**
 * The three membership tiers the temple offers. These are the same values the
 * devotee register stores in `membershipType` (see `membershipTypes` in
 * mockData), so a devotee's tier and their membership record always agree.
 */
export const MEMBERSHIP_TYPES: MembershipTypeDefinition[] = [
  {
    id: 'Silver',
    label: 'Silver',
    fee: 2500,
    durationMonths: 12,
    summary: 'Annual membership with darshan priority on regular days.',
  },
  {
    id: 'Gold',
    label: 'Gold',
    fee: 10000,
    durationMonths: 24,
    summary: 'Two-year membership with reserved seating at festivals.',
  },
  {
    id: 'Platinum',
    label: 'Platinum',
    fee: 51000,
    durationMonths: null,
    summary: 'Lifetime membership. No renewal required.',
  },
];

export const getMembershipType = (typeId: string): MembershipTypeDefinition | undefined =>
  MEMBERSHIP_TYPES.find(type => type.id === typeId);

export const isLifetimeType = (typeId: string): boolean =>
  getMembershipType(typeId)?.durationMonths === null;

/** Days until expiry; null for lifetime or unparseable dates. */
export const daysUntilExpiry = (member: Membership, today = new Date()): number | null => {
  if (isLifetimeType(member.membershipType) || !member.expiryDate) return null;

  const expiry = new Date(`${member.expiryDate}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) return null;

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((expiry.getTime() - startOfToday.getTime()) / msPerDay);
};

/**
 * Status is derived from the expiry date rather than stored, so a record can
 * never drift out of sync with the calendar.
 */
export const getMembershipStatus = (member: Membership, today = new Date()): MembershipStatus => {
  // A lifetime tier never lapses, so it simply reads as Active.
  if (isLifetimeType(member.membershipType)) return 'Active';

  const days = daysUntilExpiry(member, today);
  if (days === null) return 'Active';
  if (days < 0) return 'Expired';
  if (days <= 30) return 'Expiring Soon';
  return 'Active';
};

/** Expiry date for a category starting on `startDate`, as yyyy-mm-dd. Empty for lifetime. */
export const calculateExpiryDate = (typeId: string, startDate: string): string => {
  const type = getMembershipType(typeId);
  if (!type || type.durationMonths === null || !startDate) return '';

  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return '';

  const expiry = new Date(start);
  expiry.setMonth(expiry.getMonth() + type.durationMonths);
  return toISODate(expiry);
};

/** How long the tier runs for, e.g. "Lifetime", "12 months". */
export const getDurationLabel = (typeId: string): string => {
  const type = getMembershipType(typeId);
  if (!type) return '-';
  return type.durationMonths === null ? 'Lifetime' : `${type.durationMonths} months`;
};

export const STATUS_TONE: Record<MembershipStatus, string> = {
  Active: 'text-emerald-500',
  'Expiring Soon': 'text-amber-500',
  Expired: 'text-rose-500',
};
