import { describe, expect, it } from "vitest";
import { compareRegimes, taxOnTotalIncome, type TaxInput } from "@/lib/tax";
import { SHARED, SOURCES, YEARS } from "@/lib/tax-rules";

function on(
  totalIncome: number,
  overrides: Partial<Parameters<typeof taxOnTotalIncome>[0]> = {},
) {
  return taxOnTotalIncome({
    year: "fy-2025-26",
    regime: "new",
    resident: true,
    totalIncome,
    ...overrides,
  });
}

describe("FY 2025-26 new regime slabs, without the resident rebate", () => {
  it("is nil at every edge of the zero band", () => {
    expect(on(0, { resident: false }).totalTax).toBe(0);
    expect(on(400_000, { resident: false }).totalTax).toBe(0);
  });

  it("charges 5% from the rupee after ₹4,00,000", () => {
    const tax = on(400_010, { resident: false });
    expect(tax.taxAfterRebate).toBe(1);
    expect(tax.cess).toBe(0);
    expect(tax.totalTax).toBe(1);
  });

  it("hits the 5%, 10%, 15%, 20%, 25% and 30% edges", () => {
    expect(on(800_000, { resident: false }).totalTax).toBe(20_800);
    expect(on(800_010, { resident: false }).totalTax).toBe(20_801);
    expect(on(1_200_000, { resident: false }).totalTax).toBe(62_400);
    expect(on(1_600_000, { resident: false }).totalTax).toBe(124_800);
    expect(on(2_000_000, { resident: false }).totalTax).toBe(208_000);
    expect(on(2_400_000, { resident: false }).totalTax).toBe(312_000);
    expect(on(2_400_010, { resident: false }).totalTax).toBe(312_003);
  });
});

describe("section 87A rebate for FY 2025-26", () => {
  it("wipes tax at ₹12,00,000 and for a salaried ₹12.75 lakh", () => {
    expect(on(1_200_000).totalTax).toBe(0);
    expect(on(1_200_000).rebate).toBe(60_000);

    const salaried = compareRegimes({
      ...emptyInput(),
      grossSalary: 1_275_000,
    });
    expect(salaried.new.standardDeduction).toBe(75_000);
    expect(salaried.new.totalIncome).toBe(1_200_000);
    expect(salaried.new.totalTax).toBe(0);
  });

  it("rounds ₹12,00,004 down to the rebate and ₹12,00,005 into marginal relief", () => {
    expect(on(1_200_004).totalTax).toBe(0);
    const crossed = on(1_200_005);
    expect(crossed.totalIncome).toBe(1_200_010);
    expect(crossed.taxAfterRebate).toBe(10);
    expect(crossed.totalTax).toBe(10);
    expect(crossed.notes.some((note) => note.code === "marginal-rebate")).toBe(true);
  });

  it("keeps marginal relief just inside the 15% band and drops it just outside", () => {
    const inside = on(1_270_580);
    expect(inside.taxAfterRebate).toBe(70_580);
    expect(inside.cess).toBe(2_823);
    expect(inside.totalTax).toBe(73_403);

    const outside = on(1_270_590);
    expect(outside.taxAfterRebate).toBe(70_589);
    expect(outside.notes.some((note) => note.code === "marginal-rebate")).toBe(false);
    expect(outside.cess).toBe(2_824);
    expect(outside.totalTax).toBe(73_413);
  });

  it("does not give the rebate to a non-resident", () => {
    const tax = on(1_200_000, { resident: false });
    expect(tax.totalTax).toBe(62_400);
    expect(tax.notes.some((note) => note.code === "nonresident-no-87a")).toBe(true);
  });

  it("uses the same slabs for senior citizens", () => {
    const younger = on(700_000, { age: "below60" });
    const senior = on(700_000, { age: "senior" });
    expect(senior.totalTax).toBe(younger.totalTax);
    expect(senior.totalTax).toBe(0);
  });
});

