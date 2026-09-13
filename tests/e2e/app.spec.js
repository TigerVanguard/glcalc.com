import { test, expect } from "@playwright/test";
import path from "node:path";

const blueberriesPhoto = path.resolve("tests/fixtures/photo-blueberries.svg");
const unknownPhoto = path.resolve("tests/fixtures/photo-unknown.svg");

function resultPanel(page) {
  return page.locator(".panel--results");
}

function summaryPanel(page) {
  return page.getByRole("region", { name: "Selected food summary" });
}

function workflowStack(page) {
  return page.locator(".stack--workflow");
}

function barcodePayload() {
  return {
    ok: true,
    provider: "mock",
    product: {
      code: "1234567890123",
      product_name: "Mock blueberries",
      nutriments: {
        carbohydrates_100g: 11,
      },
    },
    candidates: [
      {
        title: "Blueberries",
        gi: 45,
        carbs_per_100g: 11,
        matchType: "exact",
      },
    ],
  };
}

function photoPayload() {
  return {
    ok: true,
    provider: "mock",
    analysis: {
      label: "Blueberries",
      confidence: 0.92,
    },
    candidates: [
      {
        title: "Blueberries",
        gi: 45,
        carbs_per_100g: 11,
        matchType: "exact",
      },
    ],
  };
}

test("loads the app shell", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  // Title = §5B.1 final copy (ticket 04 head layer): the pre-rebuild hardcoded
  // index.html title no longer exists. Still an exact-match assertion.
  await expect(page).toHaveTitle("Glycemic Load Calculator – GL by Food & Serving | GL Calc");
  await expect(page.getByRole("heading", { name: "Glycemic Load Calculator", exact: true })).toBeVisible();
  const startCta = page.locator(".hero__cta");
  await expect(startCta).toBeVisible();
  await expect(startCta).toHaveAttribute("href", "#calculator-workspace");
  await expect(page.locator(".stage-story")).toBeVisible();
  await expect(page.locator(".stage-story")).toContainText("Find a food");
  await expect(page.locator(".stage-story")).toContainText("Set serving");
  await expect(page.locator(".stage-story")).toContainText("Review GL");
  await expect(page.locator(".hero__install")).toBeVisible();
  await expect(page.locator(".hero__install")).toContainText(/install|home screen/i);
});

test("workflow shell keeps one active finder at a time", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  const searchTab = page.getByRole("tab", { name: "Search" });
  const barcodeTab = page.getByRole("tab", { name: "Barcode" });
  const photoTab = page.getByRole("tab", { name: "Photo" });
  const photoInput = page.getByLabel("Food photo", { exact: true });

  await expect(searchTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("searchbox", { name: "Food" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Barcode" })).toBeHidden();
  await expect(photoInput).toBeHidden();

  await barcodeTab.click();
  await expect(barcodeTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("textbox", { name: "Barcode" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Food" })).toBeHidden();

  await photoTab.click();
  await expect(photoTab).toHaveAttribute("aria-selected", "true");
  await expect(photoInput).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Barcode" })).toBeHidden();
});

test("finder tabs support arrow-key navigation", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  const searchTab = page.getByRole("tab", { name: "Search" });
  const barcodeTab = page.getByRole("tab", { name: "Barcode" });
  const photoTab = page.getByRole("tab", { name: "Photo" });

  await searchTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(barcodeTab).toHaveAttribute("aria-selected", "true");
  await expect(barcodeTab).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Barcode" })).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(photoTab).toHaveAttribute("aria-selected", "true");
  await expect(photoTab).toBeFocused();
  await expect(page.getByLabel("Food photo", { exact: true })).toBeVisible();

  await page.keyboard.press("ArrowLeft");
  await expect(barcodeTab).toHaveAttribute("aria-selected", "true");
});

test("manual barcode copy stays honest in the workflow shell", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("tab", { name: "Barcode" }).click();

  await expect(page.getByRole("heading", { name: /barcode/i })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Barcode" })).toHaveAttribute("inputmode", "numeric");
  await expect(page.getByRole("button", { name: "Look up barcode" })).toBeVisible();
});

test("clearing search ignores stale worker responses", async ({ page }) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;

    window.Worker = class extends NativeWorker {
      constructor(url, options) {
        super(url, options);

        const listeners = new Set();
        let onmessageHandler = null;

        const delayedDispatch = (event) => {
          window.setTimeout(() => {
            listeners.forEach((listener) => listener.call(this, event));
            onmessageHandler?.call(this, event);
          }, 200);
        };

        super.addEventListener("message", delayedDispatch);

        this.addEventListener = (type, listener, opts) => {
          if (type === "message") {
            listeners.add(listener);
            return;
          }

          return NativeWorker.prototype.addEventListener.call(this, type, listener, opts);
        };

        this.removeEventListener = (type, listener, opts) => {
          if (type === "message") {
            listeners.delete(listener);
            return;
          }

          return NativeWorker.prototype.removeEventListener.call(this, type, listener, opts);
        };

        Object.defineProperty(this, "onmessage", {
          configurable: true,
          get() {
            return onmessageHandler;
          },
          set(handler) {
            onmessageHandler = handler;
          },
        });
      }
    };
  });

  await page.goto("/glycemic-load-calculator");

  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.waitForTimeout(120);
  await page.getByRole("searchbox", { name: "Food" }).fill("");

  await page.waitForTimeout(260);

  await expect(page.getByRole("searchbox", { name: "Food" })).toHaveValue("");
  await expect(page.getByRole("list", { name: "Food search results" })).toBeHidden();
  await expect(page.locator(".panel--search .search-meta")).toHaveText("No matches yet");
});

test("searches for a food and calculates carbs and glycemic load from an ounce serving", async ({
  page,
}) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();
  await page.getByRole("spinbutton", { name: "Serving size" }).fill("2");
  await page.getByRole("combobox", { name: "Unit" }).selectOption("oz");

  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();
  await expect(resultPanel(page).getByText("Glycemic index", { exact: true })).toBeVisible();
  await expect(resultPanel(page).getByText("Carbohydrates in this serving", { exact: true })).toBeVisible();
  await expect(resultPanel(page).getByText("Estimated glycemic load", { exact: true })).toBeVisible();
  await expect(resultPanel(page).getByText("6.2 g")).toBeVisible();
  await expect(resultPanel(page).getByText("2.79")).toBeVisible();
});

