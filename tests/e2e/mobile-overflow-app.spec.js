// Mobile horizontal overflow e2e for the interactive states (app project,
// content-ux batch CU-04). The prerendered pages are covered by
// mobile-overflow-prerender.spec.js; this file covers what only exists after
// user input: search results and a selected food on the GL calculator and
// the GI page, at 390×844, 360×740 and 320×568.
//
// "Aubergine/brinjal/eggplant. raw" carries the widest unbreakable word of
// all 4893 gi.json names (27 characters); in the GL result heading (360 px)
// and the "Current selection" heading (320 px) it is wider than the screen
// unless the heading may break it.

import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 360, height: 740 },
  { width: 320, height: 568 },
];
const LONGEST_WORD_FOOD = "Aubergine/brinjal/eggplant. raw";

async function expectNoSidewaysScroll(page, state) {
  const metrics = await page.evaluate(async () => {
    await document.fonts.ready;
    return { innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth };
  });
  expect(metrics.scrollWidth, `${state}: page width`).toBeLessThanOrEqual(metrics.innerWidth);
}

for (const viewport of VIEWPORTS) {
  test.describe(`at ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });

    test("GL calculator: search results and a selected food never scroll sideways", async ({ page }) => {
      await page.goto("/glycemic-load-calculator");
      await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
      await expect(page.getByRole("list", { name: "Food search results" })).toBeVisible();
      await expectNoSidewaysScroll(page, "search results");

      await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();
      await expect(page.getByRole("region", { name: "Selected food summary" })).toBeVisible();
      await expectNoSidewaysScroll(page, "Blueberries selected");
    });

    test("GL calculator: the longest food name wraps in the result and selection headings", async ({
      page,
    }) => {
      await page.goto(`/glycemic-load-calculator?food=${encodeURIComponent(LONGEST_WORD_FOOD)}`);
      await expect(page.locator("#results-heading")).toHaveText(LONGEST_WORD_FOOD);
      await expect(page.locator(".selected-food-summary h2")).toHaveText(LONGEST_WORD_FOOD);
      await expectNoSidewaysScroll(page, `${LONGEST_WORD_FOOD} selected`);
    });

    test("GI page: search results and a selected food never scroll sideways", async ({ page }) => {
      await page.goto("/glycemic-index-calculator");
      await page.getByRole("searchbox", { name: "Food" }).fill("banana");
      await expect(page.getByRole("list", { name: "Food search results" })).toBeVisible();
      await expectNoSidewaysScroll(page, "search results");

      await page.getByRole("button", { name: "Banana GI 52 - Low", exact: true }).click();
      await expect(page.locator(".gi-result-card")).toContainText("GI 52");
      await expectNoSidewaysScroll(page, "Banana selected");
    });
  });
}
