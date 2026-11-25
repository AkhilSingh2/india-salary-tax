import Link from "next/link";
import { BilingualFaq } from "@/components/BilingualFaq";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { SalaryCalculator } from "@/components/SalaryCalculator";
import { breadcrumbSchema, faqSchema, pageMeta, softwareSchema } from "@/lib/seo";

const title = "In-hand salary calculator";
const description =
  "Turn annual CTC into monthly in-hand salary. Basic, HRA, employee and employer PF, gratuity and professional tax by state, for the old and new tax regime.";

const faqs = [
  {
    question: "What is in-hand salary?",
    answer:
      "In-hand salary is the amount credited to you. It is cash gross, minus employee PF, professional tax and income tax. Employer PF and the gratuity provision are part of CTC, but they are not paid to you each month.",
  },
  {
    question: "Is employer PF included in CTC and in take-home?",
    answer:
      "It is usually inside CTC and outside take-home. This calculator treats employee PF and employer PF as the same 12% of PF wages. You can keep PF on full basic, or cap the wage at the statutory ₹15,000 a month.",
  },
  {
    question: "Why is Bengaluru not a metro in the HRA line?",
    answer:
      "For HRA exemption, only Delhi, Mumbai, Kolkata and Chennai are metros. That sets the ceiling at 50% of salary. Every other city, including Bengaluru, Hyderabad and Pune, uses 40%. The city type here only changes the default HRA percentage and the old-regime exemption.",
  },
  {
    question: "How is gratuity counted?",
    answer:
      "The yearly provision is 15 days of basic, with a day counted as monthly basic divided by 26. That is about 4.81% of annual basic. It reduces cash gross because it sits in CTC, and it is not taxed here because it has not been paid.",
  },
];

const hindi = [
  {
    question: "इन-हैंड सैलरी क्या है?",
    answer:
      "इन-हैंड वह राशि है जो खाते में आती है। कैश ग्रॉस में से कर्मचारी पीएफ, प्रोफेशनल टैक्स और इनकम टैक्स कटता है। नियोक्ता पीएफ और ग्रेच्युटी CTC में होते हैं, हर महीने हाथ में नहीं आते।",
  },
  {
    question: "बेंगलुरु HRA के लिए मेट्रो क्यों नहीं है?",
    answer:
      "HRA में मेट्रो सिर्फ दिल्ली, मुंबई, कोलकाता और चेन्नई हैं। वहाँ सीमा वेतन का 50% है। बेंगलुरु, हैदराबाद और पुणे पर 40% लगता है।",
  },
  {
    question: "प्रोफेशनल टैक्स राज्य के हिसाब से कैसे कटता है?",
    answer:
      "महाराष्ट्र, कर्नाटक, तेलंगाना, पश्चिम बंगाल और अन्य सूचीबद्ध राज्यों की स्लैब लगी हैं। दिल्ली और कई राज्यों में यह टैक्स नहीं है। पे-स्लिप की राशि हमेशा ऊपर रहती है।",
  },
];

export const metadata = pageMeta({
  path: "/in-hand-salary-calculator/",
  title,
  description,
  image: "/og/in-hand.png",
});

export default function SalaryPage() {
  return (
    <PageShell
      title="In-hand salary calculator"
      description="Split a CTC into basic, HRA, special allowance, both legs of PF and gratuity, then take off professional tax and income tax. The headline number is the new regime. The old regime is beside it."
      breadcrumb={[
        { href: "/", label: "Home" },
        { href: "/in-hand-salary-calculator/", label: "In-hand salary calculator" },
      ]}
      current="/in-hand-salary-calculator/"
    >
      <JsonLd data={softwareSchema({ path: "/in-hand-salary-calculator/", name: title, description })} />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "In-hand salary calculator", path: "/in-hand-salary-calculator/" }])} />
      <p className="kicker">CTC to monthly take-home</p>
      <SalaryCalculator />
      <section className="prose">
        <h2>How the CTC is split</h2>
        <p>
          Basic is a percentage of CTC. HRA is a percentage of basic. Employer PF is 12% of basic, or
          12% of ₹15,000 a month if you are on the wage ceiling. The gratuity line is the statutory
          yearly provision. Whatever remains is the special allowance, and that is what keeps the parts
          equal to the CTC you typed. Cash gross is basic plus HRA plus special allowance.
        </p>
        <p>
          Income tax uses the same engine as the <Link href="/income-tax-calculator/">income tax calculator</Link>.
          Employee PF counts toward section 80C in the old regime. Add rent if you want the old regime
          to include an <Link href="/hra-calculator/">HRA exemption</Link>. Professional tax follows the
          state you pick, and you can replace it with the figure on your payslip.
        </p>
        <p>
          Monthly figures are the annual amounts divided by 12 and rounded to the nearest rupee, so twelve
          months can differ from the annual total by a few rupees. In Maharashtra and Karnataka, February’s
          professional tax is higher. The note under the table says so.
        </p>
      </section>
      <BilingualFaq id="salary-faq" title="Questions" items={faqs} hiId="salary-faq-hi" hiTitle="हिंदी में सवाल" hiItems={hindi} />
    </PageShell>
  );
}
