import React from "react";

// Print button (shareable-assets BL-05 / SA-06, Spec D2/D8): the "PDF report"
// is the browser's native print-to-PDF — no PDF library (locked decision D2).
// Click → GA4 `print_report` event (silently skipped when gtag is absent:
// local dev / prerender, D8) → window.print(). The paper layout comes from the
// shared @media print rules at the end of src/styles/app.css. Visibility is
// the caller's job (same contract as ShareCardButton): render this only when
// there is something worth printing.
export default function PrintButton({ label }) {
  const handleClick = () => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "print_report", { page: window.location.pathname });
    }
    window.print();
  };

  return (
    <button type="button" className="secondary-button" onClick={handleClick}>
      {label}
    </button>
  );
}
