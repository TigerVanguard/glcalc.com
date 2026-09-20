import React from "react";
import SiteNav from "./SiteNav.jsx";
import ToolFooter from "./ToolFooter.jsx";
import { BRAND, SITE_ORIGIN } from "../../site.config.js";

// Paper-only brand line (shareable-assets BL-05 / SA-06): a real element
// instead of CSS `content` for print-compatibility. Hidden on screen
// (.print-brand is display:none outside @media print), shown at the top of
// the page when printing, where .site-header is hidden.
const PRINT_BRAND = `${BRAND} — ${SITE_ORIGIN.replace(/^https?:\/\//, "")}`;

// Shared page frame (ticket 06, Spec §5A.1-3): SiteNav + H1 + intro + main
// content slot + related-tools slot + FAQ slot + ToolFooter. Used by all pages
// except /glycemic-load-calculator, where App.jsx owns its own <main> — that
// page composes SiteNav / RelatedTools / ToolFooter around <App /> directly.
export default function ToolPageLayout({ h1, intro, children, related, faq }) {
  return (
    <>
      <SiteNav />
      <p className="print-brand">{PRINT_BRAND}</p>
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
