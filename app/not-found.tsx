import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell title="That page is not here." description="The calculators are on these four pages.">
      <ul>
        <li>
          <Link href="/income-tax-calculator/">Income tax calculator</Link>
        </li>
        <li>
          <Link href="/in-hand-salary-calculator/">In-hand salary calculator</Link>
        </li>
        <li>
          <Link href="/hra-calculator/">HRA calculator</Link>
        </li>
        <li>
          <Link href="/rent-receipt-generator/">Rent receipt generator</Link>
        </li>
      </ul>
    </PageShell>
  );
}
