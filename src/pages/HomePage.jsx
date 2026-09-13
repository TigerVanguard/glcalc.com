import React from "react";

// Minimal placeholder home (ticket 05): `/` must no longer render the App
// (it now lives at /glycemic-load-calculator; duplicating it on two URLs
// would create full-content duplication). The real navigation home page
// with tool cards is ticket 06.
export default function HomePage() {
  return (
    <main className="app-shell">
      <h1>Free Blood Sugar &amp; Glycemic Calculators</h1>
      <p>
        Free calculators for glycemic load, glycemic index, A1C conversion, and
        blood sugar units. Site navigation is under construction.
      </p>
    </main>
  );
}
