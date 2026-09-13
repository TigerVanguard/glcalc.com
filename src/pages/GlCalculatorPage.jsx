import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import App from "../App.jsx";
import glycemicIndex from "../data/gi.json";

// /glycemic-load-calculator (ticket 05, Spec §5A.2): renders the existing App
// main flow unchanged, plus `?food=<exact gi.json key>` deep-link prefill.
// A known key preselects that food exactly as if the user had searched and
// confirmed it; an unknown key is ignored. Read-only: nothing is ever written
// back to the URL.
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

  return <App initialSelection={initialSelection} />;
}
