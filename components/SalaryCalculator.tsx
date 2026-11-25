"use client";

import { useMemo, useState } from "react";
import { Accordion, AccordionItem, Alert, Button, ComparisonTable, ResultPanel } from "@sutra-ui/react";
import { MoneyField, PercentSlider, SegmentField, SelectField, SwitchField } from "@/components/Fields";
import { useT } from "@/components/use-t";
import { formatINR, formatShare } from "@/lib/money";
import { PROFESSIONAL_TAX_STATES, type Gender } from "@/lib/professional-tax";
import { computeSalary, type SalaryInput } from "@/lib/salary";
import { YEAR_ORDER, YEARS, type TaxYearId } from "@/lib/tax-rules";

const INITIAL: SalaryInput = {
  year: "fy-2025-26",
  ctc: 1_800_000,
  basicRatio: 0.4,
  hraRatio: 0.4,
  pfOnFullBasic: true,
  includeGratuity: true,
  employerNps: 0,
  stateId: "karnataka",
  gender: "male",
  monthlyPtOverride: null,
  metro: false,
  monthlyRent: 0,
  rentMonths: 12,
  other80C: 0,
  section80CCD1B: 0,
  section80DSelf: 0,
  selfOrFamilySenior: false,
  section80DParents: 0,
  parentsSenior: false,
  homeLoanInterest: 0,
  age: "below60",
  resident: true,
  employment: "private",
};

const PART_COLOR: Record<string, string> = {
  inHand: "var(--sutra-color-bg-primary)",
  employeePf: "var(--sutra-color-fg-info)",
  professionalTax: "var(--sutra-color-fg-warning)",
  incomeTax: "var(--sutra-color-fg-danger)",
  employerPf: "var(--sutra-color-fg-accent)",
  gratuity: "var(--sutra-color-fg-success)",
};

