import React from "react";
import { BRAND } from "../site.config.js";

// Placeholder page (ticket 03). Full content lands in later tickets.
export default function AboutPage() {
  return (
    <main className="app-shell">
      <h1>{`About ${BRAND}`}</h1>
      <p>This page is under construction; data sources, formula references, and attribution are coming soon.</p>
    </main>
  );
}
