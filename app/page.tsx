import { Button, Card, CardBody, CardHeader } from "@sutra-ui/react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { appHref, pageUrl, SITE_NAME } from "@/lib/site";
import { RULES_VERSION } from "@/lib/tax-rules";

const tools = [
  {
    href: "/income-tax-calculator/",
    index: "01",
    title: "Income tax calculator",
    text: "Old and new regime for FY 2025-26 / AY 2026-27, with the AY 2025-26 slabs one switch away. Rebate, surcharge and cess included.",
  },
  {
    href: "/in-hand-salary-calculator/",
    index: "02",
    title: "In-hand salary calculator",
    text: "Turn CTC into monthly take-home. Basic, HRA, employee and employer PF, gratuity, and professional tax by state.",
  },
  {
    href: "/hra-calculator/",
    index: "03",
    title: "HRA calculator",
    text: "The three-way test in section 10(13A): actual HRA, rent minus 10% of salary, and 50% or 40% depending on the city.",
  },
  {
    href: "/rent-receipt-generator/",
    index: "04",
    title: "Rent receipt generator",
    text: "A printable PDF for the year, with an optional landlord PAN. The file is made in your browser.",
  },
];

export default function HomePage() {
  return (
    <PageShell
      title="Salary and income tax calculators for India."
      description="Four quiet tools for salaried people. Compare the old regime and the new regime, turn CTC into in-hand pay, check HRA exemption, and print rent receipts. No ads, no account, and no upload."
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: pageUrl("/"),
          description: "Salary and income-tax calculators for salaried people in India.",
          inLanguage: ["en-IN", "hi-IN"],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: tools.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.title,
            url: pageUrl(tool.href),
          })),
        }}
      />
      <p className="kicker">FY 2025-26 · AY 2026-27</p>
      <div className="actions">
        <Button href={appHref("/income-tax-calculator/")}>Income tax calculator</Button>
        <Button href={appHref("/in-hand-salary-calculator/")} variant="secondary">
          In-hand salary calculator
        </Button>
      </div>
      <div className="stack cols-3">
        <Card>
          <CardHeader>
            <h2 className="sutra-card-title">Rules you can read</h2>
          </CardHeader>
          <CardBody>
            <p>Version {RULES_VERSION} lives in one file, with links to the Budget speech, the Finance Bill and incometax.gov.in.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="sutra-card-title">A number, then the working</h2>
          </CardHeader>
          <CardBody>
            <p>Each tool opens with the answer. Slabs, PF and the HRA test sit underneath, not behind a sign-up.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="sutra-card-title">Stays on your phone</h2>
          </CardHeader>
          <CardBody>
            <p>Rent-receipt details never leave the browser. Theme and language are the only things saved on the device.</p>
          </CardBody>
        </Card>
      </div>
      <div className="stack cols-2">
        {tools.map((tool) => (
          <Card key={tool.href}>
            <CardHeader>
              <p className="kicker">{tool.index}</p>
              <h2 className="sutra-card-title">
                <Link className="card-link" href={tool.href}>
                  {tool.title}
                </Link>
              </h2>
            </CardHeader>
            <CardBody>
              <p>{tool.text}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <section className="prose">
        <h2>A worked example, not your numbers</h2>
        <p>
          On a salary of ₹12,00,000, with ₹1,32,000 of HRA exemption and ordinary 80C and 80D claims, the
          new regime comes to zero tax and the old regime to ₹85,925. That gap is the section 87A rebate
          on total income up to ₹12 lakh. Change the salary or the deductions in the{" "}
          <Link href="/income-tax-calculator/">income tax calculator</Link> and the verdict moves with them.
        </p>
        <p>
          The new regime is the default. Standard deduction for salary is ₹75,000, so a person with no
          other income pays nothing up to about ₹12.75 lakh of salary. The old regime still matters when
          HRA, 80C, health insurance and a self-occupied home loan are large.{" "}
          <Link href="/methodology/">How the numbers are worked out</Link> lists what is covered and what is not.
        </p>
        <p lang="hi">
          नई रेजिम में ₹12 लाख तक की कुल आय पर धारा 87A से टैक्स शून्य हो जाता है। वेतन पर ₹75,000 की
          स्टैंडर्ड डिडक्शन के बाद लगभग ₹12.75 लाख वेतन तक टैक्स नहीं बनता, अगर अन्य आय न हो। पुरानी रेजिम
          तब मायने रखती है जब HRA, 80C, स्वास्थ्य बीमा और होम लोन का ब्याज बड़ा हो।
        </p>
      </section>
    </PageShell>
  );
}
