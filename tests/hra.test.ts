import { describe, expect, it } from "vitest";
import { hraExemption, hraForStay } from "@/lib/hra";

const base = {
  basic: 600_000,
  da: 0,
  daCountsForRetirement: false,
  hraReceived: 300_000,
  rentPaid: 360_000,
  metro: true,
};

describe("HRA exemption", () => {
  it("uses 50% of salary in a metro and 40% otherwise", () => {
    expect(hraExemption(base).exemption).toBe(300_000);
    expect(hraExemption({ ...base, metro: false }).exemption).toBe(240_000);
    expect(hraExemption(base).percent).toBe(0.5);
    expect(hraExemption({ ...base, metro: false }).percent).toBe(0.4);
  });

  it("is zero when rent does not exceed 10% of salary", () => {
    const result = hraExemption({ ...base, rentPaid: 50_000 });
    expect(result.rentMinusTenPercent).toBe(0);
    expect(result.exemption).toBe(0);
    expect(result.taxableHra).toBe(300_000);
  });

  it("is limited by the HRA actually received", () => {
    expect(hraExemption({ ...base, hraReceived: 100_000 }).exemption).toBe(100_000);
  });

  it("is limited by rent minus 10% of salary", () => {
    const result = hraExemption({ ...base, rentPaid: 200_000, hraReceived: 300_000 });
    expect(result.rentMinusTenPercent).toBe(140_000);
    expect(result.exemption).toBe(140_000);
  });

  it("counts DA only when it forms part of retirement benefits", () => {
    const withDa = hraExemption({
      basic: 400_000,
      da: 200_000,
      daCountsForRetirement: true,
      hraReceived: 300_000,
      rentPaid: 360_000,
      metro: true,
    });
    const without = hraExemption({
      basic: 400_000,
      da: 200_000,
      daCountsForRetirement: false,
      hraReceived: 300_000,
      rentPaid: 360_000,
      metro: true,
    });
    expect(withDa.salary).toBe(600_000);
    expect(withDa.exemption).toBe(300_000);
    expect(without.salary).toBe(400_000);
    expect(without.exemption).toBe(200_000);
  });

  it("treats negative and blank amounts as zero", () => {
    const result = hraExemption({
      basic: -1,
      da: Number.NaN,
      daCountsForRetirement: true,
      hraReceived: 0,
      rentPaid: -50,
      metro: false,
    });
    expect(result.exemption).toBe(0);
  });

  it("scales a full-year salary down to the months rented", () => {
    const full = hraForStay({
      annualBasic: 600_000,
      annualDa: 0,
      daCountsForRetirement: false,
      annualHra: 300_000,
      monthlyRent: 30_000,
      months: 12,
      metro: true,
    });
    const half = hraForStay({ ...full, months: 6, annualBasic: 600_000, annualDa: 0, annualHra: 300_000, monthlyRent: 30_000, daCountsForRetirement: false, metro: true });
    expect(full.exemption).toBe(300_000);
    expect(half.exemption).toBe(150_000);
    expect(hraForStay({ ...full, months: 0, annualBasic: 600_000, annualDa: 0, annualHra: 300_000, monthlyRent: 30_000, daCountsForRetirement: false, metro: true }).exemption).toBe(0);
  });
});
