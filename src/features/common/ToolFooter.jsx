import React from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../../site.config.js";

// Unified site footer (ticket 06, Spec §7): the 5 disclaimer items, verbatim
// template, identical on all 8 pages. verify-dist T3-⑦ asserts items ①②③⑤ as
// literal strings and ④ by the regex `Last updated: \d{4}-\d{2}-\d{2}` — do
// not rephrase without updating the spec.
//
// ② uses the fallback attribution string ("the {BRAND} project") because the
// maintainer name is a pending P0 human dependency (tasks.md P0-3).
const BUILD_DATE = import.meta.env.VITE_BUILD_DATE;

export default function ToolFooter() {
  return (
    <footer className="tool-footer">
      <div className="tool-footer__inner">
        <p>
          This calculator is for informational purposes only and is not a
          substitute for professional medical advice, diagnosis, or treatment.
        </p>
        <p>Maintained by the {BRAND} project.</p>
        <p>This tool has not been reviewed by a medical professional.</p>
        <p>Last updated: {BUILD_DATE}.</p>
        <p>
          Data sources &amp; contact: <Link to="/about">about {BRAND}</Link>
        </p>
      </div>
    </footer>
  );
}
