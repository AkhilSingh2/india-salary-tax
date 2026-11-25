"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Bi } from "@/components/Bi";
import { Check, ChoiceGroup, MoneyField } from "@/components/Fields";
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

export function SalaryCalculator() {
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
    <section className="calculator">
      <div className="split">
        <form onSubmit={(event) => { event.preventDefault(); document.getElementById("salary-result")?.focus(); }}>
          <ChoiceGroup
            name="salary-year"
            label={<Bi en="Tax year for the estimate" hi="अनुमान का कर वर्ष" />}
            value={form.year}
            onChange={(year: TaxYearId) => patch({ year })}
            options={YEAR_ORDER.map((id) => ({ value: id, label: YEARS[id].shortLabel }))}
          />
          <MoneyField
            id="ctc"
            label={<Bi en="Annual CTC" hi="सालाना CTC" />}
            value={form.ctc}
            onChange={(ctc) => patch({ ctc })}
            hint={<Bi en="Cost to company, including employer PF and gratuity if you count them below." hi="नियोक्ता की लागत, जिसमें नीचे गिने गए नियोक्ता पीएफ और ग्रेच्युटी शामिल हैं।" />}
          />
          <PercentField id="basic-pct" label={<Bi en="Basic as a share of CTC" hi="CTC में बेसिक का हिस्सा" />} value={form.basicRatio} onChange={(basicRatio) => patch({ basicRatio })} />
          <Check
            id="metro-salary"
            checked={form.metro}
            onChange={(metro) => patch({ metro, hraRatio: metro ? 0.5 : 0.4 })}
            label={<Bi en="Metro for HRA (Delhi, Mumbai, Kolkata, Chennai)" hi="HRA के लिए मेट्रो (दिल्ली, मुंबई, कोलकाता, चेन्नई)" />}
            hint={<Bi en="Changing this resets HRA to 50% or 40% of basic. Bengaluru is not a metro." hi="बदलने पर HRA बेसिक का 50% या 40% हो जाता है। बेंगलुरु मेट्रो नहीं है।" />}
          />
          <PercentField id="hra-pct" label={<Bi en="HRA as a share of basic" hi="बेसिक में HRA का हिस्सा" />} value={form.hraRatio} onChange={(hraRatio) => patch({ hraRatio })} />
          <Check id="pf-full" checked={form.pfOnFullBasic} onChange={(pfOnFullBasic) => patch({ pfOnFullBasic })} label={<Bi en="PF is calculated on full basic" hi="पीएफ पूरे बेसिक पर कटता है" />} hint={<Bi en="Turn this off if PF is limited to the ₹15,000 wage ceiling, which is ₹1,800 a month." hi="अगर पीएफ ₹15,000 की सीमा पर है, यानी ₹1,800 महीना, तो इसे बंद करें।" />} />
          <Check id="gratuity" checked={form.includeGratuity} onChange={(includeGratuity) => patch({ includeGratuity })} label={<Bi en="Gratuity provision is included in CTC" hi="ग्रेच्युटी का प्रावधान CTC में है" />} hint={<Bi en="15 days of basic for the year. It is not paid out monthly." hi="साल में 15 दिन का बेसिक। यह हर महीने हाथ में नहीं आता।" />} />
          <div className="field">
            <label htmlFor="state"><Bi en="State, for professional tax" hi="प्रोफेशनल टैक्स के लिए राज्य" /></label>
            <select id="state" name="state" value={form.stateId} onChange={(event) => patch({ stateId: event.target.value })}>
              {PROFESSIONAL_TAX_STATES.map((state) => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>
          </div>
          {form.stateId === "maharashtra" ? (
            <ChoiceGroup
              name="gender"
              label={<Bi en="Maharashtra professional-tax category" hi="महाराष्ट्र प्रोफेशनल टैक्स श्रेणी" />}
              value={form.gender}
              onChange={(gender: Gender) => patch({ gender })}
              options={[
                { value: "male", label: <Bi en="Men" hi="पुरुष" /> },
                { value: "female", label: <Bi en="Women" hi="महिला" /> },
              ]}
            />
          ) : null}
          <Check id="pt-override" checked={overridePt} onChange={setOverridePt} label={<Bi en="Use the professional tax on my payslip" hi="पे-स्लिप वाला प्रोफेशनल टैक्स लगाएँ" />} />
          {overridePt ? <MoneyField id="pt-amount" label={<Bi en="Professional tax this month" hi="इस महीने का प्रोफेशनल टैक्स" />} value={overrideAmount} onChange={setOverrideAmount} /> : null}
          <details>
            <summary><Bi en="Rent and old-regime deductions" hi="किराया और पुरानी रेजिम की कटौतियाँ" /></summary>
            <MoneyField id="salary-rent" label={<Bi en="Monthly rent, for old-regime HRA" hi="मासिक किराया, पुरानी रेजिम के HRA के लिए" />} value={form.monthlyRent} onChange={(monthlyRent) => patch({ monthlyRent })} />
            <MoneyField id="other-80c" label={<Bi en="Other 80C, excluding employee PF" hi="अन्य 80C, कर्मचारी पीएफ के अलावा" />} value={form.other80C} onChange={(other80C) => patch({ other80C })} hint={<Bi en="Employee PF is added automatically and the total is capped at ₹1,50,000." hi="कर्मचारी पीएफ अपने आप जुड़ता है और कुल सीमा ₹1,50,000 है।" />} />
            <MoneyField id="salary-80d" label={<Bi en="Section 80D" hi="धारा 80D" />} value={form.section80DSelf} onChange={(section80DSelf) => patch({ section80DSelf })} />
            <MoneyField id="salary-nps" label={<Bi en="Employer NPS inside CTC" hi="CTC में नियोक्ता NPS" />} value={form.employerNps} onChange={(employerNps) => patch({ employerNps })} />
          </details>
          <div className="actions">
            <button className="btn btn-primary" type="submit"><Bi en="Show take-home" hi="इन-हैंड देखें" /></button>
            <button className="btn btn-ghost" type="button" onClick={() => { setForm(INITIAL); setOverridePt(false); }}><Bi en="Reset example" hi="उदाहरण वापस लाएँ" /></button>
          </div>
        </form>
        <div id="salary-result" tabIndex={-1} className="result-col result-first">
          {result.ok ? <TakeHomeBanner monthly={headline} other={oldMonthly} winner={result.tax.winner} savings={Math.abs(result.inHand.new - result.inHand.old)} /> : null}
          {result.ok ? <SalaryResultView input={form} result={result} /> : <StructureError />}
        </div>
      </div>
    </section>
  );
}

function PercentField({ id, label, value, onChange }: { id: string; label: ReactNode; value: number; onChange: (value: number) => void }) {
  const shown = Math.round(value * 1000) / 10;
  return (
    <div className="field">
      <div className="field-top">
        <label htmlFor={id}>{label}</label>
        <span className="num field-readout">{shown}%</span>
      </div>
      <input
        id={id}
        name={id}
        inputMode="decimal"
        value={Number.isInteger(shown) ? String(shown) : String(shown)}
        onChange={(event) => {
          const parsed = Number(event.target.value.replace(/[^\d.]/g, ""));
          if (!Number.isFinite(parsed)) return;
          onChange(Math.min(100, Math.max(0, parsed)) / 100);
        }}
      />
    </div>
  );
}

function TakeHomeBanner({ monthly, other, winner, savings }: { monthly: number; other: number; winner: "old" | "new" | "tie"; savings: number }) {
  return (
    <div className={`verdict ${winner === "old" ? "old" : "new"}`}>
      <strong className="num">{formatINR(monthly)} <Bi en="/ month" hi="/ महीना" /></strong>
      <p>
        {winner === "tie" ? (
          <Bi en="Old and new regime take-home match on these figures." hi="इन आंकड़ों पर दोनों रेजिम का इन-हैंड बराबर है।" />
        ) : winner === "new" ? (
          <Bi en={`New regime. The old regime would leave ${formatINR(other)} a month, ${formatINR(savings)} a year less.`} hi={`नई रेजिम। पुरानी रेजिम में महीने का ${formatINR(other)} बचता, साल में ${formatINR(savings)} कम।`} />
        ) : (
          <Bi en={`The new-regime estimate is ${formatINR(monthly)} a month. The old regime is higher by ${formatINR(savings)} a year, at ${formatINR(other)} a month.`} hi={`नई रेजिम का अनुमान ${formatINR(monthly)} महीना है। पुरानी रेजिम साल में ${formatINR(savings)} ज़्यादा देती है।`} />
        )}
      </p>
    </div>
  );
}

function StructureError() {
  return (
    <p className="error" role="alert">
      <Bi en="Basic, HRA, employer PF, gratuity and employer NPS add up to more than the CTC. Lower the basic or HRA percentage." hi="बेसिक, HRA, नियोक्ता पीएफ, ग्रेच्युटी और NPS मिलकर CTC से ज़्यादा हो गए। बेसिक या HRA प्रतिशत घटाएँ।" />
    </p>
  );
}

function SalaryResultView({ result }: { input: SalaryInput; result: Extract<ReturnType<typeof computeSalary>, { ok: true }> }) {
  const annual = result.annual;
  const rows = [
    ["Basic", annual.basic],
    ["HRA", annual.hra],
    ["Special allowance", annual.special],
    ["Cash gross", annual.cashGross],
    ["Employee PF", -annual.employeePf],
    ["Professional tax", -result.professionalTax.annual],
    ["Income tax, new regime", -result.tax.new.totalTax],
  ] as const;
  const takeHomeShare = annual.ctc > 0 ? result.inHand.new / annual.ctc : 0;
  const parts = [
    { label: "In-hand", value: Math.max(0, result.inHand.new), color: "var(--accent)" },
    { label: "Employee PF", value: annual.employeePf, color: "var(--old)" },
    { label: "Professional tax", value: result.professionalTax.annual, color: "var(--clay)" },
    { label: "Income tax", value: result.tax.new.totalTax, color: "#8d2f39" },
    { label: "Employer PF", value: annual.employerPf, color: "#6d6246" },
    { label: "Gratuity", value: annual.gratuity, color: "#9a7b4f" },
  ].filter((part) => part.value > 0);

  return (
    <div className="card" style={{ padding: "1rem 1.1rem", marginTop: "0.8rem" }}>
      <p className="hint"><Bi en={`${formatINR(result.inHand.new)} a year in the new regime, ${formatShare(takeHomeShare, 1)} of CTC.`} hi={`नई रेजिम में साल का ${formatINR(result.inHand.new)}, CTC का ${formatShare(takeHomeShare, 1)}।`} /></p>
      <div className="bar" aria-hidden="true">
        {parts.map((part) => (
          <span key={part.label} style={{ width: `${(part.value / annual.ctc) * 100}%`, background: part.color }} />
        ))}
      </div>
      <p className="legend">
        {parts.map((part) => (
          <span key={part.label}><i className="swatch" style={{ background: part.color }} />{part.label}</span>
        ))}
      </p>
      <table>
        <caption className="sr-only"><Bi en="Salary breakup" hi="वेतन का ब्यौरा" /></caption>
        <thead>
          <tr>
            <th scope="col"><Bi en="Component" hi="घटक" /></th>
            <th scope="col" className="num-col"><Bi en="Year" hi="साल" /></th>
            <th scope="col" className="num-col"><Bi en="Month" hi="महीना" /></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, amount]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td className="num num-col">{signed(amount)}</td>
              <td className="num num-col">{signed(amount / 12)}</td>
            </tr>
          ))}
          <tr>
            <th scope="row"><Bi en="In-hand, new regime" hi="इन-हैंड, नई रेजिम" /></th>
            <td className="num num-col">{formatINR(result.inHand.new)}</td>
            <td className="num num-col">{formatINR(result.inHand.new / 12)}</td>
          </tr>
          <tr>
            <th scope="row"><Bi en="In-hand, old regime" hi="इन-हैंड, पुरानी रेजिम" /></th>
            <td className="num num-col">{formatINR(result.inHand.old)}</td>
            <td className="num num-col">{formatINR(result.inHand.old / 12)}</td>
          </tr>
          <tr>
            <th scope="row"><Bi en="Employer PF (in CTC, not in hand)" hi="नियोक्ता पीएफ (CTC में, हाथ में नहीं)" /></th>
            <td className="num num-col">{formatINR(annual.employerPf)}</td>
            <td className="num num-col">{formatINR(annual.employerPf / 12)}</td>
          </tr>
          <tr>
            <th scope="row"><Bi en="Gratuity provision" hi="ग्रेच्युटी प्रावधान" /></th>
            <td className="num num-col">{formatINR(annual.gratuity)}</td>
            <td className="num num-col">{formatINR(annual.gratuity / 12)}</td>
          </tr>
        </tbody>
      </table>
      <p className="hint">{result.professionalTax.note.en}</p>
      <p className="hint" lang="hi">{result.professionalTax.note.hi}</p>
      {result.professionalTax.february !== result.professionalTax.monthly ? (
        <p className="hint">
          <Bi
            en={`February professional tax is ${formatINR(result.professionalTax.february)} instead of ${formatINR(result.professionalTax.monthly)}. The monthly column is the annual amount divided by 12.`}
            hi={`फरवरी का प्रोफेशनल टैक्स ${formatINR(result.professionalTax.february)} है, ${formatINR(result.professionalTax.monthly)} नहीं। मासिक कॉलम सालाना राशि को 12 से भाग देकर है।`}
          />
        </p>
      ) : null}
      <p className="hint">
        <Bi
          en={`Old-regime HRA exemption used: ${formatINR(result.hraExemption)}. Employee and employer PF are both 12% of the same wage.`}
          hi={`पुरानी रेजिम में इस्तेमाल HRA छूट: ${formatINR(result.hraExemption)}। कर्मचारी और नियोक्ता पीएफ दोनों एक ही वेतन का 12% हैं।`}
        />
      </p>
    </div>
  );
}

function signed(amount: number): string {
  if (amount < 0) return `-${formatINR(Math.abs(amount))}`;
  return formatINR(amount);
}
