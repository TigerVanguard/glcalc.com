import React from "react";
import ToolPageLayout from "../features/common/ToolPageLayout.jsx";
import { BRAND } from "../site.config.js";

// Placeholder page (ticket 03) wrapped in the shared layout (ticket 06).
// Full content (data sources, formula references, MIT attribution) is
// ticket 13. No related-tools block: /about is reached from every page's
// footer (§5B.3-4); it has no §5 in-body link quota.
export default function AboutPage() {
  return (
    <ToolPageLayout
      h1={`About ${BRAND}`}
      intro={
        <p>
          This page is under construction; data sources, formula references,
          and attribution are coming soon.
        </p>
      }
    />
  );
}
