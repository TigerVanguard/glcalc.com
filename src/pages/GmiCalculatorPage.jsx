import React, { useState } from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";
import NumberField from "../features/common/NumberField.jsx";
import UnitToggle from "../features/common/UnitToggle.jsx";
import ResultCard from "../features/common/ResultCard.jsx";
import ShareCardButton from "../features/common/ShareCardButton.jsx";
import PrintButton from "../features/common/PrintButton.jsx";
import ErrorNotice from "../features/common/ErrorNotice.jsx";
import { gmi, mgdlToMmol, mmolToMgdl } from "../lib/formulas.js";
import {
  formatGmi,
  formatMgdl,
  formatMmol,
  parsePositiveNumber,
} from "../lib/display.js";
import { GMI_FAQS } from "../data/gmiFaq.js";

// RED LINES for this page (Spec §1 D4 / §5 gmi row / §9; ticket 10):
// - The formula is EXACTLY Bergenstal et al., Diabetes Care 2018:
//   GMI (%) = 3.31 + 0.02392 × mean glucose (mg/dL). mmol/L input is
//   converted through formulas.mmolToMgdl BEFORE entering gmi(); the display
//   is one decimal, half-up (display.formatGmi).
// - The audience is CGM users: the mandated explainer block (GMI and lab A1C
//   commonly differ by ±0.5 percentage points; a mismatch is not a data
//   error; GMI cannot replace a lab A1C or support a diagnosis) is static
//   prose below the calculator, and verify-dist asserts it is prerendered.
// - Panel-level verdict discipline: no normal/prediabetes/diabetes anywhere
//   inside .gmi-panel (verify-dist scans it; "Diabetes Care" citations live
//   in the static sections outside the panel), and no percentage may be
//   prerendered in the panel (empty input → placeholder only).
export default function GmiCalculatorPage() {
  // Realtime single-field tool (Spec §5A.1-4): raw text + unit are the source
  // of truth. Inputs are never written to the URL (§5A.1-5).
  const [unit, setUnit] = useState("mgdl");
  const [text, setText] = useState("");

  const parsed = parsePositiveNumber(text);
  const isValid = parsed.state === "valid";
  const invalid = parsed.state === "invalid";
  const glucoseMgdl = isValid
    ? unit === "mmol"
      ? mmolToMgdl(parsed.value)
      : parsed.value
    : null;

  // Sanity window, NOT a validity gate: CGM sensors report roughly
  // 40–400 mg/dL (Dexcom and Libre both cap near 400), so a true CGM AVERAGE
  // outside that window cannot come from real sensor data. The spec leaves the
  // threshold to implementer judgment (warn, don't block); the sensor
  // reporting range is the tightest defensible one, and the warning never
  // blocks the result.
  const outOfSensorRange =
    isValid && (glucoseMgdl < 40 || glucoseMgdl > 400);

  const gmiValue = isValid ? `${formatGmi(gmi(glucoseMgdl))}%` : null;

  // Side-by-side echo of the input converted into the other unit (§5A.2 gmi),
  // derived from the raw value through formulas.js + display.js — never by
  // reformatting the visible text.
  const echo = isValid
    ? unit === "mmol"
      ? `${formatMgdl(mmolToMgdl(parsed.value))} mg/dL`
      : `${formatMmol(mgdlToMmol(parsed.value))} mmol/L`
    : null;

  return (
    <ToolPageLayout
      h1="GMI Calculator (Glucose Management Indicator)"
      intro={
        <p>
          Turn the average glucose from your CGM into a Glucose Management
          Indicator (GMI) — the same figure your sensor report uses to
          estimate where a laboratory A1C might land. Enter the mean glucose
          from your CGM app in mg/dL or mmol/L and the GMI updates as you
          type, with the formula and its source shown below.
        </p>
      }
      related={
        <RelatedTools
          items={[
            {
              before: "Comparing against a lab result? ",
              href: "/a1c-to-eag-calculator",
              anchor: "Convert a lab A1C into estimated average glucose",
              after: " first.",
            },
            {
              before: "No CGM handy? You can still ",
              href: "/glucose-to-a1c-estimator",
              anchor: "estimate an A1C range from your average glucose",
              after: ".",
            },
          ]}
        />
      }
      faq={
        <section className="panel seo-panel" aria-labelledby="gmi-faq-heading">
          <div className="section-heading">
            <p className="eyebrow">FAQ</p>
            <h2 id="gmi-faq-heading">GMI questions</h2>
          </div>
          <div className="faq-list">
            {GMI_FAQS.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      }
    >
      <section
        className="panel converter-panel gmi-panel"
        aria-labelledby="gmi-heading"
      >
        <div className="section-heading">
          <p className="eyebrow">Calculate</p>
          <h2 id="gmi-heading">Enter your CGM average glucose</h2>
        </div>
        <p className="muted" id="gmi-cgm-hint">
          Use the mean glucose from your CGM app and pick its unit. For a
          meaningful GMI, the average should cover at least 14 days of sensor
          data — a shorter stretch describes those days, not your usual
          glucose.
        </p>

        <UnitToggle
          unit={unit}
          value={text}
          onChange={(nextUnit, nextValue) => {
            setUnit(nextUnit);
            setText(nextValue);
          }}
          label="Glucose units"
        />

        <NumberField
          id="gmi-input"
          label="CGM average glucose"
          value={text}
          onChange={setText}
          placeholder={unit === "mmol" ? "e.g. 8.3" : "e.g. 150"}
          suffix={unit === "mmol" ? "mmol/L" : "mg/dL"}
          invalid={invalid}
          describedBy="gmi-cgm-hint"
        />

        {echo ? (
          <p className="muted gmi-echo">That average is ≈ {echo}.</p>
        ) : null}

        {invalid ? (
          <ErrorNotice
            title="Enter a positive number"
            message="CGM average glucose must be a number greater than zero. Clear the field and enter a value like 150 (mg/dL) or 8.3 (mmol/L)."
          />
        ) : null}

        {outOfSensorRange ? (
          <aside className="notice notice--warning" role="status">
            <p className="notice__title">Outside the CGM sensor range</p>
            <p>
              CGM sensors report roughly 40 to 400 mg/dL (about 2.2 to 22.2
              mmol/L), so a true CGM average outside that window cannot come
              from real sensor data — double-check the value you entered. The
              GMI below is still calculated, but treat it as arithmetic on an
              implausible input rather than a meaningful estimate.
            </p>
          </aside>
        ) : null}

        <ResultCard
          label="Glucose Management Indicator (GMI)"
          value={gmiValue}
          note="An estimate of where a laboratory A1C might land — not a measurement. GMI and lab A1C commonly differ by around half a percentage point in either direction; a gap between them does not mean either number is wrong."
          placeholder="Enter your CGM average above to see the GMI."
        />

        {isValid ? (
          // Share card (shareable-assets BL-02, Spec D5/D6): every value is
          // the string ALREADY on screen this render — the raw input text as
          // shown in the field (plus its unit suffix) and gmiValue verbatim.
          // No recomputation, no re-rounding. The footnote reuses the page's
          // existing citation wording ("Bergenstal et al., Diabetes Care
          // 2018" in the formula section below). Rendered only when a valid
          // result is visible, so the prerendered (empty-input) panel never
          // contains the buttons. The print report (BL-05, D2) follows the
          // same visibility contract; the {" "} keeps the two inline-block
          // buttons from touching on screen.
          <>
            <ShareCardButton
              cardSpec={{
                title: "GMI Result",
                rows: [
                  {
                    label: "Average glucose",
                    value: `${text.trim()} ${unit === "mmol" ? "mmol/L" : "mg/dL"}`,
                  },
                  { label: "GMI", value: gmiValue },
                ],
                footnote: "Formula: Bergenstal et al., Diabetes Care 2018",
              }}
              filename="glucomath-gmi-result.png"
            />{" "}
            <PrintButton label="Print report" />
          </>
        ) : null}
      </section>

      <section
        className="panel seo-panel"
        aria-labelledby="gmi-formula-heading"
      >
        <div className="section-heading">
          <p className="eyebrow">The math</p>
          <h2 id="gmi-formula-heading">The GMI formula and where it comes from</h2>
        </div>
        <p className="formula-box">GMI (%) = 3.31 + 0.02392 × mean glucose (mg/dL)</p>
        <p>
          This is the published Glucose Management Indicator regression
          (Bergenstal et al., Diabetes Care 2018), fitted on paired CGM and
          laboratory A1C data from just over 500 adults in clinical trials.
          The authors introduced the name GMI specifically to retire the older
          label &ldquo;estimated A1C&rdquo;: calling the sensor-derived number
          an A1C invited people to treat it as interchangeable with the lab
          test, which it is not. The formula expects mean glucose in mg/dL, so
          a mmol/L input on this page is first multiplied by 18.018 and only
          then enters the equation; the result is displayed to one decimal
          place, rounded half-up.
        </p>
        <p>
          GMI is deliberately simple — an intercept and a slope. It captures
          how average glucose and A1C relate across a study population, and
          nothing about you personally: your red blood cells, your sensor, or
          which days the sensor was worn. That is why the number below your
          CGM average is an orientation, not a substitute for blood work.
        </p>
      </section>

      <section
        className="panel seo-panel"
        aria-labelledby="gmi-difference-heading"
      >
        <div className="section-heading">
          <p className="eyebrow">GMI vs A1C</p>
          <h2 id="gmi-difference-heading">
            Why GMI and your lab A1C usually disagree — and why that is fine
          </h2>
        </div>
        <p>
          Expect a gap. GMI and a same-period laboratory A1C commonly differ
          by around ±0.5 percentage points, and for a sizeable share of people
          the gap is larger still. The two numbers answer different questions:
          GMI summarizes what your sensor saw over a few weeks, while A1C
          reflects glucose exposure over the full lifespan of your red blood
          cells — and that lifespan genuinely differs from person to person.
          Anemia, kidney disease, pregnancy, recent blood loss or transfusion,
          and hemoglobin variants each move A1C without moving your glucose;
          sensor bias and wear gaps move GMI without moving your A1C.
        </p>
        <p>
          A mismatch between the two is therefore not a data error. It does
          not mean your sensor is failing, your lab made a mistake, or your
          numbers are untrustworthy — it usually just means your personal
          glucose-to-A1C relationship sits off the population average the
          formula was fitted on. Some clinicians even use a stable personal
          gap as useful information in itself.
        </p>
        <p>
          What GMI cannot do: it cannot replace a laboratory A1C, and it must
          not be used to diagnose anything or to change treatment on its own.
          Decisions belong with your care team, who will read GMI alongside
          time in range, variability, and the rest of your CGM report — and
          alongside actual blood work.
        </p>
      </section>
    </ToolPageLayout>
  );
}
