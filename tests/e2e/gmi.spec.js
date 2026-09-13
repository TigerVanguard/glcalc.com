// GMI calculator e2e (app project, Spec §8 T4-1, ticket 10).
//
// Golden DISPLAY values derive from formulas.gmi (3.31 + 0.02392 × mg/dL,
// unrounded) rendered by display.formatGmi (1 decimal, half-up, ×10 value
// snapped to 12 significant digits before rounding):
//   150 mg/dL          → 6.898              → "6.9%"  (§8 T1 golden value)
//   154 mg/dL          → 6.9936799999999995 → "7.0%"  (carry across 7)
//   8.3 mmol/L = 8.3 × 18.018 = 149.5494 mg/dL
//                      → 6.887221648        → "6.9%"
//     — the discriminator that mmol input really flows through mmolToMgdl
//     BEFORE gmi(): feeding 8.3 straight into the formula would print "3.5%".
//   700 mg/dL          → 20.054             → "20.1%" (warned, not blocked)
// tests/unit/display.test.js anchors the same derivations at unit level.
//
// Red lines under test (Spec §1 D4 / §5 gmi row): the out-of-sensor-range
// warning never blocks the result, and inputs are never written to the URL.

import { test, expect } from "@playwright/test";

const ROUTE = "/gmi-calculator";

function glucoseField(page) {
  return page.getByRole("textbox", { name: "CGM average glucose" });
}

function gmiCard(page) {
  return page.locator(".result-card", { hasText: "Glucose Management Indicator" });
}

function unitButton(page, label) {
  return page.locator(".unit-toggle").getByRole("button", { name: label });
}

test("typing 150 mg/dL shows the golden GMI 6.9% and the mmol/L echo", async ({ page }) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("150");
  await expect(gmiCard(page)).toContainText("6.9%");
  // Side-by-side echo of the input in the other unit: 150 / 18.018 =
  // 8.3250… → formatMmol → "8.3 mmol/L".
  await expect(page.locator(".gmi-echo")).toContainText("8.3 mmol/L");
  await expect(page.locator(".notice--error")).toHaveCount(0);
  await expect(page.locator(".notice--warning")).toHaveCount(0);

  // URL discipline (Spec §5A.1-5): typing never writes the input to the URL.
  expect(new URL(page.url()).search).toBe("");
  expect(new URL(page.url()).pathname).toBe(ROUTE);
});

test("typing 154 mg/dL rounds 6.99368 up to 7.0% (half-up carry)", async ({ page }) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("154");
  await expect(gmiCard(page)).toContainText("7.0%");
});

test("mmol/L mode: 8.3 converts to 149.5494 mg/dL before the formula (GMI 6.9%)", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await unitButton(page, "mmol/L").click();
  await glucoseField(page).fill("8.3");
  // 8.3 × 18.018 = 149.5494 → gmi = 6.887221648 → "6.9%". A page that fed
  // 8.3 straight into the formula would show "3.5%" instead.
  await expect(gmiCard(page)).toContainText("6.9%");
  await expect(gmiCard(page)).not.toContainText("3.5%");
  // Echo in the other unit: round(149.5494) → "150 mg/dL".
  await expect(page.locator(".gmi-echo")).toContainText("150 mg/dL");
});

test("out-of-sensor-range input (700 mg/dL) warns but still shows the GMI", async ({ page }) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("700");
  await expect(page.locator(".notice--warning")).toBeVisible();
  await expect(page.locator(".notice--warning")).toContainText("Outside the CGM sensor range");
  // gmi(700) = 20.054 → "20.1%": warned, never blocked.
  await expect(gmiCard(page)).toContainText("20.1%");
});

test("unit toggle converts the typed value both ways", async ({ page }) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("150");
  await expect(gmiCard(page)).toContainText("6.9%");

  // 150 mg/dL → mmol display precision "8.3"; the converted text becomes the
  // new source of truth (8.3 mmol/L = 149.5494 mg/dL → still "6.9%").
  await unitButton(page, "mmol/L").click();
  await expect(glucoseField(page)).toHaveValue("8.3");
  await expect(gmiCard(page)).toContainText("6.9%");

  // Back to mg/dL: round(8.3 × 18.018) = round(149.5494) → "150".
  await unitButton(page, "mg/dL").click();
  await expect(glucoseField(page)).toHaveValue("150");
  await expect(gmiCard(page)).toContainText("6.9%");
});

test("invalid input shows an error and clears the GMI card", async ({ page }) => {
  await page.goto(ROUTE);

  // Prime a valid result first so "clears" is actually observable.
  await glucoseField(page).fill("150");
  await expect(gmiCard(page)).toContainText("6.9%");

  await glucoseField(page).fill("-150");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(gmiCard(page)).not.toContainText("6.9%");
  await expect(gmiCard(page)).toContainText("Enter your CGM average");
  await expect(page.locator(".gmi-echo")).toHaveCount(0);

  await glucoseField(page).fill("abc");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(gmiCard(page)).toContainText("Enter your CGM average");
});

test("empty input shows the placeholder and never NaN or 0", async ({ page }) => {
  await page.goto(ROUTE);

  await expect(gmiCard(page)).toContainText("Enter your CGM average");
  expect(await page.locator("main").textContent()).not.toContain("NaN");

  await glucoseField(page).fill("150");
  await expect(gmiCard(page)).toContainText("6.9%");
  await glucoseField(page).fill("");
  await expect(page.locator(".notice--error")).toHaveCount(0);
  await expect(gmiCard(page)).toContainText("Enter your CGM average");
  expect(await page.locator("main").textContent()).not.toContain("NaN");
});
