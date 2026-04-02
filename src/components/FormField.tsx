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
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="bg-background"
    />
  </div>
);

export default FormField;
