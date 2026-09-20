import React from "react";
import { Link } from "react-router-dom";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";
import PrintButton from "../features/common/PrintButton.jsx";
import { GL_CHART_TABLE, glChartCsv } from "../data/glChartTable.js";
import { GI_DATA_SOURCE } from "../lib/giData.js";
import { BRAND, SITE_ORIGIN } from "../site.config.js";

// /glycemic-load-chart (shareable-assets BL-04, Spec §4 BL-04 / D3 / D4 / D7).
//
// A citable quick-reference page: the same 27 selector foods as the GL
// calculator's static table, but at THREE serving tiers (50 g / 100 g /
// typical serving) instead of one — a different column structure and a
// different job (look numbers up vs compute your own portion), so the two
// pages are not duplicate content (D3). Everything except the CSV download
// button is plain JSX baked into the prerendered HTML (crawler-visible with
// JavaScript disabled). Not in SiteNav (D4) — reached via the home page, the
// GL calculator's table section, and the GL/GI related-tools blocks.
//
// The print button (BL-05 / SA-06, D2) sits beside the CSV button and relies
// on the shared @media print rules in src/styles/app.css.

const CSV_FILENAME = "glucomath-gl-chart.csv";
const CHART_PATH = "/glycemic-load-chart";

// Client-side CSV download (D7: generated from the single data module, no
// static file) + GA4 event (D8) — silently skipped when gtag is absent
// (local dev / prerender).
function downloadCsv() {
  const blob = new Blob([glChartCsv()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = CSV_FILENAME;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  if (typeof window.gtag === "function") {
    window.gtag("event", "gl_csv_download", { page: window.location.pathname });
  }
}

// One GL tier cell: rounded display value plus its band, in a fixed text
// shape ("12.5 (Medium)") that verify-dist golden rows can match verbatim.
function glCell(tier) {
  return `${tier.display} (${tier.band})`;
}

export default function GlChartPage() {
  return (
    <ToolPageLayout
      h1={`Glycemic Load Chart: ${GL_CHART_TABLE.length} Common Foods`}
      intro={
        <p>
          This chart lists the glycemic load of {GL_CHART_TABLE.length}{" "}
          everyday foods at three serving sizes — a flat 50 g, a flat 100 g,
          and a typical household portion — so you can scan and compare
          without entering anything. When you want the load of the exact
          amount on your own plate, or a food that is not in this table, use
          the{" "}
          <Link to="/glycemic-load-calculator">
            glycemic load calculator
          </Link>{" "}
          instead: it searches nearly five thousand foods and computes GL for
          any serving you type in.
        </p>
      }
      related={
        <RelatedTools
          items={[
            {
              before: "Eating a different amount than the chart shows? ",
              href: "/glycemic-load-calculator",
              anchor: "Work out the load of your own serving",
              after: " with the calculator.",
            },
            {
              before:
                "Curious how fast a food acts before portioning it? ",
              href: "/glycemic-index-calculator",
              anchor: "Find its glycemic index",
              after: " first.",
            },
          ]}
        />
      }
    >
      <section className="panel seo-panel" aria-labelledby="gl-chart-table-heading">
        <div className="section-heading">
          <p className="eyebrow">Reference chart</p>
          <h2 id="gl-chart-table-heading">
            GL at 50 g, 100 g, and a typical serving
          </h2>
        </div>
        <p>
          Every value is computed with GL = GI × carbohydrate grams ÷ 100 —
          the same formula and the same food data the calculator uses. The 50
          g and 100 g columns weigh the food as eaten (entries stored as dry
          weight in the dataset are marked in the serving column); the last
          column applies the nominal household portion shown beside it.
        </p>
        <table className="conversion-table gl-chart-table">
          <thead>
            <tr>
              <th scope="col">Food</th>
              <th scope="col">GI</th>
              <th scope="col">Carbs per 100 g</th>
              <th scope="col">GL (50 g)</th>
              <th scope="col">GL (100 g)</th>
              <th scope="col">Typical serving</th>
              <th scope="col">GL (typical serving)</th>
            </tr>
          </thead>
          <tbody>
            {GL_CHART_TABLE.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td>{row.gi}</td>
                <td>{row.carbs_per_100g}</td>
                <td>{glCell(row.at50g)}</td>
                <td>{glCell(row.at100g)}</td>
                <td>{row.servingLabel}</td>
                <td>{glCell(row.atTypical)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          GI values are category-level assignments from the {GI_DATA_SOURCE}{" "}
          database — reference numbers shared across similar foods, not
          individually measured results for each listed item — so treat every
          GL here as an estimate for comparing foods, not a lab measurement.
        </p>
      </section>

      <section className="panel seo-panel" aria-labelledby="gl-chart-bands-heading">
        <div className="section-heading">
          <p className="eyebrow">Reading the chart</p>
          <h2 id="gl-chart-bands-heading">What the bands next to each value mean</h2>
        </div>
        <p>
          Each GL value carries its band: <strong>Low</strong> for a load of
          10 or below (GL ≤ 10), <strong>Medium</strong> for anything above
          10 and below 20, and <strong>High</strong> for 20 or above (GL ≥
          20). The intervals are continuous with no gaps, and the banding is
          applied to the unrounded value before the one-decimal display
          rounding.
        </p>
        <p>
          Reading across a row shows why serving size is the whole story:
          many foods sit in Low at 50 g and climb a band or two by the time a
          real portion lands on the plate, while carbohydrate-light foods
          like watermelon stay Low at every tier despite a high GI.
        </p>
      </section>

      <section className="panel seo-panel" aria-labelledby="gl-chart-cite-heading">
        <div className="section-heading">
          <p className="eyebrow">Reuse</p>
          <h2 id="gl-chart-cite-heading">How to cite this table</h2>
        </div>
        <p>
          You are welcome to republish, quote, or excerpt this chart — in a
          blog post, handout, or article — as long as you credit it with a
          link back to this page. A suggested citation format:
        </p>
        <blockquote className="gl-chart-citation">
          {BRAND}. &ldquo;Glycemic Load Chart: {GL_CHART_TABLE.length} Common
          Foods.&rdquo; {SITE_ORIGIN}
          {CHART_PATH}. GI values are category-level assignments from the{" "}
          {GI_DATA_SOURCE} database, not individually measured per food.
          Accessed [your access date].
        </blockquote>
        <p>
          Prefer the raw data? The button below downloads the full table as a
          CSV file, generated from the same dataset this page renders.
        </p>
        <p>
          <button type="button" className="secondary-button" onClick={downloadCsv}>
            Download CSV
          </button>{" "}
          <PrintButton label="Print this chart" />
        </p>
      </section>
    </ToolPageLayout>
  );
}
