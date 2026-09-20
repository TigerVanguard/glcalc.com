// Static-project e2e (Spec §8 T4-2/T4-3, ticket 03).
// Runs against the dist/ static server (scripts/serve-dist.mjs, 404 mode) with
// JavaScript DISABLED: what these tests see is exactly what crawlers get.

import { test, expect } from "@playwright/test";

const BRAND = process.env.VITE_BRAND ?? "GlucoMath";

const ROUTES = [
  { path: "/", h1: "Free Blood Sugar & Glycemic Calculators" },
  { path: "/glycemic-load-calculator", h1: "Glycemic Load Calculator" },
  { path: "/glycemic-load-chart", h1: "Glycemic Load Chart: 27 Common Foods" },
  { path: "/glycemic-index-calculator", h1: "Glycemic Index Calculator" },
  { path: "/gmi-calculator", h1: "GMI Calculator (Glucose Management Indicator)" },
  { path: "/a1c-to-eag-calculator", h1: "A1C to eAG Calculator" },
  { path: "/blood-sugar-converter", h1: "Blood Sugar Converter (mg/dL ⇄ mmol/L)" },
  { path: "/glucose-to-a1c-estimator", h1: "Average Glucose to A1C Estimator" },
  { path: "/about", h1: /^About .+/ },
];

test.use({ javaScriptEnabled: false });

for (const { path, h1 } of ROUTES) {
  test(`prerendered ${path} returns 200 with visible H1 (no JavaScript)`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    // Single-element locator: also fails on duplicate H1 (strict mode).
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toHaveText(h1);
  });
}

// Ticket 06 (Spec §8 T4-3): starting from the home page, every other page is
// reachable by clicking a REAL link — tool pages via their home cards, /about
// via the header nav, and /glycemic-load-chart (shareable-assets BL-04, not
// in nav or cards per D4) via its in-body link in the home "What these tools
// help with" section. JavaScript is disabled (file-level test.use above), so
// these are native <a href> navigations against the prerendered dist/.
for (const { path, h1 } of ROUTES.filter((route) => route.path !== "/")) {
  test(`home reaches ${path} by clicking a real link`, async ({ page }) => {
    await page.goto("/");
    const selector =
      path === "/about"
        ? `.site-nav a[href="${path}"]`
        : path === "/glycemic-load-chart"
          ? `.seo-panel a[href="${path}"]`
          : `.tool-cards a[href="${path}"]`;
    await page.locator(selector).click();
    await expect(page).toHaveURL(path);
    await expect(page.locator("h1")).toHaveText(h1);
  });
}

// Ticket 06 (Spec §7 / §8 T3-⑦ runtime mirror): the unified 5-item footer is
// present on all pages (9 since shareable-assets BL-04 added the chart page).
test("all 9 pages render the unified disclaimer footer", async ({ page }) => {
  for (const { path } of ROUTES) {
    await page.goto(path);
    const footer = page.locator(".tool-footer");
    await expect(footer, `footer on ${path}`).toBeVisible();
    await expect(footer).toContainText(
      "This calculator is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.",
    );
    await expect(footer).toContainText(`Maintained by the ${BRAND} project.`);
    await expect(footer).toContainText("This tool has not been reviewed by a medical professional.");
    await expect(footer).toContainText(/Last updated: \d{4}-\d{2}-\d{2}/);
    await expect(footer).toContainText("Data sources & contact:");
    await expect(footer.locator('a[href="/about"]'), `footer /about link on ${path}`).toHaveCount(1);
  }
});

