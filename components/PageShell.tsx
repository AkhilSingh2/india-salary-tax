"use client";

import { Footer, Header, LanguageToggle, ThemeSwitcher, ToolLayout, useSutra, type Crumb } from "@sutra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { RULES_UPDATED, RULES_VERSION } from "@/lib/tax-rules";
import { appHref } from "@/lib/site";

const NAV = [
  { href: "/income-tax-calculator/", en: "Income tax", hi: "इनकम टैक्स" },
  { href: "/in-hand-salary-calculator/", en: "In-hand", hi: "इन-हैंड" },
  { href: "/hra-calculator/", en: "HRA", hi: "HRA" },
  { href: "/rent-receipt-generator/", en: "Rent receipt", hi: "किराया रसीद" },
];

const RELATED = [
  {
    href: "/income-tax-calculator/",
    en: "Income tax calculator",
    hi: "इनकम टैक्स कैलकुलेटर",
    enText: "Old and new regime, side by side.",
    hiText: "पुरानी और नई रेजिम, साथ-साथ।",
  },
  {
    href: "/in-hand-salary-calculator/",
    en: "In-hand salary calculator",
    hi: "इन-हैंड सैलरी कैलकुलेटर",
    enText: "CTC to monthly take-home.",
    hiText: "CTC से महीने की इन-हैंड।",
  },
  {
    href: "/hra-calculator/",
    en: "HRA calculator",
    hi: "HRA कैलकुलेटर",
    enText: "Metro and non-metro exemption.",
    hiText: "मेट्रो और गैर-मेट्रो छूट।",
  },
  {
    href: "/rent-receipt-generator/",
    en: "Rent receipt generator",
    hi: "किराया रसीद",
    enText: "A PDF made in your browser.",
    hiText: "PDF आपके ब्राउज़र में बनती है।",
  },
];

function NavCurrent() {
  const pathname = usePathname() || "/";
  useEffect(() => {
    const here = pathname.endsWith("/") ? pathname : `${pathname}/`;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    document.querySelectorAll<HTMLAnchorElement>(".sutra-nav a").forEach((anchor) => {
      let path = new URL(anchor.href, window.location.origin).pathname;
      if (base && path.startsWith(base)) path = path.slice(base.length) || "/";
      if (!path.endsWith("/")) path = `${path}/`;
      if (path === here) anchor.setAttribute("aria-current", "page");
      else anchor.removeAttribute("aria-current");
    });
  }, [pathname]);
  return null;
}

function FooterNote() {
  return (
    <>
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
      </p>
      <p>Theme and language stay in this browser. Salary figures and receipt details are not uploaded.</p>
    </>
  );
}

export function PageShell({
  title,
  description,
  breadcrumb = [],
  current,
  children,
}: {
  title: string;
  description?: string;
  breadcrumb?: Crumb[];
  current?: string;
  children: ReactNode;
}) {
  const { locale } = useSutra();
  const hi = locale === "hi";
  const nav = NAV.map((item) => ({ href: appHref(item.href), label: hi ? item.hi : item.en }));
  const crumbs = breadcrumb.map((crumb) => ({
    label: crumb.label,
    href: crumb.href ? appHref(crumb.href) : undefined,
  }));
  const related = current
    ? RELATED.filter((item) => item.href !== current).map((item) => ({
        href: appHref(item.href),
        title: hi ? item.hi : item.en,
        description: hi ? item.hiText : item.enText,
      }))
    : [];

  return (
    <ToolLayout
      title={title}
      description={description}
      breadcrumb={crumbs}
      related={related}
      header={
        <Header title="Aayam" href={appHref("/")} nav={nav}>
          <LanguageToggle />
          <ThemeSwitcher />
        </Header>
      }
      footer={
        <Footer
          title="Aayam"
          note={<FooterNote />}
          links={[
            { href: appHref("/income-tax-calculator/"), label: "Income tax calculator" },
            { href: appHref("/in-hand-salary-calculator/"), label: "In-hand salary calculator" },
            { href: appHref("/hra-calculator/"), label: "HRA calculator" },
            { href: appHref("/rent-receipt-generator/"), label: "Rent receipt generator" },
          ]}
        />
      }
    >
      <NavCurrent />
      {children}
    </ToolLayout>
  );
}
