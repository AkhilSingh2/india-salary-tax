import type { ReactNode } from "react";
import { formatINR } from "@/lib/money";

export function MoneyField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  value: number;
  onChange: (value: number) => void;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="field">
      <div className="field-top">
        <label htmlFor={id}>{label}</label>
        <span className="num field-readout">{formatINR(value)}</span>
      </div>
      <input
        id={id}
        name={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        value={value === 0 ? "" : String(Math.round(value))}
        aria-describedby={hintId}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 12);
          onChange(digits ? Number(digits) : 0);
        }}
      />
      {hint ? <p id={hintId} className="hint">{hint}</p> : null}
    </div>
  );
}

export function ChoiceGroup<T extends string>({
  name,
  label,
  value,
  onChange,
  options,
}: {
  name: string;
  label: ReactNode;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
}) {
  return (
    <fieldset>
      <legend>{label}</legend>
      <div className="choices">
        {options.map((option) => (
          <label key={option.value} className="choice">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Check({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="check" htmlFor={id}>
      <input id={id} name={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        {label}
        {hint ? <span className="hint" style={{ display: "block", fontWeight: 450 }}>{hint}</span> : null}
      </span>
    </label>
  );
}
