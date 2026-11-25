/** Indian digit grouping and the rounding the Income-tax Act requires. */

export function roundRupee(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

/**
 * Section 288B: total income is rounded to the nearest ten rupees.
 * A part of five rupees or more is increased to ten; a smaller part is ignored.
 */
export function roundIncomeToTen(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const lower = Math.floor(value / 10) * 10;
  const part = value - lower;
  return part >= 5 ? lower + 10 : lower;
}

export function cleanAmount(value: number, max = 1_000_000_000_000): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(value, max);
}

export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "₹0";
  const negative = value < -0.5;
  const rounded = Math.round(Math.abs(value));
  const str = String(rounded);
  let formatted: string;
  if (str.length <= 3) {
    formatted = str;
  } else {
    const head = str.slice(0, -3);
    const tail = str.slice(-3);
    formatted = `${head.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${tail}`;
  }
  return `${negative ? "-" : ""}₹${formatted}`;
}

export function formatPercent(rate: number): string {
  if (!Number.isFinite(rate)) return "0%";
  const pct = rate * 100;
  const text = Number.isInteger(pct) ? pct.toFixed(0) : pct.toFixed(2).replace(/0$/, "");
  return `${text}%`;
}

export function formatShare(part: number, whole: number): string {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) return "0%";
  const pct = (part / whole) * 100;
  return `${pct.toFixed(pct >= 10 ? 1 : 2)}%`;
}
