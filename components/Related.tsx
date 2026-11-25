import Link from "next/link";

const TOOLS = [
  { href: "/income-tax-calculator/", title: "Income tax calculator", text: "Old and new regime, side by side." },
  { href: "/in-hand-salary-calculator/", title: "In-hand salary calculator", text: "CTC to monthly take-home." },
  { href: "/hra-calculator/", title: "HRA calculator", text: "Metro and non-metro exemption." },
  { href: "/rent-receipt-generator/", title: "Rent receipt generator", text: "A PDF made in your browser." },
];

export function Related({ current }: { current: string }) {
  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading">Also on Aayam</h2>
      <div className="tool-grid">
        {TOOLS.filter((tool) => tool.href !== current).map((tool) => (
          <article key={tool.href} className="tool-card">
            <h3><Link href={tool.href}>{tool.title}</Link></h3>
            <p>{tool.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Faq({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: { question: string; answer: string }[];
}) {
  return (
    <section className="faq prose" aria-labelledby={id} lang={id.includes("hi") ? "hi" : "en"}>
      <h2 id={id}>{title}</h2>
      {items.map((item) => (
        <div key={item.question}>
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      ))}
    </section>
  );
}

export function Crumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={item.href}>
            {index > 0 ? <span aria-hidden="true"> / </span> : null}
            {index === items.length - 1 ? <span aria-current="page">{item.label}</span> : <Link href={item.href}>{item.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
