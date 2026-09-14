// One-shot generator for public/og-cover.png (ticket 04, Spec §5B.4).
//
// 1200×630 site-wide OG cover: solid brand background + brand name text.
// Implementation: Playwright Chromium (already a devDependency) screenshots an
// inline HTML page at exactly 1200×630 — no canvas/image libraries needed.
// The PNG is committed as a static asset; the brand name is baked into pixels,
// so P5's rebrand MUST re-run this with VITE_BRAND=GlucoMath (Spec §4 P5-3):
//
//   node scripts/generate-og-cover.mjs
//
import { join } from "node:path";
import { chromium } from "@playwright/test";

const BRAND = process.env.VITE_BRAND || "GlucoMath";
const OUT = join(process.cwd(), "public", "og-cover.png");

// System serif stack: hermetic (no webfont fetch), close to the site's
// Fraunces-led look.
const html = `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { margin: 0; padding: 0; }
      .cover {
        width: 1200px;
        height: 630px;
        box-sizing: border-box;
        background: #f4f0e5;
        border: 24px solid #2f3e2f;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 28px;
        font-family: Georgia, "Times New Roman", serif;
        color: #2f3e2f;
        text-align: center;
      }
      h1 { font-size: 128px; font-weight: 700; letter-spacing: -2px; }
      p { font-size: 40px; color: #4a5a4a; }
    </style>
  </head>
  <body>
    <div class="cover">
      <h1>${BRAND}</h1>
      <p>Free blood sugar &amp; glycemic calculators</p>
    </div>
  </body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.screenshot({ path: OUT });
await browser.close();
console.log(`[og-cover] wrote ${OUT} (1200x630, brand "${BRAND}")`);
