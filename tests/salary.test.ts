import { describe, expect, it } from "vitest";
import { annualProfessionalTax } from "@/lib/professional-tax";
import { computeSalary, splitCtc, type SalaryInput } from "@/lib/salary";

function salary(overrides: Partial<SalaryInput> = {}): SalaryInput {
  return {
    year: "fy-2025-26",
    ctc: 600_000,
    basicRatio: 0.5,
    hraRatio: 0.4,
    pfOnFullBasic: true,
    includeGratuity: true,
    employerNps: 0,
    stateId: "delhi",
    gender: "male",
    monthlyPtOverride: null,
    metro: false,
    monthlyRent: 0,
    rentMonths: 12,
    other80C: 0,
    section80CCD1B: 0,
    section80DSelf: 0,
    selfOrFamilySenior: false,
    section80DParents: 0,
    parentsSenior: false,
    homeLoanInterest: 0,
    age: "below60",
    resident: true,
    employment: "private",
    ...overrides,
  };
}

describe("CTC breakup", () => {
  it("splits basic, HRA, both PF legs, gratuity and the balancing allowance", () => {
    const split = splitCtc(salary());
    expect(split.ok).toBe(true);
    if (!split.ok) return;
    const annual = split.annual;
    expect(annual.basic).toBe(300_000);
    expect(annual.hra).toBe(120_000);
    expect(annual.employeePf).toBe(36_000);
    expect(annual.employerPf).toBe(36_000);
    expect(annual.gratuity).toBe(14_423);
    expect(annual.basic + annual.hra + annual.special + annual.employerPf + annual.gratuity + annual.employerNps).toBe(600_000);
    expect(annual.cashGross).toBe(annual.basic + annual.hra + annual.special);
  });

  it("caps PF wages at ₹15,000 a month when asked", () => {
    const full = splitCtc(salary());
    const capped = splitCtc(salary({ pfOnFullBasic: false }));
    expect(full.ok && capped.ok).toBe(true);
    if (!full.ok || !capped.ok) return;
    expect(capped.annual.employeePf).toBe(21_600);
    expect(capped.annual.employerPf).toBe(21_600);
    expect(capped.annual.employeePf).toBeLessThan(full.annual.employeePf);
  });

  it("refuses a structure that does not fit inside CTC", () => {
    const result = splitCtc(salary({ basicRatio: 0.9, hraRatio: 1, includeGratuity: true }));
    expect(result.ok).toBe(false);
  });
});

describe("professional tax", () => {
  it("applies Maharashtra differently for men and women, including February", () => {
    const men = annualProfessionalTax({ stateId: "maharashtra", monthlyGross: 20_000, gender: "male" });
    const women = annualProfessionalTax({ stateId: "maharashtra", monthlyGross: 20_000, gender: "female" });
    expect(men.monthly).toBe(200);
    expect(men.february).toBe(300);
    expect(men.annual).toBe(2_500);
    expect(women.annual).toBe(0);

    expect(annualProfessionalTax({ stateId: "maharashtra", monthlyGross: 7_500, gender: "male" }).annual).toBe(0);
    expect(annualProfessionalTax({ stateId: "maharashtra", monthlyGross: 7_501, gender: "male" }).monthly).toBe(175);
    expect(annualProfessionalTax({ stateId: "maharashtra", monthlyGross: 10_000, gender: "male" }).monthly).toBe(175);
    expect(annualProfessionalTax({ stateId: "maharashtra", monthlyGross: 10_001, gender: "male" }).monthly).toBe(200);
    expect(annualProfessionalTax({ stateId: "maharashtra", monthlyGross: 25_000, gender: "female" }).annual).toBe(0);
    expect(annualProfessionalTax({ stateId: "maharashtra", monthlyGross: 25_001, gender: "female" }).february).toBe(300);
  });

  it("uses the April 2025 Karnataka threshold", () => {
    expect(annualProfessionalTax({ stateId: "karnataka", monthlyGross: 24_999, gender: "male" }).annual).toBe(0);
    const above = annualProfessionalTax({ stateId: "karnataka", monthlyGross: 25_000, gender: "female" });
    expect(above.monthly).toBe(200);
    expect(above.february).toBe(300);
    expect(above.annual).toBe(2_500);
  });

  it("handles half-yearly states, nil states, and a payslip override", () => {
    const kerala = annualProfessionalTax({ stateId: "kerala", monthlyGross: 20_000, gender: "male" });
    expect(kerala.annual).toBe(2_000);
    const tamil = annualProfessionalTax({ stateId: "tamil-nadu", monthlyGross: 50_000, gender: "female" });
    expect(tamil.annual).toBe(2_500);
    expect(annualProfessionalTax({ stateId: "delhi", monthlyGross: 100_000, gender: "male" }).annual).toBe(0);
    expect(annualProfessionalTax({ stateId: "telangana", monthlyGross: 20_000, gender: "male" }).monthly).toBe(150);
    expect(annualProfessionalTax({ stateId: "telangana", monthlyGross: 20_001, gender: "male" }).monthly).toBe(200);
    expect(annualProfessionalTax({ stateId: "west-bengal", monthlyGross: 12_000, gender: "male" }).monthly).toBe(110);
    expect(annualProfessionalTax({ stateId: "gujarat", monthlyGross: 11_999, gender: "male" }).annual).toBe(0);
    expect(annualProfessionalTax({ stateId: "gujarat", monthlyGross: 12_000, gender: "male" }).monthly).toBe(200);
    const custom = annualProfessionalTax({ stateId: "karnataka", monthlyGross: 80_000, gender: "male", monthlyOverride: 0 });
    expect(custom.annual).toBe(0);
    expect(custom.overridden).toBe(true);
  });
});

describe("in-hand salary", () => {
  it("subtracts employee PF, professional tax and income tax from cash gross", () => {
    const result = computeSalary(salary());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tax.new.totalTax).toBe(0);
    expect(result.tax.old.totalTax).toBe(0);
    expect(result.inHand.new).toBe(result.annual.cashGross - result.annual.employeePf);
    expect(result.inHand.new).toBe(513_577);
  });

  it("reduces take-home by Maharashtra professional tax without creating income tax", () => {
    const result = computeSalary(salary({ stateId: "maharashtra", gender: "male" }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.professionalTax.annual).toBe(2_500);
    expect(result.inHand.new).toBe(511_077);
    expect(result.tax.old.professionalTax).toBe(2_500);
  });
});
