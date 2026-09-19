// A1C→eAG share-card e2e (app project, shareable-assets BL-03).
//
// FILENAME NOTE: playwright.config.js routes the app project by
// testMatch /(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/ — this file
// deliberately ends in "a1c.spec.js" so it lands in the app project without
// touching the config (same trick as share-gmi.spec.js). a1c.spec.js itself
// stays untouched (ticket red line).
//
// Contract under test (Spec BL-03 / D5 / D6):
// - a valid A1C makes "Download result card" appear below the result cards,
//   and clicking it downloads a PNG named glucomath-a1c-eag.png;
// - with no result (empty or invalid input) the button does not exist at all
//   (visibility is the page's job, not the button's).

import { test, expect } from "@playwright/test";

const ROUTE = "/a1c-to-eag-calculator";

function a1cField(page) {
  return page.getByLabel("A1C (%)");
}

function shareButton(page) {
  return page.getByRole("button", { name: "Download result card" });
}

test("valid A1C shows the share button and downloads glucomath-a1c-eag.png", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await a1cField(page).fill("7.0");
  await expect(shareButton(page)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await shareButton(page).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("glucomath-a1c-eag.png");
});

test("no result (empty or invalid input) → the share button does not exist", async ({
  page,
}) => {
  await page.goto(ROUTE);

  // Fresh page, empty input: no result, no button.
  await expect(shareButton(page)).toHaveCount(0);

  // Prime a valid result so the disappearance below is actually observable.
  await a1cField(page).fill("7.0");
  await expect(shareButton(page)).toBeVisible();

  // Invalid input (≤ 0) clears the result and must remove the button.
  await a1cField(page).fill("-5");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(shareButton(page)).toHaveCount(0);

  // Non-numeric input: still no button.
  await a1cField(page).fill("abc");
  await expect(shareButton(page)).toHaveCount(0);

  // Cleared back to empty: placeholder only, no button.
  await a1cField(page).fill("");
  await expect(shareButton(page)).toHaveCount(0);
});
