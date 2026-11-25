import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Crumbs, Faq, Related } from "@/components/Related";
import { RentReceiptTool } from "@/components/RentReceiptTool";
import { breadcrumbSchema, faqSchema, pageMeta, softwareSchema } from "@/lib/seo";

const title = "Rent receipt generator";
const description =
  "Create printable rent receipts as a PDF in your browser. Add tenant, landlord, rent and an optional PAN. Nothing is uploaded.";

const faqs = [
  {
    question: "Do these rent receipts leave my browser?",
    answer:
      "No. Names, the address, the rent and the PAN are used only to draw the PDF on your device. Aayam has no account, no form submission, and no server that receives them. Closing the tab clears what you typed.",
  },
  {
    question: "When do I need the landlord’s PAN?",
    answer:
      "If you claim HRA and the rent paid in the year is above ₹1,00,000, employers generally ask for the landlord’s PAN before they allow the exemption. The field is optional here. The page warns you when the annual rent crosses that line and the PAN is blank.",
  },
  {
    question: "When is a revenue stamp required?",
    answer:
      "A revenue stamp is generally affixed on a rent receipt when the rent is paid in cash and the amount is above ₹5,000. Bank, UPI and cheque payments do not need one. The PDF leaves a box on cash receipts above that amount. You still sign the printed copy.",
  },
  {
    question: "Is this an official rent receipt?",
    answer:
      "It is a receipt you and the landlord can use as a record. It is not issued by the Income Tax Department. The landlord should sign it. Whether your employer accepts it depends on their HRA policy and on the rent actually having been paid.",
  },
];

const hindi = [
  {
    question: "क्या यह विवरण कहीं अपलोड होता है?",
    answer:
      "नहीं। नाम, पता, किराया और PAN सिर्फ इसी डिवाइस पर PDF बनाने के लिए इस्तेमाल होते हैं। कोई खाता नहीं है और कोई सर्वर इन्हें नहीं पाता।",
  },
  {
    question: "मकान मालिक का PAN कब चाहिए?",
    answer:
      "HRA छूट के लिए साल का किराया ₹1,00,000 से ऊपर हो तो नियोक्ता आमतौर पर PAN माँगता है। यहाँ PAN वैकल्पिक है। सीमा पार होने पर चेतावनी दिखती है।",
  },
  {
    question: "रेवेन्यू स्टांप कब लगता है?",
    answer:
      "नकद किराया ₹5,000 से ऊपर हो तो हस्ताक्षरित रसीद पर आम तौर पर रेवेन्यू स्टांप लगता है। बैंक, UPI या चेक पर इसकी ज़रूरत नहीं। PDF में नकद रसीद पर जगह छोड़ी जाती है।",
  },
];

export const metadata = pageMeta({
  path: "/rent-receipt-generator/",
  title,
  description,
  image: "/og/rent-receipt.png",
});

export default function RentReceiptPage() {
  return (
    <>
      <JsonLd data={softwareSchema({ path: "/rent-receipt-generator/", name: title, description })} />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Rent receipt generator", path: "/rent-receipt-generator/" }])} />
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/rent-receipt-generator/", label: "Rent receipt generator" }]} />
      <p className="eyebrow">In your browser · nothing is uploaded</p>
      <h1>Rent receipt generator</h1>
      <p className="lede">
        Enter the tenant, the landlord, the rent and the months. Download a PDF, or print the preview.
        An optional landlord PAN is there for HRA claims above ₹1,00,000 a year.
      </p>
      <RentReceiptTool />
      <section className="prose">
        <h2>What the PDF contains</h2>
        <p>
          Each month gets a receipt with a number, a date, the amount in figures and in words, the
          address, the payment mode, and a line for the landlord’s signature. Two receipts sit on each
          A4 page. The file says it was created locally. It does not make the rent deductible by itself:
          the <Link href="/hra-calculator/">HRA calculator</Link> is the exemption test, and the{" "}
          <Link href="/income-tax-calculator/">income tax calculator</Link> shows whether the old regime
          is worth choosing.
        </p>
        <p>
          Do not put anyone’s real details into a shared or public computer. The sample button fills
          obvious placeholder names so you can see the layout without using a real person.
        </p>
      </section>
      <Faq id="receipt-faq" title="Questions" items={faqs} />
      <Faq id="receipt-faq-hi" title="हिंदी में सवाल" items={hindi} />
      <Related current="/rent-receipt-generator/" />
    </>
  );
}
