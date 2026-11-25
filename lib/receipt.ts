import { inrInWords } from "@/lib/words";

export type PaymentMode = "bank" | "upi" | "cheque" | "cash";

export type ReceiptInput = {
  tenantName: string;
  tenantAddress: string;
  landlordName: string;
  landlordPan: string;
  landlordAddress: string;
  propertyAddress: string;
  monthlyRent: number;
  from: string;
  to: string;
  paymentMode: PaymentMode;
  receivedDay: number;
};

export type ReceiptMonth = {
  id: string;
  label: string;
  receiptNo: string;
  dateLabel: string;
  amount: number;
  amountInWords: string;
};

export type ReceiptModel = {
  months: ReceiptMonth[];
  annualRent: number;
  needsPanWarning: boolean;
  needsStamp: boolean;
  errors: Partial<Record<"tenantName" | "landlordName" | "propertyAddress" | "rent" | "range" | "pan" | "day", string>>;
};

const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function parseYearMonth(value: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  return { year, month };
}

export function listMonths(from: string, to: string): { year: number; month: number }[] {
  const start = parseYearMonth(from);
  const end = parseYearMonth(to);
  if (!start || !end) return [];
  const startIndex = start.year * 12 + (start.month - 1);
  const endIndex = end.year * 12 + (end.month - 1);
  if (endIndex < startIndex) return [];
  const months: { year: number; month: number }[] = [];
  for (let index = startIndex; index <= endIndex; index += 1) {
    months.push({ year: Math.floor(index / 12), month: (index % 12) + 1 });
  }
  return months;
}

function ordinal(day: number): string {
  const mod = day % 100;
  if (mod >= 11 && mod <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export function buildReceiptModel(input: ReceiptInput): ReceiptModel {
  const errors: ReceiptModel["errors"] = {};
  const tenantName = input.tenantName.trim();
  const landlordName = input.landlordName.trim();
  const propertyAddress = input.propertyAddress.trim();
  const pan = input.landlordPan.trim().toUpperCase();
  const rent = Number(input.monthlyRent);
  const day = Math.round(Number(input.receivedDay));

  if (tenantName.length < 2) errors.tenantName = "tenant";
  if (landlordName.length < 2) errors.landlordName = "landlord";
  if (propertyAddress.length < 5) errors.propertyAddress = "property";
  if (!Number.isFinite(rent) || rent <= 0) errors.rent = "rent";
  if (!Number.isFinite(day) || day < 1 || day > 28) errors.day = "day";
  if (pan && !PAN.test(pan)) errors.pan = "pan";

  const span = listMonths(input.from, input.to);
  if (!parseYearMonth(input.from) || !parseYearMonth(input.to) || span.length === 0) {
    errors.range = "range";
  } else if (span.length > 12) {
    errors.range = "long";
  }

  const valid = Object.keys(errors).length === 0;
  const months: ReceiptMonth[] = valid
    ? span.map(({ year, month }) => {
        const id = `${year}-${String(month).padStart(2, "0")}`;
        const monthName = MONTHS[month - 1] ?? "";
        return {
          id,
          label: `${monthName} ${year}`,
          receiptNo: `R-${id}`,
          dateLabel: `${ordinal(day)} ${monthName} ${year}`,
          amount: Math.round(rent),
          amountInWords: inrInWords(rent),
        };
      })
    : [];

  const annualRent = months.length * (Number.isFinite(rent) && rent > 0 ? Math.round(rent) : 0);
  return {
    months,
    annualRent,
    needsPanWarning: annualRent > 100_000 && !pan,
    needsStamp: input.paymentMode === "cash" && Number.isFinite(rent) && rent > 5_000,
    errors,
  };
}

export const PAN_PATTERN = PAN;