// Ticket 07 (Spec §8 T4-2 / T3-④ runtime mirror): the converter's static
// content — the 18.018 formula string, the common-values table, and the FAQ —
// is served in the prerendered HTML and usable with JavaScript disabled.
// <details>/<summary> is native HTML, so opening a FAQ entry needs no JS.
test("converter page shows formula, reference table, and FAQ without JavaScript", async ({
  page,
}) => {
  await page.goto("/blood-sugar-converter");
  await expect(page.locator("main")).toContainText("18.018");

  const rows = page.locator(".conversion-table tbody tr");
  await expect(rows).toHaveCount(6);
  await expect(rows.nth(2)).toContainText("126");
  await expect(rows.nth(2)).toContainText("7.0");

  const faqEntries = page.locator(".faq-list details");
  await expect(faqEntries).toHaveCount(3);
  await expect(faqEntries.first().locator("summary")).toBeVisible();
  await faqEntries.first().locator("summary").click();
  await expect(faqEntries.first().locator("p")).toBeVisible();
});

// Ticket 08 (Spec §8 T4-2 / T3-④ runtime mirror): the a1c-to-eag page's
// static content — the ADAG formula + Nathan 2008 citation, the applicability
// limits (507 participants, SD ≈ 15.7 mg/dL), the STATIC ADA reference table,
// and the FAQ — is served in the prerendered HTML and usable with JavaScript
// disabled (file-level test.use({ javaScriptEnabled: false }) above applies).
test("a1c page shows formula, applicability limits, reference table, and FAQ without JavaScript", async ({
  page,
}) => {
  await page.goto("/a1c-to-eag-calculator");
  const main = page.locator("main");
  await expect(main).toContainText("eAG (mg/dL) = 28.7 × A1C − 46.7");
  await expect(main).toContainText("Nathan");
  await expect(main).toContainText("507 participants");
  await expect(main).toContainText("15.7 mg/dL");

  const rows = page.locator(".a1c-reference-table tbody tr");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText("Below 5.7%");
  await expect(rows.nth(1)).toContainText("5.7% – 6.4%");
  await expect(rows.nth(2)).toContainText("6.5% or above");

  const faqEntries = page.locator(".faq-list details");
  await expect(faqEntries).toHaveCount(3);
  await faqEntries.first().locator("summary").click();
  await expect(faqEntries.first().locator("p")).toBeVisible();
});

// Ticket 09 (Spec §8 T4-2 / T3-④ runtime mirror): the estimator's static
// content — the backwards formula with its approximation framing, the
// range-not-a-point explanation (SD 15.7 mg/dL → ≈ ±0.5%), and the FAQ — is
// served in the prerendered HTML and usable with JavaScript disabled. The
// prerendered result area must NOT contain any percentage value (empty input
// → placeholder only; a static % would be a hardcoded single-point output).
test("estimator page shows formula, approximation copy, and FAQ without JavaScript", async ({
  page,
}) => {
  await page.goto("/glucose-to-a1c-estimator");
  const main = page.locator("main");
  await expect(main).toContainText("A1C (%) ≈ (eAG + 46.7) ÷ 28.7");
  await expect(main).toContainText("15.7");
  await expect(main).toContainText("algebraic");
  await expect(main).toContainText("asymmetric");

  const panelText = await page.locator(".estimator-panel").textContent();
  expect(panelText).not.toMatch(/\d(\.\d+)?\s*%/);
  expect(panelText).not.toContain("ADAG formula");

  const faqEntries = page.locator(".faq-list details");
  await expect(faqEntries).toHaveCount(3);
  await faqEntries.first().locator("summary").click();
  await expect(faqEntries.first().locator("p")).toBeVisible();
});

