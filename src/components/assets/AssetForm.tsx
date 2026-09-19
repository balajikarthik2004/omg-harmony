import React from 'react';
import { ArrowLeft, Building2, Calendar, IndianRupee, LayoutGrid, Save, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface AssetFormValues {
  name: string;
  category: string;
  purchaseDate: string;
  cost: string;
  condition: string;
  maintenanceStatus: string;
  notes: string;
}

interface AssetFormProps {
  editId: string | null;
  form: AssetFormValues;
  errors: Record<string, string>;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  setField: (key: keyof AssetFormValues, val: string) => void;
}

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];
const MAINTENANCE_STATUSES = ['Up to Date', 'Due Soon', 'Overdue'];

const labelClass =
  'text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block';

export const AssetForm: React.FC<AssetFormProps> = ({
  editId,
  form,
  errors,
  isSaving,
  onCancel,
  onSave,
  setField,
}) => {
  const inputClass = (hasError: boolean) =>
    cn(
      'w-full h-12 rounded-lg border bg-background/80 px-4 text-sm font-semibold shadow-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/20',
      hasError ? 'border-destructive focus:border-destructive' : 'border-input hover:border-border focus:border-emerald-500'
    );

  const fieldError = (key: string) =>
    errors[key] ? (
      <p className="text-xs font-semibold text-destructive mt-2 ml-1 tracking-wide">{errors[key]}</p>
    ) : null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in h-full flex flex-col pb-4">
      <div className="bg-card rounded-2xl border border-border/60 shadow-xl overflow-hidden flex flex-col flex-1">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-border/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <button
              onClick={onCancel}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-600 active:scale-95 group/back"
              title="Return to Registry"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover/back:-translate-x-0.5" />
            </button>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <h1 className="text-[17px] font-semibold text-foreground tracking-tight leading-tight font-display">
                {editId ? 'Modify Asset Profile' : 'Add New Asset'}
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground tracking-[0.12em] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Secure Protocol
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                <span className="text-[11px] font-semibold text-muted-foreground tracking-[0.12em]">
                  Registry v3.4
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-8 px-6 sm:px-10">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Identification */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em]">
                  Asset Identification
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label className={labelClass}>Asset Designation *</Label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-emerald-500" />
                    <Input
                      value={form.name}
                      onChange={e => setField('name', e.target.value)}
                      className={cn(inputClass(!!errors.name), 'pl-11')}
                      placeholder="e.g. Suvarna Gopuram Entrance Door"
                    />
                  </div>
                  {fieldError('name')}
                </div>

                <div>
                  <Label className={labelClass}>Capital Category *</Label>
                  <div className="relative group">
                    <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-emerald-500" />
                    <Input
                      value={form.category}
                      onChange={e => setField('category', e.target.value)}
                      className={cn(inputClass(!!errors.category), 'pl-11')}
                      placeholder="e.g. Infrastructure, Sacred Items"
                    />
                  </div>
                  {fieldError('category')}
                </div>

                <div>
                  <Label className={labelClass}>Acquisition Date *</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-emerald-500" />
                    <Input
                      type="date"
                      value={form.purchaseDate}
                      onChange={e => setField('purchaseDate', e.target.value)}
                      className={cn(inputClass(!!errors.purchaseDate), 'pl-11')}
                    />
                  </div>
                  {fieldError('purchaseDate')}
                </div>

                <div className="md:col-span-2">
                  <Label className={labelClass}>Acquisition Value (₹)</Label>
                  <div className="relative group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-emerald-500" />
                    <Input
                      type="number"
                      min="0"
                      value={form.cost}
                      onChange={e => setField('cost', e.target.value)}
                      className={cn(inputClass(!!errors.cost), 'pl-11')}
                      placeholder="e.g. 450000"
                    />
                  </div>
                  {fieldError('cost')}
                </div>
              </div>
            </section>

            {/* Condition & audit */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-5 rounded-full bg-amber-500" />
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em]">
                  Condition &amp; Audit Status
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className={labelClass}>Physical Condition Profile *</Label>
                  <Select value={form.condition} onValueChange={val => setField('condition', val)}>
                    <SelectTrigger className={inputClass(!!errors.condition)}>
                      <SelectValue placeholder="Assess Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError('condition')}
                </div>

                <div>
                  <Label className={labelClass}>Maintenance Cycle Status *</Label>
                  <Select
                    value={form.maintenanceStatus}
                    onValueChange={val => setField('maintenanceStatus', val)}
                  >
                    <SelectTrigger className={inputClass(!!errors.maintenanceStatus)}>
                      <SelectValue placeholder="Select Maintenance State" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_STATUSES.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError('maintenanceStatus')}
                </div>

                <div className="md:col-span-2">
                  <Label className={labelClass}>Audit Notes &amp; Locational Details</Label>
                  <textarea
                    value={form.notes}
                    onChange={e => setField('notes', e.target.value)}
                    className={cn(inputClass(false), 'h-36 py-4 resize-none leading-relaxed')}
                    placeholder="Specify exact location within temple premises, serial numbers, or detailed maintenance history..."
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-5 border-t border-border/60 bg-card flex items-center justify-between shrink-0 gap-4">
          {errors.form ? (
            <div className="flex items-center gap-2.5 text-destructive">
              <div className="w-1 h-5 rounded-full bg-destructive" />
              <span className="text-sm font-semibold tracking-wide">{errors.form}</span>
            </div>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground px-6 transition-colors font-display"
            >
              Cancel
            </button>
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="px-8 h-12 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-lg transition-all active:scale-[0.98] flex items-center gap-2.5 font-display"
            >
              {isSaving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Finalize Asset Registry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetForm;
