import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Crumbs, Faq, Related } from "@/components/Related";
import { YearSlabs } from "@/components/SlabReference";
import { TaxCalculator } from "@/components/TaxCalculator";
import { breadcrumbSchema, faqSchema, pageMeta, softwareSchema } from "@/lib/seo";
import { SOURCES } from "@/lib/tax-rules";

const title = "Income tax calculator FY 2025-26 (AY 2026-27)";
const description =
  "Compare old and new regime tax for FY 2025-26 / AY 2026-27, and switch to AY 2025-26. Slabs, 87A rebate, HRA, 80C, 80D, surcharge and cess.";

const faqs = [
  {
    question: "What is the difference between the old and new tax regime?",
    answer:
      "The new regime has wider slabs and a section 87A rebate that wipes tax on total income up to ₹12 lakh for FY 2025-26. It does not allow section 80C, 80D, HRA exemption or self-occupied home-loan interest. The old regime keeps those deductions and uses the earlier slabs, with a rebate only up to ₹5 lakh. This income tax calculator shows both, including cess.",
  },
  {
    question: "Which year does this income tax calculator use, AY 2025-26 or AY 2026-27?",
    answer:
      "It opens on FY 2025-26, which is assessed in AY 2026-27. Switch to FY 2024-25 / AY 2025-26 if you are checking the return for last year’s income. The slabs and the rebate limit change between those two years. The old-regime slabs do not.",
  },
  {
    question: "Why is tax zero up to about ₹12.75 lakh of salary in the new regime?",
    answer:
      "A resident with total income up to ₹12 lakh gets a rebate of the full tax, capped at ₹60,000, which is exactly the slab tax at ₹12 lakh. Salaried people also get a ₹75,000 standard deduction, so salary of ₹12.75 lakh and no other income produces total income of ₹12 lakh. Income a little above the limit gets marginal relief.",
  },
  {
    question: "Can I claim 80C, HRA and home-loan interest in the new regime?",
    answer:
      "No. Those are old-regime claims. The new regime still allows the ₹75,000 standard deduction and employer NPS under section 80CCD(2), up to 14% of basic pay plus DA. Your own NPS under 80C or 80CCD(1B) is not allowed in the new regime.",
  },
  {
    question: "How are surcharge and cess calculated?",
    answer:
      "Surcharge starts when total income is above ₹50 lakh: 10% up to ₹1 crore, 15% up to ₹2 crore, and 25% up to ₹5 crore. Above ₹5 crore the old regime charges 37% and the new regime stays at 25%. Health and education cess is 4% of tax plus surcharge. Marginal relief stops a small increase in income from causing a larger increase in tax.",
  },
];

const hindi = [
  {
    question: "नई और पुरानी रेजिम में फर्क क्या है?",
    answer:
      "नई रेजिम में स्लैब चौड़े हैं और वित्त वर्ष 2025-26 में ₹12 लाख तक की कुल आय पर धारा 87A से टैक्स शून्य हो जाता है। इसमें 80C, 80D, HRA और खुद के घर के लोन का ब्याज नहीं मिलता। पुरानी रेजिम में ये कटौतियाँ मिलती हैं और छूट ₹5 लाख तक है।",
  },
  {
    question: "AY 2025-26 और AY 2026-27 में क्या अंतर है?",
    answer:
      "वित्त वर्ष 2025-26 की आय आकलन वर्ष 2026-27 में आती है। AY 2025-26 पिछले वित्त वर्ष 2024-25 की आय के लिए है। कैलकुलेटर में साल बदल सकते हैं। नई रेजिम की स्लैब और छूट की सीमा दोनों साल में अलग है।",
  },
  {
    question: "₹12.75 लाख वेतन पर टैक्स शून्य क्यों है?",
    answer:
      "निवासी की कुल आय ₹12 लाख तक हो तो छूट पूरे टैक्स को मिटा देती है। वेतन पर ₹75,000 की स्टैंडर्ड डिडक्शन मिलती है, इसलिए अन्य आय न हो तो लगभग ₹12.75 लाख वेतन पर कुल आय ₹12 लाख बनती है।",
  },
  {
    question: "सरचार्ज और सेस कैसे लगते हैं?",
    answer:
      "₹50 लाख से ऊपर सरचार्ज लगता है। नई रेजिम में यह 25% से ऊपर नहीं जाता। स्वास्थ्य और शिक्षा उपकर, टैक्स और सरचार्ज पर 4% है। सीमा के ठीक ऊपर मामूली राहत भी लगती है।",
  },
];

export const metadata = pageMeta({
  path: "/income-tax-calculator/",
  title,
  description,
  image: "/og/income-tax.png",
});

export default function IncomeTaxPage() {
  return (
    <>
      <JsonLd data={softwareSchema({ path: "/income-tax-calculator/", name: title, description })} />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Income tax calculator", path: "/income-tax-calculator/" }])} />
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/income-tax-calculator/", label: "Income tax calculator" }]} />
      <p className="eyebrow">FY 2025-26 · AY 2026-27 · also AY 2025-26</p>
      <h1>Income tax calculator</h1>
      <p className="lede">
        Old regime and new regime, side by side, for a salaried resident. The new regime is the default
        for FY 2025-26 / AY 2026-27. Switch the year if you are checking AY 2025-26.
      </p>
      <noscript>
        <p>The working below needs JavaScript. The slab tables further down are still readable.</p>
      </noscript>
      <TaxCalculator />
      <section className="prose">
        <h2>What this income tax calculator includes</h2>
        <p>
          It starts from gross salary, removes the standard deduction (₹75,000 in the new regime and
          ₹50,000 in the old), and then applies only the claims that regime allows. HRA follows section
          10(13A) and Rule 2A. Section 80C is capped at ₹1,50,000, additional NPS at ₹50,000, and
          self-occupied home-loan interest at ₹2,00,000. Employer NPS under section 80CCD(2) is allowed
          in both regimes. Health and education cess is 4%. Total income is rounded to the nearest ten
          rupees, the way section 288B requires.
        </p>
        <p>
          If you know your CTC rather than your taxable salary, start with the{" "}
          <Link href="/in-hand-salary-calculator/">in-hand salary calculator</Link>. If you are unsure of
          the HRA exemption, the <Link href="/hra-calculator/">HRA calculator</Link> sends the figure
          back here. A <Link href="/rent-receipt-generator/">rent receipt</Link> is what many employers
          ask for before they accept that exemption.
        </p>
        <p>
          Capital gains, more than one house, arrears relief under section 89, and the ₹7.5 lakh cap on
          employer PF plus NPS plus superannuation are not in this model. Read the limits on the{" "}
          <Link href="/methodology/">methodology page</Link> before you treat the result as a return.
        </p>
        <h2>Slabs used for FY 2025-26</h2>
        <YearSlabs year="fy-2025-26" />
        <h2>Sources</h2>
        <ul>
          {SOURCES.map((source) => (
            <li key={source.id}>
              <a href={source.url}>{source.label}</a> — {source.note}
            </li>
          ))}
        </ul>
      </section>
      <Faq id="tax-faq" title="Questions" items={faqs} />
      <Faq id="tax-faq-hi" title="हिंदी में सवाल" items={hindi} />
      <Related current="/income-tax-calculator/" />
    </>
  );
}
