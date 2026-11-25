"use client";

import { useMemo, useState } from "react";
import { Alert, Button, NumberInput } from "@sutra-ui/react";
import { MoneyField, MonthField, SegmentField, TextArea, TextField } from "@/components/Fields";
import { useT } from "@/components/use-t";
import { buildReceiptModel, type PaymentMode, type ReceiptInput } from "@/lib/receipt";
import { formatINR } from "@/lib/money";

const EMPTY: ReceiptInput = {
  tenantName: "",
  tenantAddress: "",
  landlordName: "",
  landlordPan: "",
  landlordAddress: "",
  propertyAddress: "",
  monthlyRent: 0,
  from: "2025-04",
  to: "2026-03",
  paymentMode: "upi",
  receivedDay: 5,
};

const SAMPLE: ReceiptInput = {
  ...EMPTY,
  tenantName: "Sample Tenant",
  tenantAddress: "Sample tenant address",
  landlordName: "Sample Landlord",
  landlordPan: "",
  landlordAddress: "Sample landlord address",
  propertyAddress: "12 Sample Lane, Pune",
  monthlyRent: 15_000,
};

export function RentReceiptTool() {
  const t = useT();
  const [form, setForm] = useState<ReceiptInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const model = useMemo(() => buildReceiptModel(form), [form]);

  function patch(partial: Partial<ReceiptInput>) {
    setPdfError(false);
    setForm((current) => ({ ...current, ...partial }));
  }

  function message(code?: string): string | undefined {
    if (code === "tenant") return t("Enter the tenant's name.", "किरायेदार का नाम भरें।");
    if (code === "landlord") return t("Enter the landlord's name.", "मकान मालिक का नाम भरें।");
    if (code === "property") return t("Enter the rented address.", "किराए के मकान का पता भरें।");
    if (code === "rent") return t("Enter the monthly rent.", "मासिक किराया भरें।");
    if (code === "day") return t("Use a day from 1 to 28 so every month is valid.", "हर महीने के लिए 1 से 28 के बीच की तारीख रखें।");
    if (code === "pan") return t("PAN should look like ABCDE1234F, or leave it blank.", "PAN ABCDE1234F जैसा होना चाहिए, वरना खाली छोड़ें।");
    if (code === "long") return t("Generate one year at a time (up to 12 receipts).", "एक बार में एक साल की रसीदें बनाएँ (अधिकतम 12)।");
    if (code === "range") return t("Choose a start month that is the same as, or before, the end month.", "शुरुआती महीना अंत वाले महीने के बाद का न हो।");
    return undefined;
  }

  async function download() {
    if (model.months.length === 0) {
      document.getElementById("receipt-errors")?.focus();
      return;
    }
    setBusy(true);
    setPdfError(false);
    try {
      const { buildReceiptPdf } = await import("@/lib/pdf-receipt");
      const bytes = await buildReceiptPdf(form);
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rent-receipts-${form.from}-to-${form.to}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="stack">
      <Alert tone="success" title={t("Nothing you type leaves this browser.", "आप जो भरते हैं वह इस ब्राउज़र से बाहर नहीं जाता।")}>
        {t(
          "There is no account and no upload. The PDF is built on this device when you ask for it. Close the tab and the details are gone.",
          "कोई खाता नहीं, कोई अपलोड नहीं। PDF इसी डिवाइस पर बनता है। टैब बंद करते ही विवरण मिट जाता है।",
        )}
      </Alert>
      <div className="calc-grid">
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            void download();
          }}
          noValidate
        >
          <TextField
            id="tenant"
            label={t("Tenant name", "किरायेदार का नाम")}
            value={form.tenantName}
            onChange={(tenantName) => patch({ tenantName })}
            error={message(model.errors.tenantName)}
            autoComplete="name"
          />
          <TextArea
            id="tenant-address"
            label={t("Tenant address (optional)", "किरायेदार का पता (वैकल्पिक)")}
            value={form.tenantAddress}
            onChange={(tenantAddress) => patch({ tenantAddress })}
          />
          <TextField
            id="landlord"
            label={t("Landlord name", "मकान मालिक का नाम")}
            value={form.landlordName}
            onChange={(landlordName) => patch({ landlordName })}
            error={message(model.errors.landlordName)}
          />
          <TextField
            id="pan"
            label={t("Landlord PAN (optional)", "मकान मालिक का PAN (वैकल्पिक)")}
            value={form.landlordPan}
            onChange={(landlordPan) => patch({ landlordPan: landlordPan.toUpperCase() })}
            error={message(model.errors.pan)}
            hint={t(
              "Employers usually ask for it when rent in the year is above ₹1,00,000.",
              "साल का किराया ₹1,00,000 से ऊपर हो तो नियोक्ता आमतौर पर PAN माँगता है।",
            )}
          />
          <TextArea
            id="landlord-address"
            label={t("Landlord address (optional)", "मकान मालिक का पता (वैकल्पिक)")}
            value={form.landlordAddress}
            onChange={(landlordAddress) => patch({ landlordAddress })}
          />
          <TextArea
            id="property"
            label={t("Address of the rented home", "किराए के मकान का पता")}
            value={form.propertyAddress}
            onChange={(propertyAddress) => patch({ propertyAddress })}
            error={message(model.errors.propertyAddress)}
          />
          <MoneyField
            id="rent-amount"
            label={t("Monthly rent", "मासिक किराया")}
            value={form.monthlyRent}
            onChange={(monthlyRent) => patch({ monthlyRent })}
            error={message(model.errors.rent)}
          />
          <div className="stack cols-2">
            <MonthField id="from-month" label={t("From", "से")} value={form.from} onChange={(from) => patch({ from })} />
            <MonthField id="to-month" label={t("To", "तक")} value={form.to} onChange={(to) => patch({ to })} />
          </div>
          {model.errors.range ? (
            <p className="sutra-error" role="alert">
              {message(model.errors.range)}
            </p>
          ) : null}
          <NumberInput
            id="day"
            name="day"
            label={t("Day printed on each receipt", "हर रसीद पर छपने वाली तारीख")}
            decimals={0}
            min={0}
            value={form.receivedDay}
            onValueChange={(value) => patch({ receivedDay: Math.min(99, Math.max(0, Math.round(value ?? 0))) })}
            hint={t("Use 1 to 28 so the date exists in every month.", "1 से 28 रखें ताकि हर महीने में तारीख बने।")}
            error={message(model.errors.day)}
          />
          <SegmentField
            label={t("How the rent was paid", "किराया कैसे दिया")}
            value={form.paymentMode}
            onChange={(paymentMode: PaymentMode) => patch({ paymentMode })}
            options={[
              { value: "upi", label: "UPI" },
              { value: "bank", label: t("Bank transfer", "बैंक ट्रांसफर") },
              { value: "cheque", label: t("Cheque", "चेक") },
              { value: "cash", label: t("Cash", "नकद") },
            ]}
          />
          <div id="receipt-errors" tabIndex={-1} className="stack">
            {model.needsPanWarning ? (
              <Alert tone="warning" title={t("PAN may be required", "PAN माँगा जा सकता है")}>
                {t(
                  "Annual rent is above ₹1,00,000 and PAN is blank. Your employer may ask for the landlord's PAN before allowing the HRA exemption.",
                  "साल का किराया ₹1,00,000 से ऊपर है और PAN खाली है। HRA छूट से पहले नियोक्ता PAN माँग सकता है।",
                )}
              </Alert>
            ) : null}
            {model.needsStamp ? (
              <Alert tone="info" title={t("Revenue stamp", "रेवेन्यू स्टांप")}>
                {t(
                  "Cash rent above ₹5,000 needs a revenue stamp on the signed receipt. A box is left for it.",
                  "₹5,000 से ऊपर नकद किराए पर हस्ताक्षरित रसीद पर रेवेन्यू स्टांप लगता है। उसके लिए जगह छोड़ी गई है।",
                )}
              </Alert>
            ) : null}
          </div>
          <div className="actions">
            <Button type="submit" disabled={busy}>
              {busy ? t("Preparing the PDF", "PDF बन रहा है") : t("Download PDF", "PDF डाउनलोड करें")}
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.print()}>
              {t("Print", "प्रिंट")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(SAMPLE)}>
              {t("Fill a labelled sample", "नमूना भरें")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(EMPTY)}>
              {t("Clear", "साफ़ करें")}
            </Button>
          </div>
          {pdfError ? (
            <p className="sutra-error" role="alert">
              {t("The PDF could not be created in this browser.", "इस ब्राउज़र में PDF नहीं बन पाया।")}
            </p>
          ) : null}
        </form>
        <div className="result-col stack">
          <p className="sutra-hint">
            {model.months.length > 0
              ? t(
                  `${model.months.length} receipts, ${formatINR(model.annualRent)} of rent in this set.`,
                  `${model.months.length} रसीदें, इस सेट में किराया ${formatINR(model.annualRent)}।`,
                )
              : t(
                  "The preview appears once the names, address and rent are filled.",
                  "नाम, पता और किराया भरते ही झलक दिखेगी।",
                )}
          </p>
          {model.months.map((month) => (
            <article key={month.id} className="sutra-card receipt-sheet" aria-label={month.label}>
              <h3>Rent receipt</h3>
              <p className="receipt-row">
                <span className="sutra-num">{month.receiptNo}</span>
                <span>{month.dateLabel}</span>
              </p>
              <p>
                Received from <strong>{form.tenantName || "—"}</strong> the sum of{" "}
                <strong className="sutra-num">{formatINR(month.amount)}</strong> ({month.amountInWords}) towards rent of{" "}
                <strong>{form.propertyAddress || "—"}</strong> for {month.label}.
              </p>
              <p>Payment: {form.paymentMode === "bank" ? "bank transfer" : form.paymentMode}.</p>
              <p>
                Landlord: <strong>{form.landlordName || "—"}</strong>
                {form.landlordPan.trim() ? ` · PAN ${form.landlordPan.trim().toUpperCase()}` : ""}
              </p>
              <div className="receipt-row">
                <span>Signature of landlord</span>
                {model.needsStamp ? <span className="stamp">Revenue stamp</span> : <span />}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
