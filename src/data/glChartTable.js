// Chart-page dataset for /glycemic-load-chart (shareable-assets BL-04,
// Spec §4 BL-04 / D3 / D6 / D7).
//
// Extends the 27-food GL_STATIC_TABLE (same selector foods, same typical
// servings) with two extra serving tiers: a flat 50 g and a flat 100 g of the
// food as eaten (or as stored in gi.json for dry-weight entries — same
// convention the typical-serving column already documents). Every GL value is
// COMPUTED AT MODULE LOAD via formulas.gl and banded with formulas.glBand on
// the UNROUNDED value (D6: never hand-typed); only the display string rounds
// to one decimal, following the exact glStaticTable.js pattern. The typical
// tier is NOT recomputed — it reuses GL_STATIC_TABLE's own computed values,
// so the two pages can never drift apart.
//
// The CSV download (D7) is generated client-side from this module by
// glChartCsv() — no static CSV file exists, so there is no second copy of the
// data to go stale.

import { GL_STATIC_TABLE } from "./glStaticTable.js";
import { gl, glBand } from "../lib/formulas.js";

// Same display rounding as glStaticTable.js formatGl: half-up to 1 decimal.
function formatGl(value) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

function tierFor(giValue, carbsPer100g, grams) {
  const carbsInServing = (carbsPer100g * grams) / 100;
  const value = gl(giValue, carbsInServing);

  return {
    grams,
    value,
    display: formatGl(value),
    band: glBand(value),
  };
}

/**
 * [{ name, gi, carbs_per_100g, servingLabel, servingGrams,
 *    at50g / at100g / atTypical: { grams, value (unrounded), display, band } }]
 * — one row per GL_STATIC_TABLE food, in the same order.
 */
export function buildGlChartTable() {
  return GL_STATIC_TABLE.map((row) => ({
    name: row.name,
    gi: row.gi,
    carbs_per_100g: row.carbs_per_100g,
    servingLabel: row.servingLabel,
    servingGrams: row.servingGrams,
    at50g: tierFor(row.gi, row.carbs_per_100g, 50),
    at100g: tierFor(row.gi, row.carbs_per_100g, 100),
    // Typical tier passes GL_STATIC_TABLE's computed values through verbatim
    // (already formulas.gl / formulas.glBand output — single source).
    atTypical: {
      grams: row.servingGrams,
      value: row.glValue,
      display: row.glDisplay,
      band: row.glBand,
    },
  }));
}

export const GL_CHART_TABLE = buildGlChartTable();

// RFC-4180-style escaping: quote a field when it holds a comma, quote, or
// newline (food names in gi.json use dots, but the escaper stays defensive).
function csvField(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const CSV_HEADER = [
  "Food",
  "GI",
  "Carbs per 100 g",
  "GL (50 g)",
  "Band (50 g)",
  "GL (100 g)",
  "Band (100 g)",
  "Typical serving",
  "GL (typical serving)",
  "Band (typical serving)",
];

// Pure function (unit-testable without a browser): the CSV text the chart
// page's download button turns into a Blob (D7 — client-generated, one data
// source). Display strings only; raw unrounded values never leave the module.
export function glChartCsv(table = GL_CHART_TABLE) {
  const rows = table.map((row) =>
    [
      row.name,
      row.gi,
      row.carbs_per_100g,
      row.at50g.display,
      row.at50g.band,
      row.at100g.display,
      row.at100g.band,
      row.servingLabel,
      row.atTypical.display,
      row.atTypical.band,
    ]
      .map(csvField)
      .join(","),
  );
  return [CSV_HEADER.map(csvField).join(","), ...rows].join("\n") + "\n";
}
