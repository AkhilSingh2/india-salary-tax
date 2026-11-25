"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bi } from "@/components/Bi";
import { Check, ChoiceGroup, MoneyField } from "@/components/Fields";
import { hraForStay } from "@/lib/hra";
import { formatINR, formatPercent, formatShare } from "@/lib/money";
import { compareRegimes, type CalcNote, type RegimeResult, type TaxInput } from "@/lib/tax";
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
  const [form, setForm] = useState<FormState>(INITIAL);
  const [live, setLive] = useState({ en: "", hi: "" });

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

  const input: TaxInput = {
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
  };
  const result = compareRegimes(input);
  const summary = useMemo(() => verdictCopy(result.winner, result.savings), [result.winner, result.savings]);

  useEffect(() => {
    const timer = setTimeout(() => setLive(summary), 350);
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
  }

  return (
    <section className="calculator" aria-labelledby="calculator-heading">
      <h2 id="calculator-heading" className="sr-only">
        <Bi en="Calculator" hi="कैलकुलेटर" />
      </h2>
      <p className="sr-only" aria-live="polite">
        <Bi en={live.en} hi={live.hi} />
      </p>
      <div className="split">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            document.getElementById("full-result")?.focus();
          }}
        >
          <ChoiceGroup
            name="year"
            label={<Bi en="Financial year" hi="वित्त वर्ष" />}
            value={form.year}
            onChange={(year) => patch({ year })}
            options={YEAR_ORDER.map((id) => ({
              value: id,
              label: <Bi en={YEARS[id].shortLabel} hi={id === "fy-2025-26" ? "वित्त वर्ष 2025-26" : "वित्त वर्ष 2024-25"} />,
            }))}
          />
          <ChoiceGroup
            name="age"
            label={<Bi en="Age on 31 March" hi="31 मार्च को उम्र" />}
            value={form.age}
            onChange={(age) => patch({ age })}
            options={[
              { value: "below60", label: <Bi en="Under 60" hi="60 से कम" /> },
              { value: "senior", label: <Bi en="60 to 79" hi="60 से 79" /> },
              { value: "superSenior", label: <Bi en="80 or above" hi="80 या अधिक" /> },
            ]}
          />
          <Check
            id="resident"
            checked={form.resident}
            onChange={(resident) => patch({ resident })}
            label={<Bi en="Resident individual" hi="निवासी व्यक्ति" />}
            hint={<Bi en="Section 87A rebate applies only to residents." hi="धारा 87A की छूट सिर्फ निवासी को मिलती है।" />}
          />
          <MoneyField id="gross" label={<Bi en="Annual gross salary" hi="सालाना ग्रॉस वेतन" />} value={form.grossSalary} onChange={(grossSalary) => patch({ grossSalary })} hint={<Bi en="Salary before standard deduction. Leave out exempt employer PF." hi="स्टैंडर्ड डिडक्शन से पहले का वेतन। छूट वाला नियोक्ता पीएफ न जोड़ें।" />} />
          <MoneyField id="other" label={<Bi en="Other income" hi="अन्य आय" />} value={form.otherIncome} onChange={(otherIncome) => patch({ otherIncome })} hint={<Bi en="Interest and similar income. Do not put capital gains here." hi="ब्याज जैसी आय। कैपिटल गेन यहाँ न डालें।" />} />
          <fieldset>
            <legend><Bi en="HRA, for the old regime" hi="HRA, सिर्फ पुरानी रेजिम" /></legend>
            <MoneyField id="basic" label={<Bi en="Basic pay for the year" hi="साल का बेसिक वेतन" />} value={form.basicSalary} onChange={(basicSalary) => patch({ basicSalary })} hint={<Bi en="Add DA to basic if it counts for HRA and for the NPS cap." hi="अगर DA, HRA और NPS सीमा में गिनता है तो उसे बेसिक में जोड़ें।" />} />
            <MoneyField id="hra-received" label={<Bi en="HRA received in the year" hi="साल में मिला HRA" />} value={form.annualHra} onChange={(annualHra) => patch({ annualHra })} />
            <MoneyField id="rent" label={<Bi en="Monthly rent" hi="मासिक किराया" />} value={form.monthlyRent} onChange={(monthlyRent) => patch({ monthlyRent })} />
            <MoneyField id="months" label={<Bi en="Months you rented" hi="कितने महीने किराए पर रहे" />} value={form.months} onChange={(months) => patch({ months: Math.min(12, months) })} hint={<Bi en="Basic and HRA above are full-year figures and are scaled to these months." hi="ऊपर का बेसिक और HRA पूरे साल का माना जाता है और इन महीनों के अनुपात में लिया जाता है।" />} />
            <Check id="metro" checked={form.metro} onChange={(metro) => patch({ metro })} label={<Bi en="Metro city (Delhi, Mumbai, Kolkata, Chennai)" hi="मेट्रो शहर (दिल्ली, मुंबई, कोलकाता, चेन्नई)" />} hint={<Bi en="Bengaluru, Hyderabad and Pune are not metros for HRA." hi="HRA के लिए बेंगलुरु, हैदराबाद और पुणे मेट्रो नहीं हैं।" />} />
            <p className="hint">
              <Bi
                en={`Old-regime exemption from these figures: ${formatINR(Math.round(hra.exemption))}. Least of actual HRA ${formatINR(Math.round(hra.actualHra))}, rent minus 10% ${formatINR(Math.round(hra.rentMinusTenPercent))}, and ${formatPercent(hra.percent)} of salary ${formatINR(Math.round(hra.percentOfSalary))}.`}
                hi={`इन आंकड़ों से पुरानी रेजिम की छूट: ${formatINR(Math.round(hra.exemption))}।`}
              />
            </p>
            <Check id="manual-hra" checked={form.manualHra} onChange={(manualHra) => patch({ manualHra })} label={<Bi en="I will type the HRA exemption myself" hi="मैं HRA छूट खुद भरूँगा" />} />
            {form.manualHra ? (
              <MoneyField id="manual-hra-amount" label={<Bi en="HRA exemption to claim" hi="दावा की जाने वाली HRA छूट" />} value={form.manualHraAmount} onChange={(manualHraAmount) => patch({ manualHraAmount })} />
            ) : null}
          </fieldset>
          <fieldset>
            <legend><Bi en="Deductions the old regime can use" hi="पुरानी रेजिम की कटौतियाँ" /></legend>
            <MoneyField id="80c" label={<Bi en="Section 80C" hi="धारा 80C" />} value={form.section80C} onChange={(section80C) => patch({ section80C })} hint={<Bi en="PF, PPF, ELSS, LIC, tuition, home-loan principal. Capped at ₹1,50,000." hi="पीएफ, पीपीएफ, ELSS, एलआईसी, ट्यूशन, होम लोन का मूलधन। सीमा ₹1,50,000।" />} />
            <MoneyField id="80ccd" label={<Bi en="Additional NPS, 80CCD(1B)" hi="अतिरिक्त NPS, 80CCD(1B)" />} value={form.section80CCD1B} onChange={(section80CCD1B) => patch({ section80CCD1B })} hint={<Bi en="Your own NPS, up to ₹50,000, over and above 80C." hi="आपका अपना NPS, 80C के ऊपर ₹50,000 तक।" />} />
            <MoneyField id="80d-self" label={<Bi en="Health insurance, self and family" hi="स्वास्थ्य बीमा, खुद और परिवार" />} value={form.section80DSelf} onChange={(section80DSelf) => patch({ section80DSelf })} />
            <Check id="self-senior" checked={form.selfOrFamilySenior} onChange={(selfOrFamilySenior) => patch({ selfOrFamilySenior })} label={<Bi en="I or my spouse is 60 or older (80D limit ₹50,000)" hi="मैं या जीवनसाथी 60+ है (80D सीमा ₹50,000)" />} />
            <MoneyField id="80d-parents" label={<Bi en="Health insurance, parents" hi="माता-पिता का स्वास्थ्य बीमा" />} value={form.section80DParents} onChange={(section80DParents) => patch({ section80DParents })} />
            <Check id="parents-senior" checked={form.parentsSenior} onChange={(parentsSenior) => patch({ parentsSenior })} label={<Bi en="A parent is 60 or older (80D limit ₹50,000)" hi="माता या पिता 60+ हैं (80D सीमा ₹50,000)" />} />
            <MoneyField id="loan" label={<Bi en="Home-loan interest, self-occupied" hi="होम लोन का ब्याज, खुद के रहने वाला घर" />} value={form.homeLoan} onChange={(homeLoan) => patch({ homeLoan })} hint={<Bi en="Old regime, section 24(b), capped at ₹2,00,000. Principal goes in 80C." hi="पुरानी रेजिम, धारा 24(b), सीमा ₹2,00,000। मूलधन 80C में डालें।" />} />
            <MoneyField id="pt" label={<Bi en="Professional tax paid" hi="भरा हुआ प्रोफेशनल टैक्स" />} value={form.professionalTax} onChange={(professionalTax) => patch({ professionalTax })} hint={<Bi en="Deducted in the old regime, capped at ₹2,500." hi="पुरानी रेजिम में कटता है, सीमा ₹2,500।" />} />
            <MoneyField id="nps-employer" label={<Bi en="Employer NPS contribution" hi="नियोक्ता का NPS योगदान" />} value={form.employerNps} onChange={(employerNps) => patch({ employerNps })} hint={<Bi en="Allowed in both regimes, capped at a percentage of basic plus DA." hi="दोनों रेजिम में मिलता है, बेसिक प्लस DA के प्रतिशत तक।" />} />
            <ChoiceGroup
              name="employment"
              label={<Bi en="Employer, for the NPS cap" hi="NPS सीमा के लिए नियोक्ता" />}
              value={form.employment}
              onChange={(employment) => patch({ employment })}
              options={[
                { value: "private", label: <Bi en="Private or PSU" hi="प्राइवेट या पीएसयू" /> },
                { value: "government", label: <Bi en="Government" hi="सरकार" /> },
              ]}
            />
            <Check id="nps-included" checked={form.npsIncluded} onChange={(npsIncluded) => patch({ npsIncluded })} label={<Bi en="Employer NPS is already inside the gross salary above" hi="नियोक्ता NPS ऊपर के ग्रॉस वेतन में शामिल है" />} />
          </fieldset>
          <div className="actions">
            <button className="btn btn-primary" type="submit"><Bi en="Show the result" hi="नतीजा देखें" /></button>
            <button className="btn btn-ghost" type="button" onClick={() => setForm(INITIAL)}><Bi en="Reset example" hi="उदाहरण वापस लाएँ" /></button>
            <button className="btn btn-ghost" type="button" onClick={copyLink}><Bi en="Copy a link to these figures" hi="इन आंकड़ों की लिंक कॉपी करें" /></button>
          </div>
        </form>
        <div id="full-result" tabIndex={-1} className="result-col result-first">
          <Verdict winner={result.winner} savings={result.savings} />
          <ResultPanel result={result} gross={form.grossSalary} />
        </div>
      </div>
    </section>
  );
}

