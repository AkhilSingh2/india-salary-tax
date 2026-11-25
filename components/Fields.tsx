"use client";

import { Input, NumberInput, Select, Slider, Toggle, type SelectOption } from "@sutra-ui/react";

export function asAmount(value: number | null, digits = 12): number {
  if (value == null || !Number.isFinite(value) || value <= 0) return 0;
  return Math.min(Math.round(value), 10 ** digits - 1);
}

export function MoneyField({
  id,
  label,
  hint,
  error,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <NumberInput
      id={id}
      name={id}
      label={label}
      hint={hint}
      error={error}
      mode="currency"
      decimals={0}
      min={0}
      value={value}
      onValueChange={(next) => onChange(asAmount(next))}
    />
  );
}

export function SegmentField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <fieldset className="sutra-field">
      <legend className="sutra-label">{label}</legend>
      <div className="sutra-segment" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function SwitchField({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return <Toggle id={id} label={label} hint={hint} checked={checked} onCheckedChange={onChange} />;
}

export function PercentSlider({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const shown = Math.round(value * 1000) / 10;
  return (
    <Slider
      id={id}
      label={label}
      hint={hint}
      min={0}
      max={100}
      step={0.5}
      value={shown}
      onValueChange={(next) => onChange(next / 100)}
      formatValue={(next) => `${next}%`}
    />
  );
}

export function SelectField({
  id,
  label,
  hint,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <Select
      id={id}
      name={id}
      label={label}
      hint={hint}
      value={value}
      options={options}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function TextField({
  id,
  label,
  hint,
  error,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <Input
      id={id}
      name={id}
      label={label}
      hint={hint}
      error={error}
      value={value}
      autoComplete={autoComplete}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function TextArea({
  id,
  label,
  hint,
  error,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={error ? "sutra-field sutra-field--error" : "sutra-field"}>
      <label className="sutra-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        className="sutra-input"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && !error ? (
        <p id={hintId} className="sutra-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="sutra-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function MonthField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return <Input id={id} name={id} type="month" label={label} value={value} onChange={(event) => onChange(event.target.value)} />;
}
