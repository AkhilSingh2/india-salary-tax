import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { buildReceiptPdf } from "@/lib/pdf-receipt";

describe("rent receipt PDF", () => {
  it("builds a local PDF with one page per two months", async () => {
    const bytes = await buildReceiptPdf({
      tenantName: "Sample Tenant",
      tenantAddress: "Sample tenant address",
      landlordName: "Sample Landlord",
      landlordPan: "ABCDE1234F",
      landlordAddress: "Sample landlord address",
      propertyAddress: "12 Sample Lane, Pune",
      monthlyRent: 15_000,
      from: "2025-04",
      to: "2025-09",
      paymentMode: "upi",
      receivedDay: 5,
    });
    expect(Buffer.from(bytes.subarray(0, 5)).toString("utf8")).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3);
    expect(doc.getTitle()).toBe("Rent receipts");
    expect(doc.getAuthor()).toBe("Aayam");
  });
});
