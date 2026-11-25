"use client";

import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Bi } from "@/components/Bi";
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
  const [form, setForm] = useState<ReceiptInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const model = useMemo(() => buildReceiptModel(form), [form]);

  function patch(partial: Partial<ReceiptInput>) {
    setPdfError(false);
    setForm((current) => ({ ...current, ...partial }));
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
    <section className="calculator">
      <div className="callout privacy">
        <strong><Bi en="Nothing you type leaves this browser." hi="आप जो भरते हैं वह इस ब्राउज़र से बाहर नहीं जाता।" /></strong>
        <p>
          <Bi
            en="There is no account and no upload. The PDF is built on this device when you ask for it. Close the tab and the details are gone."
            hi="कोई खाता नहीं, कोई अपलोड नहीं। PDF इसी डिवाइस पर बनता है। टैब बंद करते ही विवरण मिट जाता है।"
          />
        </p>
      </div>
      <div className="split" style={{ marginTop: "1rem" }}>
        <form onSubmit={(event) => { event.preventDefault(); void download(); }} noValidate>
          <TextField id="tenant" label={<Bi en="Tenant name" hi="किरायेदार का नाम" />} value={form.tenantName} onChange={(tenantName) => patch({ tenantName })} error={errorText(model.errors.tenantName)} autoComplete="name" />
          <TextField id="tenant-address" label={<Bi en="Tenant address (optional)" hi="किरायेदार का पता (वैकल्पिक)" />} value={form.tenantAddress} onChange={(tenantAddress) => patch({ tenantAddress })} multiline />
          <TextField id="landlord" label={<Bi en="Landlord name" hi="मकान मालिक का नाम" />} value={form.landlordName} onChange={(landlordName) => patch({ landlordName })} error={errorText(model.errors.landlordName)} />
          <TextField id="pan" label={<Bi en="Landlord PAN (optional)" hi="मकान मालिक का PAN (वैकल्पिक)" />} value={form.landlordPan} onChange={(landlordPan) => patch({ landlordPan: landlordPan.toUpperCase() })} error={errorText(model.errors.pan)} hint={<Bi en="Employers usually ask for it when rent in the year is above ₹1,00,000." hi="साल का किराया ₹1,00,000 से ऊपर हो तो नियोक्ता आमतौर पर PAN माँगता है।" />} />
          <TextField id="landlord-address" label={<Bi en="Landlord address (optional)" hi="मकान मालिक का पता (वैकल्पिक)" />} value={form.landlordAddress} onChange={(landlordAddress) => patch({ landlordAddress })} multiline />
          <TextField id="property" label={<Bi en="Address of the rented home" hi="किराए के मकान का पता" />} value={form.propertyAddress} onChange={(propertyAddress) => patch({ propertyAddress })} error={errorText(model.errors.propertyAddress)} multiline />
          <div className="field">
            <div className="field-top">
              <label htmlFor="rent-amount"><Bi en="Monthly rent" hi="मासिक किराया" /></label>
              <span className="num field-readout">{formatINR(form.monthlyRent)}</span>
            </div>
            <input id="rent-amount" name="rent-amount" inputMode="numeric" value={form.monthlyRent === 0 ? "" : String(form.monthlyRent)} aria-invalid={model.errors.rent ? true : undefined} aria-describedby={model.errors.rent ? "rent-error" : undefined} onChange={(event) => patch({ monthlyRent: Number(event.target.value.replace(/\D/g, "").slice(0, 9) || 0) })} />
            {model.errors.rent ? <p id="rent-error" className="error" role="alert">{errorText(model.errors.rent)}</p> : null}
          </div>
          <div className="regime-grid">
            <MonthField id="from-month" label={<Bi en="From" hi="से" />} value={form.from} onChange={(from) => patch({ from })} />
            <MonthField id="to-month" label={<Bi en="To" hi="तक" />} value={form.to} onChange={(to) => patch({ to })} />
          </div>
          {model.errors.range ? <p className="error" role="alert">{errorText(model.errors.range)}</p> : null}
          <div className="field">
            <label htmlFor="day"><Bi en="Day printed on each receipt" hi="हर रसीद पर छपने वाली तारीख" /></label>
            <input id="day" name="day" inputMode="numeric" value={String(form.receivedDay)} aria-invalid={model.errors.day ? true : undefined} onChange={(event) => patch({ receivedDay: Number(event.target.value.replace(/\D/g, "").slice(0, 2) || 0) })} />
            <p className="hint"><Bi en="Use 1 to 28 so the date exists in every month." hi="1 से 28 रखें ताकि हर महीने में तारीख बने।" /></p>
            {model.errors.day ? <p className="error" role="alert">{errorText(model.errors.day)}</p> : null}
          </div>
          <fieldset>
            <legend><Bi en="How the rent was paid" hi="किराया कैसे दिया" /></legend>
            <div className="choices">
              {(["upi", "bank", "cheque", "cash"] as PaymentMode[]).map((mode) => (
                <label key={mode} className="choice">
                  <input type="radio" name="mode" value={mode} checked={form.paymentMode === mode} onChange={() => patch({ paymentMode: mode })} />
                  <span>{mode === "upi" ? "UPI" : mode === "bank" ? <Bi en="Bank transfer" hi="बैंक ट्रांसफर" /> : mode === "cheque" ? <Bi en="Cheque" hi="चेक" /> : <Bi en="Cash" hi="नकद" />}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div id="receipt-errors" tabIndex={-1}>
            {model.needsPanWarning ? (
              <p className="note" role="status">
                <Bi en="Annual rent is above ₹1,00,000 and PAN is blank. Your employer may ask for the landlord's PAN before allowing the HRA exemption." hi="साल का किराया ₹1,00,000 से ऊपर है और PAN खाली है। HRA छूट से पहले नियोक्ता PAN माँग सकता है।" />
              </p>
            ) : null}
            {model.needsStamp ? (
              <p className="note" role="status">
                <Bi en="Cash rent above ₹5,000 needs a revenue stamp on the signed receipt. A box is left for it." hi="₹5,000 से ऊपर नकद किराए पर हस्ताक्षरित रसीद पर रेवेन्यू स्टांप लगता है। उसके लिए जगह छोड़ी गई है।" />
              </p>
            ) : null}
          </div>
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? <Bi en="Preparing the PDF" hi="PDF बन रहा है" /> : <Bi en="Download PDF" hi="PDF डाउनलोड करें" />}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => window.print()}><Bi en="Print" hi="प्रिंट" /></button>
            <button className="btn btn-ghost" type="button" onClick={() => setForm(SAMPLE)}><Bi en="Fill a labelled sample" hi="नमूना भरें" /></button>
            <button className="btn btn-ghost" type="button" onClick={() => setForm(EMPTY)}><Bi en="Clear" hi="साफ़ करें" /></button>
          </div>
          {pdfError ? <p className="error" role="alert"><Bi en="The PDF could not be created in this browser." hi="इस ब्राउज़र में PDF नहीं बन पाया।" /></p> : null}
        </form>
        <div className="result-col">
          <p className="hint">
            {model.months.length > 0 ? (
              <Bi en={`${model.months.length} receipts, ${formatINR(model.annualRent)} of rent in this set.`} hi={`${model.months.length} रसीदें, इस सेट में किराया ${formatINR(model.annualRent)}।`} />
            ) : (
              <Bi en="The preview appears once the names, address and rent are filled." hi="नाम, पता और किराया भरते ही झलक दिखेगी।" />
            )}
          </p>
          {model.months.map((month) => (
            <article key={month.id} className="receipt-sheet" aria-label={month.label}>
              <h3>Rent receipt</h3>
              <p className="field-top"><span className="num">{month.receiptNo}</span><span>{month.dateLabel}</span></p>
              <p>
                Received from <strong>{form.tenantName || "—"}</strong> the sum of <strong className="num">{formatINR(month.amount)}</strong> ({month.amountInWords}) towards rent of <strong>{form.propertyAddress || "—"}</strong> for {month.label}.
              </p>
              <p>Payment: {form.paymentMode === "bank" ? "bank transfer" : form.paymentMode}.</p>
              <p>Landlord: <strong>{form.landlordName || "—"}</strong>{form.landlordPan.trim() ? ` · PAN ${form.landlordPan.trim().toUpperCase()}` : ""}</p>
              <div className="field-top" style={{ marginTop: "1.2rem" }}>
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

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  multiline,
  autoComplete,
}: {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: ReactNode;
  hint?: ReactNode;
  multiline?: boolean;
  autoComplete?: string;
}) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const shared = {
    id,
    name: id,
    value,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  };
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? <textarea {...shared} /> : <input {...shared} />}
      {hint ? <p id={hintId} className="hint">{hint}</p> : null}
      {error ? <p id={errorId} className="error" role="alert">{error}</p> : null}
    </div>
  );
}

