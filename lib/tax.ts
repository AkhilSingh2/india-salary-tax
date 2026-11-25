import { cleanAmount, roundIncomeToTen, roundRupee } from "@/lib/money";
import {
  SHARED,
  YEARS,
  type AgeBand,
  type Employment,
  type RegimeId,
  type Slab,
  type TaxYearId,
} from "@/lib/tax-rules";

export type CapItem = "80C" | "80CCD1B" | "80D-self" | "80D-parents" | "home-loan" | "professional-tax" | "employer-nps";

export type CalcNote =
  | { code: "nonresident-no-87a" }
  | { code: "old-rebate-cliff" }
  | { code: "marginal-rebate" }
  | { code: "surcharge-relief" }
  | { code: "deductions-limited" }
  | { code: "nps-cap-not-checked" }
  | { code: "nps-added-to-gross" }
  | { code: "income-rounded"; from: number; to: number }
  | {
      code: "capped";
      item: CapItem;
      claimed: number;
      allowed: number;
    };

export type SlabRow = {
  from: number;
  to: number | null;
  rate: number;
  income: number;
  tax: number;
};

export type TaxInput = {
  year: TaxYearId;
  age: AgeBand;
  resident: boolean;
  employment: Employment;
  grossSalary: number;
  otherIncome: number;
  /** Basic + DA used for the section 80CCD(2) cap and, if relevant, documented as such. */
  basicSalary: number;
  hraExemption: number;
  professionalTax: number;
  section80C: number;
  section80CCD1B: number;
  section80DSelf: number;
  selfOrFamilySenior: boolean;
  section80DParents: number;
  parentsSenior: boolean;
  homeLoanInterestSelfOccupied: number;
  employerNps: number;
  /** When false, employer NPS is added to salary and then the allowable part is deducted. */
  employerNpsIncludedInGross: boolean;
  /**
   * `total-income` taxes the gross figure as total income, with no salary
   * deductions. Slab tests use it. The calculators use `salary`.
   */
  mode?: "salary" | "total-income";
};

export type RegimeResult = {
  regime: RegimeId;
  grossSalary: number;
  hraExemption: number;
  standardDeduction: number;
  professionalTax: number;
  incomeFromSalary: number;
  housePropertyLoss: number;
  section80C: number;
  section80CCD1B: number;
  section80D: number;
  employerNps: number;
  totalIncome: number;
  slabTax: number;
  rebate: number;
  taxAfterRebate: number;
  surcharge: number;
  surchargeRelief: number;
  taxAndSurcharge: number;
  cess: number;
  totalTax: number;
  slabs: SlabRow[];
  notes: CalcNote[];
};

export type Comparison = {
  year: TaxYearId;
  old: RegimeResult;
  new: RegimeResult;
  winner: "old" | "new" | "tie";
  savings: number;
};

function progressive(income: number, slabs: Slab[]): { tax: number; rows: SlabRow[] } {
  let cursor = 0;
  let tax = 0;
  const rows: SlabRow[] = [];
  for (const slab of slabs) {
    const cap = slab.upto ?? Number.POSITIVE_INFINITY;
    const width = Math.max(0, Math.min(income, cap) - cursor);
    const bandTax = width * slab.rate;
    if (width > 0) {
      rows.push({
        from: cursor,
        to: Number.isFinite(cap) ? cap : null,
        rate: slab.rate,
        income: width,
        tax: bandTax,
      });
    }
    tax += bandTax;
    cursor = cap;
    if (income <= cap) break;
  }
  return { tax, rows };
}

function surchargeRate(income: number, cap: number): number {
  let rate = 0;
  for (const band of SHARED.surcharge) {
    if (income > band.above) rate = band.rate;
  }
  return Math.min(rate, cap);
}

function surchargeThreshold(income: number): number {
  let threshold = 0;
  for (const band of SHARED.surcharge) {
    if (income > band.above) threshold = band.above;
  }
  return threshold;
}

function applyRebate(slabTax: number, income: number, resident: boolean, rebate: { incomeLimit: number; max: number; marginalRelief: boolean }): { rebate: number; marginal: boolean } {
  if (!resident || slabTax <= 0) return { rebate: 0, marginal: false };
  if (income <= rebate.incomeLimit) {
    return { rebate: Math.min(slabTax, rebate.max), marginal: false };
  }
  if (rebate.marginalRelief && slabTax > income - rebate.incomeLimit) {
    return { rebate: slabTax - (income - rebate.incomeLimit), marginal: true };
  }
  return { rebate: 0, marginal: false };
}

