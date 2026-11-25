// Serves the static export under /india-salary-tax and checks every route.
// Usage: NEXT_PUBLIC_BASE_PATH=/india-salary-tax npm run build && node scripts/check-routes.mjs
import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const root = path.resolve("out");
const base = "/india-salary-tax";
const site = "https://akhilsingh2.github.io/india-salary-tax";
const port = Number(process.env.PORT || 4321);

const routes = [
  { path: "/", heading: "Salary and income tax calculators for India.", jsonLd: ["WebSite", "ItemList"] },
  { path: "/income-tax-calculator/", heading: "Income tax calculator", jsonLd: ["SoftwareApplication", "FAQPage", "BreadcrumbList"], text: "₹85,925", canonical: true },
  { path: "/in-hand-salary-calculator/", heading: "In-hand salary calculator", jsonLd: ["SoftwareApplication", "FAQPage", "BreadcrumbList"], canonical: true },
  { path: "/hra-calculator/", heading: "HRA calculator", jsonLd: ["SoftwareApplication", "FAQPage", "BreadcrumbList"], text: "₹1,32,000", canonical: true },
  { path: "/rent-receipt-generator/", heading: "Rent receipt generator", jsonLd: ["SoftwareApplication", "FAQPage", "BreadcrumbList"], canonical: true },
  { path: "/methodology/", heading: "How these calculators work", jsonLd: ["BreadcrumbList"], canonical: true },
];

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function fileFor(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  if (!decoded.startsWith(base)) return null;
  let rel = decoded.slice(base.length) || "/";
  if (rel.endsWith("/")) rel += "index.html";
  const full = path.normalize(path.join(root, rel));
  if (!full.startsWith(root)) return null;
  return full;
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      if (url.pathname === base) {
        res.writeHead(308, { location: `${base}/` });
        res.end();
        return;
      }
      const file = fileFor(url.pathname);
      const send = (target, status) => {
        const body = fs.readFileSync(target);
        res.writeHead(status, {
          "content-type": types[path.extname(target)] || "application/octet-stream",
          "content-length": body.length,
        });
        res.end(body);
      };
      if (file && fs.existsSync(file) && fs.statSync(file).isFile()) {
        send(file, 200);
        return;
      }
      const missing = path.join(root, "404.html");
      if (fs.existsSync(missing)) {
        send(missing, 404);
        return;
      }
      res.writeHead(404);
      res.end("missing");
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function fail(message) {
  throw new Error(message);
}

const server = await startServer();
const origin = `http://127.0.0.1:${port}${base}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage();
  const failed = [];
  page.on("pageerror", (error) => failed.push(String(error)));
  page.on("response", (response) => {
    const url = response.url();
    if (url.startsWith(origin) && response.status() >= 400 && !url.endsWith("404")) {
      failed.push(`${response.status()} ${url}`);
    }
  });

  for (const route of routes) {
    failed.length = 0;
    const url = `${origin}${route.path === "/" ? "/" : route.path}`;
    const response = await page.goto(url, { waitUntil: "networkidle" });
    if (!response || response.status() !== 200) fail(`${route.path} status ${response?.status()}`);
    const heading = await page.locator("h1").first().innerText();
    if (!heading.includes(route.heading.replace(/\.$/, ""))) fail(`${route.path} heading was ${heading}`);
    if (route.canonical) {
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      const expected = `${site}${route.path}`;
      if (canonical !== expected) fail(`${route.path} canonical ${canonical}`);
    }
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const type of route.jsonLd) {
      if (!ld.some((block) => block.includes(`"${type}"`))) fail(`${route.path} missing JSON-LD ${type}`);
    }
    if (route.text) {
      await page.getByText(route.text, { exact: false }).first().waitFor({ timeout: 10000 });
    }
    const brand = await page.locator(".sutra-mark").getAttribute("href");
    if (brand !== `${base}/`) fail(`${route.path} brand href ${brand}`);
    if (failed.length) fail(`${route.path} asset or runtime errors:\n${failed.join("\n")}`);
    console.log("ok", route.path);
  }

  await page.goto(`${origin}/in-hand-salary-calculator/`, { waitUntil: "networkidle" });
  await page.getByText("a month", { exact: false }).first().waitFor();
  const salaryError = await page.getByText("CTC does not cover the parts").count();
  if (salaryError) fail("salary example should fit inside CTC");

  await page.goto(`${origin}/rent-receipt-generator/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /labelled sample/i }).click();
  await page.getByText("Sample Tenant").first().waitFor();
  console.log("ok receipt sample");

  const light = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--sutra-color-bg-canvas").trim());
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.waitForFunction(() => document.documentElement.getAttribute("data-theme") === "dark");
  const dark = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--sutra-color-bg-canvas").trim());
  if (!light || !dark || light === dark) fail(`theme tokens did not change (${light} -> ${dark})`);
  console.log("ok theme tokens");

  const missing = await page.goto(`${origin}/not-a-calculator/`, { waitUntil: "networkidle" });
  if (!missing || missing.status() !== 404) fail(`missing route status ${missing?.status()}`);
  const missingHeading = await page.locator("h1").first().innerText();
  if (!missingHeading.includes("That page is not here")) fail(`404 heading ${missingHeading}`);
  console.log("ok 404");

  const sitemap = await fetch(`${origin}/sitemap.xml`).then((res) => res.text());
  for (const route of routes) {
    const expected = route.path === "/" ? `${site}/` : `${site}${route.path}`;
    if (!sitemap.includes(expected)) fail(`sitemap missing ${expected}`);
  }
  console.log("ok sitemap");

  if (process.env.SHOTS === "1") {
    const shotDir = process.env.SHOT_DIR ?? path.join(path.dirname(fileURLToPath(import.meta.url)), "../docs/screenshots");
    await fs.promises.mkdir(shotDir, { recursive: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const targets = [
      ["home", "/"],
      ["tax", "/income-tax-calculator/"],
      ["salary", "/in-hand-salary-calculator/"],
      ["hra", "/hra-calculator/"],
      ["receipt", "/rent-receipt-generator/"],
    ];
    for (const theme of ["light", "dark"]) {
      for (const [name, route] of targets) {
        const shot = await context.newPage();
        if (theme === "dark") await shot.addInitScript(() => localStorage.setItem("sutra-theme", "dark"));
        await shot.goto(`${origin}${route}`, { waitUntil: "networkidle" });
        await shot.waitForTimeout(300);
        const file = path.join(shotDir, `after_${name}_${theme}.png`);
        await shot.screenshot({ path: file });
        console.log(file);
        await shot.close();
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

console.log("routes ok");