// Ticket 10 (Spec §8 T4-2 / T3-④ runtime mirror): the GMI page's static
// content — the Bergenstal 2018 formula, the mandated GMI-vs-A1C explainer
// (±0.5 percentage-point differences are common / a mismatch is not a data
// error / GMI cannot replace a lab A1C), and the FAQ — is served in the
// prerendered HTML and usable with JavaScript disabled. The prerendered
// calculator panel must NOT contain any percentage value (empty input →
// placeholder only; a static % would be a hardcoded result).
test("gmi page shows formula, difference copy, and FAQ without JavaScript", async ({ page }) => {
  await page.goto("/gmi-calculator");
  const main = page.locator("main");
  await expect(main).toContainText("GMI (%) = 3.31 + 0.02392 × mean glucose (mg/dL)");
  await expect(main).toContainText("Bergenstal");
  await expect(main).toContainText("±0.5");
  await expect(main).toContainText("not a data error");
  await expect(main).toContainText("cannot replace a laboratory A1C");

  const panelText = await page.locator(".gmi-panel").textContent();
  expect(panelText).not.toMatch(/\d(\.\d+)?\s*%/);

  const faqEntries = page.locator(".faq-list details");
  await expect(faqEntries).toHaveCount(4);
  await faqEntries.first().locator("summary").click();
  await expect(faqEntries.first().locator("p")).toBeVisible();
});

// Ticket 11 (Spec §8 T4-2 / T3-④ runtime mirror): the GI page's static
// content — the 27-row reference table from giData.selectStaticTable, the
// honest provenance note (category-level DiOGenes assignments, not
// individually measured), the GI vs GL section, and the FAQ — is served in
// the prerendered HTML with JavaScript disabled. The prerendered result panel
// must show only the placeholder (no selection can exist without JS), and the
// static table must never contain the §6.1 "N/A" display string (every row is
// an eligible measurable-carbs entry).
test("gi page shows static table, provenance note, GI vs GL copy, and FAQ without JavaScript", async ({
  page,
}) => {
  await page.goto("/glycemic-index-calculator");
  const main = page.locator("main");

  const rows = page.locator(".gi-static-table tbody tr");
  await expect(rows).toHaveCount(27);
  const table = page.locator(".gi-static-table");
  await expect(table).toContainText("Rye bread");
  await expect(table).toContainText("89");
  expect(await table.textContent()).not.toContain("N/A");

  await expect(main).toContainText("DiOGenes");
  await expect(main).toContainText("category-level");
  await expect(main).toContainText("not individually measured");
  await expect(main).toContainText("Glycemic index vs glycemic load");

  await expect(page.locator(".gi-result-panel .result-card__placeholder")).toBeVisible();

  const faqEntries = page.locator(".faq-list details");
  await expect(faqEntries).toHaveCount(4);
  await faqEntries.first().locator("summary").click();
  await expect(faqEntries.first().locator("p")).toBeVisible();
});

// Ticket 12 (Spec §8 T4-2 / T3-④ runtime mirror): the GL page's static
// content — the 27-row serving-level GL reference table (from
// src/data/glStaticTable.js, computed at build time), the band boundary copy
// (GL ≤ 10 / ≥ 20), the "glycaemic" British spelling, and the DiOGenes
// provenance — is served in the prerendered HTML with JavaScript disabled.
// The §6.1 "N/A" display string must never appear inside the table (every
// row is an eligible, measurable-carbs entry by construction).
test("gl page shows static GL table, band copy, and glycaemic spelling without JavaScript", async ({
  page,
}) => {
  await page.goto("/glycemic-load-calculator");
  const body = page.locator("body");

  const rows = page.locator(".gl-static-table tbody tr");
  await expect(rows).toHaveCount(27);
  const table = page.locator(".gl-static-table");
  await expect(table).toContainText("Rye bread");
  await expect(table).toContainText("12.5");
  await expect(table).toContainText("1 slice (30 g)");
  expect(await table.textContent()).not.toContain("N/A");
  expect(await table.textContent()).not.toContain("Egg");

  await expect(body).toContainText("GL ≤ 10");
  await expect(body).toContainText("GL ≥ 20");
  await expect(body).toContainText("glycaemic");
  await expect(body).toContainText("DiOGenes");
  await expect(body).toContainText("How to lower the glycemic load of a meal");

  // The FAQ (including the ticket 12 band question) is native <details>.
  const faqEntries = page.locator(".faq-list details");
  await expect(faqEntries).toHaveCount(5);
  await expect(faqEntries.last().locator("summary")).toContainText(
    "What counts as a low, medium, or high glycemic load?",
  );
});

