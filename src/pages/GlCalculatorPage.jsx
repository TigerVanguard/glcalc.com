import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import App from "../App.jsx";
import glycemicIndex from "../data/gi.json";
import SiteNav from "../features/common/SiteNav.jsx";
import ToolFooter from "../features/common/ToolFooter.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";
import { GL_STATIC_TABLE } from "../data/glStaticTable.js";
import { GI_DATA_SOURCE } from "../lib/giData.js";

// /glycemic-load-calculator (ticket 05, Spec §5A.2): renders the existing App
// main flow unchanged, plus `?food=<exact gi.json key>` deep-link prefill.
// A known key preselects that food exactly as if the user had searched and
// confirmed it; an unknown key is ignored. Read-only: nothing is ever written
// back to the URL.
//
// Ticket 06 wraps SiteNav / RelatedTools / ToolFooter AROUND <App /> (App's
// internal structure, including its own <main>, stays untouched). The
// related-tools block sits in its own width container below the app; it is
// final per Spec §5B.3-2 (GL ⇄ GI interlink, plus the unit converter).
//
// Ticket 12 appends the static GL reference content BELOW the app and ABOVE
// the related-tools block: band definitions (continuous intervals, matching
// formulas.glBand), the "glycaemic" British-spelling + how-to sections, and
// the 27-row serving-level GL table built at module load from
// src/data/glStaticTable.js (crawler-visible: it is part of the prerendered
// HTML and needs no JavaScript). App.jsx itself stays untouched — its
// SeoGuide already covers the formula/how-it-works angle, so the sections
// here deliberately cover only what it does not: band cut-offs, spelling,
// portion strategy, and the food table.
function GlReferenceContent() {
  return (
    <section className="seo-guide" aria-label="Glycemic load reference">
      <section className="panel seo-panel" aria-labelledby="gl-bands-heading">
        <div className="section-heading">
          <p className="eyebrow">Reading the number</p>
          <h2 id="gl-bands-heading">Low, medium, and high glycemic load</h2>
        </div>
        <p>
          Glycemic load — also spelled <em>glycaemic load</em> in British
          English — is banded as continuous intervals with no gaps: a GL of{" "}
          <strong>10 or below (GL ≤ 10)</strong> counts as Low, anything{" "}
          <strong>above 10 and below 20</strong> counts as Medium, and{" "}
          <strong>20 or above (GL ≥ 20)</strong> counts as High. The same
          rule the calculator applies to your serving is used for every row
          of the reference table below.
        </p>
        <p>
          The bands make GL more actionable than GI alone: GI is fixed per
          food, but the load moves with your portion. A high-GI food eaten in
          a small serving can sit comfortably in the Low band, while a
          moderate-GI staple piled high can cross into High — which is
          exactly what the serving input above lets you test.
        </p>
      </section>

      <section className="panel seo-panel" aria-labelledby="gl-howto-heading">
        <div className="section-heading">
          <p className="eyebrow">How to</p>
          <h2 id="gl-howto-heading">How to lower the glycemic load of a meal</h2>
        </div>
        <p>
          Because GL multiplies carbohydrate quality by carbohydrate amount,
          you can work on either factor. Three practical levers, in the order
          most people try them:
        </p>
        <ul className="seo-list">
          <li>
            <strong>Shrink the serving.</strong> Halving the portion halves
            the load — the only lever that works on every food. Re-run the
            calculator with a smaller serving to see the band change.
          </li>
          <li>
            <strong>Swap the staple.</strong> Trading a high-GI staple for a
            lower-GI one (for example, couscous for boiled spaghetti or
            lentils) cuts the load without shrinking the plate.
          </li>
          <li>
            <strong>Prefer low carbohydrate density.</strong> Foods with few
            carbohydrate grams per 100 g (most vegetables, plain yoghurt)
            keep the load small even in generous servings.
          </li>
        </ul>
        <p className="muted">
          These are meal-planning heuristics, not medical guidance — the
          footer disclaimer applies to this whole page.
        </p>
      </section>

      <section className="panel seo-panel" aria-labelledby="gl-table-heading">
        <div className="section-heading">
          <p className="eyebrow">Reference</p>
          <h2 id="gl-table-heading">
            GL reference table: {GL_STATIC_TABLE.length} everyday servings
          </h2>
        </div>
        <p>
          Estimated glycemic load for a typical serving of each food,
          computed with the same GL = GI × carbs ÷ 100 formula the calculator
          uses. Serving sizes are nominal household portions (bread by the
          slice, fruit by the piece, vegetables at 80 g); entries stored as
          dry weight in the dataset are marked accordingly.
        </p>
        <table className="conversion-table gl-static-table">
          <thead>
            <tr>
              <th scope="col">Food</th>
              <th scope="col">GI</th>
              <th scope="col">Carbs per 100 g</th>
              <th scope="col">Typical serving</th>
              <th scope="col">GL</th>
              <th scope="col">Band</th>
            </tr>
          </thead>
          <tbody>
            {GL_STATIC_TABLE.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td>{row.gi}</td>
                <td>{row.carbs_per_100g}</td>
                <td>{row.servingLabel}</td>
                <td>{row.glDisplay}</td>
                <td>{row.glBand}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          GI values are category-level assignments from the {GI_DATA_SOURCE}{" "}
          database — reference numbers shared across similar foods, not
          individually measured results — and every listed GL is an estimate
          for the stated serving only. Use the rows to compare foods and
          orient yourself, then run your actual portion through the
          calculator above.
        </p>
      </section>
    </section>
  );
}

export default function GlCalculatorPage() {
  const { search } = useLocation();

  const initialSelection = useMemo(() => {
    const foodParam = new URLSearchParams(search).get("food");
    const entry = foodParam ? glycemicIndex[foodParam] : null;

    if (!entry) {
      return null;
    }

    // Same selection shape FoodSearch produces on confirm.
    return {
      food: {
        title: foodParam,
        gi: entry.gi,
        carbsPer100g: entry.carbs_per_100g,
      },
      source: "link",
      sourceLabel: "Shared link",
    };
  }, [search]);

  return (
    <>
      <SiteNav />
      <div className="app-shell app-shell--append">
        <p className="muted gl-jump-note">
          Just browsing?{" "}
          <a href="#gl-table-heading">Jump to the GL reference table</a> —{" "}
          {GL_STATIC_TABLE.length} everyday servings with precomputed loads,
          no input needed.
        </p>
      </div>
      <App initialSelection={initialSelection} />
      <div className="app-shell app-shell--append">
        <GlReferenceContent />
        <RelatedTools
          items={[
            {
              before: "Not sure how a food ranks before you portion it? You can ",
              href: "/glycemic-index-calculator",
              anchor: "look up a food's glycemic index",
              after: " first.",
            },
            {
              before: "Working with meter readings too? ",
              href: "/blood-sugar-converter",
              anchor: "Convert readings between mg/dL and mmol/L",
              after: " without leaving the site.",
            },
          ]}
        />
      </div>
      <ToolFooter />
    </>
  );
}
