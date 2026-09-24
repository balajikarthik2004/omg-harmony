import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ThemeSelectOption {
  value: string;
  label: string;
}

export interface ThemeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (ThemeSelectOption | string)[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

const EMPTY_VALUE = "__EMPTY__";

export function ThemeSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  disabled = false,
  "aria-label": ariaLabel,
}: ThemeSelectProps) {
  const normalizedOptions: ThemeSelectOption[] = React.useMemo(() => {
    return options.map((opt) => {
      const item = typeof opt === "string" ? { value: opt, label: opt } : opt;
      return {
        value: item.value === "" ? EMPTY_VALUE : item.value,
        label: item.label,
      };
    });
  }, [options]);

  const internalValue = value === "" ? (normalizedOptions.some(o => o.value === EMPTY_VALUE) ? EMPTY_VALUE : undefined) : value;

  const handleValueChange = (val: string) => {
    onChange(val === EMPTY_VALUE ? "" : val);
  };

  return (
    <Select value={internalValue} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "h-10 rounded-lg border-border/80 bg-background/80 hover:bg-muted/40 transition-colors focus:ring-2 focus:ring-primary/20",
          className
        )}
        aria-label={ariaLabel}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-border bg-popover/95 backdrop-blur-md shadow-xl max-h-72">
        {normalizedOptions.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="rounded-lg text-sm cursor-pointer py-2 focus:bg-primary/10 focus:text-primary transition-colors"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
