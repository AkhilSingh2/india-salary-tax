import Link from "next/link";
import { RULES_UPDATED, RULES_VERSION } from "@/lib/tax-rules";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p>
          Aayam is an independent calculator for salaried people in India. It is not the Income Tax
          Department, it does not file returns, and it is not tax advice. Rules version {RULES_VERSION},
          reviewed {RULES_UPDATED}. Check the result against{" "}
          <a href="https://www.incometax.gov.in/">incometax.gov.in</a> before you act on it.
        </p>
        <p lang="hi">
          आयम एक स्वतंत्र कैलकुलेटर है। यह आयकर विभाग नहीं है और रिटर्न नहीं भरता। नियम संस्करण {RULES_VERSION}।
          फाइल करने से पहले आंकड़े incometax.gov.in पर मिला लें।
        </p>
        <p>
          <Link href="/methodology/">How the numbers are worked out</Link>
          {" · "}
          <Link href="/income-tax-calculator/">Income tax calculator</Link>
          {" · "}
          <Link href="/in-hand-salary-calculator/">In-hand salary calculator</Link>
          {" · "}
          <Link href="/hra-calculator/">HRA calculator</Link>
          {" · "}
          <Link href="/rent-receipt-generator/">Rent receipt generator</Link>
        </p>
        <p>Theme and language stay in this browser. Salary figures and receipt details are not uploaded.</p>
      </div>
    </footer>
  );
}
