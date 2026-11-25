import { describe, expect, it } from "vitest";
import { buildReceiptModel } from "@/lib/receipt";

const valid = {
  tenantName: "Sample Tenant",
  tenantAddress: "",
  landlordName: "Sample Landlord",
  landlordPan: "",
  landlordAddress: "",
  propertyAddress: "12 Sample Lane, Pune",
  monthlyRent: 15_000,
  from: "2025-04",
  to: "2026-03",
  paymentMode: "upi" as const,
  receivedDay: 5,
};

describe("rent receipts", () => {
  it("builds one receipt a month and warns when annual rent crosses ₹1,00,000 without a PAN", () => {
    const model = buildReceiptModel(valid);
    expect(model.errors).toEqual({});
    expect(model.months).toHaveLength(12);
    expect(model.months[0]?.label).toBe("April 2025");
    expect(model.months[11]?.label).toBe("March 2026");
    expect(model.months[0]?.amountInWords).toBe("Fifteen thousand rupees only");
    expect(model.annualRent).toBe(180_000);
    expect(model.needsPanWarning).toBe(true);
    expect(model.needsStamp).toBe(false);
  });

  it("asks for a revenue stamp on large cash receipts and checks the PAN shape", () => {
    const cash = buildReceiptModel({ ...valid, paymentMode: "cash", monthlyRent: 6_000, to: "2025-04" });
    expect(cash.needsStamp).toBe(true);
    expect(cash.needsPanWarning).toBe(false);
    const pan = buildReceiptModel({ ...valid, landlordPan: "ABCDE1234F", to: "2025-06" });
    expect(pan.errors.pan).toBeUndefined();
    expect(pan.needsPanWarning).toBe(false);
    expect(buildReceiptModel({ ...valid, landlordPan: "not-a-pan" }).errors.pan).toBeTruthy();
  });

  it("rejects a reversed range and more than 12 months", () => {
    expect(buildReceiptModel({ ...valid, from: "2025-08", to: "2025-04" }).errors.range).toBeTruthy();
    expect(buildReceiptModel({ ...valid, from: "2025-01", to: "2026-01" }).errors.range).toBeTruthy();
    expect(buildReceiptModel({ ...valid, tenantName: "A", monthlyRent: 0 }).errors.tenantName).toBeTruthy();
    expect(buildReceiptModel({ ...valid, monthlyRent: 0 }).errors.rent).toBeTruthy();
  });
});