function taxAndSurcharge(
  income: number,
  slabs: Slab[],
  resident: boolean,
  rebateRule: { incomeLimit: number; max: number; marginalRelief: boolean },
  surchargeCap: number,
): {
  slabTax: number;
  rebate: number;
  marginalRebate: boolean;
  taxAfterRebate: number;
  surcharge: number;
  surchargeRelief: number;
  taxAndSurcharge: number;
  slabs: SlabRow[];
} {
  const { tax: slabTax, rows } = progressive(income, slabs);
  const { rebate, marginal } = applyRebate(slabTax, income, resident, rebateRule);
  const taxAfterRebate = roundRupee(Math.max(0, slabTax - rebate));
  const rate = surchargeRate(income, surchargeCap);
  if (rate === 0 || taxAfterRebate === 0) {
    return {
      slabTax,
      rebate,
      marginalRebate: marginal,
      taxAfterRebate,
      surcharge: 0,
      surchargeRelief: 0,
      taxAndSurcharge: taxAfterRebate,
      slabs: rows,
    };
  }

  const raw = taxAfterRebate * (1 + rate);
  const threshold = surchargeThreshold(income);
  const atThreshold = taxAndSurcharge(threshold, slabs, resident, rebateRule, surchargeCap);
  const ceiling = atThreshold.taxAndSurcharge + (income - threshold);
  const limited = Math.min(raw, ceiling);
  const rounded = roundRupee(limited);
  const relief = Math.max(0, raw - ceiling);
  return {
    slabTax,
    rebate,
    marginalRebate: marginal,
    taxAfterRebate,
    surcharge: Math.max(0, rounded - taxAfterRebate),
    surchargeRelief: relief,
    taxAndSurcharge: rounded,
    slabs: rows,
  };
}

function takeDeduction(remaining: number, item: CapItem, claimed: number, statutoryCap: number): { applied: number; note?: CalcNote; remaining: number } {
  const safeClaimed = cleanAmount(claimed);
  const statutory = Math.min(safeClaimed, statutoryCap);
  const applied = Math.min(statutory, Math.max(0, remaining));
  const note =
    safeClaimed > applied + 0.5
      ? ({ code: "capped", item, claimed: roundRupee(safeClaimed), allowed: roundRupee(applied) } as const)
      : undefined;
  return { applied, note, remaining: Math.max(0, remaining - applied) };
}

function blankResult(regime: RegimeId, grossSalary: number, totalIncome: number, notes: CalcNote[], tax: ReturnType<typeof taxAndSurcharge>, cess: number): RegimeResult {
  return {
    regime,
    grossSalary,
    hraExemption: 0,
    standardDeduction: 0,
    professionalTax: 0,
    incomeFromSalary: grossSalary,
    housePropertyLoss: 0,
    section80C: 0,
    section80CCD1B: 0,
    section80D: 0,
    employerNps: 0,
    totalIncome,
    slabTax: tax.slabTax,
    rebate: tax.rebate,
    taxAfterRebate: tax.taxAfterRebate,
    surcharge: tax.surcharge,
    surchargeRelief: tax.surchargeRelief,
    taxAndSurcharge: tax.taxAndSurcharge,
    cess,
    totalTax: tax.taxAndSurcharge + cess,
    slabs: tax.slabs,
    notes,
  };
}

