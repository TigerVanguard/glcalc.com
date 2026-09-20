// Chart-page CSV download e2e (app project, shareable-assets BL-04 / D7 / D8).
//
// FILENAME NOTE: playwright.config.js routes the app project by
// testMatch /(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/ — this file
// deliberately ends in "app.spec.js" so it lands in the app project without
// touching the config (same convention as share-converter.spec.js). The
// download needs JavaScript, so it cannot run in the JS-off static project;
// the chart page's static content is asserted in prerender.spec.js instead.
//
// Contract under test: clicking "Download CSV" downloads a file named
// glucomath-gl-chart.csv, generated client-side from the single data module
// (no static CSV asset exists in the build).

import { test, expect } from "@playwright/test";

test("chart page CSV button downloads glucomath-gl-chart.csv", async ({ page }) => {
  await page.goto("/glycemic-load-chart");

  const button = page.getByRole("button", { name: "Download CSV" });
  await expect(button).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await button.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("glucomath-gl-chart.csv");
});
