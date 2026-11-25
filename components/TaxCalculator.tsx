"use client";

import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionItem, Alert, Button, ComparisonTable, ResultPanel } from "@sutra-ui/react";
import { MoneyField, SegmentField, SwitchField } from "@/components/Fields";
import { useT } from "@/components/use-t";
import { hraForStay } from "@/lib/hra";
import { formatINR, formatPercent, formatShare } from "@/lib/money";
import { compareRegimes, type CalcNote, type Comparison, type RegimeResult } from "@/lib/tax";
import { YEAR_ORDER, YEARS, type AgeBand, type Employment, type TaxYearId } from "@/lib/tax-rules";

const EXAMPLE = {
  grossSalary: 1_200_000,
  otherIncome: 0,
  basicSalary: 480_000,
  annualHra: 192_000,
  monthlyRent: 15_000,
  months: 12,
  metro: false,
  section80C: 150_000,
  section80CCD1B: 0,
  section80DSelf: 15_000,
  section80DParents: 0,
  homeLoan: 0,
  professionalTax: 2_400,
  employerNps: 0,
};

type FormState = typeof EXAMPLE & {
  year: TaxYearId;
  age: AgeBand;
  resident: boolean;
  employment: Employment;
  selfOrFamilySenior: boolean;
  parentsSenior: boolean;
  manualHra: boolean;
  manualHraAmount: number;
  npsIncluded: boolean;
};

const INITIAL: FormState = {
  ...EXAMPLE,
  year: "fy-2025-26",
  age: "below60",
  resident: true,
  employment: "private",
  selfOrFamilySenior: false,
  parentsSenior: false,
  manualHra: false,
  manualHraAmount: 0,
  npsIncluded: true,
};

