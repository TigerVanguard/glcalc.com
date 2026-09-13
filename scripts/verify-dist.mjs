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
// scans (no "Harvard" / no "works offline", site-wide) are unchanged.
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

  // T3-④ (ticket 07 — converter row only; the other pages' formula strings
  // land with their content tickets): "18.018" present, plus the static
  // common-values table (JS-free content: this file reads raw dist/ HTML).
  // Expected pairs are HARDCODED here, independent of src/lib/display.js, so a
  // rounding bug in the app cannot self-certify: mmol = mgdl / 18.018 rounded
  // half-up to 1 decimal.
  if (route === "/blood-sugar-converter") {
    check(html.includes("18.018"), 'T3-④ converter page contains formula string "18.018"');
    const tables = root.querySelectorAll(".conversion-table");
    check(tables.length === 1, `T3-④ exactly one .conversion-table (found ${tables.length})`);
    const rows = tables[0]?.querySelectorAll("tbody tr") ?? [];
    check(rows.length === 6, `T3-④ conversion table has 6 body rows (found ${rows.length})`);
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
console.log(
  "[verify-dist] all assertions passed (T3 ①②③④(converter+a1c+estimator+gmi+gi+gl)⑤⑥⑦⑧⑨(incl. /about positives) + sitemap/robots/404/vercel; ⑩ SKIPPED pre-P5).",
);
