import { test, expect } from "@playwright/test";

test("exposes SEO metadata and crawl files", async ({ page, request }) => {
  await page.goto("/");

  await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveAttribute(
    "src",
    "https://www.googletagmanager.com/gtag/js?id=G-PDPYWE3JR5",
  );
  const scriptText = await page.locator("script").evaluateAll((scripts) =>
    scripts.map((script) => script.textContent ?? "").join("\n"),
  );
  expect(scriptText).toContain('gtag("config", "G-PDPYWE3JR5")');
  expect(scriptText).toContain("glcalc.vercel.app");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://glcalc.vercel.app/",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /Calculate glycemic load/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Glycemic Load Calculator | GI and GL Food Search",
  );

  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  const graph = JSON.parse(structuredData);
  expect(graph["@graph"]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "@type": "WebApplication",
        name: "Glycemic Load Calculator",
        url: "https://glcalc.vercel.app/",
      }),
      expect.objectContaining({
        "@type": "FAQPage",
      }),
    ]),
  );

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Sitemap: https://glcalc.vercel.app/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("<loc>https://glcalc.vercel.app/</loc>");
});

test("keeps useful non-JavaScript fallback content in the source HTML", async ({ request }) => {
  const response = await request.get("/");
  const html = await response.text();

  expect(html).toContain("Glycemic Load Calculator");
  expect(html).toContain("Calculate glycemic load from GI and serving size");
  expect(html).toContain("JavaScript is required for the interactive calculator");
});
