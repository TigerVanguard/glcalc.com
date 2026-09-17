import React from "react";
import { Link } from "react-router-dom";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import { BRAND } from "../site.config.js";

// Navigation home page (ticket 06, Spec §5 "/" row): brand intro (2–3
// sentences) + 6 tool cards + health note + About link. No calculator
// functionality here, and no copy shared with the GL page (its H1/FAQ/workflow
// text lives only on /glycemic-load-calculator — duplication would recreate
// the two-URL content clash ticket 05 removed).
//
// verify-dist T3-⑤ counts in-body internal links (outside nav/footer) ≥7:
// 6 cards + 1 About link below = 7.
const TOOLS = [
  {
    href: "/glycemic-load-calculator",
    name: "Glycemic Load Calculator",
    blurb:
      "See how a real serving of a food affects blood sugar — find foods by search, barcode, or photo.",
  },
  {
    href: "/glycemic-index-calculator",
    name: "Glycemic Index Calculator",
    blurb: "Check a food's GI value and whether it counts as low, medium, or high.",
  },
  {
    href: "/gmi-calculator",
    name: "GMI Calculator",
    blurb: "Turn a CGM average glucose into a Glucose Management Indicator.",
  },
  {
    href: "/a1c-to-eag-calculator",
    name: "A1C to eAG Calculator",
    blurb: "Convert an A1C percentage into estimated average glucose, in mg/dL or mmol/L.",
  },
  {
    href: "/blood-sugar-converter",
    name: "Blood Sugar Converter",
    blurb: "Move between mg/dL and mmol/L instantly, in both directions.",
  },
  {
    href: "/glucose-to-a1c-estimator",
    name: "Glucose to A1C Estimator",
    blurb: "Estimate an A1C range from your average blood glucose readings.",
  },
];

export default function HomePage() {
  return (
    <ToolPageLayout
      h1="Free Blood Sugar & Glycemic Calculators"
      intro={
        <p>
          {BRAND} is a small, free collection of blood sugar and glycemic math
          tools. Every calculator runs in your browser with no sign-up, and
          each one cites the published formula or dataset behind it. Pick a
          tool below to get started.
        </p>
      }
    >
      <section className="tool-cards" aria-label="All calculators">
        {TOOLS.map(({ href, name, blurb }) => (
          <article className="panel tool-card" key={href}>
            <h2 className="tool-card__title">
              <Link to={href}>{name}</Link>
            </h2>
            <p>{blurb}</p>
          </article>
        ))}
      </section>

      <section className="panel seo-panel" aria-labelledby="home-usecases-heading">
        <h2 id="home-usecases-heading">What these tools help with</h2>
        <p>
          <strong>Planning meals around steadier blood sugar.</strong> The{" "}
          <Link to="/glycemic-load-calculator">glycemic load calculator</Link>{" "}
          combines a food&apos;s glycemic index with the serving you actually
          eat, so two foods can be compared on the plate instead of in the
          abstract. When you only need the raw GI number for a food, the{" "}
          <Link to="/glycemic-index-calculator">glycemic index lookup</Link>{" "}
          covers close to five thousand foods in one search.
        </p>
        <p>
          <strong>Making sense of CGM data.</strong> If you wear a continuous
          glucose monitor, the{" "}
          <Link to="/gmi-calculator">GMI calculator</Link> converts your
          sensor&apos;s average glucose into a Glucose Management Indicator —
          the CGM-era counterpart to a lab A1C — so you can sanity-check
          trends between lab draws instead of waiting months for the next
          blood test.
        </p>
        <p>
          <strong>Translating lab reports and meter units.</strong> The{" "}
          <Link to="/a1c-to-eag-calculator">A1C to eAG calculator</Link> turns
          the percentage on a lab report into the everyday glucose units a
          meter shows, the{" "}
          <Link to="/glucose-to-a1c-estimator">glucose to A1C estimator</Link>{" "}
          runs the same relationship in reverse as a range, and the{" "}
          <Link to="/blood-sugar-converter">blood sugar converter</Link> moves
          any reading between mg/dL and mmol/L — handy when your clinic and
          your device disagree on units.
        </p>
      </section>

      <section className="panel home-health-note" aria-labelledby="home-health-heading">
        <h2 id="home-health-heading">A note on health decisions</h2>
        <p>
          These calculators are educational tools, not medical devices. Numbers
          they produce are estimates built on published averages, so talk with
          your care team before changing diet, medication, or monitoring
          routines based on anything you compute here.
        </p>
        <p>
          Want to know{" "}
          <Link to="/about">where our GI data and formulas come from</Link>?
          The about page lists every source, the open-source license, and how
          to reach us.
        </p>
      </section>
    </ToolPageLayout>
  );
}
