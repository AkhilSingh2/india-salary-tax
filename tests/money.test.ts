import { describe, expect, it } from "vitest";
import { formatINR, roundIncomeToTen, roundRupee } from "@/lib/money";
import { inrInWords } from "@/lib/words";

describe("rounding", () => {
  it("rounds half a rupee up", () => {
    expect(roundRupee(0.5)).toBe(1);
    expect(roundRupee(1.49)).toBe(1);
    expect(roundRupee(70_588.5)).toBe(70_589);
  });

  it("rounds total income to the nearest ten under section 288B", () => {
    expect(roundIncomeToTen(1_200_004)).toBe(1_200_000);
    expect(roundIncomeToTen(1_200_005)).toBe(1_200_010);
    expect(roundIncomeToTen(5_000_004)).toBe(5_000_000);
    expect(roundIncomeToTen(5_000_005)).toBe(5_000_010);
    expect(roundIncomeToTen(100)).toBe(100);
    expect(roundIncomeToTen(104)).toBe(100);
    expect(roundIncomeToTen(105)).toBe(110);
    expect(roundIncomeToTen(0)).toBe(0);
  });
});

describe("formatINR", () => {
  it("groups digits the Indian way", () => {
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(100)).toBe("₹100");
    expect(formatINR(1_000)).toBe("₹1,000");
    expect(formatINR(100_000)).toBe("₹1,00,000");
    expect(formatINR(850_600)).toBe("₹8,50,600");
    expect(formatINR(12_345_678)).toBe("₹1,23,45,678");
    expect(formatINR(-250)).toBe("-₹250");
  });
});

describe("inrInWords", () => {
  it("uses lakh and crore", () => {
    expect(inrInWords(0)).toBe("Zero rupees only");
    expect(inrInWords(15_000)).toBe("Fifteen thousand rupees only");
    expect(inrInWords(101)).toBe("One hundred and one rupees only");
    expect(inrInWords(100_000)).toBe("One lakh rupees only");
    expect(inrInWords(123_456)).toBe("One lakh twenty-three thousand four hundred and fifty-six rupees only");
    expect(inrInWords(1_00_00_000)).toBe("One crore rupees only");
  });
});