export function SalaryCalculator() {
  const t = useT();
  const [form, setForm] = useState<SalaryInput>(INITIAL);
  const [overridePt, setOverridePt] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState(0);
  const result = useMemo(
    () => computeSalary({ ...form, monthlyPtOverride: overridePt ? overrideAmount : null }),
    [form, overridePt, overrideAmount],
  );

  function patch(partial: Partial<SalaryInput>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  const headline = result.ok ? result.inHand.new / 12 : 0;
  const oldMonthly = result.ok ? result.inHand.old / 12 : 0;

  return (
    <section className="calc-grid">
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          document.getElementById("salary-result")?.focus();
        }}
      >
        <SegmentField
          label={t("Tax year for the estimate", "अनुमान का कर वर्ष")}
          value={form.year}
          onChange={(year: TaxYearId) => patch({ year })}
          options={YEAR_ORDER.map((id) => ({ value: id, label: YEARS[id].shortLabel }))}
        />
        <MoneyField
          id="ctc"
          label={t("Annual CTC", "सालाना CTC")}
          value={form.ctc}
          onChange={(ctc) => patch({ ctc })}
          hint={t(
            "Cost to company, including employer PF and gratuity if you count them below.",
            "नियोक्ता की लागत, जिसमें नीचे गिने गए नियोक्ता पीएफ और ग्रेच्युटी शामिल हैं।",
          )}
        />
        <PercentSlider
          id="basic-pct"
          label={t("Basic as a share of CTC", "CTC में बेसिक का हिस्सा")}
          value={form.basicRatio}
          onChange={(basicRatio) => patch({ basicRatio })}
        />
        <SwitchField
          id="metro-salary"
          checked={form.metro}
          onChange={(metro) => patch({ metro, hraRatio: metro ? 0.5 : 0.4 })}
          label={t("Metro for HRA (Delhi, Mumbai, Kolkata, Chennai)", "HRA के लिए मेट्रो (दिल्ली, मुंबई, कोलकाता, चेन्नई)")}
          hint={t(
            "Changing this resets HRA to 50% or 40% of basic. Bengaluru is not a metro.",
            "बदलने पर HRA बेसिक का 50% या 40% हो जाता है। बेंगलुरु मेट्रो नहीं है।",
          )}
        />
        <PercentSlider
          id="hra-pct"
          label={t("HRA as a share of basic", "बेसिक में HRA का हिस्सा")}
          value={form.hraRatio}
          onChange={(hraRatio) => patch({ hraRatio })}
        />
        <SwitchField
          id="pf-full"
          checked={form.pfOnFullBasic}
          onChange={(pfOnFullBasic) => patch({ pfOnFullBasic })}
          label={t("PF is calculated on full basic", "पीएफ पूरे बेसिक पर कटता है")}
          hint={t(
            "Turn this off if PF is limited to the ₹15,000 wage ceiling, which is ₹1,800 a month.",
            "अगर पीएफ ₹15,000 की सीमा पर है, यानी ₹1,800 महीना, तो इसे बंद करें।",
          )}
        />
        <SwitchField
          id="gratuity"
          checked={form.includeGratuity}
          onChange={(includeGratuity) => patch({ includeGratuity })}
          label={t("Gratuity provision is included in CTC", "ग्रेच्युटी का प्रावधान CTC में है")}
          hint={t("15 days of basic for the year. It is not paid out monthly.", "साल में 15 दिन का बेसिक। यह हर महीने हाथ में नहीं आता।")}
        />
        <SelectField
          id="state"
          label={t("State, for professional tax", "प्रोफेशनल टैक्स के लिए राज्य")}
          value={form.stateId}
          onChange={(stateId) => patch({ stateId })}
          options={PROFESSIONAL_TAX_STATES.map((state) => ({ value: state.id, label: state.name }))}
        />
        {form.stateId === "maharashtra" ? (
          <SegmentField
            label={t("Maharashtra professional-tax category", "महाराष्ट्र प्रोफेशनल टैक्स श्रेणी")}
            value={form.gender}
            onChange={(gender: Gender) => patch({ gender })}
            options={[
              { value: "male", label: t("Men", "पुरुष") },
              { value: "female", label: t("Women", "महिला") },
            ]}
          />
        ) : null}
        <SwitchField
          id="pt-override"
          checked={overridePt}
          onChange={setOverridePt}
          label={t("Use the professional tax on my payslip", "पे-स्लिप वाला प्रोफेशनल टैक्स लगाएँ")}
        />
        {overridePt ? (
          <MoneyField
            id="pt-amount"
            label={t("Professional tax this month", "इस महीने का प्रोफेशनल टैक्स")}
            value={overrideAmount}
            onChange={setOverrideAmount}
          />
        ) : null}
        <Accordion>
          <AccordionItem value="deductions" title={t("Rent and old-regime deductions", "किराया और पुरानी रेजिम की कटौतियाँ")}>
            <div className="form-stack">
              <MoneyField
                id="salary-rent"
                label={t("Monthly rent, for old-regime HRA", "मासिक किराया, पुरानी रेजिम के HRA के लिए")}
                value={form.monthlyRent}
                onChange={(monthlyRent) => patch({ monthlyRent })}
              />
              <MoneyField
                id="other-80c"
                label={t("Other 80C, excluding employee PF", "अन्य 80C, कर्मचारी पीएफ के अलावा")}
                value={form.other80C}
                onChange={(other80C) => patch({ other80C })}
                hint={t(
                  "Employee PF is added automatically and the total is capped at ₹1,50,000.",
                  "कर्मचारी पीएफ अपने आप जुड़ता है और कुल सीमा ₹1,50,000 है।",
                )}
              />
              <MoneyField
                id="salary-80d"
                label={t("Section 80D", "धारा 80D")}
                value={form.section80DSelf}
                onChange={(section80DSelf) => patch({ section80DSelf })}
              />
              <MoneyField
                id="salary-nps"
                label={t("Employer NPS inside CTC", "CTC में नियोक्ता NPS")}
                value={form.employerNps}
                onChange={(employerNps) => patch({ employerNps })}
              />
            </div>
          </AccordionItem>
        </Accordion>
        <div className="actions">
          <Button type="submit">{t("Show take-home", "इन-हैंड देखें")}</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setForm(INITIAL);
              setOverridePt(false);
            }}
          >
            {t("Reset example", "उदाहरण वापस लाएँ")}
          </Button>
        </div>
      </form>
      <div id="salary-result" tabIndex={-1} className="result-col stack">
        {result.ok ? (
          <TakeHome result={result} monthly={headline} other={oldMonthly} />
        ) : (
          <Alert tone="danger" title={t("CTC does not cover the parts", "CTC भागों से कम है")}>
            {t(
              "Basic, HRA, employer PF, gratuity and employer NPS add up to more than the CTC. Lower the basic or HRA percentage.",
              "बेसिक, HRA, नियोक्ता पीएफ, ग्रेच्युटी और NPS मिलकर CTC से ज़्यादा हो गए। बेसिक या HRA प्रतिशत घटाएँ।",
            )}
          </Alert>
        )}
      </div>
    </section>
  );
}