// Ticket 13 (Spec §8 T4-2 / T3-⑨ runtime mirror): the /about page's full
// static content — honest DiOGenes/Aston data provenance (category-level
// archived data + Atkinson 2021 upgrade path), formula citations (Nathan
// 2008 / Bergenstal 2018 / 18.018), the MIT upstream attribution with a real
// link to assafmo/glcalc.com, the maintainer fallback + GitHub Issues contact
// link, the medical-review status, and the full disclaimer paragraph — is
// served in the prerendered HTML and visible with JavaScript disabled
// (file-level test.use({ javaScriptEnabled: false }) above applies).
test("about page shows data provenance, formula sources, MIT attribution, and contact link without JavaScript", async ({
  page,
}) => {
  await page.goto("/about");
  const main = page.locator("main");

  // Data provenance (honest framing).
  await expect(main).toContainText("DiOGenes");
  await expect(main).toContainText("Aston");
  await expect(main).toContainText("category-level");
  await expect(main).toContainText("no longer maintained");
  await expect(main).toContainText("Atkinson");

  // Formula citations.
  await expect(main).toContainText("Nathan");
  await expect(main).toContainText("Bergenstal");
  await expect(main).toContainText("18.018");

  // MIT upstream attribution with a real link.
  await expect(main).toContainText("MIT License");
  await expect(main).toContainText("Assaf Morami");
  await expect(
    main.locator('a[href="https://github.com/assafmo/glcalc.com"]'),
  ).toBeVisible();

  // Maintainer fallback + contact entry point (Spec §4 P0-3).
  await expect(main).toContainText(`Maintained by the ${BRAND} project`);
  await expect(
    main.locator('a[href="https://github.com/TigerVanguard/glcalc.com/issues"]'),
  ).toBeVisible();

  // Medical review status (consistent with footer item ③) + disclaimer.
  await expect(main).toContainText(
    "This tool has not been reviewed by a medical professional.",
  );
  await expect(main).toContainText("NGSP-certified");
});

// Shareable-assets BL-04 (Spec §4 BL-04 / red line 5): the chart page's
// citable content — the 27-row three-tier GL table, the tier column headers,
// the band copy, the "How to cite this table" block, and the honest DiOGenes
// provenance — is all plain prerendered HTML, fully readable with JavaScript
// disabled (only the CSV download button needs JS; it is tested in the app
// project, tests/e2e/gl-chart-app.spec.js).
test("chart page shows the 27-row three-tier GL table and cite block without JavaScript", async ({
  page,
}) => {
  await page.goto("/glycemic-load-chart");
  await expect(page.locator("h1")).toHaveText("Glycemic Load Chart: 27 Common Foods");

  const rows = page.locator(".gl-chart-table tbody tr");
  await expect(rows).toHaveCount(27);

  const headerRow = page.locator(".gl-chart-table thead tr");
  await expect(headerRow).toContainText("GL (50 g)");
  await expect(headerRow).toContainText("GL (100 g)");
  await expect(headerRow).toContainText("GL (typical serving)");

  const table = page.locator(".gl-chart-table");
  await expect(table).toContainText("Rye bread");
  await expect(table).toContainText("20.9 (High)");
  await expect(table).toContainText("12.5 (Medium)");
  expect(await table.textContent()).not.toContain("N/A");

  const body = page.locator("body");
  await expect(body).toContainText("How to cite this table");
  await expect(body).toContainText("DiOGenes");
  await expect(body).toContainText("category-level");
});

test("unknown path returns HTTP 404, not a soft-404 shell", async ({ request }) => {
  const response = await request.get("/no-such-page");
  expect(response.status()).toBe(404);
});

test("trailing-slash URL redirects to the no-trailing-slash URL", async ({ request }) => {
  // Local emulation of vercel.json trailingSlash:false (Vercel returns 308).
  const response = await request.get("/about/", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers()["location"]).toBe("/about");
});
