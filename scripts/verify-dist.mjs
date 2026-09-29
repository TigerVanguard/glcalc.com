// Build-artifact verification (Spec §8 T3; skeleton from ticket 03, extended in
// ticket 04 with ① title copy, ② description copy, ⑥ canonical/OG, ⑧ JSON-LD,
// ⑨ forbidden-copy scan, ⑩ SKIPPED marker, GA4 gate removal, sitemap/robots;
// extended in ticket 06 with ⑤ internal-link counts + nav presence and
// ⑦ the 5-item footer disclaimer; extended in ticket 07 with the ④ converter
// row: "18.018" formula string + static reference table content; extended in
// ticket 08 with the ④ a1c-to-eag row: "28.7"/"Nathan" + static ADA table +
// the D4 negative scan of the calculator panel; extended in ticket 09 with the
// ④ estimator row: "28.7" + backwards formula + approximation copy, plus the
// negative scans — no prerendered single-point %, no "ADAG formula" label on
// the backwards equation, no diagnostic verdicts in the panel; extended in
// ticket 10 with the ④ gmi row: "0.02392"/"Bergenstal" + the ±0.5 difference
// explainer + the .gmi-panel negative scans; extended in ticket 11 with the
// ④ gi row: static table exactly 27 rows + two hardcoded spot checks + honest
// provenance keywords + no "N/A" inside the table, and the FAQPage whitelist
// gains the gi page; extended in ticket 12 with the ④ GL row: GL formula
// string + 27-row serving-level GL table + two hand-computed golden rows +
// band boundary semantics (≤ 10 / ≥ 20) + "glycaemic" spelling + DiOGenes
// provenance + negative scans (no N/A / no encoding suspect in the table);
// extended in ticket 13 with ⑨'s positive /about assertions: DiOGenes/Aston
// provenance, formula citations (Nathan/Bergenstal), MIT upstream attribution
// (assafmo repo link), GitHub Issues contact link (visible + Organization
// contactPoint), and the Atkinson 2021 upgrade-path mention. The ⑨ negative
// scans (no "Harvard" / no "works offline", site-wide) are unchanged; extended
// in ticket 15 (P5 domain cutover) with the ⑩ dist-wide old-domain zero-hit
// scan (replacing the pre-P5 SKIPPED marker) and the vercel.json
// host-conditional old-domain redirect invariant.
//
// The §5B.1 title/description copy below is intentionally HARDCODED here
// (independent of src/seo/pageSeo.js): if both sides imported one module, a
// typo in that module would self-certify. Assertions use a DOM parser
// (node-html-parser), never grep line counts.

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "node-html-parser";

