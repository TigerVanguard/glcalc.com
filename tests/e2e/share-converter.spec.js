// Converter share-card e2e (app project, shareable-assets BL-06).
//
// FILENAME NOTE: playwright.config.js routes the app project by
// testMatch /(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/ — this file
// deliberately ends in "converter.spec.js" so it lands in the app project
// without touching the config. converter.spec.js itself stays untouched
// (ticket red line).
//
// Contract under test (Spec BL-06 / D5 / D6):
// - a valid conversion makes "Download result card" appear below the result
//   card, and clicking it downloads a PNG named glucomath-conversion.png;
// - with no result (empty or invalid input) the button does not exist at all
//   (visibility is the page's job, not the button's).

import { test, expect } from "@playwright/test";

const ROUTE = "/blood-sugar-converter";

function mgdlField(page) {
  return page.getByLabel("Blood sugar in mg/dL");
}

function shareButton(page) {
  return page.getByRole("button", { name: "Download result card" });
}

test("valid conversion shows the share button and downloads glucomath-conversion.png", async ({
  page,
}) => {
  await page.goto(ROUTE);

  await mgdlField(page).fill("100");
  await expect(shareButton(page)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await shareButton(page).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("glucomath-conversion.png");
});

test("no result (empty or invalid input) → the share button does not exist", async ({
  page,
}) => {
  await page.goto(ROUTE);

  // Fresh page, empty inputs: no result, no button.
  await expect(shareButton(page)).toHaveCount(0);

  // Prime a valid conversion so the disappearance below is actually
  // observable.
  await mgdlField(page).fill("100");
  await expect(shareButton(page)).toBeVisible();

  // Invalid input (≤ 0) clears the result and must remove the button.
  await mgdlField(page).fill("-5");
  await expect(page.locator(".notice--error")).toBeVisible();
  await expect(shareButton(page)).toHaveCount(0);

  // Non-numeric input: still no button.
  await mgdlField(page).fill("abc");
  await expect(shareButton(page)).toHaveCount(0);

  // Cleared back to empty: placeholder only, no button.
  await mgdlField(page).fill("");
  await expect(shareButton(page)).toHaveCount(0);
});
