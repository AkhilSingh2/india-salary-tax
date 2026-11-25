# SEO plan

Target: Google India, salaried people comparing take-home and tax. The product brief’s Ahrefs demand (India), which this site is built around:

| Keyword | Demand | Difficulty | Page |
| --- | --- | --- | --- |
| income tax calculator | >100K / month | Medium | `/income-tax-calculator/` |
| income tax calculator ay 2025-26 | variant | — | same URL, year switch, title, first paragraph, FAQ |
| income tax calculator new regime | variant | — | same URL, H1 support, side-by-side result |
| in hand salary calculator | >10K / month | Easy | `/in-hand-salary-calculator/` |
| hra calculator | >10K / month | Easy | `/hra-calculator/` |
| rent receipt generator | >1K / month | Easy | `/rent-receipt-generator/` |

One URL per tool keeps the link equity together. AY 2025-26 is a control on the income-tax page, not a second competing URL. The H1 is the head term (“Income tax calculator”). The title, eyebrow and opening paragraph carry FY 2025-26, AY 2026-27, AY 2025-26 and “new regime”.

## On-page map

| URL | Title | H1 |
| --- | --- | --- |
| `/` | Aayam — income tax, in-hand salary, HRA and rent receipts | Salary and income tax calculators for India. |
| `/income-tax-calculator/` | Income tax calculator FY 2025-26 (AY 2026-27) | Income tax calculator |
| `/in-hand-salary-calculator/` | In-hand salary calculator | In-hand salary calculator |
| `/hra-calculator/` | HRA calculator | HRA calculator |
| `/rent-receipt-generator/` | Rent receipt generator | Rent receipt generator |
| `/methodology/` | How these calculators work | How these calculators work |

Each tool page has a unique meta description, a canonical URL, an Open Graph image, a `SoftwareApplication` schema (price 0 INR), a `FAQPage` schema for the English questions, a `BreadcrumbList`, and a visible Hindi FAQ (`lang="hi"`). The calculator UI also has a Hindi toggle. English is the default HTML because the head terms are in English.

Internal links run both ways: the tax page points at in-hand, HRA and rent receipts; HRA links back into the tax calculator with the exemption in the query string; the home page and footer list every tool.

## Technical

- Static export (`output: "export"`), so the HTML is real before JavaScript. Slab tables and explanations are in the server HTML.
- `sitemap.xml` and `robots.txt` are emitted at build time. Canonical host is `NEXT_PUBLIC_SITE_URL` (default `https://akhilsingh2.github.io/india-salary-tax`).
- `trailingSlash` matches GitHub Pages directory URLs.
- No third-party scripts. Fonts are self-hosted by `next/font`.
- One rules file (`lib/tax-rules.ts`, version `2025-26.1`) so the visible slabs cannot drift from the maths.

## What to publish next

These are the adjacent queries worth a page of their own once the four tools have settled. Each should stay a single intent, link back to the calculator it supports, and reuse the rules file rather than restating numbers by hand.

1. Old regime vs new regime for FY 2025-26, with three worked salaries (₹8 lakh, ₹15 lakh, ₹25 lakh) and the deduction level at which the old regime wins.
2. Standard deduction explained: ₹50,000 vs ₹75,000, and the ₹12.75 lakh salaried nil-tax point.
3. Section 80C checklist for salaried people (EPF, PPF, ELSS, tuition, principal) and what does not fit in the ₹1.5 lakh cap.
4. HRA for non-metro cities, aimed at Bengaluru, Hyderabad and Pune, since those cities are not metros and the search is full of the wrong 50% figure.
5. When the landlord’s PAN is required, and how it lines up with the rent-receipt tool.
6. Professional tax pages for Maharashtra, Karnataka and Tamil Nadu. Tamil Nadu needs a local-body caveat.
7. How to read a CTC offer: employer PF, gratuity, and the wage ceiling.
8. Form 12BB: what to submit to the employer, linking the HRA and rent-receipt tools.
9. AY 2025-26 filing notes for people still closing last year’s return, once the due-date facts are checked against incometax.gov.in.
10. A short Hindi landing section or `/hi/` URLs with `hreflang`, if Search Console shows Hindi queries that the on-page FAQ is not catching.

Do not split “new regime” onto its own URL until the main calculator is the one ranking. A second page would compete with it.