test("selected food summary appears after choosing a food and search clear does not drop it", async ({
  page,
}) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();

  const summary = summaryPanel(page);
  await expect(summary).toContainText("Blueberries");
  await expect(summary).toContainText("Text search");
  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();

  await page.getByRole("searchbox", { name: "Food" }).fill("");

  await expect(summary).toContainText("Blueberries");
  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();
});

test("tab switching preserves draft input and keeps the active selected food", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();

  const summary = summaryPanel(page);
  await expect(summary).toContainText("Text search");

  await page.getByRole("tab", { name: "Barcode" }).click();
  await page.getByRole("textbox", { name: "Barcode" }).fill("1234567890123");
  await page.getByRole("tab", { name: "Photo" }).click();
  await page.getByLabel("Food photo", { exact: true }).setInputFiles(blueberriesPhoto);
  await page.getByRole("tab", { name: "Barcode" }).click();

  await expect(page.getByRole("textbox", { name: "Barcode" })).toHaveValue("1234567890123");
  await expect(summary).toContainText("Blueberries");
  await expect(summary).toContainText("Text search");

  await page.getByRole("tab", { name: "Photo" }).click();
  await expect(page.locator(".panel--photo").getByText("Selected file: photo-blueberries.svg")).toBeVisible();
  await expect(summary).toContainText("Blueberries");
  await expect(summary).toContainText("Text search");
  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();
});

