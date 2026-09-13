// Build-artifact verification (Spec §8 T3; skeleton from ticket 03, extended in
// ticket 04 with ① title copy, ② description copy, ⑥ canonical/OG, ⑧ JSON-LD,
// ⑨ forbidden-copy scan, ⑩ SKIPPED marker, GA4 gate removal, sitemap/robots;
// extended in ticket 06 with ⑤ internal-link counts + nav presence and
// ⑦ the 5-item footer disclaimer).
//
// Still out of scope (later tickets): ④ formula strings per page, ⑨'s positive
// /about assertions (DiOGenes/MIT — /about content is ticket 13).
//
// The §5B.1 title/description copy below is intentionally HARDCODED here
// (independent of src/seo/pageSeo.js): if both sides imported one module, a
// typo in that module would self-certify. Assertions use a DOM parser
// (node-html-parser), never grep line counts.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "node-html-parser";

const DIST = join(process.cwd(), "dist");
const BRAND = process.env.VITE_BRAND || "GL Calc";
const SITE_ORIGIN = process.env.VITE_SITE_ORIGIN || "https://glcalc.vercel.app";

// §5B.1 final copy, verbatim (title = `${pageTitle} | ${BRAND}`), plus the
// §5B.2 JSON-LD distribution per page (webAppName = page H1; hasFaq = page has
// a visible FAQ block → exactly one FAQPage allowed).
const PAGES = [
  {
    route: "/",
    pageTitle: "Free Blood Sugar & Glycemic Calculators",
    description:
      "Free calculators for glycemic load, glycemic index, GMI, A1C to eAG, and blood sugar unit conversion. No sign-up, no ads walls, every formula source cited.",
    jsonLdTypes: ["WebApplication", "WebSite"],
    webAppName: "Free Blood Sugar & Glycemic Calculators",
  },
  {
    route: "/glycemic-load-calculator",
    pageTitle: "Glycemic Load Calculator – GL by Food & Serving",
    description:
      "Calculate glycemic load from real serving sizes. Search foods, scan barcodes, or use a photo, then see GI, carbs, and GL together. GL = GI × carbs ÷ 100.",
    jsonLdTypes: ["FAQPage", "WebApplication"],
    webAppName: "Glycemic Load Calculator",
    hasFaq: true,
  },
  {
    route: "/glycemic-index-calculator",
    pageTitle: "Glycemic Index Calculator – Look Up Food GI",
    description:
      "Look up the glycemic index of common foods and see low, medium, or high GI at a glance. Includes carbs per 100 g and a direct link to calculate glycemic load.",
    jsonLdTypes: ["WebApplication"],
    webAppName: "Glycemic Index Calculator",
  },
  {
    route: "/gmi-calculator",
    pageTitle: "GMI Calculator – Glucose Management Indicator",
    description:
      "Convert your CGM average glucose into a Glucose Management Indicator (GMI). Uses the published Bergenstal 2018 formula and explains how GMI differs from lab A1C.",
    jsonLdTypes: ["WebApplication"],
    webAppName: "GMI Calculator (Glucose Management Indicator)",
  },
  {
    route: "/a1c-to-eag-calculator",
    pageTitle: "A1C Calculator – Convert A1C to eAG",
    description:
      "Convert A1C to estimated average glucose (eAG) in mg/dL and mmol/L using the ADAG formula (28.7 × A1C − 46.7). Includes accuracy limits and reference info.",
    jsonLdTypes: ["WebApplication"],
    webAppName: "A1C to eAG Calculator",
  },
  {
    route: "/blood-sugar-converter",
    pageTitle: "Blood Sugar Converter – mg/dL ⇄ mmol/L",
    description:
      "Convert blood sugar between mg/dL and mmol/L instantly in both directions. Includes a reference table of common values and why the two units exist.",
    jsonLdTypes: ["WebApplication"],
    webAppName: "Blood Sugar Converter (mg/dL ⇄ mmol/L)",
  },
  {
    route: "/glucose-to-a1c-estimator",
    pageTitle: "Average Glucose to A1C Estimator",
    description:
      "Estimate an A1C range from your average blood glucose. Shows a range, not a single number, and explains why reverse estimation has built-in uncertainty.",
    jsonLdTypes: ["WebApplication"],
    webAppName: "Average Glucose to A1C Estimator",
  },
  {
    route: "/about",
    pageTitle: "About – Data Sources, Formulas & Disclaimer",
    description:
      "Where our GI data and formulas come from: DiOGenes GI database, ADAG (Nathan 2008), GMI (Bergenstal 2018). Open-source attribution and medical disclaimer.",
    jsonLdTypes: ["AboutPage", "Organization"],
  },
];

