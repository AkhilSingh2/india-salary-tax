import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_NAME, absoluteUrl, pageUrl } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const themeBoot = `(function(){try{var r=document.documentElement;var t=localStorage.getItem("aayam-theme");var dark=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;r.classList.toggle("dark",dark);r.style.colorScheme=dark?"dark":"light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",dark?"#121411":"#f3eee4");var l=localStorage.getItem("aayam-lang");r.setAttribute("data-lang",l==="hi"?"hi":"en");}catch(e){document.documentElement.setAttribute("data-lang","en");}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(pageUrl("/")),
  title: {
    default: `${SITE_NAME} — income tax, in-hand salary, HRA and rent receipts`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Salary and income-tax calculators for India. Compare the old and new regime for FY 2025-26, estimate in-hand pay, check HRA exemption, and make rent receipts in your browser.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  icons: { icon: [{ url: absoluteUrl("/favicon.svg"), type: "image/svg+xml" }] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3eee4",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <Script id="theme-boot" strategy="beforeInteractive">{themeBoot}</Script>
        <a className="skip-link" href="#content">Skip to content</a>
        <SiteHeader />
        <main id="content" className="wrap" style={{ padding: "1.5rem 0 3rem" }}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
