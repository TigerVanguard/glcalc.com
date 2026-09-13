// Static-project e2e (Spec §8 T4-2/T4-3, ticket 03).
// Runs against the dist/ static server (scripts/serve-dist.mjs, 404 mode) with
// JavaScript DISABLED: what these tests see is exactly what crawlers get.

import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", h1: "Glycemic Load Calculator" },
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
