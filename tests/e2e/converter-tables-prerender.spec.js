// Converter conversion tables e2e (static project, content-ux batch CU-02).
//
// FILENAME NOTE: playwright.config.js routes the static project by
// testMatch /(prerender|seo)\.spec\.js/ — this file ends in
// "prerender.spec.js" so it runs against the built dist/ without touching the
// config, and does not match the app project's pattern.
//
// JavaScript DISABLED (what crawlers get): both tables are visible with the
// right row counts under their H3 headings, and the intro's plain
// <a href="#conversion-charts"> jumps to them natively.

import { test, expect } from "@playwright/test";

const ROUTE = "/blood-sugar-converter";

test.use({ javaScriptEnabled: false });

function rowFor(table, page, label) {
  return table
    .locator("tbody tr")
    .filter({ has: page.locator('th[scope="row"]', { hasText: new RegExp(`^${label.replace(".", "\\.")}$`) }) });
}

test("both conversion tables are visible with 29 and 27 rows", async ({ page }) => {
  await page.goto(ROUTE);

  await expect(page.locator(".conversion-table")).toHaveCount(2);
  const forward = page.locator(".conversion-table").nth(0);
  const reverse = page.locator(".conversion-table").nth(1);

  await expect(page.locator("#conversion-charts")).toHaveText(
    "Common blood sugar values: mg/dL to mmol/L",
  );
  await expect(page.locator(".converter-guide h3").nth(1)).toHaveText(
    "Common blood sugar values: mmol/L to mg/dL",
  );

  await expect(forward).toBeVisible();
  await expect(forward.locator("thead th")).toHaveText(["mg/dL", "mmol/L"]);
  const forwardRows = forward.locator("tbody tr");
  await expect(forwardRows).toHaveCount(29);
  await expect(forwardRows.first()).toBeVisible();
  await expect(forwardRows.last()).toBeVisible();
  await expect(forwardRows.first().locator("th")).toHaveText("40");
  await expect(forwardRows.last().locator("th")).toHaveText("600");
  await expect(rowFor(forward, page, "250").locator("td")).toHaveText("13.9");

  await expect(reverse).toBeVisible();
  await expect(reverse.locator("thead th")).toHaveText(["mmol/L", "mg/dL"]);
  const reverseRows = reverse.locator("tbody tr");
  await expect(reverseRows).toHaveCount(27);
  await expect(reverseRows.first()).toBeVisible();
  await expect(reverseRows.last()).toBeVisible();
  await expect(reverseRows.first().locator("th")).toHaveText("2.0");
  await expect(reverseRows.last().locator("th")).toHaveText("30.0");
  await expect(rowFor(reverse, page, "11.0").locator("td")).toHaveText("198");
});

test("the intro's #conversion-charts link jumps to the tables natively", async ({ page }) => {
  await page.goto(ROUTE);
  const link = page.locator('.tool-page__header a[href="#conversion-charts"]');
  await expect(link).toHaveText("Jump to the conversion charts");
  await expect(page.locator("#conversion-charts")).not.toBeInViewport();
  await link.click();
  await expect(page).toHaveURL(/\/blood-sugar-converter#conversion-charts$/);
  await expect(page.locator("#conversion-charts")).toBeInViewport();
});
