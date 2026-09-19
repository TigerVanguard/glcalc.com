import React, { useState } from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";
import NumberField from "../features/common/NumberField.jsx";
import UnitToggle from "../features/common/UnitToggle.jsx";
import ResultCard from "../features/common/ResultCard.jsx";
import ShareCardButton from "../features/common/ShareCardButton.jsx";
import ErrorNotice from "../features/common/ErrorNotice.jsx";
import { a1cRange, mmolToMgdl } from "../lib/formulas.js";
import { formatA1cRange, parsePositiveNumber } from "../lib/display.js";
import { GLUCOSE_TO_A1C_FAQS } from "../data/glucoseToA1cFaq.js";

// RED LINES for this page (Spec §1 D4 / §5 estimator row / §9):
// - The result is ALWAYS a range "≈ X.X% – Y.Y%" (formulas.a1cRange: center
//   (eAG+46.7)/28.7, half-width 15.7/28.7 unrounded, endpoints rounded 0.1%
//   each). A single-point A1C output must never exist — e2e asserts the only
//   result value node matches the range shape, and verify-dist asserts no
//   percentage is prerendered inside .estimator-panel.
// - The backwards equation must NEVER be labelled "ADAG formula": that name
//   belongs to the forward direction only (the a1c-to-eag page). On this page
//   the phrase may appear solely in the related-tools link pointing there.
// - No diagnostic verdicts, and unlike the a1c-to-eag page not even an
//   educational band table: the FAQ explains the limits in prose instead.
//   verify-dist scans .estimator-panel for normal/prediabetes/diabetes.
export default function GlucoseToA1cPage() {
  // Realtime single-field tool (Spec §5A.1-4): raw text + unit are the source
  // of truth; mmol/L input is converted through formulas.mmolToMgdl BEFORE
  // entering a1cRange. Inputs are never written to the URL (§5A.1-5).
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
  const range = isValid ? a1cRange(glucoseMgdl) : null;

  // The range DISPLAY string, computed ONCE per render and shared verbatim by
  // the result card and the share card (shareable-assets BL-03, red line D5):
  // the card must carry the exact range string shown on screen — never a
  // single-point A1C value, never a diagnostic band word.
  const rangeText = range ? formatA1cRange(range) : null;

  return (
    <ToolPageLayout
      h1="Average Glucose to A1C Estimator"
      intro={
        <p>
          Estimate the A1C range that corresponds to your average blood
          glucose, from a meter or CGM average in mg/dL or mmol/L. The answer
          is deliberately a range, not a single percentage — this direction of
          the calculation has built-in uncertainty that one number would hide.
        </p>
      }
      related={
        <RelatedTools
          items={[
            {
              before: "Going the other direction? ",
              href: "/a1c-to-eag-calculator",
              anchor: "Convert an A1C percentage to eAG",
              after: " with the ADAG formula.",
            },
            {
              before: "If your average comes from a sensor, you can also ",
              href: "/gmi-calculator",
              anchor: "see your GMI from CGM data",
              after: ".",
            },
          ]}
        />
      }
      faq={
        <section
          className="panel seo-panel"
          aria-labelledby="estimator-faq-heading"
        >
          <div className="section-heading">
            <p className="eyebrow">FAQ</p>
            <h2 id="estimator-faq-heading">
              Average glucose and A1C questions
            </h2>
          </div>
          <div className="faq-list">
            {GLUCOSE_TO_A1C_FAQS.map((item) => (
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
        className="panel converter-panel estimator-panel"
        aria-labelledby="estimator-heading"
      >
        <div className="section-heading">
          <p className="eyebrow">Estimate</p>
          <h2 id="estimator-heading">Enter your average glucose</h2>
        </div>
        <p className="muted">
          Type the average from your meter or CGM and pick its unit; the
          estimated A1C range updates as you type.
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
          id="estimator-input"
          label="Average glucose"
          value={text}
          onChange={setText}
          placeholder={unit === "mmol" ? "e.g. 7.0" : "e.g. 126"}
          suffix={unit === "mmol" ? "mmol/L" : "mg/dL"}
          invalid={invalid}
        />

        {invalid ? (
          <ErrorNotice
            title="Enter a positive number"
            message="Average glucose must be a number greater than zero. Clear the field and enter a value like 126 (mg/dL) or 7.0 (mmol/L)."
          />
        ) : null}

        {range?.outOfRange ? (
          <aside className="notice notice--warning" role="status">
            <p className="notice__title">Outside the ADAG reliable range</p>
            <p>
              The underlying ADAG data covers average glucose from roughly 68
              to 240 mg/dL (about 3.8 to 13.3 mmol/L). Your value falls outside
              that window, so the range below is extrapolated and less
              dependable — read it as a rough orientation only.
            </p>
          </aside>
        ) : null}

        <ResultCard
          label="Estimated A1C range"
          value={rangeText}
          note="An algebraic approximation built on ADAG study data — not the direction the ADAG regression was published for. The regression is asymmetric, so deviations grow near clinically important cut-offs; that uncertainty is why you see a range."
          placeholder="Enter an average glucose above to see the estimated A1C range."
        />

        {isValid ? (
          // Share card (shareable-assets BL-03, red line D5): the card rows
          // are the strings ALREADY on screen this render — the raw input
          // text (plus its unit suffix) and rangeText verbatim, so the card
          // can only ever show the range, never a single-point A1C or a
          // diagnostic word. The wrapper's data-share-range attribute exposes
          // the exact string handed to the card so the e2e suite can assert
          // it equals the on-screen range (share-estimator.spec.js). Rendered
          // only when a valid result is visible, so the prerendered
          // (empty-input) panel never contains the button or any percentage.
          <div data-share-range={rangeText}>
            <ShareCardButton
              cardSpec={{
                title: "Estimated A1C Range",
                rows: [
                  {
                    label: "Average glucose",
                    value: `${text.trim()} ${unit === "mmol" ? "mmol/L" : "mg/dL"}`,
                  },
                  { label: "Estimated A1C", value: rangeText },
                ],
              }}
              filename="glucomath-a1c-estimate.png"
            />
          </div>
        ) : null}
      </section>

      <section
        className="panel seo-panel"
        aria-labelledby="estimator-formula-heading"
      >
        <div className="section-heading">
          <p className="eyebrow">The math</p>
          <h2 id="estimator-formula-heading">
            How the estimate is calculated — and why it is approximate
          </h2>
        </div>
        <p className="formula-box">A1C (%) ≈ (eAG + 46.7) ÷ 28.7</p>
        <p>
          This equation is an algebraic rearrangement of the regression the
          ADAG study (Nathan et al., Diabetes Care 2008) published for the
          opposite direction — turning an A1C percentage into an estimated
          average glucose. The study validated that forward direction; running
          it backwards, as this page does, is a convenience the study itself
          never named or certified. Regression lines are asymmetric: the line
          fitted to predict glucose from A1C is not the line you would get
          fitting A1C from glucose, so the backwards estimate carries extra
          error, and that error grows near clinically important cut-offs.
        </p>
        <h3>Why you get a range, not a number</h3>
        <p>
          The scatter around the ADAG regression is measurable: the reported
          standard deviation is about 15.7 mg/dL of glucose. Propagating that
          scatter through the slope of 28.7 gives 15.7 ÷ 28.7 ≈ 0.55
          percentage points of A1C — roughly ±0.5% around the central value.
          The tool keeps that half-width unrounded, adds and subtracts it from
          the center, and only then rounds each endpoint to 0.1%. Two people
          with the same true average glucose can genuinely sit at opposite
          ends of the range shown.
        </p>
        <h3>This page versus the A1C to eAG calculator</h3>
        <p>
          The two tools are mirror images with different standing. The A1C to
          eAG calculator applies the published ADAG regression in its original,
          validated direction and can therefore report a value. This estimator
          reverses the same relationship to answer a different practical
          question — &ldquo;what A1C would this average likely map to?&rdquo;
          — and honestly reports the uncertainty of that reversal as a range.
          Neither tool measures anything: for a real A1C you need an
          NGSP-certified laboratory test.
        </p>
      </section>
    </ToolPageLayout>
  );
}