export function computeRegime(input: TaxInput, regime: RegimeId): RegimeResult {
  const year = YEARS[input.year];
  const notes: CalcNote[] = [];
  const spec = regime === "new" ? year.newRegime : year.oldRegime;
  const slabs = regime === "new" ? year.newRegime.slabs : year.oldRegime.slabsByAge[input.age];

  if (input.mode === "total-income") {
    const unrounded = cleanAmount(input.grossSalary);
    const totalIncome = roundIncomeToTen(unrounded);
    if (Math.abs(unrounded - totalIncome) >= 1) notes.push({ code: "income-rounded", from: unrounded, to: totalIncome });
    const tax = taxAndSurcharge(totalIncome, slabs, input.resident, spec.rebate, spec.surchargeCap);
    if (tax.marginalRebate) notes.push({ code: "marginal-rebate" });
    if (tax.surchargeRelief > 1) notes.push({ code: "surcharge-relief" });
    if (!input.resident && totalIncome > 0 && totalIncome <= spec.rebate.incomeLimit && tax.slabTax > 0) {
      notes.push({ code: "nonresident-no-87a" });
    }
    if (regime === "old" && input.resident && totalIncome > spec.rebate.incomeLimit && totalIncome <= spec.rebate.incomeLimit + 50_000 && tax.taxAfterRebate > 0) {
      notes.push({ code: "old-rebate-cliff" });
    }
    const cess = roundRupee(tax.taxAndSurcharge * SHARED.cessRate);
    return blankResult(regime, totalIncome, totalIncome, notes, tax, cess);
  }

  let gross = cleanAmount(input.grossSalary);
  const employerNpsClaimed = cleanAmount(input.employerNps);
  if (employerNpsClaimed > 0 && !input.employerNpsIncludedInGross) {
    gross += employerNpsClaimed;
    notes.push({ code: "nps-added-to-gross" });
  }

  const hra = regime === "old" ? Math.min(cleanAmount(input.hraExemption), gross) : 0;
  const standardDeduction = Math.min(spec.standardDeduction, gross);
  let professionalTax = 0;
  if (regime === "old") {
    const claimed = cleanAmount(input.professionalTax);
    professionalTax = Math.min(claimed, SHARED.professionalTaxDeductionCap, Math.max(0, gross - hra - standardDeduction));
    if (claimed > professionalTax + 0.5) {
      notes.push({
        code: "capped",
        item: "professional-tax",
        claimed: roundRupee(claimed),
        allowed: roundRupee(professionalTax),
      });
    }
  }

  const incomeFromSalary = Math.max(0, gross - hra - standardDeduction - professionalTax);
  const other = cleanAmount(input.otherIncome);

  let housePropertyLoss = 0;
  if (regime === "old") {
    const claimed = cleanAmount(input.homeLoanInterestSelfOccupied);
    const statutory = Math.min(claimed, SHARED.homeLoanSelfOccupiedCap);
    housePropertyLoss = Math.min(statutory, incomeFromSalary + other);
    if (claimed > statutory + 0.5) {
      notes.push({
        code: "capped",
        item: "home-loan",
        claimed: roundRupee(claimed),
        allowed: roundRupee(statutory),
      });
    }
  }

  const gti = Math.max(0, incomeFromSalary + other - housePropertyLoss);

  const npsRate =
    regime === "new"
      ? SHARED.employerNps.newRegime
      : input.employment === "government"
        ? SHARED.employerNps.oldGovernment
        : SHARED.employerNps.oldPrivate;
  const basic = cleanAmount(input.basicSalary);
  let npsCap = Number.POSITIVE_INFINITY;
  if (employerNpsClaimed > 0 && basic <= 0) {
    notes.push({ code: "nps-cap-not-checked" });
  } else if (basic > 0) {
    npsCap = npsRate * basic;
  }

  let remaining = gti;
  const via: { key: "section80C" | "section80CCD1B" | "section80D" | "employerNps"; amount: number }[] = [];

  if (regime === "old") {
    const c80 = takeDeduction(remaining, "80C", input.section80C, SHARED.section80C);
    if (c80.note) notes.push(c80.note);
    remaining = c80.remaining;
    via.push({ key: "section80C", amount: c80.applied });

    const extra = takeDeduction(remaining, "80CCD1B", input.section80CCD1B, SHARED.section80CCD1B);
    if (extra.note) notes.push(extra.note);
    remaining = extra.remaining;
    via.push({ key: "section80CCD1B", amount: extra.applied });

    const selfCap = input.selfOrFamilySenior ? SHARED.section80D.selfSenior : SHARED.section80D.self;
    const parentCap = input.parentsSenior ? SHARED.section80D.parentsSenior : SHARED.section80D.parents;
    const self = takeDeduction(remaining, "80D-self", input.section80DSelf, selfCap);
    if (self.note) notes.push(self.note);
    remaining = self.remaining;
    const parents = takeDeduction(remaining, "80D-parents", input.section80DParents, parentCap);
    if (parents.note) notes.push(parents.note);
    remaining = parents.remaining;
    via.push({ key: "section80D", amount: self.applied + parents.applied });
  } else {
    via.push({ key: "section80C", amount: 0 }, { key: "section80CCD1B", amount: 0 }, { key: "section80D", amount: 0 });
  }

  const npsStatutory = Math.min(employerNpsClaimed, npsCap);
  if (employerNpsClaimed > npsStatutory + 0.5 && basic > 0) {
    notes.push({
      code: "capped",
      item: "employer-nps",
      claimed: roundRupee(employerNpsClaimed),
      allowed: roundRupee(Math.min(npsStatutory, remaining)),
    });
  }
  const npsApplied = Math.min(npsStatutory, remaining);
  if (npsStatutory > remaining + 0.5 && employerNpsClaimed <= npsCap + 0.5) {
    notes.push({ code: "deductions-limited" });
  }
  via.push({ key: "employerNps", amount: npsApplied });

  const chapterVIA = via.reduce((sum, item) => sum + item.amount, 0);
  const unrounded = Math.max(0, gti - chapterVIA);
  const totalIncome = roundIncomeToTen(unrounded);
  if (totalIncome !== roundRupee(unrounded) && Math.abs(unrounded - totalIncome) >= 1) {
    notes.push({ code: "income-rounded", from: unrounded, to: totalIncome });
  }

  const tax = taxAndSurcharge(totalIncome, slabs, input.resident, spec.rebate, spec.surchargeCap);
  if (tax.marginalRebate) notes.push({ code: "marginal-rebate" });
  if (tax.surchargeRelief > 1) notes.push({ code: "surcharge-relief" });
  if (
    !input.resident &&
    totalIncome > 0 &&
    totalIncome <= spec.rebate.incomeLimit &&
    tax.slabTax > 0
  ) {
    notes.push({ code: "nonresident-no-87a" });
  }
  if (
    regime === "old" &&
    input.resident &&
    totalIncome > spec.rebate.incomeLimit &&
    totalIncome <= spec.rebate.incomeLimit + 50_000 &&
    tax.taxAfterRebate > 0
  ) {
    notes.push({ code: "old-rebate-cliff" });
  }

  const cess = roundRupee(tax.taxAndSurcharge * SHARED.cessRate);

  return {
    regime,
    grossSalary: gross,
    hraExemption: hra,
    standardDeduction,
    professionalTax,
    incomeFromSalary,
    housePropertyLoss,
    section80C: via.find((item) => item.key === "section80C")?.amount ?? 0,
    section80CCD1B: via.find((item) => item.key === "section80CCD1B")?.amount ?? 0,
    section80D: via.find((item) => item.key === "section80D")?.amount ?? 0,
    employerNps: npsApplied,
    totalIncome,
    slabTax: tax.slabTax,
    rebate: tax.rebate,
    taxAfterRebate: tax.taxAfterRebate,
    surcharge: tax.surcharge,
    surchargeRelief: tax.surchargeRelief,
    taxAndSurcharge: tax.taxAndSurcharge,
    cess,
    totalTax: tax.taxAndSurcharge + cess,
    slabs: tax.slabs,
    notes,
  };
}

