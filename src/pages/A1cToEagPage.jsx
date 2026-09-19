import React, { useState } from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";
import NumberField from "../features/common/NumberField.jsx";
import ResultCard from "../features/common/ResultCard.jsx";
import ShareCardButton from "../features/common/ShareCardButton.jsx";
import ErrorNotice from "../features/common/ErrorNotice.jsx";
import { eag, eagMmol } from "../lib/formulas.js";
import { formatEag, parsePositiveNumber } from "../lib/display.js";
import { A1C_TO_EAG_FAQS } from "../data/a1cToEagFaq.js";

// ADAG validity window (Spec §5A.2): A1C <4% or >10% still calculates, but
// shows the out-of-range warning (the formula is extrapolated there).
const ADAG_MIN_A1C = 4;
const ADAG_MAX_A1C = 10;

// ADA reference bands — STATIC educational rows only.
//
// RED LINE D4 (Spec §1 / §9-4): this table must NEVER highlight, mark, or
// match the user's input against a band, and the page must never print a
// normal/prediabetes/diabetes verdict for the user's number. Reason: the ADA
// requires diagnosis to be based on laboratory testing with an NGSP-certified
// method interpreted by a clinician — a web calculator grading a typed-in
// value would be presenting a diagnostic judgment it cannot make. Any
// "your value falls in band X" feature, CSS highlight, or aria-current marker
// is forbidden; scripts/verify-dist.mjs and tests/e2e/a1c.spec.js enforce it.
const ADA_REFERENCE_ROWS = [
  { band: "Below 5.7%", category: "Normal" },
  { band: "5.7% – 6.4%", category: "Prediabetes" },
  { band: "6.5% or above", category: "Diabetes" },
];

