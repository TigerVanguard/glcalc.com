import React from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import { BRAND } from "../site.config.js";
import { CONTACT_URL } from "../seo/pageSeo.js";

// /about full content (ticket 13, Spec §5 about row + §4 P1): honest data
// provenance (DiOGenes = category-level archived data, NOT an authoritative
// GI reference), formula citations (Nathan 2008 / Bergenstal 2018 / GL
// definition / 18.018), MIT upstream attribution (assafmo/glcalc.com),
// maintainer + contact fallback (Spec §4 P0-3), and the full-paragraph
// disclaimer. Pure static page, no interactivity — everything below must be
// visible with JavaScript disabled (verify-dist T3-⑨ + prerender.spec.js).
// No related-tools block: /about is reached from every page's footer
// (§5B.3-4); it has no §5 in-body link quota. The AboutPage + Organization
// JSON-LD comes from src/seo/pageSeo.js (ticket 04).

const UPSTREAM_REPO_URL = "https://github.com/assafmo/glcalc.com";

export default function AboutPage() {
  return (
    <ToolPageLayout
      h1={`About ${BRAND}`}
      intro={
        <p>
          {BRAND} is a free set of blood sugar and glycemic calculators:
          glycemic load, glycemic index lookup, GMI, A1C ⇄ average glucose
          conversion, and mg/dL ⇄ mmol/L unit conversion. It is built for
          people who want to understand the numbers on their meter, CGM, or
          lab report — for educational purposes, not as a medical device. This
          page explains where every number on the site comes from.
        </p>
      }
    >
      <section className="panel seo-panel" aria-labelledby="about-data-heading">
        <div className="section-heading">
          <p className="eyebrow">Data</p>
          <h2 id="about-data-heading">Where the GI data comes from</h2>
        </div>
        <p>
          The food search and reference tables use the DiOGenes GI Database
          (diogenes-eu.org), created by the pan-European DiOGenes project and
          described in Aston et al., <em>Obesity Reviews</em> 2010. The
          project has ended and the database is no longer maintained or
          available online; this site uses its archived data.
        </p>
        <p>
          These GI values are category-level assignments: foods were grouped
          into categories and each category was given a representative GI
          value. They are reference values, not individually measured results
          for every food in the list. The GI of a specific product can differ
          from its category value with variety, ripeness, processing, and
          preparation.
        </p>
        <p>
          If a precise value matters to you, cross-check it against a
          maintained source such as the University of Sydney GI database or
          the international tables of glycemic index and glycemic load values
          (Atkinson et al., 2021). Migrating this site's data to the Atkinson
          2021 international tables is the planned upgrade path.
        </p>
      </section>

      <section className="panel seo-panel" aria-labelledby="about-formulas-heading">
        <div className="section-heading">
          <p className="eyebrow">Formulas</p>
          <h2 id="about-formulas-heading">Formula sources</h2>
        </div>
        <ul>
          <li>
            <strong>Glycemic load:</strong> GL = GI × available carbohydrate
            (g) ÷ 100 — the standard definition of glycemic load per serving.
          </li>
          <li>
            <strong>A1C to eAG:</strong> eAG (mg/dL) = 28.7 × A1C − 46.7, from
            the ADAG study (Nathan et al., <em>Diabetes Care</em> 2008). The
            average-glucose-to-A1C estimator inverts this equation
            algebraically and therefore reports a range, not a single value.
          </li>
          <li>
            <strong>GMI:</strong> GMI (%) = 3.31 + 0.02392 × mean glucose
            (mg/dL), from Bergenstal et al., <em>Diabetes Care</em> 2018.
          </li>
          <li>
            <strong>Unit conversion:</strong> mmol/L = mg/dL ÷ 18.018, from
            the molar mass of glucose (about 180.18 g/mol).
          </li>
        </ul>
      </section>

      <section className="panel seo-panel" aria-labelledby="about-attribution-heading">
        <div className="section-heading">
          <p className="eyebrow">Open source</p>
          <h2 id="about-attribution-heading">Open-source attribution</h2>
        </div>
        <p>
          {BRAND} is based on the open-source project{" "}
          <a href={UPSTREAM_REPO_URL} rel="noopener noreferrer">
            glcalc.com
          </a>{" "}
          by Assaf Morami, MIT License, © 2018. This site is a modified
          version of that project; the original copyright and permission
          notice is preserved in this repository's LICENSE file, as the MIT
          License requires.
        </p>
      </section>

      <section className="panel seo-panel" aria-labelledby="about-contact-heading">
        <div className="section-heading">
          <p className="eyebrow">Contact</p>
          <h2 id="about-contact-heading">Maintainer and contact</h2>
        </div>
        <p>
          Maintained by the {BRAND} project. Questions, corrections, and data
          issues are welcome via{" "}
          <a href={CONTACT_URL} rel="noopener noreferrer">
            GitHub Issues
          </a>
          .
        </p>
        <p>
          This tool has not been reviewed by a medical professional. Sources
          are cited above so you can verify every formula and data point
          yourself.
        </p>
      </section>

      <section className="panel seo-panel" aria-labelledby="about-disclaimer-heading">
        <div className="section-heading">
          <p className="eyebrow">Disclaimer</p>
          <h2 id="about-disclaimer-heading">Medical disclaimer</h2>
        </div>
        <p>
          Everything on this site is provided for educational and
          informational purposes only. It is not medical advice and is not a
          substitute for professional medical advice, diagnosis, or treatment.
          The calculators apply published population-level formulas; your
          individual results can differ from any estimate shown here.
        </p>
        <p>
          Diagnosing diabetes or prediabetes requires laboratory testing using
          an NGSP-certified method, ordered and interpreted by a healthcare
          professional. Never make treatment or medication changes based on
          this site's output alone — always talk to your doctor or diabetes
          care team first.
        </p>
      </section>
    </ToolPageLayout>
  );
}
