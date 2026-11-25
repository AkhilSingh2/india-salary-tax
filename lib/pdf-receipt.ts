import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { buildReceiptModel, type ReceiptInput, type ReceiptMonth } from "@/lib/receipt";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

export async function buildReceiptPdf(input: ReceiptInput): Promise<Uint8Array> {
  const model = buildReceiptModel(input);
  if (model.months.length === 0) {
    throw new Error("Receipt details are incomplete.");
  }
  const doc = await PDFDocument.create();
  doc.setTitle("Rent receipts");
  doc.setAuthor("Aayam");
  doc.setCreator("Aayam rent receipt generator");
  doc.setSubject("Rent receipts created in the browser");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.11, 0.1, 0.08);
  const muted = rgb(0.32, 0.3, 0.26);
  const line = rgb(0.78, 0.72, 0.62);

  model.months.forEach((month, index) => {
    if (index % 2 === 0) doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const page = doc.getPage(doc.getPageCount() - 1);
    if (!page) return;
    const top = index % 2 === 0 ? PAGE_HEIGHT - 36 : PAGE_HEIGHT / 2 - 4;
    drawReceipt(page, font, bold, ink, muted, line, top, month, input, model.needsStamp);
    if (index % 2 === 0) {
      page.drawLine({
        start: { x: 36, y: PAGE_HEIGHT / 2 },
        end: { x: PAGE_WIDTH - 36, y: PAGE_HEIGHT / 2 },
        thickness: 0.4,
        color: line,
        dashArray: [3, 3],
      });
    }
  });

  const pages = doc.getPages();
  pages.forEach((page, index) => {
    page.drawText("Created locally by Aayam. Nothing in this file was uploaded.", {
      x: 36,
      y: 18,
      size: 8,
      font,
      color: muted,
    });
    page.drawText(`${index + 1} / ${pages.length}`, {
      x: PAGE_WIDTH - 70,
      y: 18,
      size: 8,
      font,
      color: muted,
    });
  });

  return doc.save();
}

function drawReceipt(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  ink: ReturnType<typeof rgb>,
  muted: ReturnType<typeof rgb>,
  line: ReturnType<typeof rgb>,
  top: number,
  month: ReceiptMonth,
  input: ReceiptInput,
  stamp: boolean,
) {
  const x = 40;
  const width = PAGE_WIDTH - 80;
  page.drawText("RENT RECEIPT", { x, y: top - 16, size: 14, font: bold, color: ink });
  page.drawText(month.receiptNo, { x: x + 250, y: top - 14, size: 10, font, color: muted });
  page.drawText(month.dateLabel, { x: x + 360, y: top - 14, size: 10, font, color: ink });
  let cursor = top - 36;
  cursor = wrap(page, `Received from ${input.tenantName.trim()} the sum of Rs. ${month.amount.toLocaleString("en-IN")} (${month.amountInWords}).`, x, cursor, width, font, 11, ink);
  cursor = wrap(page, `Towards rent of ${input.propertyAddress.trim()} for ${month.label}.`, x, cursor, width, font, 11, ink);
  cursor = wrap(page, `Payment mode: ${labelMode(input.paymentMode)}.`, x, cursor, width, font, 11, ink);
  if (input.tenantAddress.trim()) cursor = wrap(page, `Tenant address: ${input.tenantAddress.trim()}`, x, cursor, width, font, 10, muted);
  cursor -= 6;
  cursor = wrap(page, `Landlord: ${input.landlordName.trim()}`, x, cursor, width - 120, bold, 11, ink);
  if (input.landlordPan.trim()) cursor = wrap(page, `PAN: ${input.landlordPan.trim().toUpperCase()}`, x, cursor, width, font, 10, ink);
  if (input.landlordAddress.trim()) cursor = wrap(page, input.landlordAddress.trim(), x, cursor, width - 120, font, 10, muted);
  const signY = Math.min(cursor - 28, top - 300);
  page.drawLine({ start: { x, y: signY }, end: { x: x + 180, y: signY }, thickness: 0.8, color: line });
  page.drawText("Signature of landlord", { x, y: signY - 14, size: 9, font, color: muted });
  if (stamp) {
    page.drawRectangle({ x: PAGE_WIDTH - 140, y: signY - 20, width: 78, height: 64, borderColor: rgb(0.55, 0.25, 0.05), borderWidth: 1 });
    page.drawText("Revenue", { x: PAGE_WIDTH - 128, y: signY + 20, size: 8, font, color: rgb(0.55, 0.25, 0.05) });
    page.drawText("stamp", { x: PAGE_WIDTH - 124, y: signY + 8, size: 8, font, color: rgb(0.55, 0.25, 0.05) });
  }
}

function labelMode(mode: ReceiptInput["paymentMode"]): string {
  if (mode === "bank") return "bank transfer";
  if (mode === "upi") return "UPI";
  if (mode === "cheque") return "cheque";
  return "cash";
}

function wrap(page: PDFPage, text: string, x: number, y: number, maxWidth: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>): number {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let cursor = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      page.drawText(line, { x, y: cursor, size, font, color });
      cursor -= size + 3;
      line = word;
    } else {
      line = next;
    }
  }
  if (line) {
    page.drawText(line, { x, y: cursor, size, font, color });
    cursor -= size + 4;
  }
  return cursor;
}
