import type { MetadataRoute } from "next";
import { absoluteUrl, pageUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aayam — salary and tax calculators",
    short_name: "Aayam",
    description: "Income tax, in-hand salary, HRA and rent receipts for salaried India.",
    start_url: pageUrl("/"),
    display: "standalone",
    background_color: "#f3eee4",
    theme_color: "#f3eee4",
    lang: "en-IN",
    icons: [{ src: absoluteUrl("/favicon.svg"), sizes: "any", type: "image/svg+xml" }],
  };
}