const DIST = join(process.cwd(), "dist");
// Independent hardcodes (NOT imported from src/site.config.js — see above):
// same env vars, same defaults, so a build-time override stays consistent.
const BRAND = process.env.VITE_BRAND || "GlucoMath";
const SITE_ORIGIN = process.env.VITE_SITE_ORIGIN || "https://glucomath.com";

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
    // shareable-assets BL-04: a dataset page, not a calculator — JSON-LD is
    // WebPage + Dataset (asserted in detail in its T3-④ block below), and it
    // is deliberately NOT in SiteNav (D4: nav stays at 8; notInNav below).
    route: "/glycemic-load-chart",
    pageTitle: "Glycemic Load Chart — GL of 27 Common Foods at Real Servings",
    description:
      "Glycemic load of 27 common foods at 50 g, 100 g, and typical servings, in one printable chart. Free to cite with a link, plus a one-click CSV download.",
    jsonLdTypes: ["Dataset", "WebPage"],
    notInNav: true,
  },
  {
    route: "/glycemic-index-calculator",
    pageTitle: "Glycemic Index Calculator – Look Up Food GI",
    description:
      "Look up the glycemic index of common foods and see low, medium, or high GI at a glance. Includes carbs per 100 g and a direct link to calculate glycemic load.",
    jsonLdTypes: ["FAQPage", "WebApplication"],
    webAppName: "Glycemic Index Calculator",
    hasFaq: true,
  },
  {
    route: "/gmi-calculator",
    pageTitle: "GMI Calculator – Glucose Management Indicator",
    description:
      "Convert your CGM average glucose into a Glucose Management Indicator (GMI). Uses the published Bergenstal 2018 formula and explains how GMI differs from lab A1C.",
    jsonLdTypes: ["FAQPage", "WebApplication"],
    webAppName: "GMI Calculator (Glucose Management Indicator)",
    hasFaq: true,
  },
  {
    route: "/a1c-to-eag-calculator",
    pageTitle: "A1C Calculator – Convert A1C to eAG",
    description:
      "Convert A1C to estimated average glucose (eAG) in mg/dL and mmol/L using the ADAG formula (28.7 × A1C − 46.7). Includes accuracy limits and reference info.",
    jsonLdTypes: ["FAQPage", "WebApplication"],
    webAppName: "A1C to eAG Calculator",
    hasFaq: true,
  },
  {
    route: "/blood-sugar-converter",
    pageTitle: "Blood Sugar Converter – mg/dL ⇄ mmol/L",
    description:
      "Convert blood sugar between mg/dL and mmol/L instantly in both directions. Includes a reference table of common values and why the two units exist.",
    jsonLdTypes: ["FAQPage", "WebApplication"],
    webAppName: "Blood Sugar Converter (mg/dL ⇄ mmol/L)",
    hasFaq: true,
  },
  {
    route: "/glucose-to-a1c-estimator",
    pageTitle: "Average Glucose to A1C Estimator",
    description:
      "Estimate an A1C range from your average blood glucose. Shows a range, not a single number, and explains why reverse estimation has built-in uncertainty.",
    jsonLdTypes: ["FAQPage", "WebApplication"],
    webAppName: "Average Glucose to A1C Estimator",
    hasFaq: true,
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
// D4 (shareable-assets): SiteNav keeps exactly the original 8 routes; pages
// flagged notInNav (the chart page) are prerendered/sitemapped but NOT in the
// header nav.
const NAV_ROUTES = PAGES.filter((page) => !page.notInNav).map((page) => page.route);

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
    NAV_ROUTES.length === 8 && NAV_ROUTES.every((r) => navHrefs.has(r)),
    "T3-⑤ SiteNav covers all 8 nav routes",
  );
  check(
    !navHrefs.has("/glycemic-load-chart"),
    "T3-⑤ D4: /glycemic-load-chart is NOT in SiteNav (nav stays at the 8 tool routes)",
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
    // shareable-assets BL-04 internal link ①: the "What these tools help
    // with" section links to the chart page from the home page body.
    check(
      bodyInternal.some((a) => a.getAttribute("href") === "/glycemic-load-chart"),
      "BL-04 home body links to /glycemic-load-chart",
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

  // T3-④ (ticket 07 — converter row only; the other pages' formula strings
  // land with their content tickets): "18.018" present, plus the static
  // common-values table (JS-free content: this file reads raw dist/ HTML).
  // Expected pairs are HARDCODED here, independent of src/lib/display.js, so a
  // rounding bug in the app cannot self-certify: mmol = mgdl / 18.018 rounded
  // half-up to 1 decimal.
  if (route === "/blood-sugar-converter") {
    check(html.includes("18.018"), 'T3-④ converter page contains formula string "18.018"');
    const tables = root.querySelectorAll(".conversion-table");
    check(tables.length === 2, `T3-④ exactly two .conversion-table (found ${tables.length})`);
    const rows = tables[0]?.querySelectorAll("tbody tr") ?? [];
    check(rows.length === 29, `T3-④ conversion table has 29 body rows (found ${rows.length})`);
    const expectedPairs = [
      ["70", "3.9"],
      ["100", "5.6"],
      ["126", "7.0"],
      ["140", "7.8"],
      ["180", "10.0"],
      ["200", "11.1"],
    ];
    const rowCells = rows.map((tr) =>
      tr.querySelectorAll("th,td").map((cell) => cell.text.trim()),
    );
    for (const [mgdl, mmol] of expectedPairs) {
      check(
        rowCells.some((cells) => cells[0] === mgdl && cells[1] === mmol),
        `T3-④ conversion table row: ${mgdl} mg/dL → ${mmol} mmol/L`,
      );
    }

    // CU-02 (content-ux batch spec v1 §2): the forward table (tables[0],
    // 29 rows, 40–600 mg/dL) and the reverse table (tables[1], 27 rows,
    // 2.0–30.0 mmol/L), each under its own H3, reached from the intro through
    // a plain JS-free <a href="#conversion-charts">. Value columns and golden
    // rows are hardcoded HERE, independent of src/data/converterTables.js and
    // src/lib/display.js:
    //   mmol = mg/dL ÷ 18.018, half-up to 1 decimal:
    //      40 →  2.2200 → "2.2"    60 →  3.3300 → "3.3"   126 →  6.9930 → "7.0"
    //     250 → 13.8750 → "13.9"  300 → 16.6500 → "16.7"  600 → 33.2999 → "33.3"
    //   mg/dL = mmol × 18.018, half-up to a whole number:
    //     2.0 →  36.036 → "36"   4.0 →  72.072 → "72"   5.5 →  99.099 → "99"
    //     7.0 → 126.126 → "126" 10.0 → 180.180 → "180" 11.0 → 198.198 → "198"
    //    30.0 → 540.540 → "541"
    const reverseRows = tables[1]?.querySelectorAll("tbody tr") ?? [];
    check(
      reverseRows.length === 27,
      `CU-02 reverse conversion table has exactly 27 body rows (found ${reverseRows.length})`,
    );
    const headersOf = (table) =>
      (table?.querySelectorAll("thead th") ?? []).map((th) => th.text.trim()).join(" | ");
    check(headersOf(tables[0]) === "mg/dL | mmol/L", `CU-02 forward table columns = mg/dL | mmol/L (got ${headersOf(tables[0])})`);
    check(headersOf(tables[1]) === "mmol/L | mg/dL", `CU-02 reverse table columns = mmol/L | mg/dL (got ${headersOf(tables[1])})`);

    const cellsOf = (trs) => trs.map((tr) => tr.querySelectorAll("th,td"));
    const forwardCells = cellsOf(rows);
    const reverseCells = cellsOf(reverseRows);
    const rowShapeOk = (cellRows) =>
      cellRows.length > 0 &&
      cellRows.every(
        (cells) =>
          cells.length === 2 &&
          cells[0].tagName === "TH" &&
          cells[0].getAttribute("scope") === "row" &&
          cells[1].tagName === "TD",
      );
    check(rowShapeOk(forwardCells), 'CU-02 every forward row is <th scope="row"> + one <td>');
    check(rowShapeOk(reverseCells), 'CU-02 every reverse row is <th scope="row"> + one <td>');
    const forwardText = forwardCells.map((cells) => cells.map((cell) => cell.text.trim()));
    const reverseText = reverseCells.map((cells) => cells.map((cell) => cell.text.trim()));

    const expectedForwardMgdl = [
      "40", "50", "60", "70", "80", "90", "100", "110", "120", "126", "130", "140", "150", "160", "170",
      "180", "190", "200", "220", "240", "250", "270", "300", "350", "400", "450", "500", "550", "600",
    ];
    const expectedReverseMmol = [
      "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5",
      "9.0", "9.5", "10.0", "11.0", "12.0", "13.0", "14.0", "15.0", "16.0", "18.0", "20.0", "25.0", "30.0",
    ];
    check(
      JSON.stringify(forwardText.map((cells) => cells[0])) === JSON.stringify(expectedForwardMgdl),
      "CU-02 forward mg/dL column is exactly 40, 50, … 600 (29 spec values, in order)",
    );
    check(
      JSON.stringify(reverseText.map((cells) => cells[0])) === JSON.stringify(expectedReverseMmol),
      "CU-02 reverse mmol/L column is exactly 2.0, 2.5, … 30.0 (27 spec values, in order)",
    );
    check(
      forwardText.length > 0 && forwardText.every((cells) => /^\d+\.\d$/.test(cells[1] ?? "")),
      "CU-02 forward mmol/L cells carry exactly one decimal",
    );
    check(
      reverseText.length > 0 && reverseText.every((cells) => /^\d+$/.test(cells[1] ?? "")),
      "CU-02 reverse mg/dL cells are whole numbers",
    );
    const goldenForward = [
      ["40", "2.2"],
      ["60", "3.3"],
      ["126", "7.0"],
      ["250", "13.9"],
      ["300", "16.7"],
      ["600", "33.3"],
    ];
    for (const [mgdl, mmol] of goldenForward) {
      check(
        forwardText.some((cells) => cells[0] === mgdl && cells[1] === mmol),
        `CU-02 forward table row: ${mgdl} mg/dL → ${mmol} mmol/L`,
      );
    }
    const goldenReverse = [
      ["2.0", "36"],
      ["4.0", "72"],
      ["5.5", "99"],
      ["7.0", "126"],
      ["10.0", "180"],
      ["11.0", "198"],
      ["30.0", "541"],
    ];
    for (const [mmol, mgdl] of goldenReverse) {
      check(
        reverseText.some((cells) => cells[0] === mmol && cells[1] === mgdl),
        `CU-02 reverse table row: ${mmol} mmol/L → ${mgdl} mg/dL`,
      );
    }

    // Layout: H3 (#conversion-charts) → forward table → H3 → reverse table →
    // the existing muted note, as consecutive siblings, outside the calculator.
    const targets = root.querySelectorAll('[id="conversion-charts"]');
    check(targets.length === 1, `CU-02 exactly one element with id="conversion-charts" (found ${targets.length})`);
    const target = targets[0];
    check(
      target?.tagName === "H3" && target.text.trim() === "Common blood sugar values: mg/dL to mmol/L",
      'CU-02 #conversion-charts is the H3 "Common blood sugar values: mg/dL to mmol/L"',
    );
    const siblings = target?.parentNode?.childNodes.filter((node) => node.nodeType === 1) ?? [];
    const at = siblings.indexOf(target);
    const run = at >= 0 ? siblings.slice(at, at + 5) : [];
    check(
      run.length === 5 &&
        run[1] === tables[0] &&
        run[2].tagName === "H3" &&
        run[2].text.trim() === "Common blood sugar values: mmol/L to mg/dL" &&
        run[3] === tables[1] &&
        run[4].tagName === "P" &&
        run[4].text.includes("do not interpret or grade your own reading"),
      'CU-02 order: #conversion-charts H3 → forward table → H3 "Common blood sugar values: mmol/L to mg/dL" → reverse table → the "do not interpret or grade" note',
    );
    check(
      tables.length === 2 && tables.every((table) => !table.closest(".converter-panel")),
      "CU-02 both conversion tables sit outside .converter-panel",
    );

    const jumpLinks = root.querySelectorAll('a[href="#conversion-charts"]');
    check(jumpLinks.length === 1, `CU-02 exactly one <a href="#conversion-charts"> (found ${jumpLinks.length})`);
    check(
      Boolean(jumpLinks[0]?.closest(".tool-page__header")) &&
        jumpLinks[0].text.trim() === "Jump to the conversion charts",
      'CU-02 the intro (.tool-page__header) carries <a href="#conversion-charts">Jump to the conversion charts</a>',
    );
  }

  // T3-④ (ticket 08 — a1c-to-eag row): formula strings + Nathan 2008 source +
  // applicability copy, the STATIC ADA reference table, and the red-line-D4
  // negative scan: the calculator panel (input + notices + result cards) must
  // never contain normal/prediabetes/diabetes — those words are allowed ONLY
  // as static educational prose (reference table / FAQ), never bound to the
  // user's result (ADA: diagnosis requires an NGSP-certified lab test).
  if (route === "/a1c-to-eag-calculator") {
    const body = root.querySelector("body");
    const bodyText = body?.text ?? "";
    check(bodyText.includes("28.7"), 'T3-④ a1c page body contains formula string "28.7"');
    check(bodyText.includes("Nathan"), 'T3-④ a1c page body cites "Nathan" (Diabetes Care 2008)');
    check(bodyText.includes("507"), "T3-④ a1c page states the ADAG sample size (507)");
    check(bodyText.includes("15.7"), "T3-④ a1c page states the ADAG error SD (15.7 mg/dL)");

    const refTables = root.querySelectorAll(".a1c-reference-table");
    check(refTables.length === 1, `T3-④ exactly one .a1c-reference-table (found ${refTables.length})`);
    const refRows = refTables[0]?.querySelectorAll("tbody tr") ?? [];
    check(refRows.length === 3, `T3-④ ADA reference table has 3 static rows (found ${refRows.length})`);
    const refText = refTables[0]?.text ?? "";
    for (const category of ["Normal", "Prediabetes", "Diabetes"]) {
      check(refText.includes(category), `T3-④ ADA reference table lists "${category}" (static education)`);
    }
    const refHtml = refTables[0]?.innerHTML ?? "";
    check(
      !refHtml.includes("aria-current") && !/class="[^"]*(active|current|highlight)/i.test(refHtml),
      "T3-④ D4: reference table has no highlight class / aria-current marker",
    );

    const panels = root.querySelectorAll(".a1c-calculator-panel");
    check(panels.length === 1, `T3-④ exactly one .a1c-calculator-panel (found ${panels.length})`);
    const panelText = (panels[0]?.text ?? "").toLowerCase();
    for (const verdict of ["normal", "prediabetes", "diabetes"]) {
      check(
        !panelText.includes(verdict),
        `T3-④ D4: calculator panel (result/notice area) contains no "${verdict}"`,
      );
    }
  }

  // T3-④ (ticket 09 — glucose→A1C estimator row): the backwards formula +
  // approximation copy must be prerendered, and three red lines must hold
  // statically: ① the result area never carries a single-point percentage
  // (prerendered input is empty, so ANY percentage in the panel would be a
  // hardcoded point output — the range shape itself is asserted at runtime in
  // tests/e2e/estimator.spec.js); ② the phrase "ADAG formula" is reserved for
  // the related-tools link pointing at the forward-direction page and may not
  // label the backwards equation; ③ no diagnostic verdicts in the panel
  // (this page has no educational band table at all, per ticket 09).
  if (route === "/glucose-to-a1c-estimator") {
    const bodyText = root.querySelector("body")?.text ?? "";
    check(bodyText.includes("28.7"), 'T3-④ estimator page body contains formula string "28.7"');
    check(
      bodyText.includes("(eAG + 46.7) ÷ 28.7"),
      'T3-④ estimator page shows the backwards formula "(eAG + 46.7) ÷ 28.7"',
    );
    check(bodyText.includes("15.7"), "T3-④ estimator page states the ADAG error SD (15.7 mg/dL)");
    check(
      bodyText.toLowerCase().includes("algebraic"),
      'T3-④ estimator page carries the approximation copy ("algebraic")',
    );
    check(
      bodyText.toLowerCase().includes("asymmetric"),
      'T3-④ estimator page explains regression asymmetry ("asymmetric")',
    );

    const panels = root.querySelectorAll(".estimator-panel");
    check(panels.length === 1, `T3-④ exactly one .estimator-panel (found ${panels.length})`);
    const panel = panels[0];
    const panelText = panel?.text ?? "";
    check(
      (panel?.querySelectorAll(".result-card") ?? []).length === 1,
      "T3-④ estimator panel has exactly one result card (a single RANGE card, no point cards)",
    );
    check(
      !/\d(\.\d+)?\s*%/.test(panelText),
      "T3-④ no percentage value prerendered in the estimator panel (no single-point output)",
    );
    for (const verdict of ["normal", "prediabetes", "diabetes"]) {
      check(
        !panelText.toLowerCase().includes(verdict),
        `T3-④ D4: estimator panel contains no "${verdict}"`,
      );
    }

    check(
      !panelText.includes("ADAG formula"),
      'T3-④ estimator panel never labels the backwards equation "ADAG formula"',
    );
    const related = root.querySelector(".related-tools");
    const countAdagFormula = (s) => s.split("ADAG formula").length - 1;
    check(
      countAdagFormula(bodyText) === countAdagFormula(related?.text ?? ""),
      '"ADAG formula" appears ONLY inside the related-tools context (forward-direction link)',
    );
    check(
      (related?.querySelectorAll('a[href="/a1c-to-eag-calculator"]') ?? []).length >= 1,
      'the related-tools "ADAG formula" context links to /a1c-to-eag-calculator',
    );
  }

  // CU-03 (content-ux batch spec v1 §2): the static estimated-A1C range chart.
  // #estimator-chart is a <section> OUTSIDE .estimator-panel (after it, before
  // the formula section) holding exactly one .conversion-table: the three spec
  // column headers and 18 body rows, average glucose 70–240 mg/dL every 10
  // (the expected column is built HERE from integers). Golden rows are
  // hardcoded HERE, independent of src/data/estimatorChart.js,
  // src/lib/formulas.js and src/lib/display.js, so a formula or rounding bug
  // cannot self-certify. Range endpoints are the center (x + 46.7) ÷ 28.7
  // ± 15.7 ÷ 28.7, i.e. (x + 31) ÷ 28.7 and (x + 62.4) ÷ 28.7, each rounded
  // half-up to 0.1; mmol/L = x ÷ 18.018, half-up to 1 decimal:
  //      70 →  3.8850 → "3.9"    3.5192 / 4.6132  → "≈ 3.5% – 4.6%"
  //     100 →  5.5501 → "5.6"    4.5645 / 5.6585  → "≈ 4.6% – 5.7%"
  //     150 →  8.3250 → "8.3"    6.3066 / 7.4007  → "≈ 6.3% – 7.4%"
  //     160 →  8.8800 → "8.9"    6.6551 / 7.7491  → "≈ 6.7% – 7.7%"
  //     200 → 11.1000 → "11.1"   8.0488 / 9.1429  → "≈ 8.0% – 9.1%"
  //     240 → 13.3200 → "13.3"   9.4425 / 10.5366 → "≈ 9.4% – 10.5%"
  // All 18 rows are also re-derived here in exact integer arithmetic (tenths:
  // low = (100x + 3100) / 287, high = (100x + 6240) / 287, mmol = 10000x /
  // 18018, half-up). Red lines (main Spec D4 / §9): every percentage in the
  // section belongs to a "≈ X.X% – Y.Y%" range cell (no single-point A1C), the
  // table is plain markup with no class / style / highlight on any row or
  // cell, and neither the section nor the intro's jump paragraph carries band
  // vocabulary, a value label, a comparison, or the "ADAG formula" label.
  if (route === "/glucose-to-a1c-estimator") {
    const charts = root.querySelectorAll('[id="estimator-chart"]');
    check(charts.length === 1, `CU-03 exactly one element with id="estimator-chart" (found ${charts.length})`);
    const chart = charts[0];
    check(chart?.tagName === "SECTION", `CU-03 #estimator-chart is a <section> (got <${chart?.tagName ?? "none"}>)`);
    check(
      chart?.querySelector("h2")?.text.trim() === "Estimated A1C ranges for common average glucose levels",
      'CU-03 #estimator-chart H2 is "Estimated A1C ranges for common average glucose levels"',
    );

    const chartTables = chart?.querySelectorAll("table") ?? [];
    check(
      chartTables.length === 1 && chartTables[0].classList.contains("conversion-table"),
      `CU-03 #estimator-chart holds exactly one table, a .conversion-table (found ${chartTables.length})`,
    );
    const chartTable = chartTables[0];
    const chartHeaders = (chartTable?.querySelectorAll("thead th") ?? []).map((th) => th.text.trim());
    check(
      JSON.stringify(chartHeaders) ===
        JSON.stringify(["Average glucose (mg/dL)", "Average glucose (mmol/L)", "Estimated A1C range"]),
      `CU-03 chart columns = Average glucose (mg/dL) | Average glucose (mmol/L) | Estimated A1C range (got ${chartHeaders.join(" | ")})`,
    );
    const chartRows = chartTable?.querySelectorAll("tbody tr") ?? [];
    check(chartRows.length === 18, `CU-03 estimator chart has exactly 18 body rows (found ${chartRows.length})`);
    const chartCells = chartRows.map((tr) => tr.querySelectorAll("th,td"));
    check(
      chartCells.length > 0 &&
        chartCells.every(
          (cells) =>
            cells.length === 3 &&
            cells[0].tagName === "TH" &&
            cells[0].getAttribute("scope") === "row" &&
            cells.slice(1).every((cell) => cell.tagName === "TD"),
        ),
      'CU-03 every chart row is <th scope="row">mg/dL</th> + two <td> cells',
    );
    const chartText = chartCells.map((cells) => cells.map((cell) => cell.text.trim()));
    const expectedMgdlColumn = Array.from({ length: 18 }, (_, i) => String(70 + i * 10));
    check(
      JSON.stringify(chartText.map((cells) => cells[0])) === JSON.stringify(expectedMgdlColumn),
      "CU-03 mg/dL column is exactly 70, 80, … 240 (18 spec values, in order)",
    );
    check(
      chartText.length > 0 && chartText.every((cells) => /^\d+\.\d$/.test(cells[1] ?? "")),
      "CU-03 mmol/L cells carry exactly one decimal",
    );
    const RANGE_CELL = /^≈ (\d+\.\d)% – (\d+\.\d)%$/;
    check(
      chartText.length > 0 &&
        chartText.every((cells) => {
          const match = RANGE_CELL.exec(cells[2] ?? "");
          return match !== null && Number(match[1]) < Number(match[2]);
        }),
      'CU-03 every A1C cell is a genuine range "≈ X.X% – Y.Y%" (low < high), never a single value',
    );
    const goldenChartRows = [
      ["70", "3.9", "≈ 3.5% – 4.6%"],
      ["100", "5.6", "≈ 4.6% – 5.7%"],
      ["150", "8.3", "≈ 6.3% – 7.4%"],
      ["160", "8.9", "≈ 6.7% – 7.7%"],
      ["200", "11.1", "≈ 8.0% – 9.1%"],
      ["240", "13.3", "≈ 9.4% – 10.5%"],
    ];
    for (const expected of goldenChartRows) {
      check(
        chartText.some((cells) => expected.every((value, i) => cells[i] === value)),
        `CU-03 estimator chart row: ${expected[0]} mg/dL → ${expected[1]} mmol/L → ${expected[2]}`,
      );
    }
    const halfUp = (n, d) => Math.floor((2 * n + d) / (2 * d));
    const tenths = (t) => `${Math.floor(t / 10)}.${t % 10}`;
    const derivedRows = expectedMgdlColumn.map((mgdl) => {
      const x = Number(mgdl);
      return [
        mgdl,
        tenths(halfUp(10000 * x, 18018)),
        `≈ ${tenths(halfUp(100 * x + 3100, 287))}% – ${tenths(halfUp(100 * x + 6240, 287))}%`,
      ];
    });
    check(
      JSON.stringify(chartText) === JSON.stringify(derivedRows),
      "CU-03 all 18 rows equal the independent exact-integer derivation (mmol/L + both range endpoints)",
    );

    const RANGE_ANYWHERE = /≈ \d+\.\d% – \d+\.\d%/g;
    const chartAllText = chart?.text ?? "";
    const rangeStrings = chartAllText.match(RANGE_ANYWHERE) ?? [];
    check(
      rangeStrings.length === 18,
      `CU-03 #estimator-chart shows exactly 18 range strings, one per row (found ${rangeStrings.length})`,
    );
    check(
      Boolean(chart) && !chartAllText.replace(RANGE_ANYWHERE, "").includes("%"),
      'CU-03 every percentage in #estimator-chart is part of a "≈ X.X% – Y.Y%" range (no single-point A1C in the table or its copy)',
    );
    const tableDescendants = chartTable?.querySelectorAll("*") ?? [];
    check(
      tableDescendants.length > 0 &&
        tableDescendants.every(
          (node) =>
            ["THEAD", "TBODY", "TR", "TH", "TD"].includes(node.tagName) &&
            Object.keys(node.attributes).every((name) => name === "scope"),
        ),
      "CU-03 D4: the chart table is plain thead/tbody/tr/th/td with no attribute but scope (no class, style, color, or highlight on any row or cell)",
    );

    const estimatorPanel = root.querySelector(".estimator-panel");
    check(Boolean(chart) && !chart.closest(".estimator-panel"), "CU-03 #estimator-chart is not inside .estimator-panel");
    check(
      Boolean(estimatorPanel) && estimatorPanel.querySelectorAll("table, #estimator-chart").length === 0,
      "CU-03 .estimator-panel contains no table and no #estimator-chart",
    );
    check(
      Boolean(chart) && chart.querySelectorAll(".estimator-panel").length === 0,
      "CU-03 #estimator-chart does not wrap .estimator-panel",
    );
    const mainSections = root.querySelectorAll("main section");
    const formulaSection = root.querySelector('section[aria-labelledby="estimator-formula-heading"]');
    const panelIndex = mainSections.indexOf(estimatorPanel);
    const chartIndex = mainSections.indexOf(chart);
    const formulaIndex = mainSections.indexOf(formulaSection);
    check(
      panelIndex >= 0 && panelIndex < chartIndex && chartIndex < formulaIndex,
      `CU-03 #estimator-chart comes after .estimator-panel and before the formula section (indices ${panelIndex} / ${chartIndex} / ${formulaIndex})`,
    );

    const jumpLinks = root.querySelectorAll('a[href="#estimator-chart"]');
    check(jumpLinks.length === 1, `CU-03 exactly one <a href="#estimator-chart"> (found ${jumpLinks.length})`);
    check(
      Boolean(jumpLinks[0]?.closest(".tool-page__header")) &&
        jumpLinks[0].text.trim() === "Jump to the estimated A1C range chart",
      'CU-03 the intro (.tool-page__header) carries <a href="#estimator-chart">Jump to the estimated A1C range chart</a>',
    );
    const jumpParagraph = jumpLinks[0]?.closest("p");
    check(
      (jumpParagraph?.text.trim() ?? "").startsWith("Looking up a common average?"),
      'CU-03 the jump paragraph opens with "Looking up a common average?"',
    );
    check(
      Boolean(jumpParagraph) && !jumpParagraph.text.includes("%"),
      "CU-03 the jump paragraph contains no percentage",
    );

    // Each block (paragraph / heading / cell) is scanned on its own, so
    // adjacent cells can never glue into or out of a word boundary.
    const chartBlocks = chart?.querySelectorAll("h2, p, th, td") ?? [];
    const squash = (text) => text.replace(/\s+/g, "");
    check(
      Boolean(chart) && squash(chartBlocks.map((node) => node.text).join("")) === squash(chart.text),
      "CU-03 the red-line scan blocks (h2 / p / th / td) cover every character of #estimator-chart",
    );
    const LABEL_WORDS =
      "good|bad|healthy|unhealthy|ideal|optimal|excellent|poor|safe|unsafe|dangerous|elevated|target|goal|aim|high|low|borderline|risk";
    const cu03Rules = [
      ["normal", /normal/i],
      ["prediabet", /prediabet/i],
      ["diabet", /diabet/i],
      ['"ADAG formula" / "ADAG equation" label', /ADAG\s+(formula|equation)/i],
      ["percent spelled out", /percent/i],
      ["band / value label word", new RegExp(`\\b(${LABEL_WORDS})s?\\b`, "i")],
      [
        "comparative + number (below 7 / under 7 / less than 7 …)",
        /\b(below|under|less than|lower than|above|over|greater than|higher than|more than|at or below|at or above|at most|at least|up to|no more than|no higher than)\s+(about\s+|around\s+|roughly\s+|approximately\s+)?\d/i,
      ],
      ["comparison symbol + number (< 7 …)", /[<>≤≥]\s*\d/],
    ];
    const cu03Blocks = [
      ["jump paragraph", jumpParagraph?.text ?? ""],
      ...chartBlocks.map((node) => ["#estimator-chart", node.text]),
    ];
    const cu03Violations = cu03Blocks.flatMap(([where, block]) =>
      cu03Rules.filter(([, pattern]) => pattern.test(block)).map(([label]) => `${where}: ${label}`),
    );
    check(
      cu03Violations.length === 0,
      `CU-03 D4: no band vocabulary, value label, comparison, or "ADAG formula" in the chart section or the jump paragraph${
        cu03Violations.length ? ` (hits: ${cu03Violations.join("; ")})` : ""
      }`,
    );
  }

  // T3-④ (ticket 10 — GMI row): the Bergenstal 2018 formula (constant
  // 0.02392) and the mandated GMI-vs-A1C explainer (±0.5 percentage-point
  // difference is common / a mismatch is not a data error / GMI cannot
  // replace a lab A1C) must be prerendered. Panel red lines mirror the other
  // tool pages: no diagnostic verdicts inside .gmi-panel ("Diabetes Care"
  // citations must live outside it), and no percentage may be prerendered in
  // the panel — the prerendered input is empty, so any % in there would be a
  // hardcoded result.
  if (route === "/gmi-calculator") {
    const bodyText = root.querySelector("body")?.text ?? "";
    check(bodyText.includes("0.02392"), 'T3-④ gmi page body contains formula constant "0.02392"');
    check(bodyText.includes("3.31"), 'T3-④ gmi page body contains formula intercept "3.31"');
    check(bodyText.includes("Bergenstal"), 'T3-④ gmi page cites "Bergenstal" (Diabetes Care 2018)');
    check(bodyText.includes("±0.5"), "T3-④ gmi page carries the ±0.5 percentage-point difference copy");
    check(
      bodyText.includes("not a data error"),
      'T3-④ gmi page states a GMI/A1C mismatch is "not a data error"',
    );
    check(
      bodyText.includes("cannot replace a laboratory A1C"),
      'T3-④ gmi page states GMI "cannot replace a laboratory A1C"',
    );

    const panels = root.querySelectorAll(".gmi-panel");
    check(panels.length === 1, `T3-④ exactly one .gmi-panel (found ${panels.length})`);
    const panelText = panels[0]?.text ?? "";
    check(
      !/\d(\.\d+)?\s*%/.test(panelText),
      "T3-④ no percentage value prerendered in the gmi panel (no hardcoded result)",
    );
    for (const verdict of ["normal", "prediabetes", "diabetes"]) {
      check(
        !panelText.toLowerCase().includes(verdict),
        `T3-④ D4: gmi panel contains no "${verdict}"`,
      );
    }
  }

  // GC-01 (GMI content spec v1, D2~D5): the static GMI chart. #gmi-chart is a
  // <section> holding exactly one table: the three spec column headers and 30
  // body rows — GMI 5.5–8.0 in 0.1 steps plus 8.5 / 9.0 / 9.5 / 10.0, the
  // expected labels built HERE from integer tenths — and seven golden rows
  // hand-computed HERE from (GMI − 3.31) ÷ 0.02392 and ÷ 18.018 (independent
  // of src/data/gmiChart.js and src/lib/display.js, so a formula or rounding
  // bug cannot self-certify):
  //    5.5% →  91.5552 → "92"  /  5.0813 → "5.1"
  //    6.0% → 112.4582 → "112" /  6.2414 → "6.2"
  //    6.5% → 133.3612 → "133" /  7.4016 → "7.4"
  //    7.0% → 154.2642 → "154" /  8.5617 → "8.6"
  //    7.5% → 175.1672 → "175" /  9.7218 → "9.7"
  //    8.0% → 196.0702 → "196" / 10.8819 → "10.9"
  //   10.0% → 279.6823 → "280" / 15.5224 → "15.5"
  // The chart sits OUTSIDE .gmi-panel (after it, before the formula section),
  // and the intro reaches it through a plain, JS-free <a href="#gmi-chart">.
  // Red line 2 (spec §3) is scanned over every piece of GC-01 copy — the jump
  // paragraph, the chart section, and the four new FAQ answers — and the four
  // new questions must follow the original four in the FAQPage JSON-LD
  // (verbatim visible text is already T3-⑧'s job above).
  if (route === "/gmi-calculator") {
    const charts = root.querySelectorAll('[id="gmi-chart"]');
    check(charts.length === 1, `GC-01 exactly one element with id="gmi-chart" (found ${charts.length})`);
    const chart = charts[0];
    check(chart?.tagName === "SECTION", `GC-01 #gmi-chart is a <section> (got <${chart?.tagName ?? "none"}>)`);
    check(
      chart?.querySelector("h2")?.text.trim() === "GMI chart: the CGM average behind each GMI value",
      'GC-01 #gmi-chart H2 is "GMI chart: the CGM average behind each GMI value"',
    );

    const chartTables = chart?.querySelectorAll("table") ?? [];
    check(chartTables.length === 1, `GC-01 #gmi-chart holds exactly one table (found ${chartTables.length})`);
    const chartTable = chartTables[0];
    const chartHeaders = (chartTable?.querySelectorAll("thead th") ?? []).map((th) => th.text.trim());
    check(
      JSON.stringify(chartHeaders) ===
        JSON.stringify(["GMI", "CGM mean glucose (mg/dL)", "CGM mean glucose (mmol/L)"]),
      `GC-01 chart columns = GMI | CGM mean glucose (mg/dL) | CGM mean glucose (mmol/L) (got ${chartHeaders.join(" | ")})`,
    );
    const chartRows = chartTable?.querySelectorAll("tbody tr") ?? [];
    check(chartRows.length === 30, `GC-01 GMI chart has exactly 30 body rows (found ${chartRows.length})`);
    const chartCells = chartRows.map((tr) => tr.querySelectorAll("th,td"));
    check(
      chartCells.length > 0 &&
        chartCells.every(
          (cells) =>
            cells.length === 3 &&
            cells[0].tagName === "TH" &&
            cells[0].getAttribute("scope") === "row" &&
            cells.slice(1).every((cell) => cell.tagName === "TD"),
        ),
      'GC-01 every chart row is <th scope="row">GMI</th> + two <td> cells',
    );
    const chartText = chartCells.map((cells) => cells.map((cell) => cell.text.trim()));
    const expectedGmiColumn = [...Array.from({ length: 26 }, (_, i) => 55 + i), 85, 90, 95, 100].map(
      (tenths) => `${Math.floor(tenths / 10)}.${tenths % 10}%`,
    );
    check(
      JSON.stringify(chartText.map((cells) => cells[0])) === JSON.stringify(expectedGmiColumn),
      "GC-01 GMI column is 5.5%–8.0% in 0.1 steps, then 8.5% / 9.0% / 9.5% / 10.0%, in order",
    );
    check(
      chartText.length > 0 &&
        chartText.every((cells) => /^\d+$/.test(cells[1] ?? "") && /^\d+\.\d$/.test(cells[2] ?? "")),
      "GC-01 mg/dL cells are whole numbers and mmol/L cells carry exactly one decimal",
    );
    check(
      chartText.length > 0 &&
        chartText.every((cells, i) => i === 0 || Number(cells[1]) > Number(chartText[i - 1][1])),
      "GC-01 mg/dL column strictly increases down the chart",
    );
    const goldenChartRows = [
      ["5.5%", "92", "5.1"],
      ["6.0%", "112", "6.2"],
      ["6.5%", "133", "7.4"],
      ["7.0%", "154", "8.6"],
      ["7.5%", "175", "9.7"],
      ["8.0%", "196", "10.9"],
      ["10.0%", "280", "15.5"],
    ];
    for (const expected of goldenChartRows) {
      check(
        chartText.some((cells) => expected.every((value, i) => cells[i] === value)),
        `GC-01 GMI chart row: ${expected[0]} → ${expected[1]} mg/dL / ${expected[2]} mmol/L`,
      );
    }

    const gmiPanel = root.querySelector(".gmi-panel");
    check(Boolean(chart) && !chart.closest(".gmi-panel"), "GC-01 #gmi-chart is not inside .gmi-panel");
    check(
      Boolean(gmiPanel) && gmiPanel.querySelectorAll("table, #gmi-chart").length === 0,
      "GC-01 .gmi-panel contains no table and no #gmi-chart",
    );
    check(
      Boolean(chart) && chart.querySelectorAll(".gmi-panel").length === 0,
      "GC-01 #gmi-chart does not wrap .gmi-panel",
    );
    const mainSections = root.querySelectorAll("main section");
    const formulaSection = root.querySelector('section[aria-labelledby="gmi-formula-heading"]');
    const panelIndex = mainSections.indexOf(gmiPanel);
    const chartIndex = mainSections.indexOf(chart);
    const formulaIndex = mainSections.indexOf(formulaSection);
    check(
      panelIndex >= 0 && panelIndex < chartIndex && chartIndex < formulaIndex,
      `GC-01 #gmi-chart comes after .gmi-panel and before the formula section (indices ${panelIndex} / ${chartIndex} / ${formulaIndex})`,
    );

    const jumpLinks = root.querySelectorAll('a[href="#gmi-chart"]');
    check(jumpLinks.length >= 1, `GC-01 page has an <a href="#gmi-chart"> jump link (found ${jumpLinks.length})`);
    const introJump = jumpLinks.find((a) => a.closest(".tool-page__header"));
    check(Boolean(introJump), 'GC-01 the intro (.tool-page__header) carries the <a href="#gmi-chart"> link');
    const jumpParagraph = introJump?.closest("p");
    check(
      (jumpParagraph?.text.trim() ?? "").startsWith("Already have a GMI from your CGM report?"),
      'GC-01 the jump paragraph opens with "Already have a GMI from your CGM report?"',
    );

    // Red line 2 rules: no diagnostic band vocabulary, no good/bad-style label
    // bound to a value, no target number in any wording. Each block (paragraph
    // / cell / answer) is checked whole and sentence by sentence; sentences
    // split only on punctuation FOLLOWED by whitespace, so "6.5%" stays intact.
    const LABEL_WORDS =
      "good|bad|healthy|unhealthy|ideal|optimal|excellent|poor|safe|unsafe|dangerous|elevated|target|goal|aim";
    const redLineRules = [
      ["prediabet", /prediabet/i],
      ["normal", /normal/i],
      ["diabetic range", /diabetic range/i],
      ["diabet (GC-01 copy avoids the word entirely)", /diabet/i],
      [
        "comparative + number (below 7 / under 7 / less than 7 …)",
        /\b(below|under|less than|lower than|above|over|greater than|higher than|more than|at or below|at or above|at most|at least|up to|no more than|no higher than)\s+(about\s+|around\s+|roughly\s+|approximately\s+)?\d/i,
      ],
      ["comparison symbol + number (< 7 …)", /[<>≤≥]\s*\d/],
      ["label word + GMI/A1C (good GMI …)", new RegExp(`\\b(${LABEL_WORDS})\\s+(gmi|a1c)\\b`, "i")],
      ["too high / too low", /\btoo (high|low)\b/i],
    ];
    const labelWord = new RegExp(`\\b(${LABEL_WORDS})s?\\b`, "i");
    const redLineHits = (block) => {
      const hits = redLineRules.filter(([, pattern]) => pattern.test(block)).map(([label]) => label);
      if (block.split(/(?<=[.?!;:])\s+/).some((sentence) => /\d/.test(sentence) && labelWord.test(sentence))) {
        hits.push("label / target word in a sentence with a number");
      }
      return hits;
    };

    const newFaqQuestions = [
      "What does GMI mean?",
      "Can I convert my GMI to an A1C?",
      "What average glucose does my GMI correspond to?",
      'Is there a "good" GMI number?',
    ];
    const newFaqAnswers = newFaqQuestions.map((question) => {
      const entry = root
        .querySelectorAll(".faq-list details")
        .find((details) => details.querySelector("summary")?.text.trim() === question);
      return entry?.querySelector("p")?.text.trim() ?? null;
    });
    check(
      newFaqAnswers.every((answer) => answer !== null && answer.length > 0),
      "GC-01 all four new FAQ questions render as visible <details> with an answer",
    );

    const chartBlocks = chart?.querySelectorAll("h2, p, th, td") ?? [];
    const squash = (text) => text.replace(/\s+/g, "");
    check(
      Boolean(chart) && squash(chartBlocks.map((node) => node.text).join("")) === squash(chart.text),
      "GC-01 the red-line scan blocks (h2 / p / th / td) cover every character of #gmi-chart",
    );
    const scanBlocks = [
      ["jump paragraph", jumpParagraph?.text ?? ""],
      ...chartBlocks.map((node) => ["#gmi-chart", node.text]),
      ...newFaqQuestions.map((question, i) => [`FAQ answer "${question}"`, newFaqAnswers[i] ?? ""]),
    ];
    const redLineViolations = scanBlocks.flatMap(([where, block]) =>
      redLineHits(block).map((hit) => `${where}: ${hit}`),
    );
    check(
      redLineViolations.length === 0,
      `GC-01 red line 2: no band vocabulary, value label, or target number in GC-01 copy${
        redLineViolations.length ? ` (hits: ${redLineViolations.join("; ")})` : ""
      }`,
    );
    check(
      newFaqAnswers[3] !== null && !/\d/.test(newFaqAnswers[3]),
      'GC-01 the "good GMI" answer contains no number at all (no target value)',
    );
    check(
      (newFaqAnswers[2] ?? "").includes("(GMI − 3.31) ÷ 0.02392") &&
        (newFaqAnswers[2] ?? "").includes("a GMI of 6.5% corresponds to a CGM average of about 133 mg/dL (7.4 mmol/L)"),
      "GC-01 the average-glucose answer shows the inverse formula and the 6.5% golden row (133 mg/dL / 7.4 mmol/L)",
    );

    if (nodes !== null) {
      const faqNames = (nodes.find((node) => node["@type"] === "FAQPage")?.mainEntity ?? []).map(
        (entry) => entry.name,
      );
      const expectedFaqNames = [
        "Why is my GMI different from my lab A1C?",
        "How many days of CGM data do I need for a reliable GMI?",
        "Can GMI replace a lab A1C test?",
        "Which number from my CGM app should I enter?",
        ...newFaqQuestions,
      ];
      check(
        JSON.stringify(faqNames) === JSON.stringify(expectedFaqNames),
        `GC-01 FAQPage JSON-LD = the original 4 questions, then the 4 new ones, in order (got ${faqNames.length})`,
      );
    }
  }

  // T3-④ (ticket 11 — GI lookup row): the static reference table must hold
  // EXACTLY the 27 fixed, eligibility-checked foods (Spec §6.2 via
  // giData.selectStaticTable — a shrunken table means the selector silently
  // failed), spot-checked against two known gi.json values hardcoded HERE
  // (independent of src/lib/giData.js, so a data/selector bug cannot
  // self-certify). The honest provenance note (category-level DiOGenes
  // assignments, not individually measured) must be prerendered, and the §6.1
  // N/A display string must NEVER appear inside the static table — every row
  // in it is an eligible, measurable-carbs entry by construction. The GI vs GL
  // section is this page's mandated §5 content.
  if (route === "/glycemic-index-calculator") {
    const tables = root.querySelectorAll(".gi-static-table");
    check(tables.length === 1, `T3-④ exactly one .gi-static-table (found ${tables.length})`);
    const rows = tables[0]?.querySelectorAll("tbody tr") ?? [];
    check(rows.length === 27, `T3-④ GI static table has exactly 27 rows (found ${rows.length})`);
    const rowCells = rows.map((tr) =>
      tr.querySelectorAll("th,td").map((cell) => cell.text.trim()),
    );
    // Spot checks: [name, gi, band, carbs_per_100g] straight from gi.json.
    const expectedRows = [
      ["Rye bread", "89", "High", "47"],
      ["Apple", "38", "Low", "11.1"],
    ];
    for (const [name, gi, band, carbs] of expectedRows) {
      check(
        rowCells.some(
          (cells) => cells[0] === name && cells[1] === gi && cells[2] === band && cells[3] === carbs,
        ),
        `T3-④ GI static table row: ${name} → GI ${gi} / ${band} / ${carbs} g carbs`,
      );
    }
    const tableText = tables[0]?.text ?? "";
    check(
      !tableText.includes("N/A"),
      "T3-④ §6.1 N/A display string never appears inside the static table",
    );

    const bodyText = root.querySelector("body")?.text ?? "";
    check(bodyText.includes("DiOGenes"), 'T3-④ gi page names the data source "DiOGenes"');
    check(
      bodyText.includes("category-level"),
      'T3-④ gi page carries the provenance copy ("category-level" assignments)',
    );
    check(
      bodyText.includes("not individually measured"),
      'T3-④ gi page states values are "not individually measured"',
    );
    check(
      bodyText.includes("Glycemic index vs glycemic load"),
      "T3-④ gi page carries the GI vs GL difference section",
    );

    // shareable-assets BL-04 internal link ③: the GI page's related-tools
    // block links to the chart page — pure addition, existing items untouched.
    check(
      root.querySelectorAll('.related-tools a[href="/glycemic-load-chart"]').length >= 1,
      "BL-04 gi related-tools links to /glycemic-load-chart",
    );
  }

  // T3-④ (ticket 12 — GL row): the static serving-level GL table must hold
  // exactly the 27 selector foods, spot-checked against two golden rows
  // hand-computed HERE from gi.json + the hardcoded typical servings
  // (independent of src/data/glStaticTable.js, so a data or rounding bug
  // cannot self-certify):
  //   Rye bread   gi 89, carbs 47 g/100 g, 30 g slice → 14.1 g carbs
  //               → GL = 89 × 14.1 / 100 = 12.549 → "12.5" / Medium
  //   Watermelon  gi 76, carbs 8.1 g/100 g, 120 g slice → 9.72 g carbs
  //               → GL = 76 × 9.72 / 100 = 7.3872 → "7.4" / Low
  // Plus: the §5 GL formula string (÷ 100 or / 100), the band boundary
  // semantics (≤ 10 / ≥ 20), the "glycaemic" British spelling, the DiOGenes
  // provenance, and the negative scans — no N/A display string and no
  // encoding-suspect entry (egg white) inside the table.
  if (route === "/glycemic-load-calculator") {
    const bodyText = root.querySelector("body")?.text ?? "";
    check(
      bodyText.includes("÷ 100") || bodyText.includes("/ 100"),
      'T3-④ GL page contains the GL formula string ("÷ 100" or "/ 100")',
    );

    const tables = root.querySelectorAll(".gl-static-table");
    check(tables.length === 1, `T3-④ exactly one .gl-static-table (found ${tables.length})`);
    const rows = tables[0]?.querySelectorAll("tbody tr") ?? [];
    check(rows.length === 27, `T3-④ GL static table has exactly 27 rows (found ${rows.length})`);
    const rowCells = rows.map((tr) =>
      tr.querySelectorAll("th,td").map((cell) => cell.text.trim()),
    );
    // [name, gi, carbs_per_100g, serving label, GL display, GL band]
    const expectedGlRows = [
      ["Rye bread", "89", "47", "1 slice (30 g)", "12.5", "Medium"],
      ["Watermelon", "76", "8.1", "1 slice (120 g)", "7.4", "Low"],
    ];
    for (const expected of expectedGlRows) {
      check(
        rowCells.some((cells) => expected.every((value, i) => cells[i] === value)),
        `T3-④ GL static table row: ${expected[0]} → ${expected[3]} → GL ${expected[4]} (${expected[5]})`,
      );
    }

    const tableText = tables[0]?.text ?? "";
    check(
      !tableText.includes("N/A"),
      "T3-④ §6.1 N/A display string never appears inside the GL static table",
    );
    check(
      !tableText.includes("Egg"),
      "T3-④ no encoding-suspect entry (egg white) inside the GL static table",
    );

    check(bodyText.includes("≤ 10"), 'T3-④ GL band boundary semantics: "≤ 10" (Low) prerendered');
    check(bodyText.includes("≥ 20"), 'T3-④ GL band boundary semantics: "≥ 20" (High) prerendered');
    check(bodyText.includes("glycaemic"), 'T3-④ GL page covers the British spelling "glycaemic"');
    check(bodyText.includes("DiOGenes"), 'T3-④ GL page names the data source "DiOGenes"');

    // shareable-assets BL-04 internal link ②: the table section links to the
    // chart page (plus one more inside related-tools) — pure additions, the
    // assertions above are untouched.
    check(
      root.querySelectorAll('a[href="/glycemic-load-chart"]').length >= 2,
      "BL-04 GL page links to /glycemic-load-chart (table section + related-tools)",
    );
  }

  // T3-④ (shareable-assets BL-04 — /glycemic-load-chart): the citable
  // quick-reference page. The 27-row table must carry THREE GL tiers per food
  // (50 g / 100 g / typical serving), each cell in the fixed
  // "<display> (<band>)" shape, spot-checked against two golden rows
  // hand-computed HERE from gi.json + the hardcoded typical servings
  // (independent of src/data/glChartTable.js, so a data or rounding bug
  // cannot self-certify):
  //   Rye bread   gi 89, carbs 47 g/100 g:
  //               50 g → 23.5 g carbs → GL 20.915 → "20.9" High
  //               100 g → 47 g carbs  → GL 41.83  → "41.8" High
  //               30 g slice → 14.1 g → GL 12.549 → "12.5" Medium
  //   Watermelon  gi 76, carbs 8.1 g/100 g:
  //               50 g → 4.05 g carbs → GL 3.078  → "3.1" Low
  //               100 g → 8.1 g carbs → GL 6.156  → "6.2" Low
  //               120 g slice → 9.72 g → GL 7.3872 → "7.4" Low
  // Plus: the band boundary semantics (≤ 10 / ≥ 20), the "How to cite this
  // table" block, the honest DiOGenes category-level provenance, the Dataset
  // JSON-LD detail (isBasedOn DiOGenes, creator Organization {BRAND}), and
  // the same negative scans as the other static tables (no N/A, no egg
  // white). Everything here is JS-free content read from raw dist/ HTML.
  if (route === "/glycemic-load-chart") {
    const bodyText = root.querySelector("body")?.text ?? "";

    const tables = root.querySelectorAll(".gl-chart-table");
    check(tables.length === 1, `T3-④ exactly one .gl-chart-table (found ${tables.length})`);

    const headers = (tables[0]?.querySelectorAll("thead th") ?? []).map((th) => th.text.trim());
    for (const tier of ["GL (50 g)", "GL (100 g)", "GL (typical serving)"]) {
      check(headers.includes(tier), `T3-④ chart table has tier column header "${tier}"`);
    }

    const rows = tables[0]?.querySelectorAll("tbody tr") ?? [];
    check(rows.length === 27, `T3-④ chart table has exactly 27 rows (found ${rows.length})`);
    const rowCells = rows.map((tr) =>
      tr.querySelectorAll("th,td").map((cell) => cell.text.trim()),
    );
    // [name, gi, carbs, GL@50g, GL@100g, serving label, GL@typical]
    const expectedChartRows = [
      ["Rye bread", "89", "47", "20.9 (High)", "41.8 (High)", "1 slice (30 g)", "12.5 (Medium)"],
      ["Watermelon", "76", "8.1", "3.1 (Low)", "6.2 (Low)", "1 slice (120 g)", "7.4 (Low)"],
    ];
    for (const expected of expectedChartRows) {
      check(
        rowCells.some((cells) => expected.every((value, i) => cells[i] === value)),
        `T3-④ chart table row: ${expected[0]} → ${expected[3]} / ${expected[4]} / ${expected[6]}`,
      );
    }

    const tableText = tables[0]?.text ?? "";
    check(
      !tableText.includes("N/A"),
      "T3-④ §6.1 N/A display string never appears inside the chart table",
    );
    check(
      !tableText.includes("Egg"),
      "T3-④ no encoding-suspect entry (egg white) inside the chart table",
    );

    check(bodyText.includes("≤ 10"), 'T3-④ chart band boundary semantics: "≤ 10" (Low) prerendered');
    check(bodyText.includes("≥ 20"), 'T3-④ chart band boundary semantics: "≥ 20" (High) prerendered');
    check(
      bodyText.includes("How to cite this table"),
      'T3-④ chart page carries the "How to cite this table" block',
    );
    check(
      bodyText.includes(`${SITE_ORIGIN}/glycemic-load-chart`),
      "T3-④ the suggested citation spells out the page's absolute URL",
    );
    check(bodyText.includes("DiOGenes"), 'T3-④ chart page names the data source "DiOGenes"');
    check(
      bodyText.includes("category-level"),
      'T3-④ chart page carries the provenance copy ("category-level" assignments)',
    );
    check(
      bodyText.includes("not individually measured"),
      'T3-④ chart page states values are "not individually measured"',
    );

    // Dataset JSON-LD detail (beyond the type-distribution check above).
    if (nodes !== null) {
      const dataset = nodes.find((node) => node["@type"] === "Dataset");
      check(Boolean(dataset), "T3-⑧ chart page carries a Dataset JSON-LD node");
      check((dataset?.name ?? "").length > 0, "T3-⑧ Dataset.name is non-empty");
      check((dataset?.description ?? "").length > 0, "T3-⑧ Dataset.description is non-empty");
      check(dataset?.url === expectedCanonical, "T3-⑧ Dataset.url = canonical");
      check(
        String(dataset?.isBasedOn ?? "").includes("DiOGenes"),
        "T3-⑧ Dataset.isBasedOn names DiOGenes",
      );
      check(
        dataset?.creator?.["@type"] === "Organization" && dataset?.creator?.name === BRAND,
        `T3-⑧ Dataset.creator = Organization "${BRAND}"`,
      );
    }
  }

  // T3-⑨ (ticket 13 — /about positive assertions, completing the row whose
  // negative scans above run site-wide): honest data provenance (DiOGenes /
  // Aston, category-level archived data), formula citations (Nathan 2008,
  // Bergenstal 2018), the Atkinson 2021 upgrade path, MIT upstream
  // attribution with a link to the assafmo repo, and the GitHub Issues
  // contact entry point — both visible in the body and mirrored by the
  // Organization JSON-LD contactPoint. The contact URL is HARDCODED here,
  // independent of src/seo/pageSeo.js CONTACT_URL, so a typo there cannot
  // self-certify.
  if (route === "/about") {
    const bodyText = root.querySelector("body")?.text ?? "";
    check(bodyText.includes("DiOGenes"), 'T3-⑨ about page names the data source "DiOGenes"');
    check(bodyText.includes("Aston"), 'T3-⑨ about page cites "Aston" (Obesity Reviews 2010)');
    check(
      bodyText.includes("category-level"),
      'T3-⑨ about page carries the honest provenance copy ("category-level" assignments)',
    );
    check(bodyText.includes("Atkinson"), 'T3-⑨ about page names the Atkinson 2021 upgrade path');
    check(bodyText.includes("Nathan"), 'T3-⑨ about page cites "Nathan" (ADAG, Diabetes Care 2008)');
    check(bodyText.includes("Bergenstal"), 'T3-⑨ about page cites "Bergenstal" (GMI, Diabetes Care 2018)');
    check(bodyText.includes("MIT"), 'T3-⑨ about page states the MIT License attribution');
    check(bodyText.includes("Assaf Morami"), 'T3-⑨ about page credits upstream author "Assaf Morami"');
    check(
      root.querySelectorAll('a[href="https://github.com/assafmo/glcalc.com"]').length >= 1,
      "T3-⑨ about page links to the upstream assafmo/glcalc.com repository",
    );
    const contactUrl = "https://github.com/TigerVanguard/glcalc.com/issues";
    check(
      root.querySelectorAll(`a[href="${contactUrl}"]`).length >= 1,
      "T3-⑨ about page links to the GitHub Issues contact entry point",
    );
    if (nodes !== null) {
      const org = nodes.find((node) => node["@type"] === "Organization");
      check(
        org?.contactPoint?.url === contactUrl,
        "T3-⑨ Organization JSON-LD contactPoint matches the GitHub Issues contact URL",
      );
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

// T3-⑩ — enabled by P5 (ticket 15, domain switch): recursive dist-wide scan
// for the OLD deployment domain "glcalc.vercel.app" — zero hits allowed
// (github.com/*/glcalc.com repo links are a different string and untouched by
// this scan; red line 8 upstream attribution stays intact). Conditionally
// enabled: if a build is ever pinned back to a *.vercel.app origin via
// VITE_SITE_ORIGIN, the origin legitimately IS glcalc.vercel.app and the scan
// is skipped. The companion GA4 no-hostname-gate assertion runs per page
// above, unconditionally.
console.log("[verify-dist] T3-⑩ old-domain (glcalc.vercel.app) zero-hit scan");
let t10Status;
if (SITE_ORIGIN.includes("vercel.app")) {
  t10Status = "SKIPPED (SITE_ORIGIN still on vercel.app)";
  console.log(`  ${t10Status}`);
} else {
  const oldDomainHits = [];
  async function scanForOldDomain(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await scanForOldDomain(full);
      } else if ((await readFile(full)).includes("glcalc.vercel.app")) {
        oldDomainHits.push(relative(DIST, full));
      }
    }
  }
  await scanForOldDomain(DIST);
  check(
    oldDomainHits.length === 0,
    `T3-⑩ "glcalc.vercel.app" has zero hits across all dist/ files${
      oldDomainHits.length ? ` (hits: ${oldDomainHits.join(", ")})` : ""
    }`,
  );
  t10Status = oldDomainHits.length === 0 ? "PASS" : "FAIL";
}

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
  // 9 since shareable-assets BL-04 added /glycemic-load-chart (8 nav + chart).
  check(entries.length === 9, `sitemap has exactly 9 <url> entries (found ${entries.length})`);
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
  // P5 (ticket 15): the old deployment domain must 308 every path to the new
  // origin. Host-conditional redirect (NOT a rewrite), values hardcoded here.
  const hostRedirect = (vercel.redirects ?? []).find(
    (r) =>
      r.source === "/(.*)" &&
      r.destination === "https://glucomath.com/$1" &&
      r.permanent === true &&
      (r.has ?? []).some((c) => c.type === "host" && c.value === "glcalc.vercel.app"),
  );
  check(
    Boolean(hostRedirect),
    "host-conditional permanent redirect glcalc.vercel.app/(.*) → https://glucomath.com/$1 present",
  );
}