export function compareRegimes(input: TaxInput): Comparison {
  const old = computeRegime(input, "old");
  const next = computeRegime(input, "new");
  const delta = old.totalTax - next.totalTax;
  const winner = Math.abs(delta) < 1 ? "tie" : delta > 0 ? "new" : "old";
  return {
    year: input.year,
    old,
    new: next,
    winner,
    savings: Math.abs(old.totalTax - next.totalTax),
  };
}

/** Tax on total income that has already had deductions applied. Useful for slab tests. */
export function taxOnTotalIncome(options: {
  year: TaxYearId;
  regime: RegimeId;
  age?: AgeBand;
  resident?: boolean;
  totalIncome: number;
}): RegimeResult {
  const income = roundIncomeToTen(cleanAmount(options.totalIncome));
  return computeRegime(
    {
      year: options.year,
      age: options.age ?? "below60",
      resident: options.resident ?? true,
      employment: "private",
      grossSalary: income,
      otherIncome: 0,
      basicSalary: 0,
      hraExemption: 0,
      professionalTax: 0,
      section80C: 0,
      section80CCD1B: 0,
      section80DSelf: 0,
      selfOrFamilySenior: false,
      section80DParents: 0,
      parentsSenior: false,
      homeLoanInterestSelfOccupied: 0,
      employerNps: 0,
      employerNpsIncludedInGross: true,
      mode: "total-income",
    },
    options.regime,
  );
}
