// SEO e2e — REWRITTEN per Spec §5B / §8 T0-3 (ticket 04; the old version
// asserted the pre-rebuild homepage head and the GA4 hostname gate).
//
// Runs in the Playwright "static" project against the prerendered dist/ with
// JavaScript DISABLED: every assertion below is about what crawlers see in the
// raw HTML, not what the client router produces.

import { test, expect } from "@playwright/test";

const BRAND = process.env.VITE_BRAND ?? "GlucoMath";
const ORIGIN = process.env.VITE_SITE_ORIGIN ?? "https://glucomath.com";

const ALL_ROUTES = [
  "/",
  "/glycemic-load-calculator",
  "/glycemic-load-chart",
  "/glycemic-index-calculator",
  "/gmi-calculator",
  "/a1c-to-eag-calculator",
  "/blood-sugar-converter",
  "/glucose-to-a1c-estimator",
  "/about",
];

// Spot checks (≥3 routes per ticket 04): §5B.1 verbatim titles, §5B.4
// canonical policy (no trailing slash, root exempt), §5B.2 JSON-LD types.
const SPOT_CHECKS = [
  {
    path: "/",
    title: `Free Blood Sugar & Glycemic Calculators | ${BRAND}`,
    canonical: `${ORIGIN}/`,
    jsonLdTypes: ["WebApplication", "WebSite"],
  },
  {
    path: "/glycemic-load-calculator",
    title: `Glycemic Load Calculator – GL by Food & Serving | ${BRAND}`,
    canonical: `${ORIGIN}/glycemic-load-calculator`,
    jsonLdTypes: ["FAQPage", "WebApplication"],
  },
  {
    path: "/gmi-calculator",
    title: `GMI Calculator – Glucose Management Indicator | ${BRAND}`,
    canonical: `${ORIGIN}/gmi-calculator`,
    jsonLdTypes: ["FAQPage", "WebApplication"],
  },
  {
    // Shareable-assets BL-04: dataset page → WebPage + Dataset, no
    // WebApplication and no FAQPage.
    path: "/glycemic-load-chart",
    title: `Glycemic Load Chart — GL of 27 Common Foods at Real Servings | ${BRAND}`,
    canonical: `${ORIGIN}/glycemic-load-chart`,
    jsonLdTypes: ["Dataset", "WebPage"],
  },
  {
    path: "/about",
    title: `About – Data Sources, Formulas & Disclaimer | ${BRAND}`,
    canonical: `${ORIGIN}/about`,
    jsonLdTypes: ["AboutPage", "Organization"],
  },
];

test.use({ javaScriptEnabled: false });

for (const { path, title, canonical, jsonLdTypes } of SPOT_CHECKS) {
  test(`prerendered ${path} exposes correct title/canonical/JSON-LD without JavaScript`, async ({
    page,
  }) => {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);

    await expect(page).toHaveTitle(title);

    const canonicals = page.locator('link[rel="canonical"]');
    await expect(canonicals).toHaveCount(1);
    await expect(canonicals).toHaveAttribute("href", canonical);

    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /^https?:\/\//,
    );

    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const nodes = scripts.flatMap((raw) => {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : parsed["@graph"] ?? [parsed];
    });
    expect(nodes.map((node) => node["@type"]).sort()).toEqual([...jsonLdTypes].sort());
  });
}

// Pages with a visible FAQ block — and therefore the ONLY pages allowed a
// FAQPage node (§5B.2-3): GL (ticket 04), the converter (ticket 07),
// a1c-to-eag (ticket 08), the glucose→A1C estimator (ticket 09), the GMI
// calculator (ticket 10), and the GI lookup page (ticket 11).
const FAQ_ROUTES = new Set([
  "/glycemic-load-calculator",
  "/blood-sugar-converter",
  "/a1c-to-eag-calculator",
  "/glucose-to-a1c-estimator",
  "/gmi-calculator",
  "/glycemic-index-calculator",
]);

test("FAQPage JSON-LD appears exactly on the pages with a visible FAQ", async ({ request }) => {
  for (const path of ALL_ROUTES) {
    const html = await (await request.get(path)).text();
    expect(html.includes('"FAQPage"'), `FAQPage presence on ${path}`).toBe(FAQ_ROUTES.has(path));
    expect(html.includes("MedicalWebPage"), `MedicalWebPage forbidden on ${path}`).toBe(false);
  }
});

test("robots.txt and sitemap.xml are served with the full route map", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  for (const path of ALL_ROUTES) {
    expect(xml).toContain(`<loc>${path === "/" ? `${ORIGIN}/` : `${ORIGIN}${path}`}</loc>`);
  }
  // 9 since shareable-assets BL-04 added /glycemic-load-chart.
  expect(xml.match(/<url>/g)).toHaveLength(9);
});

test("GA4 config is unconditional (no hostname gate)", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('gtag("config", "G-PDPYWE3JR5")');
  expect(html).not.toContain("window.location.hostname");
});
