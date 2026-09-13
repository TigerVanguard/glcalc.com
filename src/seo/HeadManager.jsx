// Route-level <head> manager (ticket 04, Spec §4 P2-3 / §5B).
//
// Selection rationale (vs react-helmet-async): the app is React 17 on
// ReactDOM.render with a post-build prerenderer that snapshots the live DOM —
// there is no SSR string rendering, so helmet's main value (server collection)
// buys nothing here, while adding a dependency with React-version peer range
// risk. This ~60-line manager is fully deterministic: it owns every tag it
// creates (marker attribute), replaces them wholesale per navigation, and runs
// in useLayoutEffect so the head is committed synchronously BEFORE the
// ReactDOM.render callback sets data-render-complete — i.e. before
// scripts/prerender.mjs is allowed to snapshot the page. A passive useEffect
// would race that marker.
//
// index.html carries NO page-level head tags anymore (torn down in this
// ticket): this component is the only writer of title / description /
// canonical / og / twitter / JSON-LD, which is what guarantees the "exactly
// one title/canonical per page" invariant (verify-dist T3-⑥).

import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { BRAND } from "../site.config.js";
import { PAGE_SEO, OG_IMAGE_URL, canonicalFor } from "./pageSeo.js";

const MARKER = "data-seo-managed";

function appendHeadTag(tagName, attributes, textContent) {
  const element = document.createElement(tagName);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  if (textContent != null) {
    element.textContent = textContent;
  }
  element.setAttribute(MARKER, "true");
  document.head.appendChild(element);
}

export default function HeadManager() {
  // pathname only: the `?food=` deep link (Spec §5A.1-5) must canonicalize to
  // the parameterless URL, which falls out of ignoring `search` entirely.
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const seo = PAGE_SEO[pathname];
    if (!seo) {
      return; // Unknown route: leave the head alone (static 404 has its own).
    }

    document.head
      .querySelectorAll(`[${MARKER}]`)
      .forEach((node) => node.remove());

    const title = `${seo.pageTitle} | ${BRAND}`;
    const canonical = canonicalFor(pathname);

    // document.title creates/updates the single <title> element itself.
    document.title = title;

    appendHeadTag("meta", { name: "description", content: seo.description });
    appendHeadTag("link", { rel: "canonical", href: canonical });
    appendHeadTag("meta", { property: "og:type", content: "website" });
    appendHeadTag("meta", { property: "og:site_name", content: BRAND });
    appendHeadTag("meta", { property: "og:title", content: title });
    appendHeadTag("meta", { property: "og:description", content: seo.description });
    appendHeadTag("meta", { property: "og:url", content: canonical });
    appendHeadTag("meta", { property: "og:image", content: OG_IMAGE_URL });
    appendHeadTag("meta", { name: "twitter:card", content: "summary_large_image" });
    appendHeadTag(
      "script",
      { type: "application/ld+json" },
      JSON.stringify({ "@context": "https://schema.org", "@graph": seo.jsonLd }),
    );
  }, [pathname]);

  return null;
}
