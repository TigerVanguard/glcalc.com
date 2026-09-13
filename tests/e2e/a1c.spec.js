// A1C→eAG e2e (app project, Spec §8 T4-1, ticket 08).
//
// Golden DISPLAY values derive from formulas.js raw values passed through
// src/lib/display.js formatEag (1 decimal, half-up, float-noise snapped):
//   eag(7.0)     = 154.2              → "154.2"   eagMmol(7.0) = 8.54  → "8.5"
//   eag(6.5)     = 139.84999999999997 → "139.9"   (half-up; naive rounding
//                                                  would misprint "139.8")
//   eag(3.5)     = 53.75              → "53.8"    eagMmol(3.5) = 2.975 → "3.0"
//   eag(6.0)     = 125.5              → "125.5"
// tests/unit/display.test.js anchors the same derivations at unit level.
//
// The D4 red-line test (Spec §1): input 6.0 falls in the ADA "prediabetes"
// band — the page must NOT say so anywhere in the calculator panel, and the
// static reference table must not change in any way in response to input.

import { test, expect } from "@playwright/test";

const ROUTE = "/a1c-to-eag-calculator";

function a1cField(page) {
  return page.getByLabel("A1C (%)");
}

function mgdlCard(page) {
  return page.locator(".result-card", { hasText: "eAG in mg/dL" });
}

function mmolCard(page) {
  return page.locator(".result-card", { hasText: "eAG in mmol/L" });
}

test("typing 7.0 shows both eAG units with the display-rounded golden values", async ({ page }) => {
  await page.goto(ROUTE);

  await a1cField(page).fill("7.0");
  await expect(mgdlCard(page)).toContainText("154.2 mg/dL");
  await expect(mmolCard(page)).toContainText("8.5 mmol/L");
  await expect(page.locator(".notice--error")).toHaveCount(0);
  await expect(page.locator(".notice--warning")).toHaveCount(0);
});

test("typing 6.5 shows 139.9 mg/dL (half-up of raw 139.85, not the 139.8 float trap)", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await a1cField(page).fill("6.5");
  await expect(mgdlCard(page)).toContainText("139.9 mg/dL");
});

test("A1C below the ADAG range still calculates but shows the out-of-range warning", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await a1cField(page).fill("3.5");
  await expect(page.locator(".notice--warning")).toBeVisible();
  await expect(page.locator(".notice--warning")).toContainText("Outside the ADAG reliable range");
  await expect(mgdlCard(page)).toContainText("53.8 mg/dL");
  await expect(mmolCard(page)).toContainText("3.0 mmol/L");
});

test("D4 red line: input in the ADA prediabetes band is never graded or highlighted", async ({
  page,
}) => {
  await page.goto(ROUTE);

  const refTable = page.locator(".a1c-reference-table");
  await expect(refTable).toBeVisible();
  const tableBefore = await refTable.innerHTML();

  // 6.0% falls inside the ADA 5.7–6.4% band.
  await a1cField(page).fill("6.0");
  await expect(mgdlCard(page)).toContainText("125.5 mg/dL");
  await expect(page.locator(".notice--warning")).toHaveCount(0);

  // The calculator panel (input + notices + result cards) must not attach any
  // diagnostic word to the user's result. "diabetes" is a substring of
  // "prediabetes", but all three are asserted explicitly per the ticket.
  const panelText = (await page.locator(".a1c-calculator-panel").textContent()).toLowerCase();
  expect(panelText).not.toContain("prediabetes");
  expect(panelText).not.toContain("diabetes");
  expect(panelText).not.toContain("normal");

  // The static reference table is byte-for-byte unchanged by the input: no
  // highlight class, no aria-current, no reactive marking of "your" band.
  expect(await refTable.innerHTML()).toBe(tableBefore);
  await expect(refTable.locator("[aria-current]")).toHaveCount(0);
  await expect(
    refTable.locator('[class*="active"], [class*="current"], [class*="highlight"]'),
  ).toHaveCount(0);
});

test("invalid input shows an error and clears both result cards", async ({ page }) => {
  await page.goto(ROUTE);

  // Prime a valid result first so "clears" is actually observable.
  await a1cField(page).fill("7.0");
  await expect(mgdlCard(page)).toContainText("154.2 mg/dL");

  await a1cField(page).fill("-5");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(mgdlCard(page)).not.toContainText("154.2");
  await expect(mgdlCard(page)).toContainText("Enter an A1C value");
  await expect(mmolCard(page)).toContainText("Enter an A1C value");

  await a1cField(page).fill("abc");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(mgdlCard(page)).toContainText("Enter an A1C value");
});

test("empty input shows placeholders and never NaN or 0", async ({ page }) => {
  await page.goto(ROUTE);

  await expect(mgdlCard(page)).toContainText("Enter an A1C value");
  expect(await page.locator("main").textContent()).not.toContain("NaN");

  await a1cField(page).fill("7.0");
  await expect(mgdlCard(page)).toContainText("154.2 mg/dL");
  await a1cField(page).fill("");
  await expect(page.locator(".notice--error")).toHaveCount(0);
  await expect(mgdlCard(page)).toContainText("Enter an A1C value");
  expect(await page.locator("main").textContent()).not.toContain("NaN");
});
