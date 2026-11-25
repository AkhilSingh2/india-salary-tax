// Local helper. Needs playwright-core and Chrome. Not part of CI.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const base = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const outDir = path.resolve("docs/screenshots");
await mkdir(outDir, { recursive: true });
await mkdir("public/og", { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function shot(url, file, width, height, prepare) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle" });
  if (prepare) await prepare(page);
  await page.screenshot({ path: path.join(outDir, file) });
  await page.close();
  console.log(file);
}

const desktop = [1440, 900];
const mobile = [390, 844];

await shot(`${base}/`, "home-desktop.png", ...desktop);
await shot(`${base}/`, "home-mobile.png", ...mobile);
await shot(`${base}/income-tax-calculator/`, "tax-desktop.png", ...desktop, async (page) => {
  await page.waitForSelector("#full-result");
});
await shot(`${base}/income-tax-calculator/`, "tax-mobile.png", ...mobile, async (page) => {
  await page.locator("#full-result").scrollIntoViewIfNeeded();
});
await shot(`${base}/income-tax-calculator/`, "tax-dark-desktop.png", ...desktop, async (page) => {
  await page.getByRole("button", { name: /dark mode/i }).click();
  await page.waitForTimeout(200);
});
await shot(`${base}/in-hand-salary-calculator/`, "salary-desktop.png", ...desktop, async (page) => {
  await page.waitForSelector("#salary-result");
});
await shot(`${base}/in-hand-salary-calculator/`, "salary-mobile.png", ...mobile, async (page) => {
  await page.locator("#salary-result").scrollIntoViewIfNeeded();
});
await shot(`${base}/hra-calculator/`, "hra-desktop.png", ...desktop);
await shot(`${base}/hra-calculator/`, "hra-mobile.png", ...mobile, async (page) => {
  await page.locator("#hra-result").scrollIntoViewIfNeeded();
});
await shot(`${base}/rent-receipt-generator/`, "receipt-desktop.png", ...desktop, async (page) => {
  await page.getByRole("button", { name: /labelled sample/i }).click();
  await page.waitForSelector(".receipt-sheet");
});
await shot(`${base}/rent-receipt-generator/`, "receipt-mobile.png", ...mobile, async (page) => {
  await page.getByRole("button", { name: /labelled sample/i }).click();
  await page.locator(".receipt-sheet").first().scrollIntoViewIfNeeded();
});

const cards = [
  ["income-tax.png", "Income tax calculator", "Old and new regime, side by side", "FY 2025-26 · AY 2026-27"],
  ["in-hand.png", "In-hand salary calculator", "From CTC to the amount that is credited", "Basic, PF, gratuity, professional tax"],
  ["hra.png", "HRA calculator", "Metro and non-metro exemption", "Section 10(13A) · Rule 2A"],
  ["rent-receipt.png", "Rent receipt generator", "A PDF made in the browser", "Nothing is uploaded"],
  ["home.png", "Salary and tax, clearly", "Calculators for salaried India", "FY 2025-26 · AY 2026-27"],
];

const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const [file, title, subtitle, foot] of cards) {
  await ogPage.setContent(`<!doctype html>
  <html><head><style>
    html,body{margin:0;width:1200px;height:630px;background:#f3eee4;color:#1b1914;font-family:Inter,Liberation Sans,sans-serif;}
    .frame{box-sizing:border-box;height:630px;padding:72px 80px;border-left:22px solid #0c5c48;display:flex;flex-direction:column;justify-content:space-between;}
    .mark{letter-spacing:.18em;text-transform:uppercase;color:#8a3e0c;font-weight:700;font-size:22px;}
    h1{font-family:"Liberation Serif",Georgia,serif;font-size:78px;line-height:.98;font-weight:700;margin:18px 0 0;letter-spacing:-1.5px;max-width:980px;}
    p{font-size:32px;margin:18px 0 0;color:#534e45;}
    .foot{font-size:22px;color:#0c5c48;font-weight:700;}
  </style></head>
  <body><div class="frame"><div><div class="mark">Aayam</div><h1>${title}</h1><p>${subtitle}</p></div><div class="foot">${foot}</div></div></body></html>`);
  const image = await ogPage.screenshot({ type: "png" });
  await writeFile(path.join("public/og", file), image);
  console.log(file);
}

await browser.close();