export default function A1cToEagPage() {
  // Single-field realtime tool (Spec §5A.1-4): raw text is the source of
  // truth; both eAG outputs derive from the unrounded formulas.js values, and
  // display rounding (1 decimal, half-up) lives in display.js formatEag.
  // Input values are never written to the URL (Spec §5A.1-5).
  const [text, setText] = useState("");

  const parsed = parsePositiveNumber(text);
  const isValid = parsed.state === "valid";
  const invalid = parsed.state === "invalid";
  const outOfAdagRange =
    isValid && (parsed.value < ADAG_MIN_A1C || parsed.value > ADAG_MAX_A1C);

  // Display strings computed ONCE per render and shared verbatim by the
  // result cards and the share card (shareable-assets BL-03, Spec D5/D6):
  // the share card must show character-for-character what the page shows, so
  // both consumers read the same string — no recomputation, no re-rounding.
  const eagMgdlValue = isValid ? `${formatEag(eag(parsed.value))} mg/dL` : null;
  const eagMmolValue = isValid
    ? `${formatEag(eagMmol(parsed.value))} mmol/L`
    : null;

  // NOTE (red line D4): nothing inside the calculator panel below may contain
  // the strings "normal", "prediabetes", or "diabetes" (case-insensitive) —
  // verify-dist and the e2e suite scan .a1c-calculator-panel for them.
  return (
    <ToolPageLayout
      h1="A1C to eAG Calculator"
      intro={
        <p>
          Convert an A1C percentage into estimated average glucose (eAG), shown
          in mg/dL and mmol/L at the same time. eAG expresses a lab A1C result
          in the same units your meter or CGM uses day to day.
        </p>
      }
      related={
        <RelatedTools
          items={[
            {
              before: "Starting from a meter or CGM average instead? You can ",
              href: "/glucose-to-a1c-estimator",
              anchor: "work backwards from average glucose to an A1C range",
              after: ".",
            },
            {
              before: "Wearing a CGM? ",
              href: "/gmi-calculator",
              anchor: "Turn a CGM average into a Glucose Management Indicator",
              after: " for a sensor-based view.",
            },
          ]}
        />
      }
      faq={
        <section className="panel seo-panel" aria-labelledby="a1c-faq-heading">
          <div className="section-heading">
            <p className="eyebrow">FAQ</p>
            <h2 id="a1c-faq-heading">A1C and eAG questions</h2>
          </div>
          <div className="faq-list">
            {A1C_TO_EAG_FAQS.map((item) => (
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
        className="panel converter-panel a1c-calculator-panel"
        aria-labelledby="a1c-heading"
      >
        <div className="section-heading">
          <p className="eyebrow">Convert</p>
          <h2 id="a1c-heading">Enter your A1C percentage</h2>
        </div>
        <p className="muted">
          Type your A1C to one decimal place (for example 7.0); both eAG values
          update as you type.
        </p>

        <NumberField
          id="a1c-input"
          label="A1C (%)"
          value={text}
          onChange={setText}
          placeholder="e.g. 7.0"
          suffix="%"
          invalid={invalid}
        />

        {invalid ? (
          <ErrorNotice
            title="Enter a positive number"
            message="A1C values must be a number greater than zero. Clear the field and enter a value like 7.0."
          />
        ) : null}

        {outOfAdagRange ? (
          <aside className="notice notice--warning" role="status">
            <p className="notice__title">Outside the ADAG reliable range</p>
            <p>
              The ADAG study validated this formula for A1C values between 4%
              and 10%. Values outside that window are extrapolated, so the
              estimate below is less dependable — read it as a rough
              orientation only.
            </p>
          </aside>
        ) : null}

        <div className="converter-fields">
          <ResultCard
            label="eAG in mg/dL"
            value={eagMgdlValue}
            note="Estimated average glucose over roughly the past three months."
            placeholder="Enter an A1C value above to see the mg/dL estimate."
          />
          <ResultCard
            label="eAG in mmol/L"
            value={eagMmolValue}
            note="The same estimate expressed in mmol/L."
            placeholder="Enter an A1C value above to see the mmol/L estimate."
          />
        </div>

        {isValid ? (
          // Share card (shareable-assets BL-03, Spec D5/D6): every value is
          // the string ALREADY on screen this render — the raw input text as
          // shown in the field (plus its % suffix) and both eAG display
          // strings verbatim. The footnote reuses the page's existing
          // citation wording ("Nathan et al., Diabetes Care 2008" / ADAG in
          // the formula section below). Rendered only when a valid result is
          // visible, so the prerendered (empty-input) panel never contains
          // the button — and no diagnostic word ever enters this panel
          // (red line D4; verify-dist scans .a1c-calculator-panel).
          <ShareCardButton
            cardSpec={{
              title: "A1C to eAG",
              rows: [
                { label: "A1C", value: `${text.trim()}%` },
                { label: "eAG", value: eagMgdlValue },
                { label: "eAG", value: eagMmolValue },
              ],
              footnote: "Formula: Nathan et al., Diabetes Care 2008 (ADAG)",
            }}
            filename="glucomath-a1c-eag.png"
          />
        ) : null}
      </section>

      <section className="panel seo-panel" aria-labelledby="a1c-formula-heading">
        <div className="section-heading">
          <p className="eyebrow">The formula</p>
          <h2 id="a1c-formula-heading">The ADAG formula, and where it comes from</h2>
        </div>
        <p className="formula-box">eAG (mg/dL) = 28.7 × A1C − 46.7</p>
        <p className="formula-box">eAG (mmol/L) = 1.59 × A1C − 2.59</p>
        <p>
          Both equations come from the A1C-Derived Average Glucose (ADAG) study
          (Nathan et al., Diabetes Care 2008), which correlated frequent glucose
          measurements with laboratory A1C results. The name &ldquo;ADAG
          formula&rdquo; applies only to this forward direction — turning an
          A1C percentage into an estimated average glucose. Estimating in the
          reverse direction is an algebraic rearrangement, not part of the
          published ADAG regression.
        </p>
        <h3>Where the estimate is reliable</h3>
        <p>
          The ADAG study enrolled 507 participants, each contributing roughly
          2,700 glucose measurements over three months. The scatter around the
          regression line is real: the reported standard deviation is about
          15.7 mg/dL, so two people with the same A1C can have noticeably
          different true averages. The relationship is most reliable for A1C
          values between 4% and 10%, and it is not suitable during pregnancy,
          with hemoglobin variants, or with anemia and other conditions that
          change red blood cell turnover.
        </p>
      </section>

      <section className="panel seo-panel" aria-labelledby="a1c-reference-heading">
        <div className="section-heading">
          <p className="eyebrow">Reference</p>
          <h2 id="a1c-reference-heading">ADA reference ranges — education only</h2>
        </div>
        <p>
          The American Diabetes Association publishes these A1C ranges as
          population-level reference points. They are reproduced here for
          education only.
        </p>
        {/* Static table — see the D4 comment on ADA_REFERENCE_ROWS above. No
            row may ever gain a highlight class, aria-current, or any other
            marker derived from the user's input. */}
        <table className="conversion-table a1c-reference-table">
          <thead>
            <tr>
              <th scope="col">A1C result</th>
              <th scope="col">ADA category</th>
            </tr>
          </thead>
          <tbody>
            {ADA_REFERENCE_ROWS.map((row) => (
              <tr key={row.band}>
                <th scope="row">{row.band}</th>
                <td>{row.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          This page never compares your input against this table and never
          labels your result with one of these categories: diagnosis requires
          an NGSP-certified laboratory test interpreted by a clinician, not a
          calculator.
        </p>
      </section>
    </ToolPageLayout>
  );
}