function verdictCopy(winner: "old" | "new" | "tie", savings: number): { en: string; hi: string } {
  if (winner === "tie") {
    return {
      en: savings === 0 ? "Both regimes come to the same tax." : "Both regimes come to the same tax.",
      hi: "दोनों रेजिम में टैक्स बराबर है।",
    };
  }
  const amount = formatINR(savings);
  if (winner === "new") {
    return {
      en: `You save ${amount} with the new regime.`,
      hi: `नई रेजिम में ${amount} की बचत है।`,
    };
  }
  return {
    en: `You save ${amount} with the old regime.`,
    hi: `पुरानी रेजिम में ${amount} की बचत है।`,
  };
}

function Verdict({ winner, savings }: { winner: "old" | "new" | "tie"; savings: number }) {
  const copy = verdictCopy(winner, savings);
  const monthly = formatINR(savings / 12);
  return (
    <div className={`verdict ${winner}`}>
      <strong><Bi en={copy.en} hi={copy.hi} /></strong>
      {winner === "tie" ? (
        <p><Bi en="Neither regime is cheaper on these figures." hi="इन आंकड़ों पर कोई रेजिम सस्ती नहीं है।" /></p>
      ) : (
        <p>
          <Bi
            en={`That is about ${monthly} a month. The new regime is the default. Choose the old regime only when it wins after your deductions.`}
            hi={`यह लगभग ${monthly} हर महीने है। नई रेजिम डिफ़ॉल्ट है। पुरानी रेजिम तभी चुनें जब कटौतियों के बाद वही सस्ती पड़े।`}
          />
        </p>
      )}
    </div>
  );
}