test("summary reset clears only the selected result", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();

  await page.getByRole("button", { name: "Clear selected food" }).click();

  await expect(summaryPanel(page)).toBeHidden();
  await expect(resultPanel(page).getByRole("heading", { name: "Your result will land here" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Food" })).toHaveValue("blueberries");
});

test("looks up a barcode, confirms a candidate, and calculates GL", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("tab", { name: "Barcode" }).click();
  await page.getByRole("textbox", { name: "Barcode" }).fill("1234567890123");
  await page.getByRole("button", { name: "Look up barcode" }).click();

  await expect(page.getByRole("heading", { name: "Confirm the matching food" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Blueberries GI 45 Exact match" })).toBeVisible();

  await page.getByRole("button", { name: "Blueberries GI 45 Exact match" }).click();

  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();
  await expect(resultPanel(page).getByText("4.95")).toBeVisible();
});

test("replacing selected food from another finder updates the summary", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();
  await expect(summaryPanel(page)).toContainText("Text search");

  await page.getByRole("tab", { name: "Barcode" }).click();
  await page.getByRole("textbox", { name: "Barcode" }).fill("1234567890123");
  await page.getByRole("button", { name: "Look up barcode" }).click();
  await page.getByRole("button", { name: "Blueberries GI 45 Exact match" }).click();

  const summary = summaryPanel(page);
  await expect(summary).toContainText("Blueberries");
  await expect(summary).toContainText("Barcode lookup");
});

test("switching finders or running lookups without confirm does not replace the selected food", async ({
  page,
}) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();

  const summary = summaryPanel(page);
  await expect(summary).toContainText("Text search");

  await page.getByRole("tab", { name: "Barcode" }).click();
  await page.getByRole("textbox", { name: "Barcode" }).fill("1234567890123");
  await page.getByRole("button", { name: "Look up barcode" }).click();

  await expect(page.getByRole("heading", { name: "Confirm the matching food" })).toBeVisible();
  await expect(summary).toContainText("Blueberries");
  await expect(summary).toContainText("Text search");
  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "Photo" }).click();
  await page.getByLabel("Food photo", { exact: true }).setInputFiles(blueberriesPhoto);
  await page.getByRole("button", { name: "Identify photo" }).click();

  await expect(page.getByRole("heading", { name: "Confirm the matching food" })).toBeVisible();
  await expect(summary).toContainText("Blueberries");
  await expect(summary).toContainText("Text search");
});

test("uploads a photo, confirms a candidate, and calculates GL", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("tab", { name: "Photo" }).click();
  await page.getByLabel("Food photo", { exact: true }).setInputFiles(blueberriesPhoto);
  await page.getByRole("button", { name: "Identify photo" }).click();

  await expect(page.getByRole("heading", { name: "Confirm the matching food" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Blueberries GI 45 Exact match" })).toBeVisible();

  await page.getByRole("button", { name: "Blueberries GI 45 Exact match" }).click();

  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();
  await expect(resultPanel(page).getByText("Estimated glycemic load", { exact: true })).toBeVisible();
});

test("mobile layout moves the result workspace ahead of the workflow stack after selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/glycemic-load-calculator");

  const initialWorkflowBox = await workflowStack(page).boundingBox();
  const initialResultBox = await page.locator(".result-column").boundingBox();

  expect(initialWorkflowBox).not.toBeNull();
  expect(initialResultBox).not.toBeNull();
  expect(initialWorkflowBox.y).toBeLessThan(initialResultBox.y);

  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();

  const workflowBox = await workflowStack(page).boundingBox();
  const resultBox = await page.locator(".result-column").boundingBox();

  expect(resultBox).not.toBeNull();
  expect(workflowBox).not.toBeNull();
  expect(resultBox.y).toBeLessThan(workflowBox.y);
});

test("finder-local clear actions do not wipe the selected summary or result", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();

  const summary = summaryPanel(page);
  await expect(summary).toContainText("Blueberries");

  await page.getByRole("tab", { name: "Barcode" }).click();
  await page.getByRole("textbox", { name: "Barcode" }).fill("1234567890123");
  await page.getByRole("button", { name: "Look up barcode" }).click();
  await page.getByRole("button", { name: "Clear barcode" }).click();

  await expect(page.getByRole("textbox", { name: "Barcode" })).toHaveValue("");
  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();
  await expect(summary).toContainText("Text search");

  await page.getByRole("tab", { name: "Photo" }).click();
  await page.getByLabel("Food photo", { exact: true }).setInputFiles(blueberriesPhoto);
  await expect(page.locator(".panel--photo").getByText("Selected file: photo-blueberries.svg")).toBeVisible();
  await page.getByRole("button", { name: "Clear photo" }).click();

  await expect(page.locator(".panel--photo").getByText("Selected file: photo-blueberries.svg")).toBeHidden();
  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();
  await expect(summary).toContainText("Text search");
});

