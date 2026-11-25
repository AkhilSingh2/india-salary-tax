/**
 * Income-tax rules used by every calculator.
 * Version 2025-26.1 — FY 2025-26 / AY 2026-27, with FY 2024-25 / AY 2025-26 retained.
 *
 * Do not hard-code slabs in components. Import them from here.
 */

export const RULES_VERSION = "2025-26.1";
export const RULES_UPDATED = "2026-11-25";

export type TaxYearId = "fy-2025-26" | "fy-2024-25";
export type AgeBand = "below60" | "senior" | "superSenior";
export type RegimeId = "old" | "new";
export type Employment = "private" | "government";

export type Slab = {
  /** Inclusive upper bound of the band. Null means no upper bound. */
  upto: number | null;
  rate: number;
};

export type Source = {
  id: string;
  label: string;
  url: string;
  note: string;
};

export const SOURCES: Source[] = [
  {
    id: "budget-speech-2025",
    label: "Budget speech 2025-26",
    url: "https://www.indiabudget.gov.in/doc/bspeech/bs2025_26.pdf",
    note: "Nil tax up to ₹12 lakh under the new regime, ₹12.75 lakh for salaried taxpayers after the ₹75,000 standard deduction, and the slab table.",
  },
  {
    id: "finance-bill-2025",
    label: "Finance Bill, 2025",
    url: "https://www.indiabudget.gov.in/budget2025-26/doc/Finance_Bill.pdf",
    note: "Section 115BAC(1A) slabs from AY 2026-27 and the section 87A rebate of ₹60,000 up to ₹12 lakh, with marginal relief.",
  },
  {
    id: "pib-2025",
    label: "Press Information Bureau, 1 February 2025",
    url: "https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2098406",
    note: "Official summary of the ₹12 lakh / ₹12.75 lakh nil-tax announcement.",
  },
  {
    id: "itd-regime-faq",
    label: "Income Tax Department — new and old regime FAQ",
    url: "https://www.incometax.gov.in/iec/foportal/help/new-tax-vs-old-tax-regime-faqs",
    note: "New regime is the default. Chapter VI-A deductions are generally not allowed, except section 80CCD(2) and a few others.",
  },
  {
    id: "itd-thresholds",
    label: "Income Tax Department — threshold limits",
    url: "https://www.incometaxindia.gov.in/w/threshold-limits-under-income-tax-act",
    note: "Surcharge bands. The 37% rate is capped at 25% where tax is computed under section 115BAC.",
  },
  {
    id: "itd-deductions",
    label: "Income Tax Department — deductions",
    url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/tax-payer/individual/deductions-on-which-i-get-tax-benefit",
    note: "Section 80C, 80CCD(1B), 80CCD(2) and 80D limits.",
  },
  {
    id: "pfrda-nps",
    label: "PFRDA — NPS corporate tax treatment",
    url: "https://www.pfrda.org.in/schemes/national-pension-system/nps-for-corporates",
    note: "Employer contribution under section 80CCD(2): 14% of salary in the new regime, 10% in the old regime.",
  },
  {
    id: "incometax-portal",
    label: "Income Tax Department e-filing portal",
    url: "https://www.incometax.gov.in/",
    note: "Primary government portal for returns, the tax law, and official utilities.",
  },
];

export const METRO_CITIES = ["Delhi", "Mumbai", "Kolkata", "Chennai"] as const;

/** Rates and caps that did not change between the two years we ship. */
export const SHARED = {
  cessRate: 0.04,
  /** Surcharge applies only when total income is above the threshold. */
  surcharge: [
    { above: 5_000_000, rate: 0.1 },
    { above: 10_000_000, rate: 0.15 },
    { above: 20_000_000, rate: 0.25 },
    { above: 50_000_000, rate: 0.37 },
  ],
  newRegimeSurchargeCap: 0.25,
  oldRegimeSurchargeCap: 0.37,
  section80C: 150_000,
  section80CCD1B: 50_000,
  section80D: {
    self: 25_000,
    selfSenior: 50_000,
    parents: 25_000,
    parentsSenior: 50_000,
  },
  homeLoanSelfOccupiedCap: 200_000,
  professionalTaxDeductionCap: 2_500,
  hra: {
    metroShare: 0.5,
    nonMetroShare: 0.4,
    rentFloorShare: 0.1,
    metros: METRO_CITIES,
  },
  pf: {
    employeeRate: 0.12,
    employerRate: 0.12,
    wageCeilingMonthly: 15_000,
  },
  /** Statutory gratuity provision: 15 days of basic for the year, daily wage = monthly basic / 26. */
  gratuity: {
    days: 15,
    wageDivisor: 26,
  },
  employerNps: {
    newRegime: 0.14,
    oldPrivate: 0.1,
    oldGovernment: 0.14,
  },
} as const;

