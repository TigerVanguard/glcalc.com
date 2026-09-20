import React, { useState } from "react";
import { Link } from "react-router-dom";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";
import FoodSearch from "../features/search/FoodSearch.jsx";
import giData from "../data/gi.json";
import {
  giDisplayRule,
  selectStaticTable,
  GI_NA_DISPLAY,
  GI_NA_FULL_LABEL,
  GI_DATA_SOURCE,
} from "../lib/giData.js";
import { GI_FAQS } from "../data/giFaq.js";

// /glycemic-index-calculator (ticket 11, Spec §5 GI row / §5A.2 gi / §6).
//
// Search reuses the existing FoodSearch + SearchWorker channel unchanged; the
// only customization is the result-list pill, which applies the §6.1 display
// rule so low-carb entries never leak their encoded numeric GI (e.g. "egg
// white GI 70") even inside the dropdown. The result panel shows GI + band
// badge (giBand continuous intervals) + carbs per 100 g — deliberately NO
// serving/GL calculation (that is the GL page's job); instead each selection
// deep-links to /glycemic-load-calculator?food=<key> (ticket 05 prefill).
// This page's own input is never written to the URL (Spec §5A.1-5).
//
// The static reference table (prerendered, crawler-visible) comes from
// giData.selectStaticTable — 27 fixed, eligibility-checked entries — with the
// honest provenance note (category-level DiOGenes assignments, not
// individually measured). The related-tools block is final per ticket 06 and
// must not be touched by content tickets.

// Module scope: fixed 27-row table, validated at build/prerender time
// (selectStaticTable throws on any ineligible or missing entry).
const STATIC_TABLE = selectStaticTable(giData);

// §6.1 display rule applied to the search dropdown: eligible entries keep the
// classic "GI 45 - Low" pill; non-measurable ones show "GI: N/A" instead of a
// numeric GI. The "Too many results." sentinel (no gi field) gets no pill.
function giResultPill(result) {
  if (result.gi === undefined) {
    return null;
  }

  const display = giDisplayRule({
    gi: result.gi,
    carbs_per_100g: result.carbsPer100g,
  });

  if (display.giValue === null) {
    return { text: `GI: ${GI_NA_DISPLAY}`, tone: "na" };
  }

  return {
    text: `GI ${display.giValue} - ${display.giBand}`,
    tone: display.giBand.toLowerCase(),
  };
}