// Print report (shareable-assets BL-05 / SA-06, Spec D2): the print styles
// must survive the build — some bundled CSS asset has to carry the @media
// print block and the paper-only brand-line rule. String check on the raw
// dist/assets CSS (the app e2e project runs on the dev server, where CSS is
// unbundled, so the built artifact is asserted here instead).
console.log("[verify-dist] built CSS print rules (BL-05)");
const assetsDir = join(DIST, "assets");
let printCss = "";
if (existsSync(assetsDir)) {
  for (const entry of await readdir(assetsDir)) {
    if (entry.endsWith(".css")) {
      printCss += await readFile(join(assetsDir, entry), "utf-8");
    }
  }
}
check(printCss.includes("@media print"), "a built CSS asset contains an @media print block");
check(printCss.includes(".print-brand"), "the built CSS carries the .print-brand rule");

// Self-hosted fonts (perf spec PF-01, D1~D4), asserted on the built artifact:
// ① no Google Fonts host anywhere in dist/ — the spec floor is .html + .css,
// but D4 bans the hosts from the whole build output, so every file is scanned
// (as T3-⑩ does); ② Fraunces + Manrope @font-face, all font-display: swap;
// ③ every @font-face src URL is a real woff2 file in dist/; ④ each
// prerendered page preloads 1~2 fonts with crossorigin, and every preload
// href is identical to an @font-face src of the stylesheet that page links
// (D3: any mismatch makes the browser download the font twice).
console.log("[verify-dist] self-hosted fonts (PF-01)");
const GOOGLE_FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

