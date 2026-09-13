import React from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";

// Placeholder page (ticket 03) wrapped in the shared layout (ticket 06).
// Calculator content lands in a later ticket; the related-tools block below is
// final (Spec §5B.3-2: unit conversion is the upstream action for the whole
// A1C cluster, so this page links all three) — content tickets must not touch it.
export default function BloodSugarConverterPage() {
  return (
    <ToolPageLayout
      h1="Blood Sugar Converter (mg/dL ⇄ mmol/L)"
      intro={
        <p>
          This page is under construction; the blood sugar unit converter is
          coming soon.
        </p>
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
    />
  );
}