test("clearing barcode ignores stale lookup responses and does not keep loading", async ({ page }) => {
  await page.route("**/api/barcode?barcode=1234567890123", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(barcodePayload()),
    });
  });

  await page.goto("/glycemic-load-calculator");
  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();

  await page.getByRole("tab", { name: "Barcode" }).click();
  await page.getByRole("textbox", { name: "Barcode" }).fill("1234567890123");
  await page.getByRole("button", { name: "Look up barcode" }).click();
  await expect(page.getByRole("button", { name: "Looking up..." })).toBeVisible();
  await page.getByRole("button", { name: "Clear barcode" }).click();

  await page.waitForTimeout(350);

  await expect(page.getByRole("textbox", { name: "Barcode" })).toHaveValue("");
  await expect(page.getByRole("button", { name: "Look up barcode" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Confirm the matching food" })).toBeHidden();
  await expect(summaryPanel(page)).toContainText("Text search");
  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();
});

test("clearing photo ignores stale identify responses and resets loading", async ({ page }) => {
  await page.route("**/api/photo-identify", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(photoPayload()),
    });
  });

  await page.goto("/glycemic-load-calculator");
  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();

  await page.getByRole("tab", { name: "Photo" }).click();
  await page.getByLabel("Food photo", { exact: true }).setInputFiles(blueberriesPhoto);
  await page.getByRole("button", { name: "Identify photo" }).click();
  await expect(page.getByRole("button", { name: "Scanning..." })).toBeVisible();
  await page.getByRole("button", { name: "Clear photo" }).click();

  await page.waitForTimeout(350);

  await expect(page.getByRole("button", { name: "Identify photo" })).toBeDisabled();
  await expect(page.locator(".panel--photo").getByText("Selected file: photo-blueberries.svg")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Confirm the matching food" })).toBeHidden();
  await expect(summaryPanel(page)).toContainText("Text search");
  await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();
});

test("shows a recoverable error for an invalid barcode", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("tab", { name: "Barcode" }).click();
  await page.getByRole("textbox", { name: "Barcode" }).fill("abc");
  await page.getByRole("button", { name: "Look up barcode" }).click();

  await expect(page.getByRole("alert")).toContainText("Invalid barcode");
  await expect(page.getByRole("alert")).toContainText("8 to 14 digits");
});

test("shows a recoverable error for an unknown barcode", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("tab", { name: "Barcode" }).click();
  await page.getByRole("textbox", { name: "Barcode" }).fill("0000000000000");
  await page.getByRole("button", { name: "Look up barcode" }).click();

  await expect(page.getByRole("alert")).toContainText("Barcode not found");
  await expect(page.getByRole("alert")).toContainText("No product was found");
});

test("shows a recoverable error for an unrecognized photo", async ({ page }) => {
  await page.goto("/glycemic-load-calculator");

  await page.getByRole("tab", { name: "Photo" }).click();
  await page.getByLabel("Food photo", { exact: true }).setInputFiles(unknownPhoto);
  await page.getByRole("button", { name: "Identify photo" }).click();

  await expect(page.getByRole("alert")).toContainText("Could not identify the photo");
  await expect(page.getByRole("alert")).toContainText("could not find a confident food match");
});

test.describe("?food= deep link (ticket 05)", () => {
  test("preselects an existing gi.json food as a confirmed selection", async ({ page }) => {
    await page.goto("/glycemic-load-calculator?food=Blueberries");

    const summary = summaryPanel(page);
    await expect(summary).toContainText("Blueberries");
    await expect(summary).toContainText("Shared link");
    await expect(resultPanel(page).getByRole("heading", { name: "Blueberries", exact: true })).toBeVisible();
    await expect(resultPanel(page).getByText("Estimated glycemic load", { exact: true })).toBeVisible();
    // Default serving 100 g of Blueberries (GI 45, 11 g carbs/100g) => GL 4.95.
    await expect(resultPanel(page).getByText("4.95")).toBeVisible();

    // Read-only: nothing is written back to the URL.
    expect(new URL(page.url()).search).toBe("?food=Blueberries");
  });

  test("ignores an unknown ?food= key and renders normally", async ({ page }) => {
    await page.goto("/glycemic-load-calculator?food=No-Such-Food-Key");

    await expect(page.getByRole("heading", { name: "Glycemic Load Calculator", exact: true })).toBeVisible();
    await expect(summaryPanel(page)).toBeHidden();
    await expect(resultPanel(page).getByRole("heading", { name: "Your result will land here" })).toBeVisible();
    expect(new URL(page.url()).search).toBe("?food=No-Such-Food-Key");
  });

  test("deep-linked selection can be cleared and replaced by search", async ({ page }) => {
    await page.goto("/glycemic-load-calculator?food=Blueberries");

    await expect(summaryPanel(page)).toContainText("Shared link");
    await page.getByRole("button", { name: "Clear selected food" }).click();
    await expect(summaryPanel(page)).toBeHidden();

    await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
    await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();
    await expect(summaryPanel(page)).toContainText("Text search");
    // URL still untouched after interactions.
    expect(new URL(page.url()).search).toBe("?food=Blueberries");
  });
});

