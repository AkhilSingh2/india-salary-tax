import { cleanAmount } from "@/lib/money";
import { SHARED } from "@/lib/tax-rules";

export type HraInput = {
  basic: number;
  da: number;
  /** Rule 2A counts DA only when it forms part of retirement benefits. */
  daCountsForRetirement: boolean;
  hraReceived: number;
  rentPaid: number;
  metro: boolean;
};

export type HraResult = {
  salary: number;
  actualHra: number;
  rentMinusTenPercent: number;
  percentOfSalary: number;
  percent: number;
  exemption: number;
  taxableHra: number;
};

export function hraExemption(input: HraInput): HraResult {
  const basic = cleanAmount(input.basic);
  const da = input.daCountsForRetirement ? cleanAmount(input.da) : 0;
  const salary = basic + da;
  const actualHra = cleanAmount(input.hraReceived);
  const rentMinusTenPercent = Math.max(0, cleanAmount(input.rentPaid) - SHARED.hra.rentFloorShare * salary);
  const percent = input.metro ? SHARED.hra.metroShare : SHARED.hra.nonMetroShare;
  const percentOfSalary = percent * salary;
  const exemption = Math.min(actualHra, rentMinusTenPercent, percentOfSalary);
  return {
    salary,
    actualHra,
    rentMinusTenPercent,
    percentOfSalary,
    percent,
    exemption,
    taxableHra: Math.max(0, actualHra - exemption),
  };
}

/**
 * Basic, DA and HRA are full-year amounts. They are scaled to the months
 * the home was rented. Rent is the monthly figure.
 */
export function hraForStay(input: {
  annualBasic: number;
  annualDa: number;
  daCountsForRetirement: boolean;
  annualHra: number;
  monthlyRent: number;
  months: number;
  metro: boolean;
}): HraResult {
  const months = Math.min(12, Math.max(0, Math.round(cleanAmount(input.months) || 0)));
  const factor = months / 12;
  return hraExemption({
    basic: input.annualBasic * factor,
    da: input.annualDa * factor,
    daCountsForRetirement: input.daCountsForRetirement,
    hraReceived: input.annualHra * factor,
    rentPaid: cleanAmount(input.monthlyRent) * months,
    metro: input.metro,
  });
}
