// GMI share-card e2e (app project, shareable-assets BL-02).
//
// FILENAME NOTE: playwright.config.js routes the app project by
// testMatch /(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/ — this file
// deliberately ends in "gmi.spec.js" so it lands in the app project without
// touching the config. gmi.spec.js itself stays untouched (ticket red line).
//
// Contract under test (Spec BL-02 / D5 / D6):
// - a valid CGM average makes "Download result card" appear below the result
//   card, and clicking it downloads a PNG named glucomath-gmi-result.png;
// - with no result (empty or invalid input) the button does not exist at all
//   (visibility is the page's job, not the button's).

import { test, expect } from "@playwright/test";

const ROUTE = "/gmi-calculator";

function glucoseField(page) {
  return page.getByRole("textbox", { name: "CGM average glucose" });
}

function shareButton(page) {
  return page.getByRole("button", { name: "Download result card" });
}

test("valid average shows the share button and downloads glucomath-gmi-result.png", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await glucoseField(page).fill("150");
  await expect(shareButton(page)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await shareButton(page).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("glucomath-gmi-result.png");
});

test("no result (empty or invalid input) → the share button does not exist", async ({
  page,
}) => {
  await page.goto(ROUTE);

  // Fresh page, empty input: no result, no button.
  await expect(shareButton(page)).toHaveCount(0);

  // Prime a valid result so the disappearance below is actually observable.
  await glucoseField(page).fill("150");
  await expect(shareButton(page)).toBeVisible();

  // Invalid input (≤ 0) clears the result and must remove the button.
  await glucoseField(page).fill("-150");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(shareButton(page)).toHaveCount(0);

  // Non-numeric input: still no button.
  await glucoseField(page).fill("abc");
  await expect(shareButton(page)).toHaveCount(0);

  // Cleared back to empty: placeholder only, no button.
  await glucoseField(page).fill("");
  await expect(shareButton(page)).toHaveCount(0);
});