describe("FY 2024-25 new regime (AY 2025-26)", () => {
  it("rebates tax up to ₹7,00,000 and gives marginal relief just above it", () => {
    expect(on(700_000, { year: "fy-2024-25" }).totalTax).toBe(0);
    const justOver = on(700_010, { year: "fy-2024-25" });
    expect(justOver.totalIncome).toBe(700_010);
    expect(justOver.taxAfterRebate).toBe(10);
    expect(justOver.totalTax).toBe(10);
  });

  it("ends marginal relief once the 10% band overtakes the excess", () => {
    const inside = on(722_220, { year: "fy-2024-25" });
    expect(inside.taxAfterRebate).toBe(22_220);
    expect(inside.totalTax).toBe(23_109);

    const outside = on(722_230, { year: "fy-2024-25" });
    expect(outside.taxAfterRebate).toBe(22_223);
    expect(outside.notes.some((note) => note.code === "marginal-rebate")).toBe(false);
    expect(outside.totalTax).toBe(23_112);
  });
});

describe("old regime", () => {
  it("rebates tax at ₹5,00,000 and stops dead one step above it", () => {
    expect(on(500_000, { regime: "old" }).totalTax).toBe(0);
    expect(on(500_004, { regime: "old" }).totalTax).toBe(0);
    const crossed = on(500_010, { regime: "old" });
    expect(crossed.totalIncome).toBe(500_010);
    expect(crossed.rebate).toBe(0);
    expect(crossed.taxAfterRebate).toBe(12_502);
    expect(crossed.cess).toBe(500);
    expect(crossed.totalTax).toBe(13_002);
    expect(crossed.notes.some((note) => note.code === "old-rebate-cliff")).toBe(true);
  });

  it("raises the basic exemption for senior and super-senior ages", () => {
    expect(on(300_000, { regime: "old", age: "senior" }).totalTax).toBe(0);
    expect(on(300_010, { regime: "old", age: "senior", resident: false }).totalTax).toBe(1);
    expect(on(500_000, { regime: "old", age: "superSenior", resident: false }).totalTax).toBe(0);
    expect(on(500_010, { regime: "old", age: "superSenior", resident: false }).totalTax).toBe(2);
    expect(on(500_000, { regime: "old", age: "below60", resident: false }).totalTax).toBe(13_000);
  });

  it("charges 4% cess on the slab tax", () => {
    const tax = on(1_000_000, { regime: "old", resident: false });
    expect(tax.taxAfterRebate).toBe(112_500);
    expect(tax.cess).toBe(4_500);
    expect(tax.totalTax).toBe(117_000);
  });
});

describe("surcharge and marginal relief", () => {
  it("does not surcharge ₹50,00,000 and relieves the jump just above it", () => {
    const at = on(5_000_000, { regime: "old", resident: false });
    expect(at.surcharge).toBe(0);
    expect(at.taxAfterRebate).toBe(1_312_500);
    expect(at.cess).toBe(52_500);
    expect(at.totalTax).toBe(1_365_000);

    expect(on(5_000_004, { regime: "old", resident: false }).totalTax).toBe(1_365_000);

    const over = on(5_000_010, { regime: "old", resident: false });
    expect(over.totalIncome).toBe(5_000_010);
    expect(over.taxAndSurcharge).toBe(1_312_510);
    expect(over.surcharge).toBe(7);
    expect(over.cess).toBe(52_500);
    expect(over.totalTax).toBe(1_365_010);
    expect(over.notes.some((note) => note.code === "surcharge-relief")).toBe(true);
  });

  it("caps the new regime at 25% above ₹5 crore and lets the old regime charge 37%", () => {
    const newer = on(60_000_000, { regime: "new", resident: false });
    expect(newer.surcharge).toBe(4_395_000);
    expect(newer.taxAndSurcharge).toBe(21_975_000);
    expect(newer.cess).toBe(879_000);
    expect(newer.totalTax).toBe(22_854_000);

    const older = on(60_000_000, { regime: "old", resident: false });
    expect(older.surcharge).toBe(6_590_625);
    expect(older.taxAndSurcharge).toBe(24_403_125);
    expect(older.totalTax).toBe(25_379_250);
    expect(older.totalTax).toBeGreaterThan(newer.totalTax);
  });

  it("applies marginal relief when the old regime crosses into 37%", () => {
    const over = on(50_000_010, { regime: "old", resident: false });
    expect(over.taxAndSurcharge).toBe(18_515_635);
    expect(over.totalTax).toBe(19_256_260);
  });

  it("does not invent a 37% rate just above ₹5 crore in the new regime", () => {
    const over = on(50_000_010, { regime: "new", resident: false });
    expect(over.surcharge).toBeLessThan(4_000_000);
    expect(over.taxAndSurcharge).toBe(18_225_004);
    expect(over.totalTax).toBe(18_954_004);
  });
});