function TakeHome({
  result,
  monthly,
  other,
}: {
  result: Extract<ReturnType<typeof computeSalary>, { ok: true }>;
  monthly: number;
  other: number;
}) {
  const t = useT();
  const winner = result.tax.winner;
  const savings = Math.abs(result.inHand.new - result.inHand.old);
  const annual = result.annual;
  const caption =
    winner === "tie"
      ? t(
          "Old and new regime take-home match on these figures.",
          "इन आंकड़ों पर दोनों रेजिम का इन-हैंड बराबर है।",
        )
      : winner === "new"
        ? t(
            `New regime. The old regime would leave ${formatINR(other)} a month, ${formatINR(savings)} a year less.`,
            `नई रेजिम। पुरानी रेजिम में महीने का ${formatINR(other)} बचता, साल में ${formatINR(savings)} कम।`,
          )
        : t(
            `The new-regime estimate is ${formatINR(monthly)} a month. The old regime is higher by ${formatINR(savings)} a year, at ${formatINR(other)} a month.`,
            `नई रेजिम का अनुमान ${formatINR(monthly)} महीना है। पुरानी रेजिम साल में ${formatINR(savings)} ज़्यादा देती है।`,
          );

  const parts = [
    { key: "inHand", label: t("In-hand", "इन-हैंड"), value: Math.max(0, result.inHand.new) },
    { key: "employeePf", label: t("Employee PF", "कर्मचारी पीएफ"), value: annual.employeePf },
    { key: "professionalTax", label: t("Professional tax", "प्रोफेशनल टैक्स"), value: result.professionalTax.annual },
    { key: "incomeTax", label: t("Income tax", "इनकम टैक्स"), value: result.tax.new.totalTax },
    { key: "employerPf", label: t("Employer PF", "नियोक्ता पीएफ"), value: annual.employerPf },
    { key: "gratuity", label: t("Gratuity", "ग्रेच्युटी"), value: annual.gratuity },
  ].filter((part) => part.value > 0);
  const takeHomeShare = annual.ctc > 0 ? result.inHand.new / annual.ctc : 0;

  const line = (label: string, amount: number) => ({
    label,
    values: { year: signed(amount), month: signed(amount / 12) },
  });

  return (
    <div className="stack">
      <ResultPanel
        label={t("In-hand, new regime", "इन-हैंड, नई रेजिम")}
        value={formatINR(monthly)}
        unit={t("a month", "महीना")}
        caption={caption}
        tone={winner === "old" ? "primary" : "success"}
      />
      <p className="sutra-hint">
        {t(
          `${formatINR(result.inHand.new)} a year in the new regime, ${formatShare(takeHomeShare, 1)} of CTC.`,
          `नई रेजिम में साल का ${formatINR(result.inHand.new)}, CTC का ${formatShare(takeHomeShare, 1)}।`,
        )}
      </p>
      <div className="bar" aria-hidden="true">
        {parts.map((part) => (
          <span key={part.key} style={{ width: `${(part.value / annual.ctc) * 100}%`, background: PART_COLOR[part.key] }} />
        ))}
      </div>
      <p className="legend">
        {parts.map((part) => (
          <span key={part.key}>
            <i className="swatch" style={{ background: PART_COLOR[part.key] }} />
            {part.label}
          </span>
        ))}
      </p>
      <ComparisonTable
        caption={t("Salary breakup", "वेतन का ब्यौरा")}
        rowHeader={t("Component", "घटक")}
        columns={[
          { key: "year", header: t("Year", "साल") },
          { key: "month", header: t("Month", "महीना") },
        ]}
        rows={[
          line(t("Basic", "बेसिक"), annual.basic),
          line(t("HRA", "HRA"), annual.hra),
          line(t("Special allowance", "स्पेशल अलाउंस"), annual.special),
          line(t("Cash gross", "कैश ग्रॉस"), annual.cashGross),
          line(t("Employee PF", "कर्मचारी पीएफ"), -annual.employeePf),
          line(t("Professional tax", "प्रोफेशनल टैक्स"), -result.professionalTax.annual),
          line(t("Income tax, new regime", "इनकम टैक्स, नई रेजिम"), -result.tax.new.totalTax),
          line(t("In-hand, new regime", "इन-हैंड, नई रेजिम"), result.inHand.new),
          line(t("In-hand, old regime", "इन-हैंड, पुरानी रेजिम"), result.inHand.old),
          line(t("Employer PF (in CTC, not in hand)", "नियोक्ता पीएफ (CTC में, हाथ में नहीं)"), annual.employerPf),
          line(t("Gratuity provision", "ग्रेच्युटी प्रावधान"), annual.gratuity),
        ]}
      />
      <p className="sutra-hint">{result.professionalTax.note.en}</p>
      <p className="sutra-hint" lang="hi">
        {result.professionalTax.note.hi}
      </p>
      {result.professionalTax.february !== result.professionalTax.monthly ? (
        <p className="sutra-hint">
          {t(
            `February professional tax is ${formatINR(result.professionalTax.february)} instead of ${formatINR(result.professionalTax.monthly)}. The monthly column is the annual amount divided by 12.`,
            `फरवरी का प्रोफेशनल टैक्स ${formatINR(result.professionalTax.february)} है, ${formatINR(result.professionalTax.monthly)} नहीं। मासिक कॉलम सालाना राशि को 12 से भाग देकर है।`,
          )}
        </p>
      ) : null}
      <p className="sutra-hint">
        {t(
          `Old-regime HRA exemption used: ${formatINR(result.hraExemption)}. Employee and employer PF are both 12% of the same wage.`,
          `पुरानी रेजिम में इस्तेमाल HRA छूट: ${formatINR(result.hraExemption)}। कर्मचारी और नियोक्ता पीएफ दोनों एक ही वेतन का 12% हैं।`,
        )}
      </p>
    </div>
  );
}

function signed(amount: number): string {
  if (amount < 0) return `-${formatINR(Math.abs(amount))}`;
  return formatINR(amount);
}
