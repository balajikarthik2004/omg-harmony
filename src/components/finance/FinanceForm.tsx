import React from 'react';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, CalendarDays, FileText, IndianRupee, Save } from 'lucide-react';
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
import { LEDGER_PAYMENT_MODES, getCategoriesFor, type LedgerDirection } from '@/lib/finance';

export interface FinanceFormValues {
  voucherNo: string;
  date: string;
  direction: LedgerDirection;
  category: string;
  particulars: string;
  amount: string;
  paymentMode: string;
  reference: string;
  notes: string;
}

interface FinanceFormProps {
  editId: string | null;
  form: FinanceFormValues;
  errors: Record<string, string>;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  setField: (key: keyof FinanceFormValues, val: string) => void;
}

const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block';

export const FinanceForm: React.FC<FinanceFormProps> = ({
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
      'w-full h-12 rounded-lg border bg-background/80 px-4 text-sm font-semibold shadow-sm outline-none transition-all focus:ring-2 focus:ring-primary/20',
      hasError
        ? 'border-destructive focus:border-destructive'
        : 'border-input hover:border-border focus:border-primary'
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
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-95 group/back"
              title="Return to Ledger"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover/back:-translate-x-0.5" />
            </button>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <h1 className="text-[17px] font-semibold text-foreground tracking-tight leading-tight font-display">
                {editId ? 'Amend Ledger Entry' : 'Post Ledger Entry'}
              </h1>
              <span className="text-[11px] font-semibold text-muted-foreground tracking-[0.12em] flex items-center gap-1.5 mt-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                {form.voucherNo || 'Voucher number assigned on save'}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-8 px-6 sm:px-10">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Direction */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-5 rounded-full bg-primary" />
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em]">
                  Entry Type
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(['Income', 'Expense'] as LedgerDirection[]).map(option => {
                  const active = form.direction === option;
                  const Icon = option === 'Income' ? ArrowUpRight : ArrowDownLeft;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setField('direction', option)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                        active
                          ? option === 'Income'
                            ? 'border-emerald-500/50 bg-emerald-500/10 shadow-sm'
                            : 'border-destructive/50 bg-destructive/10 shadow-sm'
                          : 'border-border bg-background/60 hover:border-border/80 hover:bg-muted/40'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg',
                          option === 'Income'
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : 'bg-destructive/15 text-destructive'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-foreground">{option}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {option === 'Income' ? 'Money received' : 'Money paid out'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {fieldError('direction')}
            </section>

            {/* Entry detail */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em]">
                  Entry Detail
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label className={labelClass}>Particulars *</Label>
                  <Input
                    value={form.particulars}
                    onChange={e => setField('particulars', e.target.value)}
                    className={inputClass(!!errors.particulars)}
                    placeholder="e.g. Electricity board bill - September"
                  />
                  {fieldError('particulars')}
                </div>

                <div>
                  <Label className={labelClass}>Category *</Label>
                  <Select value={form.category} onValueChange={val => setField('category', val)}>
                    <SelectTrigger className={inputClass(!!errors.category)}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategoriesFor(form.direction).map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError('category')}
                </div>

                <div>
                  <Label className={labelClass}>Entry Date *</Label>
                  <div className="relative group">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                    <Input
                      type="date"
                      value={form.date}
                      onChange={e => setField('date', e.target.value)}
                      className={cn(inputClass(!!errors.date), 'pl-11')}
                    />
                  </div>
                  {fieldError('date')}
                </div>

                <div>
                  <Label className={labelClass}>Amount (₹) *</Label>
                  <div className="relative group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                    <Input
                      type="number"
                      min="1"
                      value={form.amount}
                      onChange={e => setField('amount', e.target.value)}
                      className={cn(inputClass(!!errors.amount), 'pl-11')}
                      placeholder="74500"
                    />
                  </div>
                  {fieldError('amount')}
                </div>

                <div>
                  <Label className={labelClass}>Payment Mode *</Label>
                  <Select value={form.paymentMode} onValueChange={val => setField('paymentMode', val)}>
                    <SelectTrigger className={inputClass(!!errors.paymentMode)}>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEDGER_PAYMENT_MODES.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError('paymentMode')}
                </div>

                <div className="md:col-span-2">
                  <Label className={labelClass}>Reference</Label>
                  <Input
                    value={form.reference}
                    onChange={e => setField('reference', e.target.value)}
                    className={inputClass(false)}
                    placeholder="Invoice, receipt or transaction number"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className={labelClass}>Notes</Label>
                  <textarea
                    value={form.notes}
                    onChange={e => setField('notes', e.target.value)}
                    className={cn(inputClass(false), 'h-32 py-4 resize-none leading-relaxed')}
                    placeholder="Approval reference, vendor details, or anything an auditor would ask about..."
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
              className="px-8 h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-lg transition-all active:scale-[0.98] flex items-center gap-2.5 font-display"
            >
              {isSaving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editId ? 'Save Changes' : 'Post to Ledger'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceForm;
