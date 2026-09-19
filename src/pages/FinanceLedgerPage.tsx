import React, { useMemo, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { FinanceHeader } from '@/components/finance/FinanceHeader';
import { FinanceStats } from '@/components/finance/FinanceStats';
import { FinanceTable, type DirectionFilter } from '@/components/finance/FinanceTable';
import { FinanceForm, type FinanceFormValues } from '@/components/finance/FinanceForm';
import { mockLedgerEntries } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { toISODate } from '@/lib/utils';
import {
  getCategoriesFor,
  getLedgerTotals,
  nextVoucherNo,
  withRunningBalance,
  type LedgerEntry,
  type LedgerRow,
} from '@/lib/finance';

const emptyForm: FinanceFormValues = {
  voucherNo: '',
  date: toISODate(new Date()),
  direction: 'Expense',
  category: '',
  particulars: '',
  amount: '',
  paymentMode: '',
  reference: '',
  notes: '',
};

const FinanceLedgerPage: React.FC = () => {
  const { items, add, update, remove } = useStore<LedgerEntry>(mockLedgerEntries);
  const { user } = useAuth();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FinanceFormValues>(emptyForm);
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // The route is admin-only; a manager who reaches it reads without posting.
  const canWrite = user?.role === 'admin';

  const openAdd = () => {
    if (!canWrite) return;
    setForm({ ...emptyForm, voucherNo: nextVoucherNo(items) });
    setEditId(null);
    setErrors({});
    setView('form');
  };

  const openEdit = (row: LedgerRow) => {
    // Entries auto-posted from another register are edited at their source.
    if (!canWrite || row.sourceModule) return;
    setForm({
      voucherNo: row.voucherNo,
      date: row.date,
      direction: row.direction,
      category: row.category,
      particulars: row.particulars,
      amount: String(row.amount),
      paymentMode: row.paymentMode,
      reference: row.reference,
      notes: row.notes || '',
    });
    setEditId(row.id);
    setErrors({});
    setView('form');
  };

  const setField = (key: keyof FinanceFormValues, val: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: val } as FinanceFormValues;

      // Income and expense have different category lists, so switching type
      // clears a category that no longer belongs.
      if (key === 'direction' && !getCategoriesFor(next.direction).includes(prev.category)) {
        next.category = '';
      }

      return next;
    });

    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleSave = async () => {
    if (!canWrite) return;

    const fieldErrors: Record<string, string> = {};
    if (form.particulars.trim().length < 4)
      fieldErrors.particulars = 'Describe the entry in at least 4 characters';
    if (!form.category) fieldErrors.category = 'Category is required';
    if (!form.date) fieldErrors.date = 'Entry date is required';
    if (form.date > toISODate(new Date())) fieldErrors.date = 'Entry date cannot be in the future';
    if (!form.amount || Number(form.amount) <= 0) fieldErrors.amount = 'Amount must be greater than zero';
    if (!form.paymentMode) fieldErrors.paymentMode = 'Payment mode is required';

    if (Object.keys(fieldErrors).length > 0) {
      fieldErrors.form = 'Please fix the highlighted fields';
      setErrors(fieldErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    const payload = {
      voucherNo: form.voucherNo || nextVoucherNo(items),
      date: form.date,
      direction: form.direction,
      category: form.category,
      particulars: form.particulars.trim(),
      amount: Number(form.amount),
      paymentMode: form.paymentMode,
      reference: form.reference.trim(),
      notes: form.notes.trim(),
    };

    setIsSaving(true);
    // Mock persistence — swap for the real API call when the backend lands.
    await new Promise(resolve => setTimeout(resolve, 400));

    if (editId) {
      update(editId, payload);
      toast.success(`${payload.voucherNo} updated`);
    } else {
      add(payload);
      toast.success(`${payload.voucherNo} posted to the ledger`);
    }

    setIsSaving(false);
    setView('list');
  };

  // The balance is computed over the whole ledger before filtering, so a
  // filtered view still shows each entry's true running balance.
  const allRows = useMemo(() => withRunningBalance(items), [items]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allRows.filter(row => {
      if (directionFilter !== 'All' && row.direction !== directionFilter) return false;
      if (categoryFilter !== 'All' && row.category !== categoryFilter) return false;
      if (!q) return true;

      return (
        row.voucherNo.toLowerCase().includes(q) ||
        row.particulars.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.reference.toLowerCase().includes(q)
      );
    });
  }, [allRows, search, directionFilter, categoryFilter]);

  // Totals follow the filters, so the tiles describe what's on screen.
  const totals = useMemo(() => getLedgerTotals(filteredRows), [filteredRows]);

  const pendingDelete = items.find(entry => entry.id === deleteId);

  if (view === 'form') {
    return (
      <div className="h-full animate-fade-in">
        <FinanceForm
          editId={editId}
          form={form}
          errors={errors}
          isSaving={isSaving}
          onCancel={() => setView('list')}
          onSave={handleSave}
          setField={setField}
        />
      </div>
    );
  }

  return (
    <div className="finance-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in pb-10">
      <FinanceHeader canWrite={canWrite} onOpenAdd={openAdd} />

      <FinanceStats totals={totals} />

      <FinanceTable
        rows={filteredRows}
        search={search}
        onSearchChange={setSearch}
        directionFilter={directionFilter}
        onDirectionFilterChange={setDirectionFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        onEdit={openEdit}
        onDelete={setDeleteId}
        canWrite={canWrite}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId && canWrite) {
            remove(deleteId);
            toast.success('Ledger entry reversed');
          }
          setDeleteId(null);
        }}
        title="Reverse Ledger Entry"
        message={
          pendingDelete
            ? `This will permanently remove ${pendingDelete.voucherNo} and recalculate the running balance.`
            : 'This will permanently remove the entry and recalculate the running balance.'
        }
      />
    </div>
  );
};

export default FinanceLedgerPage;
