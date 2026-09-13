// GI lookup page e2e (app project, Spec §8 T4-1 / ticket 11).
//
// Golden values come straight from src/data/gi.json:
//   "Banana"                    → gi 52, carbs 19.4 → GI 52 + Low band
//   "Rye bread"                 → gi 89, carbs 47   → GI 89 + High band;
//     the space in the key also exercises the URL-ENCODED ?food= deep link
//     (encodeURIComponent("Rye bread") = "Rye%20bread")
//   "Egg. chicken. white. raw"  → gi 70 (ENCODED artifact), carbs 1.2 < 2.5
//     → §6.1 display rule: "GI: N/A (too little carbohydrate to measure) ·
//     GL ≈ 0", and the numeric 70 must never surface (regression anchor).
//
// URL discipline (Spec §5A.1-5): this page's own input never writes to the
// URL; the ONLY parameterized URL is the deep link TO the GL page.

import { test, expect } from "@playwright/test";

const ROUTE = "/glycemic-index-calculator";

function searchBox(page) {
  return page.getByRole("searchbox", { name: "Food" });
}

function resultPanel(page) {
  return page.locator(".gi-result-panel");
}

function glLink(page) {
  return page.locator(".gi-gl-link");
}

test("searching a staple shows GI value, band badge, and carbs per 100 g", async ({ page }) => {
  await page.goto(ROUTE);

  await searchBox(page).fill("banana");
  await page.getByRole("button", { name: "Banana GI 52 - Low", exact: true }).click();

  const panel = resultPanel(page);
  await expect(panel).toContainText("Banana");
  await expect(panel).toContainText("GI 52");
  await expect(panel.locator(".pill--low")).toHaveText("Low");
  await expect(panel).toContainText("Carbohydrates: 19.4 g per 100 g");
  // No serving/GL math on this page (GL is the other page's job).
  await expect(panel).not.toContainText("Estimated glycemic load");

  // URL discipline: neither typing nor selecting writes to the URL.
  expect(new URL(page.url()).search).toBe("");
  expect(new URL(page.url()).pathname).toBe(ROUTE);
});

test("high-GI food gets the High badge and an encoded GL deep link", async ({ page }) => {
  await page.goto(ROUTE);

  await searchBox(page).fill("rye bread");
  await page.getByRole("button", { name: "Rye bread GI 89 - High", exact: true }).click();

  const panel = resultPanel(page);
  await expect(panel).toContainText("GI 89");
  await expect(panel.locator(".pill--high")).toHaveText("High");
  await expect(panel).toContainText("Carbohydrates: 47 g per 100 g");

  // Deep link carries the URL-ENCODED gi.json key (ticket 05 ?food= prefill).
  await expect(glLink(page)).toHaveAttribute(
    "href",
    "/glycemic-load-calculator?food=Rye%20bread",
  );
});

test("clicking the deep link lands on the GL page with the food preselected", async ({ page }) => {
  await page.goto(ROUTE);

  await searchBox(page).fill("rye bread");
  await page.getByRole("button", { name: "Rye bread GI 89 - High", exact: true }).click();
  await glLink(page).click();

  // Cross-page assertion: the GL page reads ?food= and preselects the food
  // exactly as if it had been searched and confirmed there.
  await expect(page).toHaveURL("/glycemic-load-calculator?food=Rye%20bread");
  const summary = page.getByRole("region", { name: "Selected food summary" });
  await expect(summary).toContainText("Rye bread");
  await expect(summary).toContainText("Shared link");
  await expect(
    page.locator(".panel--results").getByRole("heading", { name: "Rye bread", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".panel--results").getByText("Estimated glycemic load", { exact: true }),
  ).toBeVisible();
});

test("egg white shows GI: N/A with no numeric 70 anywhere in the result", async ({ page }) => {
  await page.goto(ROUTE);

  await searchBox(page).fill("egg. chicken. white");
  // §6.1 rule applies to the dropdown too: the pill reads "GI: N/A", never
  // the encoded "GI 70 - High".
  const resultButton = page.getByRole("button", {
    name: "Egg. chicken. white. raw GI: N/A",
    exact: true,
  });
  await expect(resultButton).toBeVisible();
  await resultButton.click();

  const panel = resultPanel(page);
  await expect(panel).toContainText(
    "GI: N/A (too little carbohydrate to measure) · GL ≈ 0",
  );
  await expect(panel).toContainText("Carbohydrates: 1.2 g per 100 g");
  // Regression anchor (Spec §6 / ticket 02): the encoded GI 70 never surfaces.
  expect(await panel.textContent()).not.toContain("70");
  await expect(panel.locator(".pill--low")).toHaveCount(0);
  await expect(panel.locator(".pill--medium")).toHaveCount(0);
  await expect(panel.locator(".pill--high")).toHaveCount(0);

  // The deep link still works for N/A foods (the GL page shows its own math).
  await expect(glLink(page)).toHaveAttribute(
    "href",
    "/glycemic-load-calculator?food=Egg.%20chicken.%20white.%20raw",
  );
});

test("no-match and cleared searches behave sanely and never write the URL", async ({ page }) => {
  await page.goto(ROUTE);

  const meta = page.locator(".panel--search .search-meta");
  const placeholder = page.locator(".gi-result-panel .result-card__placeholder");

  // Empty state: placeholder result panel, no results list, no matches label.
  await expect(placeholder).toBeVisible();
  await expect(meta).toHaveText("No matches yet");

  // Gibberish query: worker responds with zero results.
  await searchBox(page).fill("zzzz-no-such-food-zzzz");
  await expect(meta).toHaveText("No matches yet");
  await expect(page.getByRole("list", { name: "Food search results" })).toBeHidden();
  await expect(placeholder).toBeVisible();

  // Clearing the query returns to the idle state.
  await searchBox(page).fill("");
  await expect(meta).toHaveText("No matches yet");
  await expect(page.getByRole("list", { name: "Food search results" })).toBeHidden();

  expect(new URL(page.url()).search).toBe("");
});