describe("salary deductions and the worked example", () => {
  it("lets a ₹12 lakh salary with ordinary deductions save under the new regime", () => {
    const result = compareRegimes(exampleInput());
    expect(result.new.totalTax).toBe(0);
    expect(result.new.totalIncome).toBe(1_125_000);
    expect(result.old.hraExemption).toBe(132_000);
    expect(result.old.totalIncome).toBe(850_600);
    expect(result.old.taxAfterRebate).toBe(82_620);
    expect(result.old.cess).toBe(3_305);
    expect(result.old.totalTax).toBe(85_925);
    expect(result.winner).toBe("new");
    expect(result.savings).toBe(85_925);
  });

  it("caps 80C, 80D, extra NPS and self-occupied interest, and ignores them in the new regime", () => {
    const result = compareRegimes({
      ...emptyInput(),
      grossSalary: 2_500_000,
      basicSalary: 1_000_000,
      section80C: 300_000,
      section80CCD1B: 80_000,
      section80DSelf: 40_000,
      selfOrFamilySenior: false,
      section80DParents: 60_000,
      parentsSenior: true,
      homeLoanInterestSelfOccupied: 350_000,
      employerNps: 200_000,
      employerNpsIncludedInGross: true,
      employment: "private",
    });

    expect(result.old.section80C).toBe(150_000);
    expect(result.old.section80CCD1B).toBe(50_000);
    expect(result.old.section80D).toBe(25_000 + 50_000);
    expect(result.old.housePropertyLoss).toBe(200_000);
    expect(result.old.employerNps).toBe(100_000);
    expect(result.new.section80C).toBe(0);
    expect(result.new.section80D).toBe(0);
    expect(result.new.housePropertyLoss).toBe(0);
    expect(result.new.hraExemption).toBe(0);
    expect(result.new.employerNps).toBe(140_000);
    expect(result.old.notes.some((note) => note.code === "capped" && note.item === "80C")).toBe(true);
  });

  it("uses 14% employer NPS for government employees in the old regime", () => {
    const result = compareRegimes({
      ...emptyInput(),
      grossSalary: 2_000_000,
      basicSalary: 1_000_000,
      employerNps: 140_000,
      employerNpsIncludedInGross: true,
      employment: "government",
    });
    expect(result.old.employerNps).toBe(140_000);
  });

  it("does not let chapter VI-A pull total income below zero", () => {
    const result = compareRegimes({
      ...emptyInput(),
      grossSalary: 100_000,
      section80C: 150_000,
    });
    expect(result.old.totalIncome).toBe(0);
    expect(result.old.totalTax).toBe(0);
  });
});

describe("rules file", () => {
  it("covers every rupee exactly once and cites incometax.gov.in", () => {
    for (const year of Object.values(YEARS)) {
      expect(continuous(year.newRegime.slabs)).toBe(true);
      for (const slabs of Object.values(year.oldRegime.slabsByAge)) {
        expect(continuous(slabs)).toBe(true);
      }
    }
    expect(YEARS["fy-2025-26"].newRegime.rebate.max).toBe(60_000);
    expect(YEARS["fy-2025-26"].newRegime.standardDeduction).toBe(75_000);
    expect(SHARED.cessRate).toBe(0.04);
    expect(SOURCES.some((source) => source.url.includes("incometax.gov.in"))).toBe(true);
  });
});

function continuous(slabs: { upto: number | null; rate: number }[]): boolean {
  if (slabs[0]?.upto == null) return false;
  let cursor = 0;
  for (let index = 0; index < slabs.length; index += 1) {
    const slab = slabs[index];
    if (!slab) return false;
    if (index === 0 && slab.upto == null) return false;
    if (slab.upto != null && slab.upto <= cursor) return false;
    if (index === slabs.length - 1 && slab.upto != null) return false;
    cursor = slab.upto ?? cursor;
  }
  return true;
}

function emptyInput(): TaxInput {
  return {
    year: "fy-2025-26",
    age: "below60",
    resident: true,
    employment: "private",
    grossSalary: 0,
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
  };
}

function exampleInput(): TaxInput {
  return {
    ...emptyInput(),
    grossSalary: 1_200_000,
    basicSalary: 480_000,
    hraExemption: 132_000,
    professionalTax: 2_400,
    section80C: 150_000,
    section80DSelf: 15_000,
  };
}
