// Route-split client navigation e2e (app project, perf spec PF-02 / D5~D7).
//
// FILENAME NOTE: playwright.config.js routes the app project by
// testMatch /(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/ — this file
// deliberately ends in "app.spec.js" so it lands in the app project without
// touching the config (same convention as gl-chart-app.spec.js).
//
// Contract under test (src/index.jsx): the three gi.json pages load from
// their own chunks. Reaching them through an in-app link is a client-side
// route change — the document is never reloaded (a window marker set before
// the click survives it) — and while a chunk is in flight the Suspense
// fallback keeps the site header on screen with a loading line. The split
// page that was opened directly is mounted from its awaited module, so
// navigating back to it never shows the fallback. A chunk that fails to load
// mid-navigation becomes a full page load of the target URL, not a blank page,
// and a chunk failing on the page load itself never starts a reload loop.
// The direct-open side (prerendered H1 never gone, no fallback) runs against
// the built dist/ in route-split-prerender.spec.js.

import { test, expect } from "@playwright/test";

const MARKER = "__routeSplitSameDocument";
const GMI_H1 = "GMI Calculator (Glucose Management Indicator)";
// The dev server serves each source module at its own URL.
const GL_PAGE_MODULE = /\/src\/pages\/GlCalculatorPage\.jsx(\?.*)?$/;

function siteNavLink(page, name) {
  return page
    .getByRole("navigation", { name: "Site", exact: true })
    .getByRole("link", { name, exact: true });
}

function foodSearchBox(page) {
  return page.getByRole("searchbox", { name: "Food" });
}

async function markDocument(page) {
  await page.evaluate((key) => {
    window[key] = true;
  }, MARKER);
}

async function readMarker(page) {
  return page.evaluate((key) => window[key], MARKER);
}

async function openGmiPage(page) {
  await page.goto("/gmi-calculator");
  await expect(page.locator("h1")).toHaveText(GMI_H1);
  await markDocument(page);
}

test("SiteNav link from GMI reaches the GL calculator client-side, search box ready", async ({
  page,
}) => {
  await openGmiPage(page);

  await siteNavLink(page, "Glycemic Load").click();

  await expect(page).toHaveURL("/glycemic-load-calculator");
  await expect(foodSearchBox(page)).toBeVisible();
  expect(await readMarker(page), "no full page reload").toBe(true);
});

test("SiteNav link from GMI reaches the GI lookup client-side", async ({ page }) => {
  await openGmiPage(page);

  await siteNavLink(page, "Glycemic Index").click();

  await expect(page).toHaveURL("/glycemic-index-calculator");
  await expect(page.locator("h1")).toHaveText("Glycemic Index Calculator");
  expect(await readMarker(page), "no full page reload").toBe(true);
});

test("home body link reaches the GL chart client-side", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Free Blood Sugar & Glycemic Calculators");
  await markDocument(page);

  await page.locator('.seo-panel a[href="/glycemic-load-chart"]').click();

  await expect(page).toHaveURL("/glycemic-load-chart");
  await expect(page.locator("h1")).toHaveText("Glycemic Load Chart: 27 Common Foods");
  expect(await readMarker(page), "no full page reload").toBe(true);
});

test("while a split page's chunk loads, the fallback shows the site nav and a loading line", async ({
  page,
}) => {
  let releaseChunk;
  const chunkGate = new Promise((resolve) => {
    releaseChunk = resolve;
  });
  await page.route(GL_PAGE_MODULE, async (route) => {
    await chunkGate;
    await route.continue();
  });
  await openGmiPage(page);

  await siteNavLink(page, "Glycemic Load").click();

  const fallback = page.locator("[data-route-fallback]");
  await expect(fallback).toBeVisible();
  await expect(fallback.locator(".site-nav a[href]")).toHaveCount(8);
  await expect(fallback.getByRole("status")).toHaveText(/loading/i);

  releaseChunk();
  await expect(foodSearchBox(page)).toBeVisible();
  await expect(fallback).toHaveCount(0);
  expect(await readMarker(page), "no full page reload").toBe(true);
});

test("navigating back to the directly opened split page never shows the fallback", async ({
  page,
}) => {
  await page.goto("/glycemic-load-calculator");
  await expect(foodSearchBox(page)).toBeVisible();
  await page.evaluate(() => {
    window.__routeFallbackSeen = false;
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches("[data-route-fallback]") || node.querySelector("[data-route-fallback]"))
          ) {
            window.__routeFallbackSeen = true;
          }
        }
      }
    }).observe(document.getElementById("root"), { childList: true, subtree: true });
  });
  await markDocument(page);

  await siteNavLink(page, "GMI").click();
  await expect(page.locator("h1")).toHaveText(GMI_H1);
  await siteNavLink(page, "Glycemic Load").click();

  await expect(foodSearchBox(page)).toBeVisible();
  expect(await page.evaluate(() => window.__routeFallbackSeen), "fallback inserted").toBe(false);
  expect(await readMarker(page), "no full page reload").toBe(true);
});

test("a split-page chunk that fails to load mid-navigation falls back to a full page load", async ({
  page,
}) => {
  let failedOnce = false;
  await page.route(GL_PAGE_MODULE, async (route) => {
    if (!failedOnce) {
      failedOnce = true;
      await route.abort();
      return;
    }
    await route.continue();
  });
  await openGmiPage(page);

  await siteNavLink(page, "Glycemic Load").click();

  await expect(page).toHaveURL("/glycemic-load-calculator");
  await expect(foodSearchBox(page)).toBeVisible();
  expect(failedOnce).toBe(true);
  expect(await readMarker(page), "the document was reloaded").toBeUndefined();
});

test("a chunk failing on the page load itself never triggers a reload loop", async ({ page }) => {
  // <Routes> percent-decodes the path, so this URL renders the GL route —
  // through lazy(), because the startup lookup sees the raw pathname. With
  // the chunk permanently failing, the page must settle on the fallback
  // instead of reloading itself over and over.
  let documentLoads = 0;
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentLoads += 1;
  });
  await page.route(GL_PAGE_MODULE, (route) => route.abort());

  await page.goto("/glycemic%2Dload-calculator");

  await expect(page.locator("[data-route-fallback]")).toBeVisible();
  await page.waitForTimeout(1500);
  expect(documentLoads, "document navigations").toBe(1);
  await expect(page.locator("[data-route-fallback] .site-nav a[href]")).toHaveCount(8);
});
