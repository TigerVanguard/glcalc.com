import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import App from "../App.jsx";
import glycemicIndex from "../data/gi.json";
import SiteNav from "../features/common/SiteNav.jsx";
import ToolFooter from "../features/common/ToolFooter.jsx";
import RelatedTools from "../features/common/RelatedTools.jsx";

// /glycemic-load-calculator (ticket 05, Spec §5A.2): renders the existing App
// main flow unchanged, plus `?food=<exact gi.json key>` deep-link prefill.
// A known key preselects that food exactly as if the user had searched and
// confirmed it; an unknown key is ignored. Read-only: nothing is ever written
// back to the URL.
//
// Ticket 06 wraps SiteNav / RelatedTools / ToolFooter AROUND <App /> (App's
// internal structure, including its own <main>, stays untouched). The
// related-tools block sits in its own width container below the app; it is
// final per Spec §5B.3-2 (GL ⇄ GI interlink, plus the unit converter).
export default function GlCalculatorPage() {
  const { search } = useLocation();

  const initialSelection = useMemo(() => {
    const foodParam = new URLSearchParams(search).get("food");
    const entry = foodParam ? glycemicIndex[foodParam] : null;

    if (!entry) {
      return null;
    }

    // Same selection shape FoodSearch produces on confirm.
    return {
      food: {
        title: foodParam,
        gi: entry.gi,
        carbsPer100g: entry.carbs_per_100g,
      },
      source: "link",
      sourceLabel: "Shared link",
    };
  }, [search]);

  return (
    <>
      <SiteNav />
      <App initialSelection={initialSelection} />
      <div className="app-shell app-shell--append">
        <RelatedTools
          items={[
            {
              before: "Not sure how a food ranks before you portion it? You can ",
              href: "/glycemic-index-calculator",
              anchor: "look up a food's glycemic index",
              after: " first.",
            },
            {
              before: "Working with meter readings too? ",
              href: "/blood-sugar-converter",
              anchor: "Convert readings between mg/dL and mmol/L",
              after: " without leaving the site.",
            },
          ]}
        />
      </div>
      <ToolFooter />
    </>
  );
}
