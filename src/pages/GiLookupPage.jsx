import React from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";

// Placeholder page (ticket 03) wrapped in the shared layout (ticket 06).
// Calculator content lands in a later ticket; the related-tools block below is
// final (Spec §5B.3-2: GL ⇄ GI interlink, plus the unit converter) — content
// tickets must not touch it.
export default function GiLookupPage() {
  return (
    <ToolPageLayout
      h1="Glycemic Index Calculator"
      intro={
        <p>
          This page is under construction; the glycemic index lookup tool is
          coming soon.
        </p>
      }
      related={
        <RelatedTools
          items={[
            {
              before: "GI alone ignores portion size — ",
              href: "/glycemic-load-calculator",
              anchor: "calculate the glycemic load of a real serving",
              after: " to see the fuller picture.",
            },
            {
              before: "Tracking glucose in different units? ",
              href: "/blood-sugar-converter",
              anchor: "Switch blood sugar values between the two units",
              after: " in one step.",
            },
          ]}
        />
      }
    />
  );
}
