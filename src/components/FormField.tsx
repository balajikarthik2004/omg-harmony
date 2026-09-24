import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  textarea?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, type = 'text', placeholder, required, disabled, textarea }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-foreground">
      {label}{required && <span className="text-destructive"> *</span>}
    </Label>
    {textarea ? (
       <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`bg-background/60 text-foreground rounded-lg border border-border/80 hover:border-border transition-all duration-200 focus:border-primary w-full p-3 min-h-[100px] resize-none outline-none focus:ring-2 focus:ring-primary/20 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
       />
    ) : type === 'date' ? (
      <DatePicker
        value={String(value || '')}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder || 'Select date'}
        className="bg-background/60"
      />
    ) : (
    <Input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`bg-background/60 h-10 rounded-lg border-border/80 hover:border-border transition-all duration-200 focus:border-primary ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    />
    )}
  </div>
);

export default FormField;
