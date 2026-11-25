import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { YearSlabs } from "@/components/SlabReference";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import { RULES_UPDATED, RULES_VERSION, SHARED, SOURCES } from "@/lib/tax-rules";

const YEARS_NOTE = { newSd: 75_000, oldSd: 50_000 };

const title = "How these calculators work";
const description =
  "Sources, rounding, and the limits of the FY 2025-26 income-tax, salary, HRA and rent-receipt tools.";

export const metadata = pageMeta({
  path: "/methodology/",
  title,
  description,
  image: "/og/home.png",
});

export default function MethodologyPage() {
  return (
    <PageShell
      title="How these calculators work"
      description="Every slab, cap and rate is read from one versioned file. The pages do not keep a second copy. This note says what that file assumes, and what it leaves out."
      breadcrumb={[
        { href: "/", label: "Home" },
        { href: "/methodology/", label: "Methodology" },
      ]}
    >
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Methodology", path: "/methodology/" }])} />
      <p className="kicker">Rules {RULES_VERSION} · {RULES_UPDATED}</p>
      <section className="prose">
        <h2>Order of the income-tax sum</h2>
        <ol>
          <li>Start with gross salary. Employer NPS is added first if you said it was not already included.</li>
          <li>In the old regime, subtract HRA exemption and professional tax. Professional tax is capped at ₹{SHARED.professionalTaxDeductionCap.toLocaleString("en-IN")}.</li>
          <li>Subtract the standard deduction: ₹{YEARS_NOTE.newSd.toLocaleString("en-IN")} in the new regime and ₹{YEARS_NOTE.oldSd.toLocaleString("en-IN")} in the old regime, and never more than the salary.</li>
          <li>In the old regime, set off self-occupied home-loan interest up to ₹{SHARED.homeLoanSelfOccupiedCap.toLocaleString("en-IN")}.</li>
          <li>Then chapter VI-A, in this order, and never below zero: 80C, 80CCD(1B), 80D, employer NPS.</li>
          <li>Round total income to the nearest ten rupees (section 288B). A part of ₹5 or more rounds up.</li>
          <li>Apply the slabs, then the section 87A rebate or its marginal relief, then surcharge and surcharge marginal relief, then round to the nearest rupee (section 288A).</li>
          <li>Add health and education cess at {SHARED.cessRate * 100}%.</li>
        </ol>
        <p>
          The new-regime rebate for FY 2025-26 is the full tax, up to ₹60,000, when total income is within
          ₹12,00,000. Just above that, tax is limited to the excess over ₹12,00,000. The FY 2024-25 new
          regime uses the ₹7,00,000 limit and a ₹25,000 rebate cap. The old regime rebate stops dead at
          ₹5,00,000. There is no marginal relief on it. None of the rebate is available to a non-resident.
        </p>
        <h2>Employer NPS</h2>
        <p>
          Section 80CCD(2) is one of the few deductions in the new regime. The cap is 14% of basic pay
          plus DA for everyone in the new regime. In the old regime it is 10% for a private or PSU
          employer and 14% for government. PFRDA describes the same split. If basic pay is left blank,
          the percentage cap is not applied and the page says so.
        </p>
        <h2>HRA</h2>
        <p>
          The exemption is the lowest of actual HRA, rent paid minus 10% of salary, and 50% of salary in
          Delhi, Mumbai, Kolkata or Chennai, otherwise 40%. Salary is basic plus DA only when DA forms
          part of retirement benefits. Partial years scale a full-year basic and HRA down to the months
          rented. The exemption is ignored in the new regime.
        </p>
        <h2>Salary and professional tax</h2>
        <p>
          CTC parts are rounded to the nearest rupee and the special allowance absorbs the rounding so
          they still add up. Employee PF and employer PF are each 12%. Gratuity is 15 / 26 of one month’s
          basic, for the year. Professional tax uses published employee slabs for the states in the list.
          Tamil Nadu is collected by municipalities and can differ. A payslip override replaces the slab.
        </p>
        <h2>What is not calculated</h2>
        <ul>
          <li>Capital gains and any income taxed at a special rate. The section 87A rebate does not cover that tax.</li>
          <li>A let-out house, more than one house, or a loss carried forward.</li>
          <li>Relief under section 89 on arrears, leave travel allowance, and food or gift exemptions.</li>
          <li>The ₹7.5 lakh combined cap on employer PF, NPS and superannuation, and the interest on the excess.</li>
          <li>The ₹5,000 preventive-checkup sub-limit inside section 80D. Premiums are capped at the section total.</li>
          <li>Surcharge splitting between dividend income and normal income. Everything here is treated as normal slab income.</li>
        </ul>
        <p>
          Use the result to compare regimes and to read a salary offer. File the return from the figures
          on <a href="https://www.incometax.gov.in/">incometax.gov.in</a>, not from this page.
        </p>
        <h2>Slabs</h2>
        <YearSlabs year="fy-2025-26" />
        <h3>Previous year, for AY 2025-26</h3>
        <YearSlabs year="fy-2024-25" />
        <h2>Sources</h2>
        <ul>
          {SOURCES.map((source) => (
            <li key={source.id}>
              <a href={source.url}>{source.label}</a> — {source.note}
            </li>
          ))}
        </ul>
        <p>
          The tools themselves: <Link href="/income-tax-calculator/">income tax</Link>,{" "}
          <Link href="/in-hand-salary-calculator/">in-hand salary</Link>,{" "}
          <Link href="/hra-calculator/">HRA</Link>, and{" "}
          <Link href="/rent-receipt-generator/">rent receipts</Link>.
        </p>
      </section>
    </PageShell>
  );
}
