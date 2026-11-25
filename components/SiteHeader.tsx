"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bi } from "@/components/Bi";

const NAV = [
  { href: "/income-tax-calculator/", en: "Income tax", hi: "इनकम टैक्स" },
  { href: "/in-hand-salary-calculator/", en: "In-hand", hi: "इन-हैंड" },
  { href: "/hra-calculator/", en: "HRA", hi: "HRA" },
  { href: "/rent-receipt-generator/", en: "Rent receipt", hi: "किराया रसीद" },
];

function normalize(path: string): string {
  const trimmed = path.replace(/\/$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function SiteHeader() {
  const pathname = normalize(usePathname() || "/");

  function toggleTheme() {
    const root = document.documentElement;
    const dark = !root.classList.contains("dark");
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    localStorage.setItem("aayam-theme", dark ? "dark" : "light");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#121411" : "#f3eee4");
  }

  function toggleLang() {
    const next = document.documentElement.getAttribute("data-lang") === "hi" ? "en" : "hi";
    document.documentElement.setAttribute("data-lang", next);
    localStorage.setItem("aayam-lang", next);
  }

  return (
    <header className="site-header">
      <div className="wrap nav-row">
        <Link href="/" className="brand">
          Aayam
          <small>India</small>
        </Link>
        <nav className="tool-nav" aria-label="Tools">
          {NAV.map((item) => {
            const active = pathname === normalize(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
                <Bi en={item.en} hi={item.hi} />
              </Link>
            );
          })}
        </nav>
        <div className="toggles">
          <button type="button" className="text-btn" onClick={toggleTheme}>
            <span className="when-light"><Bi en="Dark mode" hi="डार्क मोड" /></span>
            <span className="when-dark"><Bi en="Light mode" hi="लाइट मोड" /></span>
          </button>
          <button type="button" className="text-btn" onClick={toggleLang}>
            <span className="i18n" lang="en">हिंदी</span>
            <span className="i18n" lang="hi">English</span>
          </button>
        </div>
      </div>
    </header>
  );
}