function errorText(code?: string): ReactNode {
  if (code === "tenant") return <Bi en="Enter the tenant's name." hi="किरायेदार का नाम भरें।" />;
  if (code === "landlord") return <Bi en="Enter the landlord's name." hi="मकान मालिक का नाम भरें।" />;
  if (code === "property") return <Bi en="Enter the rented address." hi="किराए के मकान का पता भरें।" />;
  if (code === "rent") return <Bi en="Enter the monthly rent." hi="मासिक किराया भरें।" />;
  if (code === "day") return <Bi en="Use a day from 1 to 28 so every month is valid." hi="हर महीने के लिए 1 से 28 के बीच की तारीख रखें।" />;
  if (code === "pan") return <Bi en="PAN should look like ABCDE1234F, or leave it blank." hi="PAN ABCDE1234F जैसा होना चाहिए, वरना खाली छोड़ें।" />;
  if (code === "long") return <Bi en="Generate one year at a time (up to 12 receipts)." hi="एक बार में एक साल की रसीदें बनाएँ (अधिकतम 12)।" />;
  if (code === "range") return <Bi en="Choose a start month that is the same as, or before, the end month." hi="शुरुआती महीना अंत वाले महीने के बाद का न हो।" />;
  return null;
}

function MonthField({ id, label, value, onChange }: { id: string; label: ReactNode; value: string; onChange: (value: string) => void }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} type="month" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
