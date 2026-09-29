// Estimated A1C range chart e2e (static project, content-ux batch CU-03).
//
// FILENAME NOTE: playwright.config.js routes the static project by
// testMatch /(prerender|seo)\.spec\.js/ — this file ends in
// "prerender.spec.js" so it runs against the built dist/ without touching the
// config, and does not match the app project's pattern.
//
// - JavaScript DISABLED (what crawlers get): the 18-row chart and its three
//   column headers are visible outside the estimator panel, every A1C cell is
//   a range, and the intro's plain <a href="#estimator-chart"> jumps to it
//   natively.
// - 390×844, JavaScript off and on: no horizontal overflow, with the empty
//   estimator and again with a live result on screen.

import { test, expect } from "@playwright/test";

const ROUTE = "/glucose-to-a1c-estimator";
const RANGE_SHAPE = /^≈ \d+\.\d% – \d+\.\d%$/;

async function overflow(page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    const section = document.getElementById("estimator-chart");
    const table = section.querySelector("table");
    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      tableRight: table.getBoundingClientRect().right,
      sectionRight: section.getBoundingClientRect().right,
    };
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the range chart shows 18 rows under three column headers, every A1C cell a range", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const chart = page.locator("#estimator-chart");
    await expect(chart).toBeVisible();
    await expect(chart.locator("h2")).toHaveText(
      "Estimated A1C ranges for common average glucose levels",
    );
    await expect(chart.locator("thead th")).toHaveText([
      "Average glucose (mg/dL)",
      "Average glucose (mmol/L)",
      "Estimated A1C range",
    ]);

    const rows = chart.locator("tbody tr");
    await expect(rows).toHaveCount(18);
    await expect(rows.first()).toBeVisible();
    await expect(rows.last()).toBeVisible();
    await expect(rows.first().locator("th")).toHaveText("70");
    await expect(rows.last().locator("th")).toHaveText("240");

    const row160 = rows.filter({ has: page.locator('th[scope="row"]', { hasText: /^160$/ }) });
    await expect(row160.locator("td")).toHaveText(["8.9", "≈ 6.7% – 7.7%"]);

    const rangeCells = rows.locator("td:nth-child(3)");
    await expect(rangeCells).toHaveCount(18);
    for (const text of await rangeCells.allTextContents()) {
      expect(text.trim()).toMatch(RANGE_SHAPE);
    }

    await expect(page.locator(".estimator-panel table")).toHaveCount(0);
    await expect(page.locator(".estimator-panel #estimator-chart")).toHaveCount(0);
  });

  test("the intro's #estimator-chart link jumps to the chart natively", async ({ page }) => {
    await page.goto(ROUTE);
    const link = page.locator('.tool-page__header a[href="#estimator-chart"]');
    await expect(link).toHaveText("Jump to the estimated A1C range chart");
    await expect(page.locator("#estimator-chart h2")).not.toBeInViewport();
    await link.click();
    await expect(page).toHaveURL(/\/glucose-to-a1c-estimator#estimator-chart$/);
    await expect(page.locator("#estimator-chart h2")).toBeInViewport();
  });

  test.describe("at 390×844", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("the page never scrolls sideways", async ({ page }) => {
      await page.goto(ROUTE);
      const metrics = await overflow(page);
      expect(metrics.innerWidth).toBe(390);
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
      expect(metrics.tableRight).toBeLessThanOrEqual(metrics.sectionRight);
    });
  });
});

test.describe("with JavaScript at 390×844", () => {
  test.use({ javaScriptEnabled: true, viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    // Hermetic, same policy as scripts/prerender.mjs: only the local dist/
    // server; the analytics hosts in <head> are aborted.
    await page.route("**/*", (route) =>
      new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
    );
  });

  test("the page never scrolls sideways, before and after a result", async ({ page }) => {
    await page.goto(ROUTE);

    const empty = await overflow(page);
    expect(empty.innerWidth).toBe(390);
    expect(empty.scrollWidth).toBeLessThanOrEqual(empty.innerWidth);
    expect(empty.tableRight).toBeLessThanOrEqual(empty.sectionRight);

    // A live result proves React owns the prerendered DOM (JS really ran),
    // and adds the result card and share button to the layout.
    await page.getByRole("textbox", { name: "Average glucose" }).fill("126");
    await expect(
      page.locator(".result-card", { hasText: "Estimated A1C range" }),
    ).toContainText("≈ 5.5% – 6.6%");
    await expect(page.locator("#estimator-chart tbody tr")).toHaveCount(18);

    const withResult = await overflow(page);
    expect(withResult.scrollWidth).toBeLessThanOrEqual(withResult.innerWidth);
    expect(withResult.tableRight).toBeLessThanOrEqual(withResult.sectionRight);
  });
});
