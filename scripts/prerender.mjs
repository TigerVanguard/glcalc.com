// Post-build prerender (Spec §4 P2-4, ticket 03).
//
// Runs after `vite build`: starts a local static server over dist/ with SPA
// fallback (dist/ only has the root index.html at this point — HTML navigations
// MUST fall back to it or sub-routes would 404 and never render), renders each
// route with Playwright Chromium, and writes the full HTML to
// dist/<route>/index.html (the root route overwrites dist/index.html).
// Also emits a static dist/404.html with site-wide <a href> navigation.
//
// Out of scope here (ticket 04): sitemap.xml / robots.txt rewriting, per-route
// head tags, index.html shell teardown.

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { createDistServer } from "./serve-dist.mjs";

const DIST = join(process.cwd(), "dist");
const BRAND = process.env.VITE_BRAND || "GL Calc";

const ROUTES = [
  { path: "/", label: "Home", h1: "Glycemic Load Calculator" },
  { path: "/glycemic-load-calculator", label: "Glycemic Load Calculator", h1: "Glycemic Load Calculator" },
  { path: "/glycemic-index-calculator", label: "Glycemic Index Calculator", h1: "Glycemic Index Calculator" },
  { path: "/gmi-calculator", label: "GMI Calculator", h1: "GMI Calculator (Glucose Management Indicator)" },
  { path: "/a1c-to-eag-calculator", label: "A1C to eAG Calculator", h1: "A1C to eAG Calculator" },
  { path: "/blood-sugar-converter", label: "Blood Sugar Converter", h1: "Blood Sugar Converter (mg/dL ⇄ mmol/L)" },
  { path: "/glucose-to-a1c-estimator", label: "Glucose to A1C Estimator", h1: "Average Glucose to A1C Estimator" },
  { path: "/about", label: `About ${BRAND}`, h1: `About ${BRAND}` },
];

function notFoundHtml() {
  const links = ROUTES.map(
    ({ path, label }) => `        <li><a href="${path}">${label}</a></li>`,
  ).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Page not found | ${BRAND}</title>
  </head>
  <body>
    <main>
      <h1>Page not found</h1>
      <p>The page you requested does not exist. Try one of these pages instead:</p>
      <nav aria-label="All pages">
      <ul>
${links}
      </ul>
      </nav>
    </main>
  </body>
</html>
`;
}

async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    throw new Error(`dist/index.html not found — run \`vite build\` before prerendering.`);
  }

  // SPA-fallback server, internal to this script only (never deployed).
  const server = createDistServer({ root: DIST, spaFallback: true });
  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  console.log(`[prerender] internal SPA-fallback server at ${origin}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  // Keep prerender hermetic and fast: block external requests (fonts, gtag).
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "127.0.0.1") {
      route.abort();
      return;
    }
    route.continue();
  });

  // Render every route BEFORE writing any file: the root route overwrites
  // dist/index.html, which is also this server's SPA fallback document.
  const rendered = [];
  const page = await context.newPage();
  for (const { path, h1 } of ROUTES) {
    await page.goto(`${origin}${path}`, { waitUntil: "load" });
    // Wait for React to have replaced the static shell (marker set by the
    // ReactDOM.render callback in src/index.jsx), then for this route's H1.
    await page.waitForSelector('#root[data-render-complete="true"]', { timeout: 15000 });
    await page.waitForSelector(`#root h1:has-text(${JSON.stringify(h1)})`, { timeout: 15000 });
    const html = await page.content();
    rendered.push({ path, html });
    console.log(`[prerender] rendered ${path}`);
  }
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));

  for (const { path, html } of rendered) {
    const outDir = path === "/" ? DIST : join(DIST, path.slice(1));
    await mkdir(outDir, { recursive: true });
    const outFile = join(outDir, "index.html");
    await writeFile(outFile, html, "utf-8");
    console.log(`[prerender] wrote ${outFile}`);
  }

  await writeFile(join(DIST, "404.html"), notFoundHtml(), "utf-8");
  console.log(`[prerender] wrote ${join(DIST, "404.html")}`);
  console.log(`[prerender] done: ${rendered.length} routes + 404.html`);
}

main().catch((error) => {
  console.error("[prerender] FAILED:", error);
  process.exit(1);
});
