// Glucose→A1C estimator e2e (app project, Spec §8 T4-1, ticket 09).
//
// Golden DISPLAY values derive from formulas.a1cRange (center (eAG+46.7)/28.7,
// half-width 15.7/28.7 UNROUNDED, endpoints each rounded half-up to 0.1%)
// joined by display.js formatA1cRange:
//   126 mg/dL          → center 6.0174 → [5.4703, 6.5644] → "≈ 5.5% – 6.6%"
//   7.0 mmol/L = 126.126 mg/dL
//                      → center 6.0218 → [5.4748, 6.5689] → "≈ 5.5% – 6.6%"
//   50 mg/dL (out of range, < eag(4) = 68.1)
//                      → center 3.3693 → [2.8223, 3.9164] → "≈ 2.8% – 3.9%"
//   180 mg/dL          → center 7.8990 → [7.3519, 8.4460] → "≈ 7.4% – 8.4%"
//   10.0 mmol/L = 180.18 mg/dL
//                      → center 7.9052 → [7.3582, 8.4523] → "≈ 7.4% – 8.5%"
// The 180 vs 10.0-mmol pair is the discriminator that mmol input really flows
// through mmolToMgdl before a1cRange. tests/unit/display.test.js anchors the
// same derivations at unit level.
//
// Red lines under test (Spec §1 D4 / §5 estimator row): the result is ALWAYS
// a range — no result node may ever hold a single-point percentage.

import { test, expect } from "@playwright/test";

const ROUTE = "/glucose-to-a1c-estimator";
const RANGE_SHAPE = /^≈ \d+\.\d% – \d+\.\d%$/;

function glucoseField(page) {
  // getByLabel would be ambiguous here: the panel/FAQ <section>s carry
  // aria-labelledby headings that also contain "average glucose", so target
  // the textbox role explicitly.
  return page.getByRole("textbox", { name: "Average glucose" });
}

function rangeCard(page) {
  return page.locator(".result-card", { hasText: "Estimated A1C range" });
}

function unitButton(page, label) {
  return page.locator(".unit-toggle").getByRole("button", { name: label });
}

test("typing 126 mg/dL shows the golden range ≈ 5.5% – 6.6%", async ({ page }) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("126");
  await expect(rangeCard(page)).toContainText("≈ 5.5% – 6.6%");
  await expect(page.locator(".notice--error")).toHaveCount(0);
  await expect(page.locator(".notice--warning")).toHaveCount(0);

  // URL discipline (Spec §5A.1-5): typing never writes the input to the URL.
  expect(new URL(page.url()).search).toBe("");
  expect(new URL(page.url()).pathname).toBe(ROUTE);
});

test("switching to mmol/L and typing 7.0 gives the 126.126 mg/dL range", async ({ page }) => {
  await page.goto(ROUTE);

  await unitButton(page, "mmol/L").click();
  await glucoseField(page).fill("7.0");
  await expect(rangeCard(page)).toContainText("≈ 5.5% – 6.6%");
  await expect(page.locator(".notice--warning")).toHaveCount(0);
});

test("no single-point output: the only result value node matches the range shape", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("126");
  const values = page.locator(".estimator-panel .stat__value");
  await expect(values).toHaveCount(1);
  expect((await values.first().textContent()).trim()).toMatch(RANGE_SHAPE);

  // Every node in the result area that mentions a percentage must be a range
  // (contain the en dash) — a lone "6.0%" style point value must not exist.
  const percentNodes = page.locator(".estimator-panel .stat__value", { hasText: "%" });
  for (const text of await percentNodes.allTextContents()) {
    expect(text).toContain("–");
  }
});

test("out-of-range input (50 mg/dL) still shows the range plus the ADAG warning", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("50");
  await expect(page.locator(".notice--warning")).toBeVisible();
  await expect(page.locator(".notice--warning")).toContainText("Outside the ADAG reliable range");
  await expect(rangeCard(page)).toContainText("≈ 2.8% – 3.9%");
});

test("unit toggle converts the typed value both ways (first UnitToggle coverage)", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("180");
  await expect(rangeCard(page)).toContainText("≈ 7.4% – 8.4%");

  // 180 mg/dL → mmol display precision: 180 / 18.018 = 9.9900… → "10.0"; the
  // converted text becomes the new source of truth, so the range recomputes
  // from 10.0 mmol/L = 180.18 mg/dL — high endpoint moves 8.4 → 8.5, proving
  // real conversion (not a display-only unit swap).
  await unitButton(page, "mmol/L").click();
  await expect(glucoseField(page)).toHaveValue("10.0");
  await expect(rangeCard(page)).toContainText("≈ 7.4% – 8.5%");

  // Back to mg/dL: 10.0 × 18.018 = 180.18 → integer display "180".
  await unitButton(page, "mg/dL").click();
  await expect(glucoseField(page)).toHaveValue("180");
  await expect(rangeCard(page)).toContainText("≈ 7.4% – 8.4%");
});

test("invalid input shows an error and clears the range card", async ({ page }) => {
  await page.goto(ROUTE);

  // Prime a valid result first so "clears" is actually observable.
  await glucoseField(page).fill("126");
  await expect(rangeCard(page)).toContainText("≈ 5.5% – 6.6%");

  await glucoseField(page).fill("-50");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(rangeCard(page)).not.toContainText("5.5%");
  await expect(rangeCard(page)).toContainText("Enter an average glucose");

  await glucoseField(page).fill("abc");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(rangeCard(page)).toContainText("Enter an average glucose");
});

test("empty input shows the placeholder and never NaN or 0", async ({ page }) => {
  await page.goto(ROUTE);

  await expect(rangeCard(page)).toContainText("Enter an average glucose");
  expect(await page.locator("main").textContent()).not.toContain("NaN");

  await glucoseField(page).fill("126");
  await expect(rangeCard(page)).toContainText("≈ 5.5% – 6.6%");
  await glucoseField(page).fill("");
  await expect(page.locator(".notice--error")).toHaveCount(0);
  await expect(rangeCard(page)).toContainText("Enter an average glucose");
  expect(await page.locator("main").textContent()).not.toContain("NaN");
});
