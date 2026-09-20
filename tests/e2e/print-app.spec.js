// Print-report e2e (app project, shareable-assets BL-05 / SA-06).
//
// FILENAME NOTE: playwright.config.js routes the app project by
// testMatch /(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/ — this file
// deliberately ends in "app.spec.js" so it lands in the app project without
// touching the config (same convention as gl-chart-app.spec.js).
//
// Contract under test (Spec BL-05 / D2 / D8):
// - window.print is stubbed with a counter via addInitScript (a real print
//   dialog would hang the headless run); clicking a print button must call it
//   exactly once — the "PDF report" is native print-to-PDF, no PDF library;
// - the GMI button follows the share button's visibility contract: no valid
//   result → the button does not exist at all;
// - the chart page's button is static (the table is always printable).
// The @media print rules themselves are asserted on the BUILT artifact by
// scripts/verify-dist.mjs (this project runs on the dev server, where CSS is
// not bundled).

import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__printCalls = 0;
    window.print = () => {
      window.__printCalls += 1;
    };
  });
});

function printCalls(page) {
  return page.evaluate(() => window.__printCalls);
}

test("GMI page: valid average shows Print report, click calls window.print once", async ({
  page,
}) => {
  await page.goto("/gmi-calculator");

  await page.getByRole("textbox", { name: "CGM average glucose" }).fill("150");
  const button = page.getByRole("button", { name: "Print report" });
  await expect(button).toBeVisible();

  await button.click();
  expect(await printCalls(page)).toBe(1);
});

test("chart page: Print this chart calls window.print once", async ({ page }) => {
  await page.goto("/glycemic-load-chart");

  const button = page.getByRole("button", { name: "Print this chart" });
  await expect(button).toBeVisible();

  await button.click();
  expect(await printCalls(page)).toBe(1);
});

test("GMI page: no result (empty or invalid input) → Print report does not exist", async ({
  page,
}) => {
  await page.goto("/gmi-calculator");
  const field = page.getByRole("textbox", { name: "CGM average glucose" });
  const button = page.getByRole("button", { name: "Print report" });

  // Fresh page, empty input: no result, no button.
  await expect(button).toHaveCount(0);

  // Prime a valid result so the disappearance below is actually observable.
  await field.fill("150");
  await expect(button).toBeVisible();

  // Invalid input (≤ 0) clears the result and must remove the button.
  await field.fill("-150");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(button).toHaveCount(0);
});
