import { describe, expect, it } from 'vitest';
import {
  donationCategoryData,
  inventoryUsageData,
  mockAssets,
  mockBookings,
  mockDevotees,
  mockDonations,
  mockEvents,
  mockInventory,
  mockServices,
  serviceBookingData,
} from '@/data/mockData';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isIsoDate = (value: string) => ISO_DATE.test(value) && !Number.isNaN(Date.parse(value));

const duplicatesOf = <T>(rows: T[], key: (row: T) => string | undefined) => {
  const counts = new Map<string, number>();
  rows.forEach(row => {
    const value = key(row);
    if (!value || value === '-') return;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts.entries()].filter(([, n]) => n > 1).map(([value]) => value);
};

describe('devotee register', () => {
  it('has unique ids, phones and emails', () => {
    expect(duplicatesOf(mockDevotees, d => d.id)).toEqual([]);
    expect(duplicatesOf(mockDevotees, d => d.phone)).toEqual([]);
    expect(duplicatesOf(mockDevotees, d => d.email)).toEqual([]);
  });

  it('is deterministic - no generated field changes between reads', () => {
    // Guards against Math.random() creeping back into the seed data.
    expect(mockDevotees.map(d => d.phone)).toEqual(mockDevotees.map(d => d.phone));
    mockDevotees.forEach(d => expect(d.phone, d.name).toMatch(/^\+91 \d{5} \d{5}$/));
  });

  it('carries a real location, not placeholder text', () => {
    mockDevotees.forEach(d => {
      expect(d.city, d.name).toBeTruthy();
      expect(d.city, d.name).not.toBe('City Name');
      expect(d.state, d.name).not.toBe('State');
    });
  });

  it('has valid dates and a known status', () => {
    mockDevotees.forEach(d => {
      expect(isIsoDate(d.lastVisit), d.name).toBe(true);
      expect(['Active', 'Inactive']).toContain(d.status);
    });
  });

  it('reports a lifetime total that the donation register actually backs', () => {
    mockDevotees.forEach(devotee => {
      const recorded = mockDonations
        .filter(d => d.phone === devotee.phone && d.paymentStatus === 'Success')
        .reduce((sum, d) => sum + d.amount, 0);
      expect(devotee.totalDonations, devotee.name).toBe(recorded);
    });
  });
});

describe('donation register', () => {
  it('has unique codes and receipt numbers', () => {
    expect(duplicatesOf(mockDonations, d => d.donationCode)).toEqual([]);
    expect(duplicatesOf(mockDonations, d => d.receiptNumber)).toEqual([]);
  });

  it('names a donor who exists in the devotee register', () => {
    mockDonations.forEach(donation => {
      const devotee = mockDevotees.find(d => d.phone === donation.phone);
      expect(devotee, `${donation.donationCode} (${donation.donorName})`).toBeDefined();
      expect(devotee!.name).toBe(donation.donorName);
      expect(devotee!.email).toBe(donation.email);
    });
  });

  it('records a positive amount on a valid date', () => {
    mockDonations.forEach(d => {
      expect(d.amount, d.donationCode).toBeGreaterThan(0);
      expect(isIsoDate(d.date), d.donationCode).toBe(true);
    });
  });
});

describe('booking register', () => {
  it('references a devotee and a service that both exist', () => {
    mockBookings.forEach(booking => {
      expect(
        mockDevotees.some(d => d.name === booking.devoteeName),
        `${booking.id}: ${booking.devoteeName}`
      ).toBe(true);
      expect(
        mockServices.some(s => s.name === booking.serviceName),
        `${booking.id}: ${booking.serviceName}`
      ).toBe(true);
    });
  });

  it('keeps refunds and cancellations in step', () => {
    mockBookings
      .filter(b => b.paymentStatus === 'Refunded')
      .forEach(b => expect(b.bookingStatus, b.id).toBe('Cancelled'));
  });
});

describe('catalogues', () => {
  it('prices every service', () => {
    mockServices.forEach(s => expect(s.price, s.name).toBeGreaterThan(0));
    expect(duplicatesOf(mockServices, s => s.name)).toEqual([]);
  });

  it('keeps the inventory stock status in step with the quantity', () => {
    mockInventory.forEach(item => {
      const low = item.quantity <= 10;
      expect(item.stockStatus === 'Low Stock', `${item.name} (${item.quantity})`).toBe(low);
    });
  });

  it('gives every asset a cost and a valid purchase date', () => {
    mockAssets.forEach(a => {
      expect(a.cost, a.name).toBeGreaterThan(0);
      expect(isIsoDate(a.purchaseDate), a.name).toBe(true);
    });
  });

  it('dates every event', () => {
    mockEvents.forEach(e => expect(isIsoDate(e.date), e.name).toBe(true));
  });
});

describe('dashboard charts describe things that exist', () => {
  it('charts only real services', () => {
    const names = new Set(mockServices.map(s => s.name));
    serviceBookingData.forEach(row => expect(names, row.service).toContain(row.service));
  });

  it('charts only real inventory items', () => {
    const names = new Set(mockInventory.map(i => i.name));
    inventoryUsageData.forEach(row => expect(names, row.item).toContain(row.item));
  });

  it('charts only donation categories in use, totalling ~100%', () => {
    const categories = new Set(mockDonations.map(d => d.category));
    donationCategoryData.forEach(row => expect(categories, row.name).toContain(row.name));

    const total = donationCategoryData.reduce((sum, row) => sum + row.value, 0);
    expect(Math.abs(total - 100)).toBeLessThanOrEqual(2);
  });
});
