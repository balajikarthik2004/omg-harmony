import React, { useMemo, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { AssetsHeader } from '@/components/assets/AssetsHeader';
import { AssetsStats } from '@/components/assets/AssetsStats';
import { AssetsTable } from '@/components/assets/AssetsTable';
import { AssetForm, type AssetFormValues } from '@/components/assets/AssetForm';
import { mockAssets, type Asset } from '@/data/mockData';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/contexts/AuthContext';

const emptyForm: AssetFormValues = {
  name: '',
  category: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  cost: '',
  condition: '',
  maintenanceStatus: '',
  notes: '',
};

const AssetsPage: React.FC = () => {
  const { items, add, update, remove } = useStore<Asset>(mockAssets);
  const { user } = useAuth();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<AssetFormValues>(emptyForm);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // The /assets route is already admin-only; managers reaching it read-only.
  const canWrite = user?.role === 'admin';

  const openAdd = () => {
    if (!canWrite) return;
    setForm(emptyForm);
    setEditId(null);
    setErrors({});
    setView('form');
  };

  const openEdit = (item: Asset) => {
    if (!canWrite) return;
    setForm({
      name: item.name,
      category: item.category,
      purchaseDate: item.purchaseDate || '',
      cost: item.cost ? String(item.cost) : '',
      condition: item.condition,
      maintenanceStatus: item.maintenanceStatus,
      notes: item.notes || '',
    });
    setEditId(item.id);
    setErrors({});
    setView('form');
  };

  const setField = (key: keyof AssetFormValues, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSave = async () => {
    if (!canWrite) return;

    const fieldErrors: Record<string, string> = {};
    if (form.name.trim().length < 3) fieldErrors.name = 'Asset name must be at least 3 characters';
    if (!form.category.trim()) fieldErrors.category = 'Category is required';
    if (!form.purchaseDate) fieldErrors.purchaseDate = 'Acquisition date is required';
    if (!form.condition) fieldErrors.condition = 'Physical condition assessment is required';
    if (!form.maintenanceStatus) fieldErrors.maintenanceStatus = 'Maintenance status is required';
    if (form.cost && Number(form.cost) < 0) fieldErrors.cost = 'Value cannot be negative';

    if (Object.keys(fieldErrors).length > 0) {
      fieldErrors.form = 'Please fill the highlighted fields';
      setErrors(fieldErrors);
      toast.error('Please fill the highlighted fields');
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      purchaseDate: form.purchaseDate,
      cost: Number(form.cost) || 0,
      condition: form.condition,
      maintenanceStatus: form.maintenanceStatus,
      notes: form.notes.trim(),
    };

    setIsSaving(true);
    // Mock persistence — swap for the real API call when the backend lands.
    await new Promise(resolve => setTimeout(resolve, 400));

    if (editId) {
      update(editId, payload);
      toast.success('Asset profile updated successfully');
    } else {
      add(payload);
      toast.success('New asset registered successfully');
    }

    setIsSaving(false);
    setView('list');
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.condition.toLowerCase().includes(q)
    );
  }, [items, search]);

  const stats = useMemo(
    () => ({
      total: items.length,
      inService: items.filter(a => a.maintenanceStatus === 'Up to Date').length,
      maintenance: items.filter(a => a.maintenanceStatus !== 'Up to Date').length,
      totalValue: items.reduce((acc, a) => acc + (Number(a.cost) || 0), 0),
    }),
    [items]
  );

  if (view === 'form') {
    return (
      <div className="h-full animate-fade-in">
        <AssetForm
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
    <div className="assets-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in pb-10">
      <AssetsHeader canWrite={canWrite} onOpenAdd={openAdd} />

      <AssetsStats
        total={stats.total}
        inService={stats.inService}
        maintenance={stats.maintenance}
        totalValue={stats.totalValue}
      />

      <AssetsTable
        items={filteredItems}
        search={search}
        onSearchChange={setSearch}
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
            toast.success('Asset removed from temple registry');
          }
          setDeleteId(null);
        }}
        title="Remove Asset"
        message="Are you sure you want to decommission this asset? This will permanently remove it from the temple registry ledger."
      />
    </div>
  );
};

export default AssetsPage;
