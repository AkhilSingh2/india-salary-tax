/** Public site URL, without a trailing slash. Includes the project path when hosted on GitHub Pages. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://akhilsingh2.github.io/india-salary-tax").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "Aayam";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function pageUrl(path: string): string {
  if (path === "/" || path === "") return `${SITE_URL}/`;
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  const withSlash = withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
  return `${SITE_URL}${withSlash}`;
}
