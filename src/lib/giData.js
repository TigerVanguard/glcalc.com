// GI data quality rules (Spec §6) — pure functions, no UI coupling.
// Data source: src/gi.json ({name: {gi, carbs_per_100g}}, DiOGenes category
// assignments). Low-carb entries carry encoded (non-measured) GI values like
// 45/70, producing directional errors such as "egg white GI 70". These rules
// govern how entries are displayed and which entries qualify for the static
// reference table. Nothing here deletes or mutates gi.json; every entry stays
// searchable.

import { giBand } from "./formulas.js";

// Below this carbs threshold GI is not measurable (ISO 26642 methodology).
export const MIN_MEASURABLE_CARBS = 2.5;

// Canonical display strings (Spec §6.1). UI must render these exact strings;
// tests assert against the same constants so page and spec cannot drift.
export const GI_NA_DISPLAY = "N/A";
export const GI_NA_NOTE = "too little carbohydrate to measure";
export const GI_NA_LABEL = `GI: ${GI_NA_DISPLAY} (${GI_NA_NOTE})`;
export const GL_APPROX_ZERO_LABEL = "GL \u2248 0";
export const GI_NA_FULL_LABEL = `${GI_NA_LABEL} \u00b7 ${GL_APPROX_ZERO_LABEL}`;

// Data provenance label for the static reference table footer (Spec §6.2).
export const GI_DATA_SOURCE = "DiOGenes";

/**
 * Display decision for a single gi.json entry ({gi, carbs_per_100g}).
 *
 * carbs_per_100g < 2.5  → GI is not measurable; the entry's numeric GI is an
 * encoding artifact and must never surface. Returns the N/A semantics.
 * Otherwise → numeric GI plus its band (continuous intervals via giBand).
 */
export function giDisplayRule(entry) {
  const carbs = Number(entry.carbs_per_100g);

  if (carbs < MIN_MEASURABLE_CARBS) {
    return {
      giDisplay: GI_NA_DISPLAY,
      note: GI_NA_NOTE,
      glApproxZero: true,
      giValue: null,
      giBand: null,
    };
  }

  const gi = Number(entry.gi);

  return {
    giDisplay: String(gi),
    note: null,
    glApproxZero: false,
    giValue: gi,
    giBand: giBand(gi),
  };
}

/**
 * Encoding suspect (Spec §6.2): DiOGenes category-assignment signature —
 * carbs_per_100g < 10 combined with GI exactly 45 or 70.
 */
export function isEncodingSuspect(entry) {
  const carbs = Number(entry.carbs_per_100g);
  const gi = Number(entry.gi);

  return carbs < 10 && (gi === 45 || gi === 70);
}

/**
 * Static-table eligibility: measurable carbs AND not an encoding suspect.
 */
export function isStaticTableEligible(entry) {
  return (
    Number(entry.carbs_per_100g) >= MIN_MEASURABLE_CARBS &&
    !isEncodingSuspect(entry)
  );
}

export const STATIC_TABLE_CATEGORIES = [
  "staple",
  "fruit",
  "vegetable",
  "dairy",
  "legume",
];

// Fixed food list for the static reference table (Spec §6.2: ≥20 entries
// covering staples/fruits/vegetables/dairy/legumes). Every name must exist in
// gi.json verbatim and pass isStaticTableEligible; selectStaticTable enforces
// both and throws on violation instead of silently skipping.
export const STATIC_TABLE_FOODS = [
  // Staples
  { name: "Rye bread", category: "staple" },
  { name: "Brown bread. average", category: "staple" },
  { name: "Spaghetti. white. boiled", category: "staple" },
  { name: "Couscous", category: "staple" },
  { name: "Sweet potato. boiled in salted water", category: "staple" },
  { name: "New potatoes. boiled in unsalted water", category: "staple" },
  // Fruits
  { name: "Apple", category: "fruit" },
  { name: "Banana", category: "fruit" },
  { name: "Oranges", category: "fruit" },
  { name: "Grapes", category: "fruit" },
  { name: "Mango", category: "fruit" },
  { name: "Watermelon", category: "fruit" },
  // Vegetables
  { name: "Carrots", category: "vegetable" },
  { name: "Peas", category: "vegetable" },
  { name: "Sweet corn fresh", category: "vegetable" },
  { name: "Beetroot. boiled in salted water", category: "vegetable" },
  { name: "Parsnip. boiled in unsalted water", category: "vegetable" },
  // Dairy
  { name: "Skim milk", category: "dairy" },
  { name: "Yoghurt", category: "dairy" },
  { name: "Yogurt. low fat. fruit", category: "dairy" },
  { name: "Custard. ready to eat", category: "dairy" },
  { name: "Ice cream. dairy. premium", category: "dairy" },
  // Legumes
  { name: "Lentils", category: "legume" },
  { name: "Kidney beans", category: "legume" },
  { name: "Baked beans", category: "legume" },
  { name: "Chickpeas/Bengal gram. raw", category: "legume" },
  { name: "Hummus", category: "legume" },
];

/**
 * Build the static reference table from a gi.json-shaped dataset.
 *
 * Validates every hardcoded food: it must exist in the dataset and pass
 * isStaticTableEligible. Any violation throws (fail loudly — a silent skip
 * would let the table shrink below the ≥20 / five-category guarantee).
 *
 * Returns [{name, category, gi, carbs_per_100g, giBand, source}].
 */
export function selectStaticTable(giData) {
  return STATIC_TABLE_FOODS.map(({ name, category }) => {
    const entry = giData[name];

    if (!entry) {
      throw new Error(`Static table food not found in gi data: "${name}"`);
    }

    if (!isStaticTableEligible(entry)) {
      throw new Error(
        `Static table food fails eligibility (carbs ${entry.carbs_per_100g}, GI ${entry.gi}): "${name}"`
      );
    }

    return {
      name,
      category,
      gi: Number(entry.gi),
      carbs_per_100g: Number(entry.carbs_per_100g),
      giBand: giBand(Number(entry.gi)),
      source: GI_DATA_SOURCE,
    };
  });
}
