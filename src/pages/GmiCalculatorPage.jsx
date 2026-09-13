import React from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";

// Placeholder page (ticket 03) wrapped in the shared layout (ticket 06).
// Calculator content lands in a later ticket; the related-tools block below is
// final (Spec §5B.3-2: A1C cluster pages interlink pairwise) — content tickets
// must not touch it.
export default function GmiCalculatorPage() {
  return (
    <ToolPageLayout
      h1="GMI Calculator (Glucose Management Indicator)"
      intro={
        <p>This page is under construction; the GMI calculator is coming soon.</p>
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
    />
  );
}
