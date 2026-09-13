// Blood sugar converter e2e (app project, Spec §8 T4-1, ticket 07).
//
// Golden DISPLAY values below derive from the formulas.js raw values passed
// through the display rounding defined in src/lib/display.js (mg/dL →
// Math.round integer; mmol/L → round half-up to 1 decimal, toFixed(1)):
//   mgdlToMmol(100)  = 5.5500555…  → "5.6"
//   mmolToMgdl(5.5)  = 99.099      → "99"
//   mgdlToMmol(1200) = 66.600066…  → "66.6"
// tests/unit/display.test.js anchors the same derivations at unit level.

import { test, expect } from "@playwright/test";

const ROUTE = "/blood-sugar-converter";

function mgdlField(page) {
  return page.getByLabel("Blood sugar in mg/dL");
}

function mmolField(page) {
  return page.getByLabel("Blood sugar in mmol/L");
}

function resultCard(page) {
  return page.locator(".result-card");
}

test("typing mg/dL updates the mmol/L side with the display-rounded value", async ({ page }) => {
  await page.goto(ROUTE);

  await mgdlField(page).fill("100");
  await expect(mmolField(page)).toHaveValue("5.6");
  await expect(resultCard(page)).toContainText("100 mg/dL = 5.6 mmol/L");
  await expect(page.locator(".notice--error")).toHaveCount(0);
  await expect(page.locator(".notice--warning")).toHaveCount(0);
});

test("typing mmol/L updates the mg/dL side with the display-rounded value", async ({ page }) => {
  await page.goto(ROUTE);

  await mmolField(page).fill("5.5");
  await expect(mgdlField(page)).toHaveValue("99");
  await expect(resultCard(page)).toContainText("99 mg/dL = 5.5 mmol/L");
});

test("invalid input shows an error and clears the derived side and result", async ({ page }) => {
  await page.goto(ROUTE);

  // Prime a valid conversion first so "clears" is actually observable.
  await mgdlField(page).fill("100");
  await expect(mmolField(page)).toHaveValue("5.6");

  await mgdlField(page).fill("-5");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(mmolField(page)).toHaveValue("");
  await expect(resultCard(page)).not.toContainText("mg/dL =");
  await expect(resultCard(page)).toContainText("Enter a blood sugar value");

  await mgdlField(page).fill("abc");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(mmolField(page)).toHaveValue("");
  await expect(resultCard(page)).not.toContainText("mg/dL =");
});

test("values above 1000 mg/dL warn without blocking the conversion", async ({ page }) => {
  await page.goto(ROUTE);

  await mgdlField(page).fill("1200");
  await expect(page.locator(".notice--warning")).toBeVisible();
  await expect(page.locator(".notice--warning")).toContainText("Outside the common range");
  await expect(mmolField(page)).toHaveValue("66.6");
  await expect(resultCard(page)).toContainText("1200 mg/dL = 66.6 mmol/L");
});

test("empty input shows placeholders and never NaN or 0", async ({ page }) => {
  await page.goto(ROUTE);

  // Pristine state: placeholder hint, no error, no NaN anywhere.
  await expect(resultCard(page)).toContainText("Enter a blood sugar value");
  expect(await page.locator("main").textContent()).not.toContain("NaN");

  // Clearing after a valid entry returns to the same empty state.
  await mgdlField(page).fill("100");
  await expect(mmolField(page)).toHaveValue("5.6");
  await mgdlField(page).fill("");
  await expect(mmolField(page)).toHaveValue("");
  await expect(page.locator(".notice--error")).toHaveCount(0);
  await expect(resultCard(page)).toContainText("Enter a blood sugar value");
  expect(await page.locator("main").textContent()).not.toContain("NaN");
});
