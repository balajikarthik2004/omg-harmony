import { describe, expect, it } from 'vitest';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getLedgerTotals,
  nextVoucherNo,
  signedAmount,
  withRunningBalance,
  type LedgerEntry,
} from '@/lib/finance';
import { mockBookings, mockDonations, mockLedgerEntries, mockServices } from '@/data/mockData';

const entry = (over: Partial<LedgerEntry>): LedgerEntry => ({
  id: 'e',
  voucherNo: 'VCH-0001',
  date: '2026-01-01',
  direction: 'Income',
  category: 'Donation',
  particulars: 'Test entry',
  amount: 1000,
  paymentMode: 'Cash',
  reference: 'RC-0001',
  ...over,
});

describe('ledger arithmetic', () => {
  it('adds income and subtracts expense', () => {
    expect(signedAmount(entry({ direction: 'Income', amount: 500 }))).toBe(500);
    expect(signedAmount(entry({ direction: 'Expense', amount: 500 }))).toBe(-500);
  });

  it('totals income, expense and net separately', () => {
    const totals = getLedgerTotals([
      entry({ id: 'a', direction: 'Income', amount: 1000 }),
      entry({ id: 'b', direction: 'Income', amount: 500 }),
      entry({ id: 'c', direction: 'Expense', amount: 600 }),
    ]);

    expect(totals).toEqual({ income: 1500, expense: 600, net: 900, entryCount: 3 });
  });

  it('accumulates the running balance in date order, newest row first', () => {
    const rows = withRunningBalance([
      entry({ id: 'c', voucherNo: 'VCH-0003', date: '2026-03-01', direction: 'Expense', amount: 400 }),
      entry({ id: 'a', voucherNo: 'VCH-0001', date: '2026-01-01', direction: 'Income', amount: 1000 }),
      entry({ id: 'b', voucherNo: 'VCH-0002', date: '2026-02-01', direction: 'Income', amount: 500 }),
    ]);

    // Display order is newest first...
    expect(rows.map(r => r.id)).toEqual(['c', 'b', 'a']);
    // ...but the balance accumulated oldest first: 1000, 1500, 1100.
    expect(rows.map(r => r.balance)).toEqual([1100, 1500, 1000]);
  });

  it('closes on the same figure as the net total', () => {
    const entries = [
      entry({ id: 'a', date: '2026-01-01', direction: 'Income', amount: 1000 }),
      entry({ id: 'b', date: '2026-02-01', direction: 'Expense', amount: 250 }),
      entry({ id: 'c', date: '2026-03-01', direction: 'Income', amount: 75 }),
    ];

    expect(withRunningBalance(entries)[0].balance).toBe(getLedgerTotals(entries).net);
  });

  it('issues the next voucher number from the highest already used', () => {
    expect(nextVoucherNo([entry({ voucherNo: 'VCH-0007' }), entry({ voucherNo: 'VCH-0042' })])).toBe(
      'VCH-0043'
    );
    expect(nextVoucherNo([])).toBe('VCH-0001');
  });
});

describe('ledger agrees with the registers it is posted from', () => {
  it('posts every successful donation exactly once', () => {
    const successful = mockDonations.filter(d => d.paymentStatus === 'Success');
    const posted = mockLedgerEntries.filter(e => e.sourceModule === 'Donations');

    expect(posted).toHaveLength(successful.length);
    successful.forEach(donation => {
      const row = posted.find(e => e.reference === donation.receiptNumber);
      expect(row, donation.receiptNumber).toBeDefined();
      expect(row!.amount).toBe(donation.amount);
      expect(row!.date).toBe(donation.date);
      expect(row!.direction).toBe('Income');
    });
  });

  it('posts paid bookings at the price on the service', () => {
    const paid = mockBookings.filter(b => b.paymentStatus === 'Paid');
    const posted = mockLedgerEntries.filter(e => e.sourceModule === 'Pooja & Seva');

    expect(posted).toHaveLength(paid.length);
    paid.forEach(booking => {
      const row = posted.find(e => e.reference === booking.id);
      expect(row, booking.id).toBeDefined();
      expect(row!.amount).toBe(mockServices.find(s => s.name === booking.serviceName)?.price ?? 0);
    });
  });

  it('never posts a refunded or pending booking', () => {
    const notPaid = new Set(
      mockBookings.filter(b => b.paymentStatus !== 'Paid').map(b => b.id)
    );
    mockLedgerEntries
      .filter(e => e.sourceModule === 'Pooja & Seva')
      .forEach(e => expect(notPaid.has(e.reference)).toBe(false));
  });

  it('never posts a zero-value entry', () => {
    mockLedgerEntries.forEach(e => expect(e.amount, e.voucherNo).toBeGreaterThan(0));
  });

  it('prices every service a booking can reference', () => {
    const priced = new Set(mockServices.filter(s => s.price > 0).map(s => s.name));
    mockBookings.forEach(b => expect(priced, b.serviceName).toContain(b.serviceName));
  });

  it('runs a surplus - income covers expenses', () => {
    const totals = getLedgerTotals(mockLedgerEntries);
    expect(totals.net).toBeGreaterThan(0);
    expect(totals.income).toBeGreaterThan(totals.expense);
  });

  it('uses only defined categories and unique voucher numbers', () => {
    const known = new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]);
    mockLedgerEntries.forEach(e => expect(known, e.voucherNo).toContain(e.category));

    const vouchers = mockLedgerEntries.map(e => e.voucherNo);
    expect(new Set(vouchers).size).toBe(vouchers.length);
  });
});
