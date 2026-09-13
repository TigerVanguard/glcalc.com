// Static GL reference table for /glycemic-load-calculator (ticket 12,
// Spec §5 GL row / §6.2).
//
// Rows come from giData.selectStaticTable — the same 27 fixed,
// eligibility-checked foods the GI page renders (carbs ≥ 2.5 g/100 g, no
// DiOGenes encoding suspects) — extended here with a TYPICAL SERVING and the
// glycemic load of that serving.
//
// Serving-size convention (hardcoded, documented): nominal household portions
// aligned with the serving sizes used in international GI/GL tables —
// bread 30 g per slice, fruit 120 g per piece, vegetables 80 g, milk 250 g,
// cooked pasta/legumes 150–180 g, ice cream 50 g per scoop. Two per-food
// adjustments: (a) entries whose gi.json carbs are DRY weight (couscous,
// raw chickpeas) get a 50 g dry portion; (b) parsnip uses 100 g because the
// 80 g vegetable nominal lands its GL exactly on the 10.0 band boundary,
// which would render a confusing "10.0 / Medium" row.
//
// GL per serving is COMPUTED AT MODULE LOAD (i.e. at build/prerender time for
// the static HTML) via formulas.gl — never hand-typed — and banded with
// formulas.glBand on the UNROUNDED value; only the display string rounds to
// one decimal. scripts/verify-dist.mjs independently hardcodes two golden
// rows so a bug here cannot self-certify.

import giData from "./gi.json";
import { gl, glBand } from "../lib/formulas.js";
import { selectStaticTable } from "../lib/giData.js";

// { gi.json key: { grams, label } } — label is what the table shows.
export const TYPICAL_SERVINGS = {
  // Staples
  "Rye bread": { grams: 30, label: "1 slice (30 g)" },
  "Brown bread. average": { grams: 30, label: "1 slice (30 g)" },
  "Spaghetti. white. boiled": { grams: 180, label: "180 g cooked" },
  Couscous: { grams: 50, label: "50 g dry" },
  "Sweet potato. boiled in salted water": { grams: 150, label: "150 g" },
  "New potatoes. boiled in unsalted water": { grams: 150, label: "150 g" },
  // Fruits
  Apple: { grams: 120, label: "1 medium (120 g)" },
  Banana: { grams: 120, label: "1 medium (120 g)" },
  Oranges: { grams: 120, label: "1 medium (120 g)" },
  Grapes: { grams: 120, label: "small bunch (120 g)" },
  Mango: { grams: 120, label: "120 g" },
  Watermelon: { grams: 120, label: "1 slice (120 g)" },
  // Vegetables
  Carrots: { grams: 80, label: "80 g" },
  Peas: { grams: 80, label: "80 g" },
  "Sweet corn fresh": { grams: 80, label: "80 g" },
  "Beetroot. boiled in salted water": { grams: 80, label: "80 g" },
  "Parsnip. boiled in unsalted water": { grams: 100, label: "100 g" },
  // Dairy
  "Skim milk": { grams: 250, label: "1 glass (250 g)" },
  Yoghurt: { grams: 200, label: "1 pot (200 g)" },
  "Yogurt. low fat. fruit": { grams: 150, label: "1 pot (150 g)" },
  "Custard. ready to eat": { grams: 120, label: "120 g" },
  "Ice cream. dairy. premium": { grams: 50, label: "1 scoop (50 g)" },
  // Legumes
  Lentils: { grams: 150, label: "150 g cooked" },
  "Kidney beans": { grams: 150, label: "150 g cooked" },
  "Baked beans": { grams: 150, label: "150 g" },
  "Chickpeas/Bengal gram. raw": { grams: 50, label: "50 g dry" },
  Hummus: { grams: 50, label: "50 g" },
};

function formatGl(value) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

/**
 * [{name, category, gi, carbs_per_100g, servingGrams, servingLabel,
 *   glValue (unrounded), glDisplay ("12.5"), glBand}] — throws if any of the
 * 27 selector foods is missing a serving definition (fail loudly, like the
 * selector itself).
 */
export function buildGlStaticTable() {
  return selectStaticTable(giData).map((row) => {
    const serving = TYPICAL_SERVINGS[row.name];

    if (!serving) {
      throw new Error(`No typical serving defined for static table food: "${row.name}"`);
    }

    const carbsInServing = (row.carbs_per_100g * serving.grams) / 100;
    const glValue = gl(row.gi, carbsInServing);

    return {
      ...row,
      servingGrams: serving.grams,
      servingLabel: serving.label,
      glValue,
      glDisplay: formatGl(glValue),
      glBand: glBand(glValue),
    };
  });
}

export const GL_STATIC_TABLE = buildGlStaticTable();
