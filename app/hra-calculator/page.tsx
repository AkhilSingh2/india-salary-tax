import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Crumbs, Faq, Related } from "@/components/Related";
import { HraCalculator } from "@/components/HraCalculator";
import { breadcrumbSchema, faqSchema, pageMeta, softwareSchema } from "@/lib/seo";

const title = "HRA calculator";
const description =
  "Calculate HRA exemption for metro and non-metro cities. The least of actual HRA, rent minus 10% of salary, and 50% or 40% of salary.";

const faqs = [
  {
    question: "How is HRA exemption calculated?",
    answer:
      "Section 10(13A), read with Rule 2A, exempts the lowest of three amounts: the HRA you actually received, rent paid minus 10% of salary, and 50% of salary in a metro or 40% elsewhere. Salary here is basic pay plus dearness allowance, but only if that allowance forms part of retirement benefits.",
  },
  {
    question: "Which cities are metros for HRA?",
    answer:
      "Delhi, Mumbai, Kolkata and Chennai. Bengaluru, Hyderabad, Pune, Ahmedabad and other cities use 40% of salary, even when the rent is high.",
  },
  {
    question: "Can I claim HRA exemption in the new tax regime?",
    answer:
      "No. HRA exemption is an old-regime claim. In the new regime the HRA you receive is taxed as salary. The exemption still matters if the old regime wins after your other deductions, which you can check in the income tax calculator.",
  },
  {
    question: "What if I pay rent to a parent?",
    answer:
      "The same three-way test applies. You need a real tenancy, rent that is actually paid, and receipts. If the rent for the year is above ₹1,00,000, the employer generally asks for the landlord’s PAN. The parent should report the rent as income.",
  },
];

const hindi = [
  {
    question: "HRA छूट कैसे निकलती है?",
    answer:
      "तीन राशियों में जो सबसे कम हो, वही छूट है: मिला हुआ HRA, किराया घटा वेतन का 10%, और मेट्रो में वेतन का 50% या अन्य शहर में 40%। वेतन में बेसिक और वह DA आता है जो रिटायरमेंट बेनिफिट का हिस्सा हो।",
  },
  {
    question: "कौन से शहर मेट्रो हैं?",
    answer:
      "दिल्ली, मुंबई, कोलकाता और चेन्नई। बेंगलुरु, हैदराबाद और पुणे मेट्रो नहीं हैं। वहाँ सीमा 40% है।",
  },
  {
    question: "क्या नई रेजिम में HRA छूट मिलती है?",
    answer:
      "नहीं। यह छूट सिर्फ पुरानी रेजिम में है। नई रेजिम में मिला HRA वेतन की तरह कर योग्य है।",
  },
];

export const metadata = pageMeta({
  path: "/hra-calculator/",
  title,
  description,
  image: "/og/hra.png",
});

export default function HraPage() {
  return (
    <>
      <JsonLd data={softwareSchema({ path: "/hra-calculator/", name: title, description })} />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "HRA calculator", path: "/hra-calculator/" }])} />
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/hra-calculator/", label: "HRA calculator" }]} />
      <p className="eyebrow">Section 10(13A) · Rule 2A</p>
      <h1>HRA calculator</h1>
      <p className="lede">
        Metro or not, the exemption is the lowest of the three statutory limits. Enter monthly figures,
        or the totals for the months you actually rented.
      </p>
      <HraCalculator />
      <section className="prose">
        <h2>What counts as salary</h2>
        <p>
          Rule 2A uses basic pay and dearness allowance when the allowance is part of retirement benefits.
          It does not use your full CTC, your special allowance, or your bonus. If you are unsure, leave
          DA at zero. Overstating salary makes the 10% threshold and the 40% or 50% ceiling both larger,
          and the exemption can move either way.
        </p>
        <p>
          Use the same months for rent, HRA and salary. A partial year should not be mixed with a
          full-year basic. The result is an old-regime figure. Pass it to the{" "}
          <Link href="/income-tax-calculator/">income tax calculator</Link> to see whether the old regime
          actually wins, and keep a <Link href="/rent-receipt-generator/">rent receipt</Link> if your
          employer asks for one.
        </p>
      </section>
      <Faq id="hra-faq" title="Questions" items={faqs} />
      <Faq id="hra-faq-hi" title="हिंदी में सवाल" items={hindi} />
      <Related current="/hra-calculator/" />
    </>
  );
}
