// Ticket 12 (Spec §5 GL row / §6.2): the GL page's static serving-level
// reference table. Every row's GL must agree with the formula library
// (formulas.gl / formulas.glBand) — the acceptance criterion "each row's GL
// matches the formula library" — plus three hand-computed golden rows so the
// table data cannot drift silently. Tolerance assertions only (never strict
// float equality, per Spec §8 T1).

import { describe, expect, it } from "vitest";
import {
  GL_STATIC_TABLE,
  TYPICAL_SERVINGS,
} from "../../src/data/glStaticTable.js";
import { gl, glBand } from "../../src/lib/formulas.js";
import { isStaticTableEligible } from "../../src/lib/giData.js";
import giData from "../../src/data/gi.json";

describe("GL static reference table (ticket 12)", () => {
  it("holds exactly the 27 selector foods, each with a typical serving", () => {
    expect(GL_STATIC_TABLE).toHaveLength(27);

    for (const row of GL_STATIC_TABLE) {
      expect(row.servingGrams, row.name).toBeGreaterThan(0);
      expect(row.servingLabel, row.name).toBeTruthy();
      expect(TYPICAL_SERVINGS[row.name].grams).toBe(row.servingGrams);
    }
  });

  it("computes every row's GL and band from the formula library, on gi.json values", () => {
    for (const row of GL_STATIC_TABLE) {
      const entry = giData[row.name];
      expect(entry, row.name).toBeTruthy();
      expect(isStaticTableEligible(entry), row.name).toBe(true);
      expect(row.gi).toBe(Number(entry.gi));
      expect(row.carbs_per_100g).toBe(Number(entry.carbs_per_100g));

      const carbsInServing = (Number(entry.carbs_per_100g) * row.servingGrams) / 100;
      const expected = gl(Number(entry.gi), carbsInServing);
      expect(Math.abs(row.glValue - expected), row.name).toBeLessThan(0.001);

      // Band from the UNROUNDED value; display rounded to exactly 1 decimal.
      expect(row.glBand, row.name).toBe(glBand(expected));
      expect(row.glDisplay, row.name).toMatch(/^\d+\.\d$/);
      expect(
        Math.abs(Number(row.glDisplay) - expected),
        row.name,
      ).toBeLessThanOrEqual(0.05 + 1e-9);
    }
  });

  it("matches three hand-computed golden rows across all three bands", () => {
    const byName = new Map(GL_STATIC_TABLE.map((row) => [row.name, row]));

    // Rye bread: gi 89, carbs 47 → 30 g slice → 14.1 g carbs → 12.549.
    const rye = byName.get("Rye bread");
    expect(Math.abs(rye.glValue - 12.549)).toBeLessThan(0.001);
    expect(rye.glDisplay).toBe("12.5");
    expect(rye.glBand).toBe("Medium");

    // Watermelon: gi 76, carbs 8.1 → 120 g slice → 9.72 g carbs → 7.3872.
    const watermelon = byName.get("Watermelon");
    expect(Math.abs(watermelon.glValue - 7.3872)).toBeLessThan(0.001);
    expect(watermelon.glDisplay).toBe("7.4");
    expect(watermelon.glBand).toBe("Low");

    // Couscous: gi 65, carbs 69 (dry) → 50 g dry → 34.5 g carbs → 22.425.
    const couscous = byName.get("Couscous");
    expect(Math.abs(couscous.glValue - 22.425)).toBeLessThan(0.001);
    expect(couscous.glDisplay).toBe("22.4");
    expect(couscous.glBand).toBe("High");

    // The table demonstrates all three bands (Low / Medium / High).
    expect(new Set(GL_STATIC_TABLE.map((row) => row.glBand))).toEqual(
      new Set(["Low", "Medium", "High"]),
    );
  });
});
