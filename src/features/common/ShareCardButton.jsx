import React from "react";
import { buildCardLines, downloadCard } from "../../lib/shareCard.js";

// "Download result card" button (shareable-assets BL-01). Callers pass the
// card spec ({ title, rows, footnote }) either as a plain object or as a
// factory function evaluated at click time (so the spec always reflects the
// currently displayed result). Visibility is the caller's job: render this
// only when a valid result is on screen.
export default function ShareCardButton({ cardSpec, filename }) {
  const handleClick = () => {
    const spec = typeof cardSpec === "function" ? cardSpec() : cardSpec;
    downloadCard(buildCardLines(spec), filename);
  };

  return (
    <button type="button" className="secondary-button" onClick={handleClick}>
      Download result card
    </button>
  );
}
