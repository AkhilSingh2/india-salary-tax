import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>That page is not here.</h1>
      <p className="lede">The calculators are on these four pages.</p>
      <ul>
        <li><Link href="/income-tax-calculator/">Income tax calculator</Link></li>
        <li><Link href="/in-hand-salary-calculator/">In-hand salary calculator</Link></li>
        <li><Link href="/hra-calculator/">HRA calculator</Link></li>
        <li><Link href="/rent-receipt-generator/">Rent receipt generator</Link></li>
      </ul>
    </>
  );
}
