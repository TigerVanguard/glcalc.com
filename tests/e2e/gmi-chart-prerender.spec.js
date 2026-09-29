// GMI chart e2e (static project, GMI content spec GC-01 D3 / D4 / D5 / D8).
//
// FILENAME NOTE: playwright.config.js routes the static project by
// testMatch /(prerender|seo)\.spec\.js/ — this file ends in
// "prerender.spec.js" so it runs against the built dist/ without touching the
// config (same convention as route-split-prerender.spec.js).
//
// - JavaScript DISABLED (what crawlers get): the 30-row chart and its three
//   column headers are visible, the intro's plain <a href="#gmi-chart">
//   jumps to it natively, and the four new FAQ questions are visible.
// - JavaScript ENABLED at 390×844 (D8): no horizontal overflow with the empty
//   calculator, and again with a live result on screen.

import { test, expect } from "@playwright/test";

const ROUTE = "/gmi-calculator";

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the GMI chart shows 30 rows under three column headers", async ({ page }) => {
    await page.goto(ROUTE);
    const chart = page.locator("#gmi-chart");
    await expect(chart).toBeVisible();
    await expect(chart.locator("h2")).toHaveText(
      "GMI chart: the CGM average behind each GMI value",
    );
    await expect(chart.locator("thead th")).toHaveText([
      "GMI",
      "CGM mean glucose (mg/dL)",
      "CGM mean glucose (mmol/L)",
    ]);

    const rows = chart.locator("tbody tr");
    await expect(rows).toHaveCount(30);
    await expect(rows.first()).toBeVisible();
    await expect(rows.last()).toBeVisible();
    await expect(rows.first().locator("th")).toHaveText("5.5%");
    await expect(rows.last().locator("th")).toHaveText("10.0%");

    const row65 = rows.filter({ has: page.locator('th[scope="row"]', { hasText: /^6\.5%$/ }) });
    await expect(row65.locator("td")).toHaveText(["133", "7.4"]);
  });

  test("the intro's #gmi-chart link jumps to the chart natively", async ({ page }) => {
    await page.goto(ROUTE);
    const link = page.locator('.tool-page__header a[href="#gmi-chart"]');
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/gmi-calculator#gmi-chart$/);
    await expect(page.locator("#gmi-chart h2")).toBeInViewport();
  });

  test("the four intent questions are visible FAQ entries", async ({ page }) => {
    await page.goto(ROUTE);
    for (const question of [
      "What does GMI mean?",
      "Can I convert my GMI to an A1C?",
      "What average glucose does my GMI correspond to?",
      'Is there a "good" GMI number?',
    ]) {
      const summary = page.locator(".faq-list summary").filter({ hasText: question });
      await expect(summary, question).toHaveCount(1);
      await expect(summary, question).toBeVisible();
    }
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

  async function overflow(page) {
    return page.evaluate(async () => {
      await document.fonts.ready;
      const section = document.getElementById("gmi-chart");
      const table = section.querySelector("table");
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        tableRight: table.getBoundingClientRect().right,
        sectionRight: section.getBoundingClientRect().right,
      };
    });
  }

  test("the page never scrolls sideways, before and after a result", async ({ page }) => {
    await page.goto(ROUTE);

    const empty = await overflow(page);
    expect(empty.innerWidth).toBe(390);
    expect(empty.scrollWidth).toBeLessThanOrEqual(empty.innerWidth);
    expect(empty.tableRight).toBeLessThanOrEqual(empty.sectionRight);

    // A live result proves React owns the prerendered DOM (JS really ran),
    // and adds the result card, share and print buttons to the layout.
    await page.getByRole("textbox", { name: "CGM average glucose" }).fill("150");
    await expect(
      page.locator(".result-card", { hasText: "Glucose Management Indicator" }),
    ).toContainText("6.9%");

    const withResult = await overflow(page);
    expect(withResult.scrollWidth).toBeLessThanOrEqual(withResult.innerWidth);
    expect(withResult.tableRight).toBeLessThanOrEqual(withResult.sectionRight);
  });
});
