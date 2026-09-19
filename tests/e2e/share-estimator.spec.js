// Glucose→A1C estimator share-card e2e (app project, shareable-assets BL-03).
//
// FILENAME NOTE: playwright.config.js routes the app project by
// testMatch /(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/ — this file
// deliberately ends in "estimator.spec.js" so it lands in the app project
// without touching the config (same trick as share-gmi.spec.js).
// estimator.spec.js itself stays untouched (ticket red line).
//
// Contract under test (Spec BL-03 / red line D5):
// - a valid average makes "Download result card" appear, and clicking it
//   downloads a PNG named glucomath-a1c-estimate.png;
// - the range string handed to the card (exposed as data-share-range on the
//   button's wrapper by GlucoseToA1cPage) is EXACTLY the on-screen range —
//   it contains the range connector (en dash), never a single-point value,
//   and never a diagnostic band word (normal/prediabetes/diabetes);
// - with no result the button does not exist at all.

import { test, expect } from "@playwright/test";

const ROUTE = "/glucose-to-a1c-estimator";

function glucoseField(page) {
  // Same disambiguation as estimator.spec.js: getByLabel would also match
  // the section headings, so target the textbox role explicitly.
  return page.getByRole("textbox", { name: "Average glucose" });
}

function shareButton(page) {
  return page.getByRole("button", { name: "Download result card" });
}

test("valid average shows the share button and downloads glucomath-a1c-estimate.png", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("126");
  await expect(shareButton(page)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await shareButton(page).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("glucomath-a1c-estimate.png");
});

test("D5 red line: the range text handed to the card is the on-screen range, never a point value or band word", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("126");

  // The wrapper exposes the exact string passed into the card spec.
  const wrapper = page.locator("[data-share-range]");
  await expect(wrapper).toHaveCount(1);
  const cardRange = await wrapper.getAttribute("data-share-range");

  // It is a range: connector (en dash) present, and it matches the range
  // shape rather than a lone percentage.
  expect(cardRange).toContain("–");
  expect(cardRange).toMatch(/^≈ \d+\.\d% – \d+\.\d%$/);

  // Character-for-character identical to the range displayed on the page.
  const onScreen = (
    await page
      .locator(".estimator-panel .stat__value")
      .first()
      .textContent()
  ).trim();
  expect(cardRange).toBe(onScreen);

  // No diagnostic band word anywhere in the card's range text ("diabetes" is
  // a substring of "prediabetes", but all three are asserted explicitly).
  const lower = cardRange.toLowerCase();
  expect(lower).not.toContain("normal");
  expect(lower).not.toContain("prediabetes");
  expect(lower).not.toContain("diabetes");
});

test("no result (empty or invalid input) → the share button does not exist", async ({
  page,
}) => {
  await page.goto(ROUTE);

  // Fresh page, empty input: no result, no button.
  await expect(shareButton(page)).toHaveCount(0);

  // Prime a valid result so the disappearance below is actually observable.
  await glucoseField(page).fill("126");
  await expect(shareButton(page)).toBeVisible();

  // Invalid input (≤ 0) clears the result and must remove the button.
  await glucoseField(page).fill("-50");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(shareButton(page)).toHaveCount(0);

  // Non-numeric input: still no button.
  await glucoseField(page).fill("abc");
  await expect(shareButton(page)).toHaveCount(0);

  // Cleared back to empty: placeholder only, no button.
  await glucoseField(page).fill("");
  await expect(shareButton(page)).toHaveCount(0);
});
