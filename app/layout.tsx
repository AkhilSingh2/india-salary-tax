import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { themeInitScript } from "@sutra-ui/react/theme-script";
import { Providers } from "@/components/Providers";
import { SITE_NAME, absoluteUrl, pageUrl } from "@/lib/site";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/500.css";
import "@fontsource/noto-sans-devanagari/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@sutra-ui/react/styles.css";
import "./globals.css";

const themeBoot = `(function(){try{var s=localStorage;if(!s.getItem("sutra-theme")){var legacy=s.getItem("aayam-theme");if(legacy==="dark"||legacy==="light")s.setItem("sutra-theme",legacy);}if(!s.getItem("sutra-locale")){var lang=s.getItem("aayam-lang");if(lang==="hi"||lang==="en")s.setItem("sutra-locale",lang);}}catch(e){}})();${themeInitScript};(function(){try{var locale=localStorage.getItem("sutra-locale");document.documentElement.setAttribute("data-lang",locale==="hi"?"hi":"en");}catch(e){document.documentElement.setAttribute("data-lang","en");}})();`;

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
    <html lang="en" data-lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-boot" strategy="beforeInteractive">
          {themeBoot}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
