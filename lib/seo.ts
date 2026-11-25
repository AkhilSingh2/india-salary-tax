import type { Metadata } from "next";
import { absoluteUrl, pageUrl, SITE_NAME } from "@/lib/site";

export function pageMeta(options: {
  path: string;
  title: string;
  description: string;
  image: string;
}): Metadata {
  const url = pageUrl(options.path);
  const image = absoluteUrl(options.image);
  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${options.title} | ${SITE_NAME}`,
      description: options.description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: options.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${options.title} | ${SITE_NAME}`,
      description: options.description,
      images: [image],
    },
  };
}

export function softwareSchema(options: { path: string; name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: options.name,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: pageUrl(options.path),
    description: options.description,
    inLanguage: ["en-IN", "hi-IN"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    provider: { "@type": "Organization", name: SITE_NAME, url: pageUrl("/") },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}
