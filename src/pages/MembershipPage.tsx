import React, { useMemo, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { MembershipHeader } from '@/components/membership/MembershipHeader';
import { MembershipStats } from '@/components/membership/MembershipStats';
import { MembershipTable, type StatusFilter } from '@/components/membership/MembershipTable';
import {
  MembershipForm,
  type MembershipFormValues,
} from '@/components/membership/MembershipForm';
import { mockMemberships, type Membership } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { calculateExpiryDate, getMembershipStatus, getMembershipType } from '@/lib/membership';
import { toISODate } from '@/lib/utils';

const today = () => toISODate(new Date());

const emptyForm: MembershipFormValues = {
  membershipNo: '',
  name: '',
  phone: '',
  email: '',
  membershipType: '',
  startDate: today(),
  expiryDate: '',
  fee: '',
  paymentMode: '',
  notes: '',
};

/** OMG-MEM-0015 style, continuing from the highest existing number. */
const nextMembershipNo = (members: Membership[]): string => {
  const highest = members.reduce((max, member) => {
    const digits = Number(member.membershipNo.split('-').pop());
    return Number.isFinite(digits) && digits > max ? digits : max;
  }, 0);
  return `OMG-MEM-${String(highest + 1).padStart(4, '0')}`;
};

const MembershipPage: React.FC = () => {
  const { items, add, update, remove } = useStore<Membership>(mockMemberships);
  const { user } = useAuth();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<MembershipFormValues>(emptyForm);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const canWrite = user?.role === 'admin' || user?.role === 'manager';

  const openAdd = () => {
    if (!canWrite) return;
    setForm({ ...emptyForm, membershipNo: nextMembershipNo(items) });
    setEditId(null);
    setErrors({});
    setView('form');
  };

  const openEdit = (member: Membership) => {
    if (!canWrite) return;
    setForm({
      membershipNo: member.membershipNo,
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      membershipType: member.membershipType,
      startDate: member.startDate,
      expiryDate: member.expiryDate,
      fee: String(member.fee ?? ''),
      paymentMode: member.paymentMode,
      notes: member.notes || '',
    });
    setEditId(member.id);
    setErrors({});
    setView('form');
  };

  /** Renewal starts a fresh term from today at the plan's current fee. */
  const openRenew = (member: Membership) => {
    if (!canWrite) return;
    const start = today();
    const type = getMembershipType(member.membershipType);
    setForm({
      membershipNo: member.membershipNo,
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      membershipType: member.membershipType,
      startDate: start,
      expiryDate: calculateExpiryDate(member.membershipType, start),
      fee: String(type?.fee ?? member.fee ?? ''),
      paymentMode: member.paymentMode,
      notes: member.notes || '',
    });
    setEditId(member.id);
    setErrors({});
    setView('form');
    toast.info(`Renewing ${member.name} — term restarts today`);
  };

  const setField = (key: keyof MembershipFormValues, val: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };

      // Expiry is always derived, never typed in.
      if (key === 'membershipType' || key === 'startDate') {
        next.expiryDate = calculateExpiryDate(next.membershipType, next.startDate);
      }
      // Selecting a category prefills its standard fee unless one was already entered.
      if (key === 'membershipType' && !prev.fee) {
        next.fee = String(getMembershipType(val)?.fee ?? '');
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
    if (form.name.trim().length < 3) fieldErrors.name = 'Member name must be at least 3 characters';
    if (!/^[+\d][\d\s-]{7,}$/.test(form.phone.trim())) fieldErrors.phone = 'Enter a valid mobile number';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      fieldErrors.email = 'Enter a valid email address';
    if (!form.membershipType) fieldErrors.membershipType = 'Membership category is required';
    if (!form.startDate) fieldErrors.startDate = 'Start date is required';
    // Volunteer and Staff Member categories carry no fee, so 0 is valid - blank is not.
    if (form.fee.trim() === '' || Number.isNaN(Number(form.fee)) || Number(form.fee) < 0)
      fieldErrors.fee = 'Enter the fee collected (0 for service categories)';
    if (!form.paymentMode) fieldErrors.paymentMode = 'Payment mode is required';

    const duplicate = items.find(
      member =>
        member.id !== editId && member.phone.replace(/\s/g, '') === form.phone.replace(/\s/g, '')
    );
    if (duplicate) fieldErrors.phone = `Already enrolled as ${duplicate.membershipNo}`;

    if (Object.keys(fieldErrors).length > 0) {
      fieldErrors.form = 'Please fix the highlighted fields';
      setErrors(fieldErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    const payload = {
      // Enrolments made here are not yet linked to a devotee record.
      devoteeId: editId ? (items.find(m => m.id === editId)?.devoteeId ?? '') : '',
      membershipNo: form.membershipNo || nextMembershipNo(items),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      membershipType: form.membershipType,
      startDate: form.startDate,
      expiryDate: calculateExpiryDate(form.membershipType, form.startDate),
      fee: Number(form.fee),
      paymentMode: form.paymentMode,
      notes: form.notes.trim(),
    };

    setIsSaving(true);
    // Mock persistence — swap for the real API call when the backend lands.
    await new Promise(resolve => setTimeout(resolve, 400));

    if (editId) {
      update(editId, payload);
      toast.success(`${payload.name}'s membership updated`);
    } else {
      add(payload);
      toast.success(`${payload.name} enrolled as ${payload.membershipNo}`);
    }

    setIsSaving(false);
    setView('list');
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter(member => {
      if (typeFilter !== 'All' && member.membershipType !== typeFilter) return false;
      if (statusFilter !== 'All' && getMembershipStatus(member) !== statusFilter) return false;
      if (!q) return true;

      return (
        member.name.toLowerCase().includes(q) ||
        member.membershipNo.toLowerCase().includes(q) ||
        member.phone.toLowerCase().includes(q) ||
        (member.email || '').toLowerCase().includes(q)
      );
    });
  }, [items, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const statuses = items.map(member => getMembershipStatus(member));
    return {
      total: items.length,
      active: statuses.filter(s => s === 'Active').length,
      expiringSoon: statuses.filter(s => s === 'Expiring Soon').length,
      expired: statuses.filter(s => s === 'Expired').length,
      revenue: items.reduce((sum, member) => sum + (Number(member.fee) || 0), 0),
    };
  }, [items]);

  const pendingDelete = items.find(member => member.id === deleteId);

  if (view === 'form') {
    return (
      <div className="h-full animate-fade-in">
        <MembershipForm
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
    <div className="membership-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in pb-10">
      <MembershipHeader canWrite={canWrite} onOpenAdd={openAdd} />

      <MembershipStats
        total={stats.total}
        active={stats.active}
        expiringSoon={stats.expiringSoon}
        expired={stats.expired}
        revenue={stats.revenue}
      />

      <MembershipTable
        items={filteredItems}
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onEdit={openEdit}
        onRenew={openRenew}
        onDelete={setDeleteId}
        canWrite={canWrite}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId && canWrite) {
            remove(deleteId);
            toast.success('Membership removed from the register');
          }
          setDeleteId(null);
        }}
        title="Remove Membership"
        message={
          pendingDelete
            ? `This will permanently remove ${pendingDelete.name} (${pendingDelete.membershipNo}) from the membership register.`
            : 'This will permanently remove the member from the membership register.'
        }
      />
    </div>
  );
};

export default MembershipPage;
