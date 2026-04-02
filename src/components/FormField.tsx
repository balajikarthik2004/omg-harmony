import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    {textarea ? (
       <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`bg-background/60 rounded-lg border border-border/80 hover:border-border transition-all duration-200 focus:border-primary w-full p-3 min-h-[100px] resize-none outline-none focus:ring-2 focus:ring-primary/20 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
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
