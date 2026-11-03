import type { ChangeEvent } from "react";

const baseInputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50";

interface LabelProps {
  label: string;
  hint?: string;
  error?: string;
}

function FieldLabel({ label, hint, error }: LabelProps) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between">
      <label className="block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>
      {hint && <span className="text-xs text-on-surface-variant/70">{hint}</span>}
    </div>
  );
}

interface TextInputProps extends LabelProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export function TextInput({ label, hint, error, value, onChange, placeholder, type = "text", disabled, min, max }: TextInputProps) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <input
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className={`${baseInputClass} ${error ? "border-error focus:border-error focus:ring-error/50" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends LabelProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export function TextAreaField({ label, hint, error, value, onChange, rows = 3, placeholder }: TextAreaProps) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${baseInputClass} ${error ? "border-error focus:border-error focus:ring-error/50" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

interface SelectFieldProps extends LabelProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function SelectField({ label, hint, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <select value={value} onChange={(e) => onChange(e.target.value)} className={baseInputClass}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2.5 rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-outline-variant accent-secondary"
      />
      {label}
    </label>
  );
}
