import { hraForStay } from "@/lib/hra";
import { cleanAmount, roundRupee } from "@/lib/money";
import { annualProfessionalTax, type Gender } from "@/lib/professional-tax";
import { compareRegimes, type Comparison } from "@/lib/tax";
import { SHARED, type AgeBand, type Employment, type TaxYearId } from "@/lib/tax-rules";

export type SalaryInput = {
  year: TaxYearId;
  ctc: number;
  /** Share of CTC that is basic. */
  basicRatio: number;
  /** HRA as a share of basic. */
  hraRatio: number;
  pfOnFullBasic: boolean;
  includeGratuity: boolean;
  employerNps: number;
  stateId: string;
  gender: Gender;
  monthlyPtOverride: number | null;
  metro: boolean;
  monthlyRent: number;
  rentMonths: number;
  other80C: number;
  section80CCD1B: number;
  section80DSelf: number;
  selfOrFamilySenior: boolean;
  section80DParents: number;
  parentsSenior: boolean;
  homeLoanInterest: number;
  age: AgeBand;
  resident: boolean;
  employment: Employment;
};

export type SalaryBreakdown = {
  ctc: number;
  basic: number;
  hra: number;
  special: number;
  employerPf: number;
  employeePf: number;
  gratuity: number;
  employerNps: number;
  cashGross: number;
};

export type SalaryResult =
  | {
      ok: true;
      annual: SalaryBreakdown;
      professionalTax: ReturnType<typeof annualProfessionalTax>;
      hraExemption: number;
      tax: Comparison;
      inHand: { old: number; new: number };
    }
  | { ok: false; reason: "structure" };

function rupee(value: number): number {
  return Math.round(value);
}

export function splitCtc(input: SalaryInput): { ok: true; annual: SalaryBreakdown } | { ok: false; reason: "structure" } {
  const ctc = rupee(cleanAmount(input.ctc));
  const basicRatio = Number.isFinite(input.basicRatio) ? Math.min(Math.max(input.basicRatio, 0), 1) : 0;
  const hraRatio = Number.isFinite(input.hraRatio) ? Math.min(Math.max(input.hraRatio, 0), 1) : 0;
  const basic = rupee(ctc * basicRatio);
  const hra = rupee(basic * hraRatio);
  const monthlyBasic = basic / 12;
  const pfWage = input.pfOnFullBasic ? monthlyBasic : Math.min(monthlyBasic, SHARED.pf.wageCeilingMonthly);
  const employeePf = rupee(pfWage * SHARED.pf.employeeRate * 12);
  const employerPf = rupee(pfWage * SHARED.pf.employerRate * 12);
  const gratuity = input.includeGratuity ? rupee((basic * SHARED.gratuity.days) / (SHARED.gratuity.wageDivisor * 12)) : 0;
  const employerNps = rupee(cleanAmount(input.employerNps));
  const special = ctc - basic - hra - employerPf - gratuity - employerNps;
  if (special < 0) return { ok: false, reason: "structure" };
  const cashGross = basic + hra + special;
  return {
    ok: true,
    annual: { ctc, basic, hra, special, employerPf, employeePf, gratuity, employerNps, cashGross },
  };
}

export function computeSalary(input: SalaryInput): SalaryResult {
  const split = splitCtc(input);
  if (!split.ok) return split;
  const annual = split.annual;
  const monthlyGross = annual.cashGross / 12;
  const professionalTax = annualProfessionalTax({
    stateId: input.stateId,
    monthlyGross,
    gender: input.gender,
    monthlyOverride: input.monthlyPtOverride,
  });
  const hra = hraForStay({
    annualBasic: annual.basic,
    annualDa: 0,
    daCountsForRetirement: false,
    annualHra: annual.hra,
    monthlyRent: input.monthlyRent,
    months: input.rentMonths,
    metro: input.metro,
  });
  const tax = compareRegimes({
    year: input.year,
    age: input.age,
    resident: input.resident,
    employment: input.employment,
    grossSalary: annual.cashGross,
    otherIncome: 0,
    basicSalary: annual.basic,
    hraExemption: hra.exemption,
    professionalTax: professionalTax.annual,
    section80C: annual.employeePf + cleanAmount(input.other80C),
    section80CCD1B: input.section80CCD1B,
    section80DSelf: input.section80DSelf,
    selfOrFamilySenior: input.selfOrFamilySenior,
    section80DParents: input.section80DParents,
    parentsSenior: input.parentsSenior,
    homeLoanInterestSelfOccupied: input.homeLoanInterest,
    employerNps: annual.employerNps,
    employerNpsIncludedInGross: false,
  });
  const base = annual.cashGross - annual.employeePf - professionalTax.annual;
  return {
    ok: true,
    annual,
    professionalTax,
    hraExemption: roundRupee(hra.exemption),
    tax,
    inHand: {
      old: base - tax.old.totalTax,
      new: base - tax.new.totalTax,
    },
  };
}
