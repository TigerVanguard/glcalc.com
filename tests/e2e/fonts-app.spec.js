// Self-hosted fonts e2e (app project, perf spec PF-01 / D1~D4).
//
// FILENAME NOTE: playwright.config.js routes the app project by
// testMatch /(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/ — this file
// deliberately ends in "app.spec.js" so it lands in the app project without
// touching the config (same convention as gl-chart-app.spec.js).
//
// Contract under test:
// - no request ever goes to fonts.googleapis.com / fonts.gstatic.com (D4);
// - after document.fonts.ready, check("700 1em Fraunces") and
//   check("500 1em Manrope") are true. check() is ALSO true when no FontFace
//   matches at all, so each family must additionally own a FontFace whose
//   status is "loaded" — that half cannot pass vacuously;
// - every woff2 comes from this origin's /fonts/ and is fetched exactly once:
//   a preload whose href or crossorigin mode does not match the @font-face
//   src makes Chromium fetch the file a second time (D3).
// The built artifact (dist/ CSS + prerendered preload tags) is asserted by
// scripts/verify-dist.mjs, PF-01 ①~④.

import { test, expect } from "@playwright/test";

const GOOGLE_FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

test("home page loads Fraunces + Manrope from the site itself, never from Google Fonts", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => requests.push(new URL(request.url())));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      fraunces700: document.fonts.check("700 1em Fraunces"),
      manrope500: document.fonts.check("500 1em Manrope"),
      loadedFamilies: [...document.fonts]
        .filter((face) => face.status === "loaded")
        .map((face) => face.family.replace(/["']/g, "")),
    };
  });

  const googleRequests = requests.filter((url) => GOOGLE_FONT_HOSTS.includes(url.hostname));
  expect(googleRequests.map(String)).toEqual([]);

  expect(fonts.fraunces700).toBe(true);
  expect(fonts.manrope500).toBe(true);
  expect(fonts.loadedFamilies).toContain("Fraunces");
  expect(fonts.loadedFamilies).toContain("Manrope");

  const origin = new URL(page.url()).origin;
  const fontFiles = requests.filter((url) => url.pathname.endsWith(".woff2")).map(String);
  expect(fontFiles.length).toBeGreaterThan(0);
  for (const href of fontFiles) {
    expect(href.startsWith(`${origin}/fonts/`), href).toBe(true);
  }
  expect(fontFiles.length, `each font file fetched once:\n${fontFiles.join("\n")}`).toBe(
    new Set(fontFiles).size,
  );
});
