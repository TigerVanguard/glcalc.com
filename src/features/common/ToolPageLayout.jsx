import React from "react";
import SiteNav from "./SiteNav.jsx";
import ToolFooter from "./ToolFooter.jsx";

// Shared page frame (ticket 06, Spec §5A.1-3): SiteNav + H1 + intro + main
// content slot + related-tools slot + FAQ slot + ToolFooter. Used by all pages
// except /glycemic-load-calculator, where App.jsx owns its own <main> — that
// page composes SiteNav / RelatedTools / ToolFooter around <App /> directly.
export default function ToolPageLayout({ h1, intro, children, related, faq }) {
  return (
    <>
      <SiteNav />
      <main className="app-shell tool-page">
        <header className="tool-page__header">
          <h1>{h1}</h1>
          {intro}
        </header>
        {children}
        {related}
        {faq}
      </main>
      <ToolFooter />
    </>
  );
}
