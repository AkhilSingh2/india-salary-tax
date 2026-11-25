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

/** In-app path with the GitHub Pages base prefix. Sutra's anchors do not add Next's basePath. */
export function appHref(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const hashAt = path.indexOf("#");
  const hash = hashAt >= 0 ? path.slice(hashAt) : "";
  const beforeHash = hashAt >= 0 ? path.slice(0, hashAt) : path;
  const queryAt = beforeHash.indexOf("?");
  const search = queryAt >= 0 ? beforeHash.slice(queryAt) : "";
  const pathname = queryAt >= 0 ? beforeHash.slice(0, queryAt) : beforeHash;
  const withSlash = pathname === "/" || pathname === "" ? "/" : pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${BASE_PATH}${withSlash}${search}${hash}`;
}

export function pageUrl(path: string): string {
  if (path === "/" || path === "") return `${SITE_URL}/`;
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  const withSlash = withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
  return `${SITE_URL}${withSlash}`;
}