// Ticket 12 (Spec §6.1 / §6.2): the egg-white regression closes its loop on
// the GL page — an entry with carbs_per_100g < 2.5 must show the N/A
// semantics in the RESULT AREA (never its encoded numeric GI, never a
// computed GL), whether it arrives via the ?food= deep link or via search —
// and the static serving-level GL reference table is part of the page.
test.describe("GL page N/A entries and static reference table (ticket 12)", () => {
  const EGG_WHITE_DEEP_LINK =
    "/glycemic-load-calculator?food=Egg.%20chicken.%20white.%20raw";

  test("egg white via ?food= deep link shows N/A semantics with no numeric GL", async ({
    page,
  }) => {
    await page.goto(EGG_WHITE_DEEP_LINK);

    const summary = summaryPanel(page);
    await expect(summary).toContainText("Egg. chicken. white. raw");
    await expect(summary).toContainText("Shared link");

    const panel = resultPanel(page);
    await expect(
      panel.getByRole("heading", { name: "Egg. chicken. white. raw", exact: true }),
    ).toBeVisible();
    await expect(panel).toContainText("GL ≈ 0");
    await expect(panel).toContainText(
      "GI: N/A (too little carbohydrate to measure)",
    );

    // No numeric GL, no encoded GI 70, no band pills anywhere in the panel.
    expect(await panel.textContent()).not.toContain("70");
    await expect(panel.locator(".pill")).toHaveCount(0);
    await expect(panel).not.toContainText("Estimated for");
    await expect(panel).not.toContainText("Carbohydrates in this serving");
  });

  test("egg white via search shows the N/A pill in the dropdown and N/A result on confirm", async ({
    page,
  }) => {
    await page.goto("/glycemic-load-calculator");

    await page.getByRole("searchbox", { name: "Food" }).fill("egg. chicken. white");
    // §6.1 applies to the dropdown too: "GI: N/A", never "GI 70 - High".
    const resultButton = page.getByRole("button", {
      name: "Egg. chicken. white. raw GI: N/A",
      exact: true,
    });
    await expect(resultButton).toBeVisible();
    await resultButton.click();

    const panel = resultPanel(page);
    await expect(panel).toContainText("GL ≈ 0");
    await expect(panel).toContainText(
      "GI: N/A (too little carbohydrate to measure)",
    );
    expect(await panel.textContent()).not.toContain("70");

    // Serving edits don't conjure a numeric GL for a non-measurable entry.
    await page.getByRole("spinbutton", { name: "Serving size" }).fill("250");
    await expect(panel).toContainText("GL ≈ 0");
    expect(await panel.textContent()).not.toContain("70");
  });

  test("a measurable food still gets the numeric flow (regression guard)", async ({
    page,
  }) => {
    await page.goto("/glycemic-load-calculator?food=Blueberries");

    const panel = resultPanel(page);
    await expect(panel.getByText("Estimated glycemic load", { exact: true })).toBeVisible();
    await expect(panel.getByText("4.95")).toBeVisible();
    await expect(panel).not.toContainText("GL ≈ 0");
    await expect(panel).not.toContainText("N/A");
  });

  test("static GL reference table renders with 27 rows and band copy", async ({ page }) => {
    await page.goto("/glycemic-load-calculator");

    const table = page.locator(".gl-static-table");
    await expect(table).toBeVisible();
    await expect(table.locator("tbody tr")).toHaveCount(27);

    // Golden row (same derivation as verify-dist): Rye bread, 30 g slice →
    // GL 12.5 Medium.
    const ryeRow = table.locator("tbody tr", { hasText: "Rye bread" });
    await expect(ryeRow).toContainText("1 slice (30 g)");
    await expect(ryeRow).toContainText("12.5");
    await expect(ryeRow).toContainText("Medium");

    // The table never contains the N/A display string (§6.1) and the band
    // boundary copy is on the page.
    expect(await table.textContent()).not.toContain("N/A");
    const main = page.locator("body");
    await expect(main).toContainText("GL ≤ 10");
    await expect(main).toContainText("GL ≥ 20");
    await expect(main).toContainText("glycaemic");
  });
});
