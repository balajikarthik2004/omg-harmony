import { describe, expect, it } from 'vitest';
import {
  MEMBERSHIP_TYPES,
  calculateExpiryDate,
  getDurationLabel,
  getMembershipStatus,
  getMembershipType,
} from '@/lib/membership';
import { mockDevotees, mockMemberships } from '@/data/mockData';
import type { Membership } from '@/lib/membership';

const member = (over: Partial<Membership>): Membership => ({
  id: 'x',
  devoteeId: '100',
  membershipNo: 'OMG-MEM-9999',
  name: 'Test Member',
  phone: '+91 90000 00000',
  membershipType: 'Silver',
  startDate: '2025-01-01',
  expiryDate: '2026-01-01',
  fee: 2500,
  paymentMode: 'UPI',
  ...over,
});

const NOW = new Date('2026-09-19T10:00:00');

describe('membership status', () => {
  it('reads Platinum as active regardless of dates - it never lapses', () => {
    expect(getMembershipStatus(member({ membershipType: 'Platinum', expiryDate: '' }), NOW)).toBe(
      'Active'
    );
  });

  it('flags a membership expiring inside 30 days', () => {
    expect(getMembershipStatus(member({ expiryDate: '2026-10-05' }), NOW)).toBe('Expiring Soon');
  });

  it('flags a past expiry as expired', () => {
    expect(getMembershipStatus(member({ expiryDate: '2026-08-14' }), NOW)).toBe('Expired');
  });

  it('leaves a distant expiry active', () => {
    expect(getMembershipStatus(member({ expiryDate: '2027-06-01' }), NOW)).toBe('Active');
  });
});

describe('expiry calculation', () => {
  it('adds the category duration to the start date', () => {
    expect(calculateExpiryDate('Silver', '2026-09-19')).toBe('2027-09-19');
    expect(calculateExpiryDate('Gold', '2026-09-19')).toBe('2028-09-19');
  });

  it('returns no expiry for lifetime categories', () => {
    expect(calculateExpiryDate('Platinum', '2026-09-19')).toBe('');
    expect(getMembershipType('Platinum')?.durationMonths).toBeNull();
  });

  it('labels each tier duration for the register', () => {
    expect(getDurationLabel('Platinum')).toBe('Lifetime');
    expect(getDurationLabel('Gold')).toBe('24 months');
    expect(getDurationLabel('Silver')).toBe('12 months');
  });
});

describe('membership register agrees with the devotee register', () => {
  it('has one membership per devotee', () => {
    expect(mockMemberships).toHaveLength(mockDevotees.length);
  });

  it('copies name, phone, email and category from the devotee record', () => {
    mockMemberships.forEach(record => {
      const devotee = mockDevotees.find(d => d.id === record.devoteeId);
      expect(devotee, `no devotee for ${record.membershipNo}`).toBeDefined();
      expect(record.name).toBe(devotee!.name);
      expect(record.phone).toBe(devotee!.phone);
      expect(record.email).toBe(devotee!.email);
      expect(record.membershipType).toBe(devotee!.membershipType);
    });
  });

  it('offers exactly three tiers', () => {
    expect(MEMBERSHIP_TYPES.map(t => t.id)).toEqual(['Silver', 'Gold', 'Platinum']);
  });

  it('only uses tiers the membership module defines', () => {
    const known = new Set(MEMBERSHIP_TYPES.map(t => t.id));
    mockMemberships.forEach(record => expect(known).toContain(record.membershipType));
  });

  it('charges each member the standard fee for their category', () => {
    mockMemberships.forEach(record => {
      expect(record.fee, record.membershipNo).toBe(getMembershipType(record.membershipType)!.fee);
    });
  });

  it('gives inactive devotees an expired membership', () => {
    mockDevotees
      .filter(devotee => devotee.status === 'Inactive')
      .forEach(devotee => {
        const record = mockMemberships.find(m => m.devoteeId === devotee.id);
        expect(record, `no membership for ${devotee.name}`).toBeDefined();
        expect(getMembershipStatus(record!), devotee.name).toBe('Expired');
      });
  });

  it('issues unique membership numbers', () => {
    const numbers = mockMemberships.map(m => m.membershipNo);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});