const ROUTES = PAGES.map((page) => page.route);

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

function canonicalFor(route) {
  return route === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${route}`;
}

// Flatten every <script type="application/ld+json"> (including @graph wrappers)
// into a single array of schema nodes.
function jsonLdNodes(root) {
  const nodes = [];
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    let parsed;
    try {
      parsed = JSON.parse(script.text);
    } catch {
      return null; // caller reports invalid JSON
    }
    const items = Array.isArray(parsed) ? parsed : parsed["@graph"] ?? [parsed];
    nodes.push(...items);
  }
  return nodes;
}

for (const page of PAGES) {
  const { route } = page;
  console.log(`[verify-dist] ${route}`);
  const file = routeFile(route);
  const fileExists = existsSync(file);
  check(fileExists, `prerendered file exists: ${file}`);
  if (!fileExists) continue;

  const html = await readFile(file, "utf-8");
  const root = parse(html);

  // Skeleton (ticket 03): unique title/H1.
  const titles = root.querySelectorAll("title");
  const h1s = root.querySelectorAll("h1");
  check(titles.length === 1, `exactly one <title> (found ${titles.length})`);
  check(h1s.length === 1, `exactly one <h1> (found ${h1s.length})`);
  check(
    h1s.length >= 1 && h1s[0].text.trim().length > 0,
    `<h1> is non-empty ("${h1s[0]?.text.trim() ?? ""}")`,
  );

  // T3-①: title verbatim equals §5B.1 final copy.
  const expectedTitle = `${page.pageTitle} | ${BRAND}`;
  check(
    titles.length === 1 && titles[0].text.trim() === expectedTitle,
    `T3-① <title> verbatim: "${expectedTitle}"`,
  );

  // T3-②: meta description verbatim, and unique.
  const descriptions = root.querySelectorAll('meta[name="description"]');
  check(descriptions.length === 1, `T3-② exactly one meta description (found ${descriptions.length})`);
  check(
    descriptions.length === 1 && descriptions[0].getAttribute("content") === page.description,
    "T3-② meta description verbatim equals §5B.1 copy",
  );

  // T3-⑥: canonical policy + OG consistency, all unique (double-tag guard).
  const canonicals = root.querySelectorAll('link[rel="canonical"]');
  const expectedCanonical = canonicalFor(route);
  check(canonicals.length === 1, `T3-⑥ exactly one canonical (found ${canonicals.length})`);
  const canonicalHref = canonicals[0]?.getAttribute("href") ?? "";
  check(canonicalHref === expectedCanonical, `T3-⑥ canonical = "${expectedCanonical}" (got "${canonicalHref}")`);
  check(
    route === "/" || !canonicalHref.endsWith("/"),
    "T3-⑥ canonical has no trailing slash (root exempt)",
  );
  const ogUrls = root.querySelectorAll('meta[property="og:url"]');
  check(
    ogUrls.length === 1 && ogUrls[0].getAttribute("content") === expectedCanonical,
    "T3-⑥ unique og:url identical to canonical",
  );
  const ogTitles = root.querySelectorAll('meta[property="og:title"]');
  check(
    ogTitles.length === 1 && ogTitles[0].getAttribute("content") === expectedTitle,
    "T3-⑥ unique og:title identical to title",
  );
  const ogDescriptions = root.querySelectorAll('meta[property="og:description"]');
  check(
    ogDescriptions.length === 1 && ogDescriptions[0].getAttribute("content") === page.description,
    "T3-⑥ unique og:description identical to meta description",
  );
  const ogImages = root.querySelectorAll('meta[property="og:image"]');
  const ogImage = ogImages[0]?.getAttribute("content") ?? "";
  check(
    ogImages.length === 1 && /^https?:\/\//.test(ogImage),
    `T3-⑥ unique og:image with absolute URL (got "${ogImage}")`,
  );
  check(
    root.querySelectorAll('meta[property="og:type"]').length === 1 &&
      root.querySelector('meta[property="og:type"]').getAttribute("content") === "website",
    "T3-⑥ og:type = website",
  );
  check(root.querySelectorAll('meta[name="twitter:card"]').length === 1, "T3-⑥ twitter:card present once");

  // T3-⑧: JSON-LD type distribution per §5B.2.
  const nodes = jsonLdNodes(root);
  check(nodes !== null, "T3-⑧ all JSON-LD scripts parse as valid JSON");
  if (nodes !== null) {
    const types = nodes.map((node) => node["@type"]).sort();
    check(
      JSON.stringify(types) === JSON.stringify([...page.jsonLdTypes].sort()),
      `T3-⑧ JSON-LD types = [${page.jsonLdTypes.join(", ")}] (got [${types.join(", ")}])`,
    );

    const webApp = nodes.find((node) => node["@type"] === "WebApplication");
    if (page.webAppName) {
      check(webApp?.name === page.webAppName, `T3-⑧ WebApplication.name = page H1 ("${page.webAppName}")`);
      check(webApp?.url === expectedCanonical, "T3-⑧ WebApplication.url = canonical");
      check(webApp?.applicationCategory === "HealthApplication", 'T3-⑧ applicationCategory = "HealthApplication"');
      check(webApp?.operatingSystem === "Any", 'T3-⑧ operatingSystem = "Any"');
      check(
        webApp?.offers?.price === 0 && webApp?.offers?.priceCurrency === "USD",
        "T3-⑧ offers = price 0 USD",
      );
      check(webApp?.description === page.description, "T3-⑧ WebApplication.description = meta description");
    }

    // FAQPage: only on pages with a visible FAQ, and Q/A text must verbatim
    // match visible text (questions render as <summary>, answers as body text).
    const faqPages = nodes.filter((node) => node["@type"] === "FAQPage");
    check(
      faqPages.length === (page.hasFaq ? 1 : 0),
      page.hasFaq ? "T3-⑧ exactly one FAQPage (visible FAQ present)" : "T3-⑧ no FAQPage (no visible FAQ)",
    );
    if (page.hasFaq && faqPages.length === 1) {
      const summaries = root.querySelectorAll("summary").map((node) => node.text.trim());
      const pageText = root.querySelector("body").text;
      const mainEntity = faqPages[0].mainEntity ?? [];
      check(mainEntity.length > 0, "T3-⑧ FAQPage has mainEntity questions");
      for (const entry of mainEntity) {
        check(
          summaries.includes(entry.name),
          `T3-⑧ FAQ question visible verbatim: "${entry.name}"`,
        );
        check(
          pageText.includes(entry.acceptedAnswer?.text ?? "\u0000"),
          `T3-⑧ FAQ answer visible verbatim for: "${entry.name}"`,
        );
      }
    }
  }
  check(!html.includes("MedicalWebPage"), "T3-⑧ no MedicalWebPage anywhere");

  // T3-⑨ (partial — /about positive assertions are ticket 13): forbidden copy.
  const lowered = html.toLowerCase();
  check(!lowered.includes("harvard"), 'T3-⑨ no "Harvard"');
  check(!lowered.includes("works offline"), 'T3-⑨ no "works offline" claim');

  // GA4 gate removal (Spec §4 P1-2; ticket 04 acceptance criterion).
  check(html.includes('gtag("config", "G-PDPYWE3JR5")'), "GA4 config present");
  check(!html.includes("window.location.hostname"), "GA4 config has no hostname condition");

  // T3-⑤ (ticket 06): header nav asserted separately on EVERY page — exactly
  // 8 real <a href> items covering all 8 routes (Spec §5B.3-1). Deliberately
  // NOT counted toward the in-body link quotas below, otherwise the nav would
  // make "≥2" always true and §5B.3-2 would go untested.
  const navLinks = root.querySelectorAll(".site-nav a[href]");
  check(navLinks.length === 8, `T3-⑤ SiteNav has exactly 8 links (found ${navLinks.length})`);
  const navHrefs = new Set(navLinks.map((a) => a.getAttribute("href")));
  check(
    ROUTES.every((r) => navHrefs.has(r)),
    "T3-⑤ SiteNav covers all 8 routes",
  );

  const isInternal = (a) => (a.getAttribute("href") ?? "").startsWith("/");
  const outsideChrome = (a) => !a.closest(".site-nav") && !a.closest(".tool-footer");

  if (route === "/") {
    // Home: ≥7 internal links by DOM count. Counted OUTSIDE nav AND footer
    // (stricter than the spec floor): 6 tool cards + 1 in-body /about link.
    const bodyInternal = root.querySelectorAll("a[href]").filter((a) => isInternal(a) && outsideChrome(a));
    check(
      bodyInternal.length >= 7,
      `T3-⑤ home has ≥7 in-body internal links outside nav/footer (found ${bodyInternal.length})`,
    );
  } else if (route !== "/about") {
    // 6 tool pages: the in-body related-tools container holds ≥2 internal
    // links to OTHER known routes (Spec §5B.3-2 topology lives in there).
    const relatedContainers = root.querySelectorAll(".related-tools");
    check(relatedContainers.length === 1, `T3-⑤ exactly one .related-tools container (found ${relatedContainers.length})`);
    const relatedLinks = (relatedContainers[0]?.querySelectorAll("a[href]") ?? []).filter(isInternal);
    check(
      relatedLinks.length >= 2,
      `T3-⑤ related-tools has ≥2 internal links (found ${relatedLinks.length})`,
    );
    for (const a of relatedLinks) {
      const href = a.getAttribute("href");
      check(ROUTES.includes(href), `T3-⑤ related-tools link targets a known route (${href})`);
      check(href !== route, `T3-⑤ related-tools link is not a self-link (${href})`);
    }
  }

  // T3-⑦ (ticket 06): unified 5-item footer disclaimer on all 8 pages
  // (Spec §7 template) — ①②③⑤ literal, ④ by date regex.
  const footers = root.querySelectorAll(".tool-footer");
  check(footers.length === 1, `T3-⑦ exactly one .tool-footer (found ${footers.length})`);
  const footerText = (footers[0]?.text ?? "").replace(/\s+/g, " ").replace(/&amp;/g, "&");
  check(
    footerText.includes(
      "This calculator is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.",
    ),
    "T3-⑦ footer ① non-diagnostic statement (literal)",
  );
  check(
    footerText.includes(`Maintained by the ${BRAND} project.`),
    `T3-⑦ footer ② attribution "Maintained by the ${BRAND} project." (literal fallback)`,
  );
  check(
    footerText.includes("This tool has not been reviewed by a medical professional."),
    "T3-⑦ footer ③ review status (literal)",
  );
  check(
    /Last updated: \d{4}-\d{2}-\d{2}/.test(footerText),
    "T3-⑦ footer ④ matches /Last updated: \\d{4}-\\d{2}-\\d{2}/",
  );
  check(
    footerText.includes("Data sources & contact:"),
    'T3-⑦ footer ⑤ "Data sources & contact:" (literal)',
  );
  check(
    (footers[0]?.querySelectorAll('a[href="/about"]') ?? []).length >= 1,
    "T3-⑦ footer ⑤ links to /about",
  );
}

// T3-⑩ — enabled only after P5 (domain switch): dist-wide grep for
// "glcalc.vercel.app" zero hits. Before P5 the origin legitimately IS
// glcalc.vercel.app, so:
console.log("[verify-dist] T3-⑩ glcalc.vercel.app zero-hit scan: SKIPPED (P5 前)");

console.log("[verify-dist] dist/sitemap.xml");
const sitemapFile = join(DIST, "sitemap.xml");
const sitemapExists = existsSync(sitemapFile);
check(sitemapExists, `sitemap exists: ${sitemapFile}`);
if (sitemapExists) {
  const sitemap = await readFile(sitemapFile, "utf-8");
  const lastmodSource = JSON.parse(
    await readFile(join(process.cwd(), "src", "sitemap-lastmod.json"), "utf-8"),
  );
  const entries = [...sitemap.matchAll(/<url>\s*<loc>([^<]*)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>\s*<\/url>/g)];
  check(entries.length === 8, `sitemap has exactly 8 <url> entries (found ${entries.length})`);
  const byLoc = new Map(entries.map(([, loc, lastmod]) => [loc, lastmod]));
  for (const route of ROUTES) {
    const loc = canonicalFor(route);
    check(byLoc.has(loc), `sitemap contains <loc>${loc}</loc>`);
    check(
      byLoc.get(loc) === lastmodSource[route],
      `sitemap lastmod for ${route} comes from src/sitemap-lastmod.json (${lastmodSource[route]})`,
    );
  }
}

console.log("[verify-dist] dist/robots.txt");
const robotsFile = join(DIST, "robots.txt");
const robotsExists = existsSync(robotsFile);
check(robotsExists, `robots.txt exists: ${robotsFile}`);
if (robotsExists) {
  const robots = await readFile(robotsFile, "utf-8");
  check(robots.includes("Allow: /"), "robots.txt allows all");
  check(!/^Disallow:\s*\/\s*$/m.test(robots), "robots.txt has no blanket Disallow");
  check(robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`), "robots.txt points to sitemap");
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
console.log("[verify-dist] all assertions passed (T3 ①②③⑤⑥⑦⑧⑨ + sitemap/robots/404/vercel; ⑩ SKIPPED pre-P5).");