const OLD_SLABS: Record<AgeBand, Slab[]> = {
  below60: [
    { upto: 250_000, rate: 0 },
    { upto: 500_000, rate: 0.05 },
    { upto: 1_000_000, rate: 0.2 },
    { upto: null, rate: 0.3 },
  ],
  senior: [
    { upto: 300_000, rate: 0 },
    { upto: 500_000, rate: 0.05 },
    { upto: 1_000_000, rate: 0.2 },
    { upto: null, rate: 0.3 },
  ],
  superSenior: [
    { upto: 500_000, rate: 0 },
    { upto: 1_000_000, rate: 0.2 },
    { upto: null, rate: 0.3 },
  ],
};

export type RebateRule = {
  incomeLimit: number;
  max: number;
  marginalRelief: boolean;
};

export type YearRules = {
  id: TaxYearId;
  financialYear: string;
  assessmentYear: string;
  shortLabel: string;
  newRegime: {
    slabs: Slab[];
    standardDeduction: number;
    rebate: RebateRule;
    surchargeCap: number;
  };
  oldRegime: {
    slabsByAge: Record<AgeBand, Slab[]>;
    standardDeduction: number;
    rebate: RebateRule;
    surchargeCap: number;
  };
};

/**
 * New-regime slabs for FY 2024-25 / AY 2025-26 are section 115BAC(1A)(ii)
 * as substituted by the Finance (No. 2) Act, 2024. Standard deduction of
 * ₹75,000 for salary applies in that year as well.
 */
export const YEARS: Record<TaxYearId, YearRules> = {
  "fy-2025-26": {
    id: "fy-2025-26",
    financialYear: "2025-26",
    assessmentYear: "2026-27",
    shortLabel: "FY 2025-26 · AY 2026-27",
    newRegime: {
      slabs: [
        { upto: 400_000, rate: 0 },
        { upto: 800_000, rate: 0.05 },
        { upto: 1_200_000, rate: 0.1 },
        { upto: 1_600_000, rate: 0.15 },
        { upto: 2_000_000, rate: 0.2 },
        { upto: 2_400_000, rate: 0.25 },
        { upto: null, rate: 0.3 },
      ],
      standardDeduction: 75_000,
      rebate: { incomeLimit: 1_200_000, max: 60_000, marginalRelief: true },
      surchargeCap: SHARED.newRegimeSurchargeCap,
    },
    oldRegime: {
      slabsByAge: OLD_SLABS,
      standardDeduction: 50_000,
      rebate: { incomeLimit: 500_000, max: 12_500, marginalRelief: false },
      surchargeCap: SHARED.oldRegimeSurchargeCap,
    },
  },
  "fy-2024-25": {
    id: "fy-2024-25",
    financialYear: "2024-25",
    assessmentYear: "2025-26",
    shortLabel: "FY 2024-25 · AY 2025-26",
    newRegime: {
      slabs: [
        { upto: 300_000, rate: 0 },
        { upto: 700_000, rate: 0.05 },
        { upto: 1_000_000, rate: 0.1 },
        { upto: 1_200_000, rate: 0.15 },
        { upto: 1_500_000, rate: 0.2 },
        { upto: null, rate: 0.3 },
      ],
      standardDeduction: 75_000,
      rebate: { incomeLimit: 700_000, max: 25_000, marginalRelief: true },
      surchargeCap: SHARED.newRegimeSurchargeCap,
    },
    oldRegime: {
      slabsByAge: OLD_SLABS,
      standardDeduction: 50_000,
      rebate: { incomeLimit: 500_000, max: 12_500, marginalRelief: false },
      surchargeCap: SHARED.oldRegimeSurchargeCap,
    },
  },
};

export const YEAR_ORDER: TaxYearId[] = ["fy-2025-26", "fy-2024-25"];

export function gratuityProvision(annualBasic: number): number {
  return (annualBasic * SHARED.gratuity.days) / (SHARED.gratuity.wageDivisor * 12);
}
