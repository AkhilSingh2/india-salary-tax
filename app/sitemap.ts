import type { MetadataRoute } from "next";
import { pageUrl } from "@/lib/site";

export const dynamic = "force-static";

const PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/income-tax-calculator/", priority: 0.9 },
  { path: "/in-hand-salary-calculator/", priority: 0.8 },
  { path: "/hra-calculator/", priority: 0.8 },
  { path: "/rent-receipt-generator/", priority: 0.7 },
  { path: "/methodology/", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-25");
  return PAGES.map((page) => ({
    url: pageUrl(page.path),
    lastModified,
    changeFrequency: "monthly",
    priority: page.priority,
  }));
}
