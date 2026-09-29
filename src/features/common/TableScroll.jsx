import React from "react";

// Horizontal scroll frame for a data table wider than a phone screen
// (content-ux CU-04): the table scrolls inside this box instead of widening
// the page. A scrollable box must be reachable and scrollable by keyboard and
// named for screen readers — tabIndex 0 + role="region" + a non-empty label
// (axe rule scrollable-region-focusable); tests/e2e/mobile-overflow-prerender
// asserts all three. Layout rules: .table-scroll in src/styles/app.css.
export default function TableScroll({ label, children }) {
  return (
    <div className="table-scroll" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}