export default function GiLookupPage() {
  const [selected, setSelected] = useState(null);

  const handleSelectSelection = (selection) => {
    const food = selection?.food;

    // Ignore the "Too many results." sentinel (it has no gi/carbs data).
    if (!food || food.gi === undefined || food.carbsPer100g === undefined) {
      return;
    }

    setSelected(food);
  };

  const display = selected
    ? giDisplayRule({ gi: selected.gi, carbs_per_100g: selected.carbsPer100g })
    : null;

  return (
    <ToolPageLayout
      h1="Glycemic Index Calculator"
      intro={
        <p>
          Look up the glycemic index of a food by name and see at a glance
          whether it counts as low, medium, or high GI, along with its
          carbohydrate content per 100 g. Every result links straight to the
          glycemic load calculator, where the same food can be portioned into
          a real serving.
        </p>
      }
      related={
        <RelatedTools
          items={[
            {
              before: "GI alone ignores portion size — ",
              href: "/glycemic-load-calculator",
              anchor: "calculate the glycemic load of a real serving",
              after: " to see the fuller picture.",
            },
            {
              before: "Tracking glucose in different units? ",
              href: "/blood-sugar-converter",
              anchor: "Switch blood sugar values between the two units",
              after: " in one step.",
            },
            {
              before: "Rather compare loads than look up one food? ",
              href: "/glycemic-load-chart",
              anchor: "Open the glycemic load quick-reference chart",
              after: " for 27 foods at three portions each.",
            },
          ]}
        />
      }
      faq={
        <section className="panel seo-panel" aria-labelledby="gi-faq-heading">
          <div className="section-heading">
            <p className="eyebrow">FAQ</p>
            <h2 id="gi-faq-heading">Glycemic index questions</h2>
          </div>
          <div className="faq-list">
            {GI_FAQS.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      }
    >
      <FoodSearch
        onSelectSelection={handleSelectSelection}
        resultPill={giResultPill}
      />

      <section
        className="panel gi-result-panel"
        aria-labelledby="gi-result-heading"
      >
        <div className="section-heading">
          <p className="eyebrow">Result</p>
          <h2 id="gi-result-heading">Glycemic index details</h2>
        </div>
        <div aria-live="polite">
          {selected ? (
            <div className="stat result-card gi-result-card">
              <p className="stat__label">{selected.title}</p>
              {display.giValue === null ? (
                <>
                  <p className="stat__value">
                    <strong>{GI_NA_FULL_LABEL}</strong>
                  </p>
                  <p className="stat__note">
                    This food carries too little carbohydrate for a glycemic
                    index to be measured, so any number a database attaches to
                    it is a placeholder. At normal servings its glycemic load
                    is effectively zero.
                  </p>
                </>
              ) : (
                <p className="stat__value">
                  <strong>GI {display.giValue}</strong>
                  <span className={`pill pill--${display.giBand.toLowerCase()}`}>
                    {display.giBand}
                  </span>
                </p>
              )}
              <p className="stat__note">
                Carbohydrates: {selected.carbsPer100g} g per 100 g (
                {GI_DATA_SOURCE} data)
              </p>
              <p className="gi-gl-link-line">
                <Link
                  className="gi-gl-link"
                  to={`/glycemic-load-calculator?food=${encodeURIComponent(selected.title)}`}
                >
                  Calculate glycemic load →
                </Link>
              </p>
            </div>
          ) : (
            <p className="result-card__placeholder muted">
              Search a food above and choose the best match to see its
              glycemic index here.
            </p>
          )}
        </div>
      </section>

      <section className="panel seo-panel" aria-labelledby="gi-what-heading">
        <div className="section-heading">
          <p className="eyebrow">The basics</p>
          <h2 id="gi-what-heading">What the glycemic index measures</h2>
        </div>
        <p>
          The glycemic index ranks carbohydrate-containing foods on a 0–100
          scale by how quickly a fixed 50-gram dose of their available
          carbohydrate raises blood glucose, compared with pure glucose at
          100. A food digested and absorbed quickly scores high; one that
          releases its carbohydrate slowly scores low. Because the test
          always uses the same carbohydrate dose, GI is a statement about
          carbohydrate <em>quality</em>, not about any particular plate of
          food.
        </p>
        <p>
          The bands on this page follow the conventional cut-offs as
          continuous intervals with no gaps: a GI of 55 or below counts as{" "}
          <strong>Low</strong>, anything above 55 and below 70 counts as{" "}
          <strong>Medium</strong>, and 70 or above counts as{" "}
          <strong>High</strong>. The boundaries are conventions, not
          biological thresholds — a GI of 56 and a GI of 54 describe nearly
          identical foods even though they land in different bands.
        </p>
      </section>

      <section className="panel seo-panel" aria-labelledby="gi-vs-gl-heading">
        <div className="section-heading">
          <p className="eyebrow">GI vs GL</p>
          <h2 id="gi-vs-gl-heading">Glycemic index vs glycemic load</h2>
        </div>
        <p>
          GI answers &ldquo;how fast?&rdquo; — glycemic load answers &ldquo;how
          much, given what I am actually eating?&rdquo;. Because the GI test
          normalizes every food to the same 50-gram carbohydrate dose, it
          hides how carbohydrate-dense a food really is. Watermelon is the
          classic illustration: its GI is high, but 100 g of watermelon holds
          only a few grams of carbohydrate, so a normal slice produces a small
          glucose load. Densely packed foods work the other way — a moderate
          GI applied to a large pile of carbohydrate still adds up.
        </p>
        <p>
          That is why this page deliberately stops at GI and carbohydrate
          density and hands portion math to the glycemic load calculator: the
          two numbers answer different questions, and reading GI as if it
          already accounted for your serving is the most common way to
          misread it.
        </p>
      </section>

      <section className="panel seo-panel" aria-labelledby="gi-table-heading">
        <div className="section-heading">
          <p className="eyebrow">Reference</p>
          <h2 id="gi-table-heading">
            GI reference table: {STATIC_TABLE.length} everyday foods
          </h2>
        </div>
        <table className="conversion-table gi-static-table">
          <thead>
            <tr>
              <th scope="col">Food</th>
              <th scope="col">GI</th>
              <th scope="col">Band</th>
              <th scope="col">Carbs per 100 g</th>
            </tr>
          </thead>
          <tbody>
            {STATIC_TABLE.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td>{row.gi}</td>
                <td>{row.giBand}</td>
                <td>{row.carbs_per_100g}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          These GI values are category-level assignments from the{" "}
          {GI_DATA_SOURCE} database — reference numbers shared across similar
          foods, not individually measured results for each item listed. Use
          them to compare foods and orient yourself, not as lab-grade
          measurements of a specific product.
        </p>
      </section>
    </ToolPageLayout>
  );
}
