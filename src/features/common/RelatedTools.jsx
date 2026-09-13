import React from "react";
import { Link } from "react-router-dom";

// In-body related-tools block (ticket 06, Spec §5B.3-2/-3): every tool page
// carries ≥2 internal links to sibling tools inside this container. The stable
// `related-tools` class is a contract with scripts/verify-dist.mjs (T3-⑤
// counts links INSIDE this container; the header nav is asserted separately
// and does not count). Anchor text is a natural-word-order variant of the
// target page's keyword, worded differently at every placement site-wide —
// never verbatim-repeated, never "click here".
//
// items: [{ before?, href, anchor, after? }] — anchor embedded in a sentence.
export default function RelatedTools({ items }) {
  return (
    <section className="related-tools panel" aria-label="Related calculators">
      <h2>Related calculators</h2>
      <ul>
        {items.map(({ before, href, anchor, after }) => (
          <li key={href}>
            {before}
            <Link to={href}>{anchor}</Link>
            {after}
          </li>
        ))}
      </ul>
    </section>
  );
}
