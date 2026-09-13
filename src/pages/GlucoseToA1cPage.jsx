import React from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";

// Placeholder page (ticket 03) wrapped in the shared layout (ticket 06).
// Calculator content lands in a later ticket; the related-tools block below is
// final (Spec §5B.3-2: A1C cluster pages interlink pairwise) — content tickets
// must not touch it.
export default function GlucoseToA1cPage() {
  return (
    <ToolPageLayout
      h1="Average Glucose to A1C Estimator"
      intro={
        <p>
          This page is under construction; the average glucose to A1C estimator
          is coming soon.
        </p>
      }
      related={
        <RelatedTools
          items={[
            {
              before: "Going the other direction? ",
              href: "/a1c-to-eag-calculator",
              anchor: "Convert an A1C percentage to eAG",
              after: " with the ADAG formula.",
            },
            {
              before: "If your average comes from a sensor, you can also ",
              href: "/gmi-calculator",
              anchor: "see your GMI from CGM data",
              after: ".",
            },
          ]}
        />
      }
    />
  );
}
