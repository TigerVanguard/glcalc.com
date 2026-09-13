// Spec §8 T2: GI data quality tests against src/gi.json (full dataset).
import { describe, expect, it } from "vitest";

import giData from "../../src/gi.json";
import {
  GI_NA_DISPLAY,
  GI_NA_FULL_LABEL,
  GI_NA_LABEL,
  GI_NA_NOTE,
  GL_APPROX_ZERO_LABEL,
  MIN_MEASURABLE_CARBS,
  STATIC_TABLE_CATEGORIES,
  giDisplayRule,
  isEncodingSuspect,
  isStaticTableEligible,
  selectStaticTable,
} from "../../src/lib/giData.js";

describe("static table selector (Spec §6.2)", () => {
  const table = selectStaticTable(giData);

  it("outputs at least 20 entries", () => {
    expect(table.length).toBeGreaterThanOrEqual(20);
  });

  it("every entry has carbs_per_100g >= 2.5", () => {
    for (const row of table) {
      expect(
        row.carbs_per_100g,
        `carbs too low for "${row.name}"`
      ).toBeGreaterThanOrEqual(MIN_MEASURABLE_CARBS);
    }
  });

  it("no entry is an encoding suspect (carbs < 10 with GI 45/70)", () => {
    for (const row of table) {
      expect(
        isEncodingSuspect({ gi: row.gi, carbs_per_100g: row.carbs_per_100g }),
        `encoding suspect leaked into static table: "${row.name}"`
      ).toBe(false);
    }
  });

  it("covers all five categories: staple/fruit/vegetable/dairy/legume", () => {
    const covered = new Set(table.map((row) => row.category));
    for (const category of STATIC_TABLE_CATEGORIES) {
      expect(covered.has(category), `missing category: ${category}`).toBe(
        true
      );
    }
  });

  it("every listed name exists verbatim in gi.json", () => {
    for (const row of table) {
      expect(giData[row.name], `not in gi.json: "${row.name}"`).toBeDefined();
    }
  });

  it("each entry carries a numeric GI, a band, and DiOGenes provenance", () => {
    for (const row of table) {
      expect(typeof row.gi).toBe("number");
      expect(["Low", "Medium", "High"]).toContain(row.giBand);
      expect(row.source).toBe("DiOGenes");
    }
  });

  it("throws (instead of skipping) when a listed food is missing", () => {
    const doctored = { ...giData };
    delete doctored["Rye bread"];
    expect(() => selectStaticTable(doctored)).toThrow(/not found/);
  });

  it("throws (instead of skipping) when a listed food fails eligibility", () => {
    const doctored = { ...giData, "Rye bread": { gi: 70, carbs_per_100g: 3 } };
    expect(() => selectStaticTable(doctored)).toThrow(/eligibility/);
  });
});

describe("display rule (Spec §6.1)", () => {
  it("exports the canonical spec display strings", () => {
    expect(GI_NA_LABEL).toBe("GI: N/A (too little carbohydrate to measure)");
    expect(GL_APPROX_ZERO_LABEL).toBe("GL \u2248 0");
    expect(GI_NA_FULL_LABEL).toBe(
      "GI: N/A (too little carbohydrate to measure) \u00b7 GL \u2248 0"
    );
  });

  it("returns N/A semantics for every carbs < 2.5 entry in gi.json", () => {
    const lowCarbNames = Object.keys(giData).filter(
      (name) => giData[name].carbs_per_100g < MIN_MEASURABLE_CARBS
    );
    // Sanity: the dataset really contains low-carb entries.
    expect(lowCarbNames.length).toBeGreaterThan(0);

    for (const name of lowCarbNames) {
      const result = giDisplayRule(giData[name]);
      expect(result.giDisplay, `expected N/A for "${name}"`).toBe(
        GI_NA_DISPLAY
      );
      expect(result.note).toBe(GI_NA_NOTE);
      expect(result.glApproxZero).toBe(true);
      expect(result.giValue).toBeNull();
      expect(result.giBand).toBeNull();
    }
  });

  it("regression anchor: egg white entries (carbs 1.2/0.4, encoded GI 70) return N/A and never surface 70", () => {
    const eggWhites = [
      "Egg. chicken. white. raw", // carbs_per_100g 1.2
      "Egg Chicken White Raw", // carbs_per_100g 0.4
    ];

    for (const name of eggWhites) {
      const entry = giData[name];
      expect(entry, `anchor entry missing from gi.json: "${name}"`).toBeDefined();
      // These are low-carb but NOT zero-carb — the rule must key off < 2.5.
      expect(entry.carbs_per_100g).toBeGreaterThan(0);
      expect(entry.carbs_per_100g).toBeLessThan(MIN_MEASURABLE_CARBS);
      // The raw dataset does carry the encoded GI 70 (that's the bug source).
      expect(entry.gi).toBe(70);

      const result = giDisplayRule(entry);
      expect(result.giDisplay).toBe(GI_NA_DISPLAY);
      expect(result.glApproxZero).toBe(true);
      // The numeric 70 must not appear anywhere in the display structure.
      for (const value of Object.values(result)) {
        expect(value).not.toBe(70);
        expect(value).not.toBe("70");
      }
      expect(JSON.stringify(result)).not.toMatch(/70/);
    }
  });

  it("returns numeric GI plus correct band for compliant entries", () => {
    // Common staple: Rye bread, GI 89, carbs 47 → High.
    const rye = giDisplayRule(giData["Rye bread"]);
    expect(rye.giDisplay).toBe("89");
    expect(rye.giValue).toBe(89);
    expect(rye.giBand).toBe("High");
    expect(rye.glApproxZero).toBe(false);
    expect(rye.note).toBeNull();

    // Fruit: Apple, GI 38, carbs 11.1 → Low.
    const apple = giDisplayRule(giData["Apple"]);
    expect(apple.giValue).toBe(38);
    expect(apple.giBand).toBe("Low");
    expect(apple.glApproxZero).toBe(false);

    // Band boundary sanity via display rule (GI 65, carbs 69 → Medium).
    const couscous = giDisplayRule(giData["Couscous"]);
    expect(couscous.giValue).toBe(65);
    expect(couscous.giBand).toBe("Medium");
  });

  it("keeps low-carb entries searchable: rule never deletes, only re-labels", () => {
    // The module takes entries as-is; gi.json itself must retain the
    // low-carb entries (they stay searchable per Spec §6.1).
    expect(giData["Egg. chicken. white. raw"]).toBeDefined();
    expect(giData["Egg Chicken White Raw"]).toBeDefined();
  });

  it("eligibility helper matches the display threshold at the 2.5 boundary", () => {
    expect(giDisplayRule({ gi: 50, carbs_per_100g: 2.5 }).giDisplay).toBe(
      "50"
    );
    expect(giDisplayRule({ gi: 50, carbs_per_100g: 2.49 }).giDisplay).toBe(
      GI_NA_DISPLAY
    );
    expect(isStaticTableEligible({ gi: 50, carbs_per_100g: 2.5 })).toBe(true);
    expect(isStaticTableEligible({ gi: 45, carbs_per_100g: 9.9 })).toBe(false);
    expect(isStaticTableEligible({ gi: 70, carbs_per_100g: 9.9 })).toBe(false);
    expect(isStaticTableEligible({ gi: 45, carbs_per_100g: 10 })).toBe(true);
    expect(isStaticTableEligible({ gi: 46, carbs_per_100g: 5 })).toBe(true);
  });
});