async function listFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    files.push(...(entry.isDirectory() ? await listFiles(full) : [full]));
  }
  return files;
}

// Minifier-agnostic: esbuild unquotes family names and url()s, source CSS
// keeps the quotes.
function fontFaces(css) {
  return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, body]) => {
    const src = /(?:^|;)\s*src\s*:\s*([^;]+)/.exec(body)?.[1] ?? "";
    return {
      family: (/font-family\s*:\s*([^;]+)/.exec(body)?.[1] ?? "").trim().replace(/^["']|["']$/g, ""),
      display: (/font-display\s*:\s*([^;]+)/.exec(body)?.[1] ?? "").trim(),
      srcUrls: [...src.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)].map((match) => match[2]),
    };
  });
}

function distPathFor(url) {
  return url.startsWith("/") && !url.startsWith("//") ? join(DIST, url.split(/[?#]/)[0].slice(1)) : null;
}

const distFiles = existsSync(DIST) ? await listFiles(DIST) : [];
const htmlFiles = distFiles.filter((file) => file.endsWith(".html"));
const cssFiles = distFiles.filter((file) => file.endsWith(".css"));
check(
  htmlFiles.length >= PAGES.length && cssFiles.length >= 1,
  `PF-01 ① scan covers the built HTML + CSS (${htmlFiles.length} .html, ${cssFiles.length} .css, ${distFiles.length} files in total)`,
);
const googleFontHits = [];
for (const file of distFiles) {
  const content = await readFile(file);
  if (GOOGLE_FONT_HOSTS.some((host) => content.includes(host))) {
    googleFontHits.push(relative(DIST, file));
  }
}
check(
  googleFontHits.length === 0,
  `PF-01 ① no fonts.googleapis.com / fonts.gstatic.com in any dist/ file${
    googleFontHits.length ? ` (hits: ${googleFontHits.join(", ")})` : ""
  }`,
);

const builtFaces = [];
for (const file of cssFiles) {
  builtFaces.push(...fontFaces(await readFile(file, "utf-8")));
}
for (const family of ["Fraunces", "Manrope"]) {
  const faces = builtFaces.filter((face) => face.family === family);
  check(faces.length >= 1, `PF-01 ② built CSS has @font-face rules for ${family} (found ${faces.length})`);
  check(
    faces.length >= 1 && faces.every((face) => face.display === "swap"),
    `PF-01 ② every ${family} @font-face has font-display: swap`,
  );
}

check(
  builtFaces.length >= 1 && builtFaces.every((face) => face.srcUrls.length >= 1),
  `PF-01 ③ every built @font-face src carries a url() (${builtFaces.length} rules)`,
);
for (const url of new Set(builtFaces.flatMap((face) => face.srcUrls))) {
  const file = distPathFor(url);
  const isWoff2 =
    file !== null && existsSync(file) && (await readFile(file)).subarray(0, 4).toString("latin1") === "wOF2";
  check(isWoff2, `PF-01 ③ @font-face src ${url} is a woff2 file in dist/`);
}

for (const { route } of PAGES) {
  const file = routeFile(route);
  if (!existsSync(file)) continue; // already reported by the per-page loop
  const root = parse(await readFile(file, "utf-8"));
  const preloads = root.querySelectorAll('link[rel="preload"][as="font"]');
  check(
    preloads.length >= 1 && preloads.length <= 2,
    `PF-01 ④ ${route}: 1~2 font preloads (found ${preloads.length})`,
  );
  check(
    preloads.every(
      (link) =>
        ["", "anonymous"].includes(link.getAttribute("crossorigin")) &&
        link.getAttribute("type") === "font/woff2",
    ),
    `PF-01 ④ ${route}: every font preload has crossorigin (anonymous) + type="font/woff2"`,
  );
  const pageSrcUrls = new Set();
  for (const link of root.querySelectorAll('link[rel="stylesheet"][href]')) {
    const cssFile = distPathFor(link.getAttribute("href"));
    if (cssFile !== null && existsSync(cssFile)) {
      for (const face of fontFaces(await readFile(cssFile, "utf-8"))) {
        face.srcUrls.forEach((url) => pageSrcUrls.add(url));
      }
    }
  }
  for (const link of preloads) {
    const href = link.getAttribute("href");
    check(
      pageSrcUrls.has(href),
      `PF-01 ④ ${route}: preload ${href} is identical to an @font-face src in the page's stylesheet`,
    );
  }
}

// Route-split entry chunk (perf spec PF-02, D5/D8), asserted on the built
// artifact: ① every prerendered page loads the SAME single entry script
// (<script type="module" src="/assets/index-*.js">) and it is ≤ 260 KB, with
// KB = 1024 B — the unit behind the spec's "currently ~515 KB" (527,020 B);
// ② the gi.json dataset is not in it: "carbs_per_100g" (one per food, 4893
// foods) appears at most 5 times; ③ the dataset lives in exactly one other
// chunk under dist/assets, where the key appears ≥ 4000 times.
console.log("[verify-dist] route-split entry chunk (PF-02)");
const ENTRY_JS_MAX_BYTES = 260 * 1024;
const DATA_KEY = "carbs_per_100g";
const countOccurrences = (text, needle) => text.split(needle).length - 1;

const entrySrcs = new Set();
for (const { route } of PAGES) {
  const file = routeFile(route);
  if (!existsSync(file)) continue; // already reported by the per-page loop
  const root = parse(await readFile(file, "utf-8"));
  const entryScripts = root
    .querySelectorAll('script[type="module"][src]')
    .map((script) => script.getAttribute("src"))
    .filter((src) => /^\/assets\/index-[\w-]+\.js$/.test(src));
  check(
    entryScripts.length === 1,
    `PF-02 ① ${route}: exactly one entry script /assets/index-*.js (found ${entryScripts.length})`,
  );
  entryScripts.forEach((src) => entrySrcs.add(src));
}
check(
  entrySrcs.size === 1,
  `PF-02 ① all pages reference the same entry script (${[...entrySrcs].join(", ") || "none"})`,
);

const entryFile = entrySrcs.size === 1 ? distPathFor([...entrySrcs][0]) : null;
const entryExists = entryFile !== null && existsSync(entryFile);
check(entryExists, `PF-02 ① the entry script exists in dist/ (${entryFile ?? "unresolved"})`);
if (entryExists) {
  const entryJs = await readFile(entryFile);
  check(
    entryJs.length <= ENTRY_JS_MAX_BYTES,
    `PF-02 ① entry script is ≤ 260 KB (${entryJs.length} B = ${(entryJs.length / 1024).toFixed(1)} KB)`,
  );
  const entryKeyCount = countOccurrences(entryJs.toString("utf-8"), DATA_KEY);
  check(
    entryKeyCount <= 5,
    `PF-02 ② entry script carries no gi.json data ("${DATA_KEY}" ×${entryKeyCount}, max 5)`,
  );

  const dataChunks = [];
  for (const name of existsSync(assetsDir) ? await readdir(assetsDir) : []) {
    const file = join(assetsDir, name);
    if (!name.endsWith(".js") || file === entryFile) continue;
    const keyCount = countOccurrences(await readFile(file, "utf-8"), DATA_KEY);
    if (keyCount >= 4000) dataChunks.push(`${name} ×${keyCount}`);
  }
  check(
    dataChunks.length === 1,
    `PF-02 ③ exactly one separate chunk carries the gi.json dataset ("${DATA_KEY}" ≥ 4000×): ${
      dataChunks.join(", ") || "none"
    }`,
  );
}

// D11 (perf spec, added during PF-02): asset URLs are public, so no file name
// in dist/ and no asset path referenced from built HTML/JS may match
// /glcalc/i (main Spec red line: no glcalc variants). Scope is names and
// paths only — string contents such as the MIT attribution link are not
// covered here. HTML references are absolute (/assets/…); chunks reference
// each other as ./x.js and list preload deps as assets/x.js.
console.log("[verify-dist] asset names (D11)");
const GLCALC = /glcalc/i;
const badFileNames = distFiles.map((file) => relative(DIST, file)).filter((name) => GLCALC.test(name));
check(
  distFiles.length > 0 && badFileNames.length === 0,
  `D11 no dist/ file name matches /glcalc/i (${distFiles.length} files${
    badFileNames.length ? `; hits: ${badFileNames.join(", ")}` : ""
  })`,
);
const assetRefs = new Set();
for (const file of distFiles) {
  if (file.endsWith(".html")) {
    for (const [ref] of (await readFile(file, "utf-8")).matchAll(/\/assets\/[^"'\s>)]+/g)) {
      assetRefs.add(ref);
    }
  } else if (file.endsWith(".js")) {
    for (const [ref] of (await readFile(file, "utf-8")).matchAll(/(?:\/?assets\/|\.\/)[\w.-]+\.(?:js|css)/g)) {
      assetRefs.add(ref);
    }
  }
}
const badRefs = [...assetRefs].filter((ref) => GLCALC.test(ref));
check(
  assetRefs.size > 0 && badRefs.length === 0,
  `D11 no asset path referenced from built HTML/JS matches /glcalc/i (${assetRefs.size} distinct paths${
    badRefs.length ? `; hits: ${badRefs.join(", ")}` : ""
  })`,
);

// D10 (perf spec, added during PF-02): the Cloudflare Web Analytics beacon is
// an async module script — a non-async module script placed before the entry
// would hold the app's execution until the third-party file downloads. The
// token is hardcoded here, independent of index.html.
console.log("[verify-dist] Cloudflare beacon async (D10)");
const CF_BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";
const CF_BEACON_TOKEN = "2c05a228f62c487ca3f96597b09174dc";
for (const { route } of PAGES) {
  const file = routeFile(route);
  if (!existsSync(file)) continue; // already reported by the per-page loop
  const root = parse(await readFile(file, "utf-8"));
  const beacons = root.querySelectorAll(`script[src="${CF_BEACON_SRC}"]`);
  check(beacons.length === 1, `D10 ${route}: exactly one Cloudflare beacon script (found ${beacons.length})`);
  const beacon = beacons[0];
  check(
    beacon?.getAttribute("type") === "module" && beacon.hasAttribute("async"),
    `D10 ${route}: beacon is type="module" with async`,
  );
  let token = null;
  try {
    token = JSON.parse(beacon?.getAttribute("data-cf-beacon") ?? "null")?.token ?? null;
  } catch {
    token = null;
  }
  check(token === CF_BEACON_TOKEN, `D10 ${route}: data-cf-beacon token = ${CF_BEACON_TOKEN} (got ${token})`);
}

if (failures > 0) {
  console.error(`[verify-dist] FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log(
  `[verify-dist] all assertions passed (T3 ①②③④(converter+a1c+estimator+gmi+gi+gl)⑤⑥⑦⑧⑨(incl. /about positives)⑩(${t10Status}) + sitemap/robots/404/vercel).`,
);
