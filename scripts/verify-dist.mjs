// Build-artifact verification — SKELETON (ticket 03; Spec §8 T3).
//
// Scope in this ticket: per-route HTML file exists, exactly one <title>, exactly
// one <h1>, dist/404.html exists with full site navigation, and vercel.json
// routing invariants (cleanUrls, trailingSlash:false, no catch-all rewrite).
// The full §5B assertion set (title/description copy, canonical/OG, formulas,
// internal-link counts, JSON-LD, footer disclaimer) belongs to ticket 04+.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "node-html-parser";

const DIST = join(process.cwd(), "dist");

const ROUTES = [
  "/",
  "/glycemic-load-calculator",
  "/glycemic-index-calculator",
  "/gmi-calculator",
  "/a1c-to-eag-calculator",
  "/blood-sugar-converter",
  "/glucose-to-a1c-estimator",
  "/about",
];

let failures = 0;

function check(condition, message) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${message}`);
  }
}

function routeFile(route) {
  return route === "/" ? join(DIST, "index.html") : join(DIST, route.slice(1), "index.html");
}

for (const route of ROUTES) {
  console.log(`[verify-dist] ${route}`);
  const file = routeFile(route);
  const fileExists = existsSync(file);
  check(fileExists, `prerendered file exists: ${file}`);
  if (!fileExists) continue;

  const root = parse(await readFile(file, "utf-8"));
  const titles = root.querySelectorAll("title");
  const h1s = root.querySelectorAll("h1");
  check(titles.length === 1, `exactly one <title> (found ${titles.length})`);
  check(
    titles.length >= 1 && titles[0].text.trim().length > 0,
    `<title> is non-empty ("${titles[0]?.text.trim() ?? ""}")`,
  );
  check(h1s.length === 1, `exactly one <h1> (found ${h1s.length})`);
  check(
    h1s.length >= 1 && h1s[0].text.trim().length > 0,
    `<h1> is non-empty ("${h1s[0]?.text.trim() ?? ""}")`,
  );
}

console.log("[verify-dist] dist/404.html");
const notFoundFile = join(DIST, "404.html");
const notFoundExists = existsSync(notFoundFile);
check(notFoundExists, `404 page exists: ${notFoundFile}`);
if (notFoundExists) {
  const nf = parse(await readFile(notFoundFile, "utf-8"));
  const hrefs = new Set(nf.querySelectorAll("a[href]").map((a) => a.getAttribute("href")));
  for (const route of ROUTES) {
    check(hrefs.has(route), `404 page links to ${route}`);
  }
}

console.log("[verify-dist] vercel.json routing invariants");
const vercelFile = join(process.cwd(), "vercel.json");
const vercelExists = existsSync(vercelFile);
check(vercelExists, "vercel.json exists");
if (vercelExists) {
  const vercel = JSON.parse(await readFile(vercelFile, "utf-8"));
  check(vercel.cleanUrls === true, "cleanUrls is true");
  check(vercel.trailingSlash === false, "trailingSlash is false");
  check(!vercel.rewrites && !vercel.routes, "no rewrites/routes (catch-all rewrite forbidden)");
}

if (failures > 0) {
  console.error(`[verify-dist] FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log("[verify-dist] all skeleton assertions passed.");
