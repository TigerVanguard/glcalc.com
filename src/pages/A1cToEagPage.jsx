import React from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";

// Placeholder page (ticket 03) wrapped in the shared layout (ticket 06).
// Calculator content lands in a later ticket; the related-tools block below is
// final (Spec §5B.3-2: A1C cluster pages interlink pairwise) — content tickets
// must not touch it.
export default function A1cToEagPage() {
  return (
    <ToolPageLayout
      h1="A1C to eAG Calculator"
      intro={
        <p>
          This page is under construction; the A1C to estimated average glucose
          calculator is coming soon.
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
    />
  );
}
