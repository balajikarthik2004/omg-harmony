/**
 * Finance Ledger Management.
 *
 * A single chronological ledger of money in and money out. Income entries are
 * derived from the registers that already record the money (donations, paid
 * pooja bookings) so the ledger can never disagree with them; expenses are
 * recorded directly here because nothing else in the app captures them.
 */

export type LedgerDirection = 'Income' | 'Expense';

export interface LedgerEntry {
  id: string;
  voucherNo: string;
  date: string;
  direction: LedgerDirection;
  category: string;
  particulars: string;
  amount: number;
  paymentMode: string;
  /** Receipt number, booking id, invoice number - whatever backs the entry. */
  reference: string;
  /** Set when the entry came from another register rather than being keyed in. */
  sourceModule?: 'Donations' | 'Pooja & Seva';
  notes?: string;
}

/** An entry with its running balance, as a ledger is meant to be read. */
export interface LedgerRow extends LedgerEntry {
  balance: number;
}

export const INCOME_CATEGORIES = [
  'Donation',
  'Pooja & Seva',
  'Hall Rental',
  'Membership Fee',
  'Hundi Collection',
  'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Salaries & Honorarium',
  'Annadhanam Provisions',
  'Maintenance & Repairs',
  'Utilities',
  'Procurement',
  'Festival Expenses',
  'Other Expense',
];

export const getCategoriesFor = (direction: LedgerDirection): string[] =>
  direction === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

export const LEDGER_PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Cheque', 'Bank Transfer'];

/** Income adds, expense subtracts. */
export const signedAmount = (entry: LedgerEntry): number =>
  entry.direction === 'Income' ? entry.amount : -entry.amount;

/** Oldest first - the order a ledger is posted and a balance accumulates in. */
export const sortByDateAscending = <T extends LedgerEntry>(entries: T[]): T[] =>
  [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.voucherNo.localeCompare(b.voucherNo));

/**
 * Attaches the running balance to each entry, then returns them newest first
 * for display. The balance is always computed over the whole ledger, never over
 * the filtered subset, so filtering can't produce a misleading closing figure.
 */
export const withRunningBalance = (entries: LedgerEntry[]): LedgerRow[] => {
  let balance = 0;
  const posted = sortByDateAscending(entries).map(entry => {
    balance += signedAmount(entry);
    return { ...entry, balance };
  });
  return posted.reverse();
};

export interface LedgerTotals {
  income: number;
  expense: number;
  net: number;
  entryCount: number;
}

export const getLedgerTotals = (entries: LedgerEntry[]): LedgerTotals => {
  const income = entries
    .filter(entry => entry.direction === 'Income')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const expense = entries
    .filter(entry => entry.direction === 'Expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  return { income, expense, net: income - expense, entryCount: entries.length };
};

/** VCH-0043 style, continuing from the highest number already issued. */
export const nextVoucherNo = (entries: LedgerEntry[]): string => {
  const highest = entries.reduce((max, entry) => {
    const digits = Number(entry.voucherNo.split('-').pop());
    return Number.isFinite(digits) && digits > max ? digits : max;
  }, 0);
  return `VCH-${String(highest + 1).padStart(4, '0')}`;
};

export const formatRupees = (amount: number): string => `₹${Math.round(amount).toLocaleString('en-IN')}`;
