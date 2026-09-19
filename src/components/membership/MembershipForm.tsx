import React from 'react';
import { ArrowLeft, BadgeCheck, CalendarDays, IndianRupee, Mail, Phone, Save, User } from 'lucide-react';
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
import { cn, formatDateDDMMYYYY } from '@/lib/utils';
import { MEMBERSHIP_TYPES, getMembershipType } from '@/lib/membership';

export interface MembershipFormValues {
  membershipNo: string;
  name: string;
  phone: string;
  email: string;
  membershipType: string;
  startDate: string;
  expiryDate: string;
  fee: string;
  paymentMode: string;
  notes: string;
}

interface MembershipFormProps {
  editId: string | null;
  form: MembershipFormValues;
  errors: Record<string, string>;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  setField: (key: keyof MembershipFormValues, val: string) => void;
}

const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Cheque', 'Bank Transfer', 'Not Applicable'];

const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block';

export const MembershipForm: React.FC<MembershipFormProps> = ({
  editId,
  form,
  errors,
  isSaving,
  onCancel,
  onSave,
  setField,
}) => {
  const type = getMembershipType(form.membershipType);
  const isLifetime = type?.durationMonths === null;

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
              title="Return to Register"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover/back:-translate-x-0.5" />
            </button>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <h1 className="text-[17px] font-semibold text-foreground tracking-tight leading-tight font-display">
                {editId ? 'Update Membership' : 'Enrol New Member'}
              </h1>
              <span className="text-[11px] font-semibold text-muted-foreground tracking-[0.12em] flex items-center gap-1.5 mt-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                {form.membershipNo || 'Number assigned on save'}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-8 px-6 sm:px-10">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Member details */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-5 rounded-full bg-primary" />
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em]">
                  Member Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label className={labelClass}>Full Name *</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                    <Input
                      value={form.name}
                      onChange={e => setField('name', e.target.value)}
                      className={cn(inputClass(!!errors.name), 'pl-11')}
                      placeholder="e.g. Lakshmi Narayanan"
                    />
                  </div>
                  {fieldError('name')}
                </div>

                <div>
                  <Label className={labelClass}>Mobile Number *</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                    <Input
                      value={form.phone}
                      onChange={e => setField('phone', e.target.value)}
                      className={cn(inputClass(!!errors.phone), 'pl-11')}
                      placeholder="+91 98407 22110"
                    />
                  </div>
                  {fieldError('phone')}
                </div>

                <div>
                  <Label className={labelClass}>Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                    <Input
                      type="email"
                      value={form.email}
                      onChange={e => setField('email', e.target.value)}
                      className={cn(inputClass(!!errors.email), 'pl-11')}
                      placeholder="member@example.com"
                    />
                  </div>
                  {fieldError('email')}
                </div>
              </div>
            </section>

            {/* Category & validity */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em]">
                  Category &amp; Validity
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label className={labelClass}>Membership Category *</Label>
                  <Select
                    value={form.membershipType}
                    onValueChange={val => setField('membershipType', val)}
                  >
                    <SelectTrigger className={inputClass(!!errors.membershipType)}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBERSHIP_TYPES.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label} — {option.fee > 0 ? `₹${option.fee.toLocaleString('en-IN')}` : 'No fee'}
                          {option.durationMonths ? ` / ${option.durationMonths} months` : ' / lifetime'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {type && <p className="text-[11px] text-muted-foreground mt-2 ml-1">{type.summary}</p>}
                  {fieldError('membershipType')}
                </div>

                <div>
                  <Label className={labelClass}>Start Date *</Label>
                  <div className="relative group">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={e => setField('startDate', e.target.value)}
                      className={cn(inputClass(!!errors.startDate), 'pl-11')}
                    />
                  </div>
                  {fieldError('startDate')}
                </div>

                <div>
                  <Label className={labelClass}>Valid Till</Label>
                  <div
                    className={cn(
                      inputClass(false),
                      'flex items-center text-muted-foreground bg-muted/40 cursor-not-allowed'
                    )}
                  >
                    {isLifetime
                      ? 'Lifetime — no renewal required'
                      : form.expiryDate
                        ? formatDateDDMMYYYY(form.expiryDate)
                        : 'Set a category and start date'}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 ml-1">
                    Calculated from the category duration.
                  </p>
                </div>

                <div>
                  <Label className={labelClass}>Fee Collected (₹)</Label>
                  <div className="relative group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                    <Input
                      type="number"
                      min="0"
                      value={form.fee}
                      onChange={e => setField('fee', e.target.value)}
                      className={cn(inputClass(!!errors.fee), 'pl-11')}
                      placeholder="2500"
                    />
                  </div>
                  {fieldError('fee')}
                </div>

                <div>
                  <Label className={labelClass}>Payment Mode *</Label>
                  <Select value={form.paymentMode} onValueChange={val => setField('paymentMode', val)}>
                    <SelectTrigger className={inputClass(!!errors.paymentMode)}>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MODES.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError('paymentMode')}
                </div>

                <div className="md:col-span-2">
                  <Label className={labelClass}>Notes</Label>
                  <textarea
                    value={form.notes}
                    onChange={e => setField('notes', e.target.value)}
                    className={cn(inputClass(false), 'h-32 py-4 resize-none leading-relaxed')}
                    placeholder="Family members covered, seating preferences, renewal follow-ups..."
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
              {editId ? 'Save Changes' : 'Confirm Enrolment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipForm;