function ResultPanel({ result, gross }: { result: ReturnType<typeof compareRegimes>; gross: number }) {
  return (
    <div>
      <div className="regime-grid" style={{ marginTop: "0.8rem" }}>
        <RegimeCard title={<Bi en="New regime" hi="नई रेजिम" />} result={result.new} winner={result.winner} gross={gross} />
        <RegimeCard title={<Bi en="Old regime" hi="पुरानी रेजिम" />} result={result.old} winner={result.winner} gross={gross} />
      </div>
      <NoteList notes={[...result.new.notes, ...result.old.notes]} />
    </div>
  );
}

function RegimeCard({
  title,
  result,
  winner,
  gross,
}: {
  title: ReactNode;
  result: RegimeResult;
  winner: "old" | "new" | "tie";
  gross: number;
}) {
  const lower = winner === result.regime;
  const status = winner === "tie" ? "same" : lower ? "lower" : "higher";
  return (
    <article className={lower ? "regime-card is-winner" : "regime-card"}>
      <div className="field-top">
        <h3>{title}</h3>
        <span className="badge">
          {status === "same" ? <Bi en="Same tax" hi="बराबर टैक्स" /> : null}
          {status === "lower" ? <Bi en="Lower tax" hi="कम टैक्स" /> : null}
          {status === "higher" ? <Bi en="Higher tax" hi="ज़्यादा टैक्स" /> : null}
        </span>
      </div>
      <p className="figure num">{formatINR(result.totalTax)}</p>
      <p className="hint">
        <Bi
          en={`${formatShare(result.totalTax, gross)} of gross salary`}
          hi={`ग्रॉस वेतन का ${formatShare(result.totalTax, gross)}`}
        />
      </p>
      <dl className="lines">
        <Row label={<Bi en="Standard deduction" hi="स्टैंडर्ड डिडक्शन" />} amount={-result.standardDeduction} />
        {result.hraExemption > 0 ? <Row label={<Bi en="HRA exemption" hi="HRA छूट" />} amount={-result.hraExemption} /> : null}
        {result.professionalTax > 0 ? <Row label={<Bi en="Professional tax" hi="प्रोफेशनल टैक्स" />} amount={-result.professionalTax} /> : null}
        {result.housePropertyLoss > 0 ? <Row label={<Bi en="Home-loan interest" hi="होम लोन का ब्याज" />} amount={-result.housePropertyLoss} /> : null}
        {result.section80C > 0 ? <Row label="80C" amount={-result.section80C} /> : null}
        {result.section80CCD1B > 0 ? <Row label="80CCD(1B)" amount={-result.section80CCD1B} /> : null}
        {result.section80D > 0 ? <Row label="80D" amount={-result.section80D} /> : null}
        {result.employerNps > 0 ? <Row label={<Bi en="Employer NPS" hi="नियोक्ता NPS" />} amount={-result.employerNps} /> : null}
        <Row label={<Bi en="Total income" hi="कुल आय" />} amount={result.totalIncome} />
        <Row label={<Bi en="Tax before rebate" hi="छूट से पहले टैक्स" />} amount={Math.round(result.slabTax)} />
        <Row label={<Bi en="Rebate u/s 87A" hi="धारा 87A की छूट" />} amount={-Math.round(result.rebate)} />
        {result.surcharge > 0 ? <Row label={<Bi en="Surcharge" hi="सरचार्ज" />} amount={result.surcharge} /> : null}
        <Row label={<Bi en="Cess, 4%" hi="उपकर, 4%" />} amount={result.cess} />
        <div className="total">
          <dt><Bi en="Total tax" hi="कुल टैक्स" /></dt>
          <dd className="num">{formatINR(result.totalTax)}</dd>
        </div>
      </dl>
      <details>
        <summary><Bi en="Slab breakdown" hi="स्लैब का हिसाब" /></summary>
        <table>
          <caption className="sr-only"><Bi en="Tax by slab" hi="स्लैब के अनुसार टैक्स" /></caption>
          <thead>
            <tr>
              <th scope="col"><Bi en="Income in the band" hi="बैंड में आय" /></th>
              <th scope="col"><Bi en="Rate" hi="दर" /></th>
              <th scope="col" className="num-col"><Bi en="Tax" hi="टैक्स" /></th>
            </tr>
          </thead>
          <tbody>
            {result.slabs.map((slab) => (
              <tr key={`${slab.from}-${slab.rate}`}>
                <td className="num">{formatINR(slab.income)}</td>
                <td>{formatPercent(slab.rate)}</td>
                <td className="num num-col">{formatINR(slab.tax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </article>
  );
}

function Row({ label, amount }: { label: ReactNode; amount: number }) {
  const text = amount < 0 ? `-${formatINR(Math.abs(amount))}` : formatINR(amount);
  return (
    <div>
      <dt>{label}</dt>
      <dd className="num">{text}</dd>
    </div>
  );
}

function NoteList({ notes }: { notes: CalcNote[] }) {
  const unique = notes.filter((note, index) => notes.findIndex((item) => JSON.stringify(item) === JSON.stringify(note)) === index);
  if (unique.length === 0) return null;
  return (
    <div className="note">
      <ul>
        {unique.map((note, index) => (
          <li key={`${note.code}-${index}`}><NoteText note={note} /></li>
        ))}
      </ul>
    </div>
  );
}

function NoteText({ note }: { note: CalcNote }) {
  switch (note.code) {
    case "marginal-rebate":
      return <Bi en="Marginal relief under section 87A has reduced the tax to the income above the rebate limit." hi="धारा 87A की मामूली राहत ने टैक्स को छूट-सीमा से ऊपर की आय तक घटा दिया है।" />;
    case "surcharge-relief":
      return <Bi en="Marginal relief has capped the surcharge so the extra tax does not exceed the extra income." hi="सरचार्ज पर मामूली राहत लगी है, ताकि अतिरिक्त टैक्स अतिरिक्त आय से ज़्यादा न हो।" />;
    case "old-rebate-cliff":
      return <Bi en="The old-regime rebate stops abruptly above ₹5,00,000. There is no marginal relief on it." hi="पुरानी रेजिम की छूट ₹5,00,000 के ऊपर अचानक खत्म हो जाती है। उस पर मामूली राहत नहीं है।" />;
    case "nonresident-no-87a":
      return <Bi en="Section 87A is not available because the taxpayer is not a resident." hi="धारा 87A नहीं मिली क्योंकि करदाता निवासी नहीं है।" />;
    case "nps-cap-not-checked":
      return <Bi en="Basic pay is blank, so the employer NPS percentage cap was not applied." hi="बेसिक खाली है, इसलिए नियोक्ता NPS की प्रतिशत सीमा नहीं लगाई गई।" />;
    case "nps-added-to-gross":
      return <Bi en="Employer NPS was added to salary and then the allowable part was deducted." hi="नियोक्ता NPS को वेतन में जोड़ा गया और फिर मान्य हिस्सा काटा गया।" />;
    case "deductions-limited":
      return <Bi en="Deductions were limited because they cannot exceed total income." hi="कटौतियाँ कुल आय से ज़्यादा नहीं हो सकतीं, इसलिए उन्हें घटाया गया।" />;
    case "income-rounded":
      return <Bi en={`Total income was rounded from ${formatINR(note.from)} to ${formatINR(note.to)} under section 288B.`} hi={`धारा 288B के तहत कुल आय ${formatINR(note.from)} से ${formatINR(note.to)} की गई।`} />;
    case "capped":
      return <Bi en={`${note.item} claimed ${formatINR(note.claimed)}, allowed ${formatINR(note.allowed)}.`} hi={`${note.item}: दावा ${formatINR(note.claimed)}, मान्य ${formatINR(note.allowed)}।`} />;
    default:
      return null;
  }
}
