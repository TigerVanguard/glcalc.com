import React, { useState } from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";
import NumberField from "../features/common/NumberField.jsx";
import ResultCard from "../features/common/ResultCard.jsx";
import ShareCardButton from "../features/common/ShareCardButton.jsx";
import ErrorNotice from "../features/common/ErrorNotice.jsx";
import { mgdlToMmol, mmolToMgdl } from "../lib/formulas.js";
import { formatMgdl, formatMmol, parsePositiveNumber } from "../lib/display.js";
import { BLOOD_SUGAR_CONVERTER_FAQS } from "../data/bloodSugarConverterFaq.js";
// Common-values tables (Spec §5A.2 converter, content-ux CU-02): both
// directions are DERIVED from formulas.js + display.js at module load in
// src/data/converterTables.js, so the static prerendered numbers can never
// drift from the conversion the interactive tool uses.
// scripts/verify-dist.mjs re-hardcodes the expected rows independently.
import { MGDL_TO_MMOL_TABLE, MMOL_TO_MGDL_TABLE } from "../data/converterTables.js";

// ">1000 mg/dL (or the mmol equivalent)" warning threshold (Spec §5A.2):
// warns without blocking the conversion.
const WARN_ABOVE_MGDL = 1000;

export default function BloodSugarConverterPage() {
  // Bidirectional binding, single source of truth: the LAST-EDITED side and
  // its raw text. The opposite field always displays a value derived through
  // the unrounded formulas.js conversion of that raw number — never from the
  // other field's rounded display — so round-tripping cannot drift. Input
  // values are never written to the URL (Spec §5A.2).
  const [entry, setEntry] = useState({ source: "mgdl", text: "" });

  const parsed = parsePositiveNumber(entry.text);
  const isValid = parsed.state === "valid";

  // Canonical raw values (unrounded) for the current input, when valid.
  const rawMgdl = isValid
    ? entry.source === "mgdl"
      ? parsed.value
      : mmolToMgdl(parsed.value)
    : null;
  const rawMmol = isValid
    ? entry.source === "mmol"
      ? parsed.value
      : mgdlToMmol(parsed.value)
    : null;

  // The edited side echoes the user's raw text; the derived side shows the
  // display-rounded conversion, or clears on empty/invalid input.
  const mgdlText =
    entry.source === "mgdl" ? entry.text : isValid ? formatMgdl(rawMgdl) : "";
  const mmolText =
    entry.source === "mmol" ? entry.text : isValid ? formatMmol(rawMmol) : "";

  const invalid = parsed.state === "invalid";
  const outOfCommonRange = isValid && rawMgdl > WARN_ABOVE_MGDL;

  return (
    <ToolPageLayout
      h1="Blood Sugar Converter (mg/dL ⇄ mmol/L)"
      intro={
        <>
          <p>
            Convert a blood glucose reading between mg/dL and mmol/L instantly,
            in either direction. The two units are different ways of reporting
            exactly the same measurement, so nothing about your reading changes —
            only the number format does.
          </p>
          <p>
            Looking up a common value?{" "}
            <a href="#conversion-charts">Jump to the conversion charts</a> for
            both directions, mg/dL to mmol/L and mmol/L to mg/dL.
          </p>
        </>
      }
      related={
        <RelatedTools
          items={[
            {
              before: "Once your units match, you can ",
              href: "/a1c-to-eag-calculator",
              anchor: "translate an A1C result into average glucose",
              after: ".",
            },
            {
              before: "Or go the other way and ",
              href: "/glucose-to-a1c-estimator",
              anchor: "approximate an A1C range from an average reading",
              after: ".",
            },
            {
              before: "CGM users can ",
              href: "/gmi-calculator",
              anchor: "check the glucose management indicator for a CGM average",
              after: ".",
            },
          ]}
        />
      }
      faq={
        <section className="panel seo-panel" aria-labelledby="converter-faq-heading">
          <div className="section-heading">
            <p className="eyebrow">FAQ</p>
            <h2 id="converter-faq-heading">Blood sugar unit questions</h2>
          </div>
          <div className="faq-list">
            {BLOOD_SUGAR_CONVERTER_FAQS.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      }
    >
      <section className="panel converter-panel" aria-labelledby="converter-heading">
        <div className="section-heading">
          <p className="eyebrow">Convert</p>
          <h2 id="converter-heading">Enter a value on either side</h2>
        </div>
        <p className="muted">
          Type into whichever field matches your meter or lab report; the other
          side updates as you type. mg/dL is shown as a whole number, mmol/L
          with one decimal place.
        </p>

        <div className="converter-fields">
          <NumberField
            id="mgdl-input"
            label="Blood sugar in mg/dL"
            value={mgdlText}
            onChange={(text) => setEntry({ source: "mgdl", text })}
            placeholder="e.g. 100"
            suffix="mg/dL"
            invalid={invalid && entry.source === "mgdl"}
          />
          <NumberField
            id="mmol-input"
            label="Blood sugar in mmol/L"
            value={mmolText}
            onChange={(text) => setEntry({ source: "mmol", text })}
            placeholder="e.g. 5.5"
            suffix="mmol/L"
            invalid={invalid && entry.source === "mmol"}
          />
        </div>

        {invalid ? (
          <ErrorNotice
            title="Enter a positive number"
            message="Blood sugar values must be a number greater than zero. Clear the field and enter a value like 100 (mg/dL) or 5.5 (mmol/L)."
          />
        ) : null}

        {outOfCommonRange ? (
          <aside className="notice notice--warning" role="status">
            <p className="notice__title">Outside the common range</p>
            <p>
              Readings above 1000 mg/dL (55.5 mmol/L) are far beyond what
              glucose meters normally report. The conversion below is still
              mathematically correct, but double-check the number you entered.
            </p>
          </aside>
        ) : null}

        <ResultCard
          label="Conversion result"
          value={isValid ? `${formatMgdl(rawMgdl)} mg/dL = ${formatMmol(rawMmol)} mmol/L` : null}
          note="Same glucose level expressed in both reporting units."
          placeholder="Enter a blood sugar value above to see it in both units."
        />

        {isValid ? (
          // Share card (shareable-assets BL-06, Spec D5/D6): both values are
          // the strings ALREADY shown in the two bound fields this render —
          // mgdlText / mmolText verbatim (the edited side's raw text, the
          // derived side's display-rounded conversion). No recomputation, no
          // re-rounding. The rule row is the fixed string matching the
          // formula-box wording below ("mmol/L = mg/dL ÷ 18.018"). Rendered
          // only when a valid conversion is visible, so the prerendered
          // (empty-input) panel never contains the button.
          <ShareCardButton
            cardSpec={{
              title: "Blood Sugar Conversion",
              rows: [
                { label: "mg/dL", value: mgdlText.trim() },
                { label: "mmol/L", value: mmolText.trim() },
                { label: "Rule", value: "mmol/L = mg/dL ÷ 18.018" },
              ],
            }}
            filename="glucomath-conversion.png"
          />
        ) : null}
      </section>

      <section className="panel seo-panel converter-guide" aria-labelledby="converter-guide-heading">
        <div className="section-heading">
          <p className="eyebrow">Why two units</p>
          <h2 id="converter-guide-heading">mg/dL and mmol/L measure the same thing</h2>
        </div>
        <p>
          mg/dL (milligrams per deciliter) reports the weight of glucose in a
          volume of blood and is the standard in the United States and a few
          other countries. mmol/L (millimoles per liter) counts glucose
          molecules per liter and is the standard in the UK, most of Europe,
          Canada, Australia, and China. Meters, lab reports, and research papers
          mix the two constantly, which is why the same fasting reading can
          appear as 100 in one report and 5.6 in another.
        </p>
        <p className="formula-box">
          mmol/L = mg/dL ÷ 18.018&ensp;·&ensp;mg/dL = mmol/L × 18.018
        </p>
        <p>
          The 18.018 factor comes from the molar mass of glucose (about 180.18
          g/mol) combined with the deciliter-to-liter volume difference between
          the two units.
        </p>
        <h3 id="conversion-charts">Common blood sugar values: mg/dL to mmol/L</h3>
        <table className="conversion-table">
          <thead>
            <tr>
              <th scope="col">mg/dL</th>
              <th scope="col">mmol/L</th>
            </tr>
          </thead>
          <tbody>
            {MGDL_TO_MMOL_TABLE.map((row) => (
              <tr key={row.mgdlDisplay}>
                <th scope="row">{row.mgdlDisplay}</th>
                <td>{row.mmolDisplay}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Common blood sugar values: mmol/L to mg/dL</h3>
        <table className="conversion-table">
          <thead>
            <tr>
              <th scope="col">mmol/L</th>
              <th scope="col">mg/dL</th>
            </tr>
          </thead>
          <tbody>
            {MMOL_TO_MGDL_TABLE.map((row) => (
              <tr key={row.mmolDisplay}>
                <th scope="row">{row.mmolDisplay}</th>
                <td>{row.mgdlDisplay}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          Some of these values appear in clinical guidelines, but the tables
          are only here to help you read a number written in an unfamiliar
          unit — they do not interpret or grade your own reading.
        </p>
      </section>
    </ToolPageLayout>
  );
}