function readAmount(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export function TaxCalculator() {
  const t = useT();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [live, setLive] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length === 0) return;
    setForm((current) => {
      const next = { ...current };
      const salary = readAmount(params.get("salary"));
      const basic = readAmount(params.get("basic"));
      const hra = readAmount(params.get("hra"));
      const rent = readAmount(params.get("rent"));
      const months = readAmount(params.get("months"));
      const exempt = readAmount(params.get("exempt"));
      const c80 = readAmount(params.get("c80"));
      const d80 = readAmount(params.get("d80"));
      const pt = readAmount(params.get("pt"));
      if (salary != null) next.grossSalary = salary;
      if (basic != null) next.basicSalary = basic;
      if (hra != null) next.annualHra = hra;
      if (rent != null) next.monthlyRent = rent;
      if (months != null) next.months = Math.min(12, Math.max(1, months));
      if (params.get("metro") === "1") next.metro = true;
      if (params.get("metro") === "0") next.metro = false;
      if (exempt != null) {
        next.manualHra = true;
        next.manualHraAmount = exempt;
      }
      if (c80 != null) next.section80C = c80;
      if (d80 != null) next.section80DSelf = d80;
      if (pt != null) next.professionalTax = pt;
      const year = params.get("year");
      if (year === "fy-2024-25" || year === "fy-2025-26") next.year = year;
      return next;
    });
  }, []);

  const hra = hraForStay({
    annualBasic: form.basicSalary,
    annualDa: 0,
    daCountsForRetirement: false,
    annualHra: form.annualHra,
    monthlyRent: form.monthlyRent,
    months: form.months,
    metro: form.metro,
  });
  const hraExemption = form.manualHra ? form.manualHraAmount : Math.round(hra.exemption);

  const result = compareRegimes({
    year: form.year,
    age: form.age,
    resident: form.resident,
    employment: form.employment,
    grossSalary: form.grossSalary,
    otherIncome: form.otherIncome,
    basicSalary: form.basicSalary,
    hraExemption,
    professionalTax: form.professionalTax,
    section80C: form.section80C,
    section80CCD1B: form.section80CCD1B,
    section80DSelf: form.section80DSelf,
    selfOrFamilySenior: form.selfOrFamilySenior,
    section80DParents: form.section80DParents,
    parentsSenior: form.parentsSenior,
    homeLoanInterestSelfOccupied: form.homeLoan,
    employerNps: form.employerNps,
    employerNpsIncludedInGross: form.npsIncluded,
  });
  const summary = useMemo(() => verdictCopy(result.winner, result.savings, t), [result.winner, result.savings, t]);

  useEffect(() => {
    const timer = setTimeout(() => setLive(summary.sentence), 350);
    return () => clearTimeout(timer);
  }, [summary]);

  function patch(partial: Partial<FormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function copyLink() {
    const params = new URLSearchParams({
      year: form.year,
      salary: String(form.grossSalary),
      basic: String(form.basicSalary),
      hra: String(form.annualHra),
      rent: String(form.monthlyRent),
      months: String(form.months),
      metro: form.metro ? "1" : "0",
      c80: String(form.section80C),
      d80: String(form.section80DSelf),
      pt: String(form.professionalTax),
    });
    if (form.manualHra) params.set("exempt", String(form.manualHraAmount));
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    void navigator.clipboard?.writeText(url);
    window.history.replaceState(null, "", `?${params.toString()}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="stack" aria-labelledby="calculator-heading">
      <h2 id="calculator-heading" className="sutra-sr">
        {t("Calculator", "कैलकुलेटर")}
      </h2>
      <p className="sutra-sr" aria-live="polite">
        {live}
      </p>
      <div className="calc-grid">
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            document.getElementById("full-result")?.focus();
          }}
        >
          <SegmentField
            label={t("Financial year", "वित्त वर्ष")}
            value={form.year}
            onChange={(year) => patch({ year })}
            options={YEAR_ORDER.map((id) => ({
              value: id,
              label: t(YEARS[id].shortLabel, id === "fy-2025-26" ? "वित्त वर्ष 2025-26" : "वित्त वर्ष 2024-25"),
            }))}
          />
          <SegmentField
            label={t("Age on 31 March", "31 मार्च को उम्र")}
            value={form.age}
            onChange={(age) => patch({ age })}
            options={[
              { value: "below60", label: t("Under 60", "60 से कम") },
              { value: "senior", label: t("60 to 79", "60 से 79") },
              { value: "superSenior", label: t("80 or above", "80 या अधिक") },
            ]}
          />
          <SwitchField
            id="resident"
            checked={form.resident}
            onChange={(resident) => patch({ resident })}
            label={t("Resident individual", "निवासी व्यक्ति")}
            hint={t("Section 87A rebate applies only to residents.", "धारा 87A की छूट सिर्फ निवासी को मिलती है।")}
          />
          <MoneyField
            id="gross"
            label={t("Annual gross salary", "सालाना ग्रॉस वेतन")}
            value={form.grossSalary}
            onChange={(grossSalary) => patch({ grossSalary })}
            hint={t(
              "Salary before standard deduction. Leave out exempt employer PF.",
              "स्टैंडर्ड डिडक्शन से पहले का वेतन। छूट वाला नियोक्ता पीएफ न जोड़ें।",
            )}
          />
          <MoneyField
            id="other"
            label={t("Other income", "अन्य आय")}
            value={form.otherIncome}
            onChange={(otherIncome) => patch({ otherIncome })}
            hint={t("Interest and similar income. Do not put capital gains here.", "ब्याज जैसी आय। कैपिटल गेन यहाँ न डालें।")}
          />
          <fieldset className="form-section">
            <legend>{t("HRA, for the old regime", "HRA, सिर्फ पुरानी रेजिम")}</legend>
            <MoneyField
              id="basic"
              label={t("Basic pay for the year", "साल का बेसिक वेतन")}
              value={form.basicSalary}
              onChange={(basicSalary) => patch({ basicSalary })}
              hint={t(
                "Add DA to basic if it counts for HRA and for the NPS cap.",
                "अगर DA, HRA और NPS सीमा में गिनता है तो उसे बेसिक में जोड़ें।",
              )}
            />
            <MoneyField
              id="hra-received"
              label={t("HRA received in the year", "साल में मिला HRA")}
              value={form.annualHra}
              onChange={(annualHra) => patch({ annualHra })}
            />
            <MoneyField
              id="rent"
              label={t("Monthly rent", "मासिक किराया")}
              value={form.monthlyRent}
              onChange={(monthlyRent) => patch({ monthlyRent })}
            />
            <MoneyField
              id="months"
              label={t("Months you rented", "कितने महीने किराए पर रहे")}
              value={form.months}
              onChange={(months) => patch({ months: Math.min(12, months) })}
              hint={t(
                "Basic and HRA above are full-year figures and are scaled to these months.",
                "ऊपर का बेसिक और HRA पूरे साल का माना जाता है और इन महीनों के अनुपात में लिया जाता है।",
              )}
            />
            <SwitchField
              id="metro"
              checked={form.metro}
              onChange={(metro) => patch({ metro })}
              label={t("Metro city (Delhi, Mumbai, Kolkata, Chennai)", "मेट्रो शहर (दिल्ली, मुंबई, कोलकाता, चेन्नई)")}
              hint={t("Bengaluru, Hyderabad and Pune are not metros for HRA.", "HRA के लिए बेंगलुरु, हैदराबाद और पुणे मेट्रो नहीं हैं।")}
            />
            <p className="sutra-hint">
              {t(
                `Old-regime exemption from these figures: ${formatINR(Math.round(hra.exemption))}. Least of actual HRA ${formatINR(Math.round(hra.actualHra))}, rent minus 10% ${formatINR(Math.round(hra.rentMinusTenPercent))}, and ${formatPercent(hra.percent)} of salary ${formatINR(Math.round(hra.percentOfSalary))}.`,
                `इन आंकड़ों से पुरानी रेजिम की छूट: ${formatINR(Math.round(hra.exemption))}।`,
              )}
            </p>
            <SwitchField
              id="manual-hra"
              checked={form.manualHra}
              onChange={(manualHra) => patch({ manualHra })}
              label={t("I will type the HRA exemption myself", "मैं HRA छूट खुद भरूँगा")}
            />
            {form.manualHra ? (
              <MoneyField
                id="manual-hra-amount"
                label={t("HRA exemption to claim", "दावा की जाने वाली HRA छूट")}
                value={form.manualHraAmount}
                onChange={(manualHraAmount) => patch({ manualHraAmount })}
              />
            ) : null}
          </fieldset>
          <fieldset className="form-section">
            <legend>{t("Deductions the old regime can use", "पुरानी रेजिम की कटौतियाँ")}</legend>
            <MoneyField
              id="80c"
              label={t("Section 80C", "धारा 80C")}
              value={form.section80C}
              onChange={(section80C) => patch({ section80C })}
              hint={t(
                "PF, PPF, ELSS, LIC, tuition, home-loan principal. Capped at ₹1,50,000.",
                "पीएफ, पीपीएफ, ELSS, एलआईसी, ट्यूशन, होम लोन का मूलधन। सीमा ₹1,50,000।",
              )}
            />
            <MoneyField
              id="80ccd"
              label={t("Additional NPS, 80CCD(1B)", "अतिरिक्त NPS, 80CCD(1B)")}
              value={form.section80CCD1B}
              onChange={(section80CCD1B) => patch({ section80CCD1B })}
              hint={t("Your own NPS, up to ₹50,000, over and above 80C.", "आपका अपना NPS, 80C के ऊपर ₹50,000 तक।")}
            />
            <MoneyField
              id="80d-self"
              label={t("Health insurance, self and family", "स्वास्थ्य बीमा, खुद और परिवार")}
              value={form.section80DSelf}
              onChange={(section80DSelf) => patch({ section80DSelf })}
            />
            <SwitchField
              id="self-senior"
              checked={form.selfOrFamilySenior}
              onChange={(selfOrFamilySenior) => patch({ selfOrFamilySenior })}
              label={t("I or my spouse is 60 or older (80D limit ₹50,000)", "मैं या जीवनसाथी 60+ है (80D सीमा ₹50,000)")}
            />
            <MoneyField
              id="80d-parents"
              label={t("Health insurance, parents", "माता-पिता का स्वास्थ्य बीमा")}
              value={form.section80DParents}
              onChange={(section80DParents) => patch({ section80DParents })}
            />
            <SwitchField
              id="parents-senior"
              checked={form.parentsSenior}
              onChange={(parentsSenior) => patch({ parentsSenior })}
              label={t("A parent is 60 or older (80D limit ₹50,000)", "माता या पिता 60+ हैं (80D सीमा ₹50,000)")}
            />
            <MoneyField
              id="loan"
              label={t("Home-loan interest, self-occupied", "होम लोन का ब्याज, खुद के रहने वाला घर")}
              value={form.homeLoan}
              onChange={(homeLoan) => patch({ homeLoan })}
              hint={t(
                "Old regime, section 24(b), capped at ₹2,00,000. Principal goes in 80C.",
                "पुरानी रेजिम, धारा 24(b), सीमा ₹2,00,000। मूलधन 80C में डालें।",
              )}
            />
            <MoneyField
              id="pt"
              label={t("Professional tax paid", "भरा हुआ प्रोफेशनल टैक्स")}
              value={form.professionalTax}
              onChange={(professionalTax) => patch({ professionalTax })}
              hint={t("Deducted in the old regime, capped at ₹2,500.", "पुरानी रेजिम में कटता है, सीमा ₹2,500।")}
            />
            <MoneyField
              id="nps-employer"
              label={t("Employer NPS contribution", "नियोक्ता का NPS योगदान")}
              value={form.employerNps}
              onChange={(employerNps) => patch({ employerNps })}
              hint={t(
                "Allowed in both regimes, capped at a percentage of basic plus DA.",
                "दोनों रेजिम में मिलता है, बेसिक प्लस DA के प्रतिशत तक।",
              )}
            />
            <SegmentField
              label={t("Employer, for the NPS cap", "NPS सीमा के लिए नियोक्ता")}
              value={form.employment}
              onChange={(employment) => patch({ employment })}
              options={[
                { value: "private", label: t("Private or PSU", "प्राइवेट या पीएसयू") },
                { value: "government", label: t("Government", "सरकार") },
              ]}
            />
            <SwitchField
              id="nps-included"
              checked={form.npsIncluded}
              onChange={(npsIncluded) => patch({ npsIncluded })}
              label={t("Employer NPS is already inside the gross salary above", "नियोक्ता NPS ऊपर के ग्रॉस वेतन में शामिल है")}
            />
          </fieldset>
          <div className="actions">
            <Button type="submit">{t("Show the result", "नतीजा देखें")}</Button>
            <Button type="button" variant="secondary" onClick={() => setForm(INITIAL)}>
              {t("Reset example", "उदाहरण वापस लाएँ")}
            </Button>
            <Button type="button" variant="ghost" onClick={copyLink}>
              {copied ? t("Copied", "कॉपी हो गया") : t("Copy a link to these figures", "इन आंकड़ों की लिंक कॉपी करें")}
            </Button>
          </div>
        </form>
        <div id="full-result" tabIndex={-1} className="result-col stack">
          <ResultPanel
            label={summary.label}
            value={summary.value}
            unit={summary.unit}
            caption={summary.caption}
            tone={summary.tone}
          />
          <RegimeComparison result={result} gross={form.grossSalary} />
        </div>
      </div>
    </section>
  );
}

function verdictCopy(winner: "old" | "new" | "tie", savings: number, t: (en: string, hi: string) => string) {
  const amount = formatINR(savings);
  const monthly = formatINR(savings / 12);
  if (winner === "tie") {
    return {
      sentence: t("Both regimes come to the same tax.", "दोनों रेजिम में टैक्स बराबर है।"),
      label: t("Both regimes", "दोनों रेजिम"),
      value: amount,
      unit: undefined as string | undefined,
      caption: t("Neither regime is cheaper on these figures.", "इन आंकड़ों पर कोई रेजिम सस्ती नहीं है।"),
      tone: "default" as const,
    };
  }
  if (winner === "new") {
    return {
      sentence: t(`You save ${amount} with the new regime.`, `नई रेजिम में ${amount} की बचत है।`),
      label: t("You save with the new regime", "नई रेजिम में बचत"),
      value: amount,
      unit: t("a year", "साल में"),
      caption: t(
        `That is about ${monthly} a month. The new regime is the default. Choose the old regime only when it wins after your deductions.`,
        `यह लगभग ${monthly} हर महीने है। नई रेजिम डिफ़ॉल्ट है। पुरानी रेजिम तभी चुनें जब कटौतियों के बाद वही सस्ती पड़े।`,
      ),
      tone: "success" as const,
    };
  }
  return {
    sentence: t(`You save ${amount} with the old regime.`, `पुरानी रेजिम में ${amount} की बचत है।`),
    label: t("You save with the old regime", "पुरानी रेजिम में बचत"),
    value: amount,
    unit: t("a year", "साल में"),
    caption: t(
      `That is about ${monthly} a month. The new regime is the default. Choose the old regime only when it wins after your deductions.`,
      `यह लगभग ${monthly} हर महीने है। नई रेजिम डिफ़ॉल्ट है। पुरानी रेजिम तभी चुनें जब कटौतियों के बाद वही सस्ती पड़े।`,
    ),
    tone: "primary" as const,
  };
}

function RegimeComparison({ result, gross }: { result: Comparison; gross: number }) {
  const t = useT();
  const rows = comparisonRows(result, gross, t);
  const notes = uniqueNotes([...result.new.notes, ...result.old.notes]);
  return (
    <div className="stack">
      <ComparisonTable
        caption={t("Old and new regime", "पुरानी और नई रेजिम")}
        highlight={result.winner === "tie" ? undefined : result.winner}
        rowHeader={t("Item", "मद")}
        columns={[
          { key: "new", header: t("New regime", "नई रेजिम") },
          { key: "old", header: t("Old regime", "पुरानी रेजिम") },
        ]}
        rows={rows}
      />
      <Accordion type="multiple">
        <AccordionItem value="new-slabs" title={t("New regime slabs", "नई रेजिम के स्लैब")}>
          <SlabTable result={result.new} />
        </AccordionItem>
        <AccordionItem value="old-slabs" title={t("Old regime slabs", "पुरानी रेजिम के स्लैब")}>
          <SlabTable result={result.old} />
        </AccordionItem>
      </Accordion>
      {notes.length > 0 ? (
        <Alert tone="info" title={t("Notes on this result", "इस नतीजे पर नोट")}>
          <ul>
            {notes.map((note, index) => (
              <li key={`${note.code}-${index}`}>{noteText(note, t)}</li>
            ))}
          </ul>
        </Alert>
      ) : null}
    </div>
  );
}

function comparisonRows(result: Comparison, gross: number, t: (en: string, hi: string) => string) {
  const old = result.old;
  const next = result.new;
  const rows: { label: string; values: Record<string, string> }[] = [];
  const add = (label: string, oldAmount: number, newAmount: number, negate = false, always = false) => {
    if (!always && oldAmount === 0 && newAmount === 0) return;
    const show = (amount: number) => formatINR(negate ? -amount : amount);
    rows.push({ label, values: { old: show(oldAmount), new: show(newAmount) } });
  };
  add(t("Standard deduction", "स्टैंडर्ड डिडक्शन"), old.standardDeduction, next.standardDeduction, true, true);
  add(t("HRA exemption", "HRA छूट"), old.hraExemption, next.hraExemption, true);
  add(t("Professional tax", "प्रोफेशनल टैक्स"), old.professionalTax, next.professionalTax, true);
  add(t("Home-loan interest", "होम लोन का ब्याज"), old.housePropertyLoss, next.housePropertyLoss, true);
  add("80C", old.section80C, next.section80C, true);
  add("80CCD(1B)", old.section80CCD1B, next.section80CCD1B, true);
  add("80D", old.section80D, next.section80D, true);
  add(t("Employer NPS", "नियोक्ता NPS"), old.employerNps, next.employerNps, true);
  add(t("Total income", "कुल आय"), old.totalIncome, next.totalIncome, false, true);
  add(t("Tax before rebate", "छूट से पहले टैक्स"), Math.round(old.slabTax), Math.round(next.slabTax), false, true);
  add(t("Rebate u/s 87A", "धारा 87A की छूट"), Math.round(old.rebate), Math.round(next.rebate), true, true);
  add(t("Surcharge", "सरचार्ज"), old.surcharge, next.surcharge);
  add(t("Cess, 4%", "उपकर, 4%"), old.cess, next.cess, false, true);
  add(t("Total tax", "कुल टैक्स"), old.totalTax, next.totalTax, false, true);
  rows.push({
    label: t("Share of gross salary", "ग्रॉस वेतन का हिस्सा"),
    values: {
      old: formatShare(old.totalTax, gross),
      new: formatShare(next.totalTax, gross),
    },
  });
  return rows;
}

function SlabTable({ result }: { result: RegimeResult }) {
  const t = useT();
  return (
    <ComparisonTable
      caption={t("Tax by slab", "स्लैब के अनुसार टैक्स")}
      rowHeader={t("Income in the band", "बैंड में आय")}
      columns={[
        { key: "rate", header: t("Rate", "दर") },
        { key: "tax", header: t("Tax", "टैक्स") },
      ]}
      rows={result.slabs.map((slab) => ({
        label: slab.to == null ? `${formatINR(slab.from)} and above` : `${formatINR(slab.from)} to ${formatINR(slab.to)}`,
        values: { rate: formatPercent(slab.rate), tax: formatINR(slab.tax) },
      }))}
    />
  );
}

function uniqueNotes(notes: CalcNote[]): CalcNote[] {
  return notes.filter((note, index) => notes.findIndex((item) => JSON.stringify(item) === JSON.stringify(note)) === index);
}

function noteText(note: CalcNote, t: (en: string, hi: string) => string): string {
  switch (note.code) {
    case "marginal-rebate":
      return t(
        "Marginal relief under section 87A has reduced the tax to the income above the rebate limit.",
        "धारा 87A की मामूली राहत ने टैक्स को छूट-सीमा से ऊपर की आय तक घटा दिया है।",
      );
    case "surcharge-relief":
      return t(
        "Marginal relief has capped the surcharge so the extra tax does not exceed the extra income.",
        "सरचार्ज पर मामूली राहत लगी है, ताकि अतिरिक्त टैक्स अतिरिक्त आय से ज़्यादा न हो।",
      );
    case "old-rebate-cliff":
      return t(
        "The old-regime rebate stops abruptly above ₹5,00,000. There is no marginal relief on it.",
        "पुरानी रेजिम की छूट ₹5,00,000 के ऊपर अचानक खत्म हो जाती है। उस पर मामूली राहत नहीं है।",
      );
    case "nonresident-no-87a":
      return t(
        "Section 87A is not available because the taxpayer is not a resident.",
        "धारा 87A नहीं मिली क्योंकि करदाता निवासी नहीं है।",
      );
    case "nps-cap-not-checked":
      return t(
        "Basic pay is blank, so the employer NPS percentage cap was not applied.",
        "बेसिक खाली है, इसलिए नियोक्ता NPS की प्रतिशत सीमा नहीं लगाई गई।",
      );
    case "nps-added-to-gross":
      return t(
        "Employer NPS was added to salary and then the allowable part was deducted.",
        "नियोक्ता NPS को वेतन में जोड़ा गया और फिर मान्य हिस्सा काटा गया।",
      );
    case "deductions-limited":
      return t(
        "Deductions were limited because they cannot exceed total income.",
        "कटौतियाँ कुल आय से ज़्यादा नहीं हो सकतीं, इसलिए उन्हें घटाया गया।",
      );
    case "income-rounded":
      return t(
        `Total income was rounded from ${formatINR(note.from)} to ${formatINR(note.to)} under section 288B.`,
        `धारा 288B के तहत कुल आय ${formatINR(note.from)} से ${formatINR(note.to)} की गई।`,
      );
    case "capped":
      return t(
        `${note.item} claimed ${formatINR(note.claimed)}, allowed ${formatINR(note.allowed)}.`,
        `${note.item}: दावा ${formatINR(note.claimed)}, मान्य ${formatINR(note.allowed)}।`,
      );
    default:
      return "";
  }
}
