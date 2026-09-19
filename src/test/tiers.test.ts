import { describe, expect, it } from 'vitest';
import { getNavigationLinks } from '@/lib/navigation';

const labels = (role: 'admin' | 'manager' | 'devotee', tier: 'foundation' | 'growth' | 'enterprise') =>
  getNavigationLinks(role, tier).map(link => link.label);

describe('tier navigation', () => {
  it('limits Foundation to the five core pages', () => {
    expect(labels('admin', 'foundation')).toEqual([
      'Dashboard',
      'Devotees',
      'Pooja & Seva',
      'Donations',
      'Settings',
    ]);
  });

  it('adds the Growth modules on top of Foundation', () => {
    const foundation = labels('admin', 'foundation');
    const growth = labels('admin', 'growth');

    foundation.forEach(label => expect(growth).toContain(label));
    expect(growth).toContain('HR');
    expect(growth).toContain('Membership');
    expect(growth).toContain('Rental Venue');
    expect(growth).toContain('Inventory');
    expect(growth).not.toContain('Assets');
    expect(growth).not.toContain('Campaigns');
    expect(growth).not.toContain('Parking');
  });

  it('opens everything on Enterprise', () => {
    const enterprise = labels('admin', 'enterprise');

    expect(enterprise).toContain('Assets');
    expect(enterprise).toContain('Campaigns');
    expect(enterprise).toContain('Documents');
    expect(enterprise).toContain('Parking');
    expect(enterprise).toContain('Membership');
    expect(enterprise.length).toBeGreaterThan(labels('admin', 'growth').length);
  });
});
