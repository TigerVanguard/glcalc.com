import { test, expect } from "@playwright/test";

test("exposes installable PWA metadata and icon assets", async ({ page, request }) => {
  await page.goto("/");

  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute("href", "/manifest.webmanifest");

  const themeColor = page.locator('meta[name="theme-color"]');
  await expect(themeColor).toHaveAttribute("content", "#e8f2ea");

  const appleCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
  await expect(appleCapable).toHaveAttribute("content", "yes");

  const appleTitle = page.locator('meta[name="apple-mobile-web-app-title"]');
  await expect(appleTitle).toHaveAttribute("content", "GL Calc");

  const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
  await expect(appleTouchIcon).toHaveAttribute("href", "/icons/apple-touch-icon.png");

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();

  const manifestJson = await manifest.json();
  expect(manifestJson.name).toBe("Glycemic Load Calculator");
  expect(manifestJson.short_name).toBe("GL Calc");
  expect(manifestJson.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }),
      expect.objectContaining({ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }),
      expect.objectContaining({
        src: "/icons/gl-guide-maskable.svg",
        purpose: "maskable",
        type: "image/svg+xml",
      }),
    ]),
  );
});
