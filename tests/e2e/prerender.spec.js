// Static-project e2e (Spec §8 T4-2/T4-3, ticket 03).
// Runs against the dist/ static server (scripts/serve-dist.mjs, 404 mode) with
// JavaScript DISABLED: what these tests see is exactly what crawlers get.

import { test, expect } from "@playwright/test";

const BRAND = process.env.VITE_BRAND ?? "GL Calc";

const ROUTES = [
  { path: "/", h1: "Free Blood Sugar & Glycemic Calculators" },
  { path: "/glycemic-load-calculator", h1: "Glycemic Load Calculator" },
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
// via the header nav. JavaScript is disabled (file-level test.use above), so
// these are native <a href> navigations against the prerendered dist/.
for (const { path, h1 } of ROUTES.filter((route) => route.path !== "/")) {
  test(`home reaches ${path} by clicking a real link`, async ({ page }) => {
    await page.goto("/");
    const selector =
      path === "/about"
        ? `.site-nav a[href="${path}"]`
        : `.tool-cards a[href="${path}"]`;
    await page.locator(selector).click();
    await expect(page).toHaveURL(path);
    await expect(page.locator("h1")).toHaveText(h1);
  });
}

// Ticket 06 (Spec §7 / §8 T3-⑦ runtime mirror): the unified 5-item footer is
// present on all 8 pages.
test("all 8 pages render the unified disclaimer footer", async ({ page }) => {
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
