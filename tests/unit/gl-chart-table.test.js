// Shareable-assets BL-04 (Spec §4 BL-04 / D6 / D7): the chart page's
// three-tier dataset. Every tier's GL must agree with the formula library
// (formulas.gl on gi.json-derived carbs, formulas.glBand on the UNROUNDED
// value), the row set must be exactly the GL_STATIC_TABLE 27, and three
// hand-computed golden rows lock all three tiers so the data cannot drift
// silently. Tolerance assertions only (never strict float equality, per main
// Spec §8 T1).

import { describe, expect, it } from "vitest";
import { GL_CHART_TABLE, glChartCsv } from "../../src/data/glChartTable.js";
import { GL_STATIC_TABLE } from "../../src/data/glStaticTable.js";
import { gl, glBand } from "../../src/lib/formulas.js";
import giData from "../../src/data/gi.json";

const TIERS = ["at50g", "at100g", "atTypical"];

describe("GL chart table (shareable-assets BL-04)", () => {
  it("holds exactly one row per GL_STATIC_TABLE food (27), in the same order", () => {
    expect(GL_CHART_TABLE).toHaveLength(GL_STATIC_TABLE.length);
    expect(GL_CHART_TABLE).toHaveLength(27);
    expect(GL_CHART_TABLE.map((row) => row.name)).toEqual(
      GL_STATIC_TABLE.map((row) => row.name),
    );
  });

  it("computes every tier's GL and band from the formula library, on gi.json values", () => {
    for (const row of GL_CHART_TABLE) {
      const entry = giData[row.name];
      expect(entry, row.name).toBeTruthy();
      expect(row.gi).toBe(Number(entry.gi));
      expect(row.carbs_per_100g).toBe(Number(entry.carbs_per_100g));
      expect(row.at50g.grams).toBe(50);
      expect(row.at100g.grams).toBe(100);
      expect(row.atTypical.grams).toBe(row.servingGrams);

      for (const tierKey of TIERS) {
        const tier = row[tierKey];
        const carbsInServing = (Number(entry.carbs_per_100g) * tier.grams) / 100;
        const expected = gl(Number(entry.gi), carbsInServing);
        const label = `${row.name} ${tierKey}`;

        expect(Math.abs(tier.value - expected), label).toBeLessThan(0.001);
        // Band from the UNROUNDED value; display rounded to exactly 1 decimal.
        expect(tier.band, label).toBe(glBand(expected));
        expect(tier.display, label).toMatch(/^\d+\.\d$/);
        expect(Math.abs(Number(tier.display) - expected), label).toBeLessThanOrEqual(
          0.05 + 1e-9,
        );
      }
    }
  });

  it("reuses GL_STATIC_TABLE's own computed values for the typical tier", () => {
    const staticByName = new Map(GL_STATIC_TABLE.map((row) => [row.name, row]));
    for (const row of GL_CHART_TABLE) {
      const staticRow = staticByName.get(row.name);
      expect(row.atTypical.value, row.name).toBe(staticRow.glValue);
      expect(row.atTypical.display, row.name).toBe(staticRow.glDisplay);
      expect(row.atTypical.band, row.name).toBe(staticRow.glBand);
      expect(row.servingLabel, row.name).toBe(staticRow.servingLabel);
    }
  });

  it("matches three hand-computed golden rows across all three tiers", () => {
    const byName = new Map(GL_CHART_TABLE.map((row) => [row.name, row]));

    // Rye bread: gi 89, carbs 47 g/100 g.
    //   50 g → 23.5 g carbs → 20.915; 100 g → 47 g → 41.83;
    //   typical 30 g slice → 14.1 g → 12.549.
    const rye = byName.get("Rye bread");
    expect(Math.abs(rye.at50g.value - 20.915)).toBeLessThan(0.001);
    expect(rye.at50g.display).toBe("20.9");
    expect(rye.at50g.band).toBe("High");
    expect(Math.abs(rye.at100g.value - 41.83)).toBeLessThan(0.001);
    expect(rye.at100g.display).toBe("41.8");
    expect(rye.at100g.band).toBe("High");
    expect(Math.abs(rye.atTypical.value - 12.549)).toBeLessThan(0.001);
    expect(rye.atTypical.display).toBe("12.5");
    expect(rye.atTypical.band).toBe("Medium");

    // Watermelon: gi 76, carbs 8.1 g/100 g.
    //   50 g → 4.05 g → 3.078; 100 g → 8.1 g → 6.156;
    //   typical 120 g slice → 9.72 g → 7.3872.
    const watermelon = byName.get("Watermelon");
    expect(Math.abs(watermelon.at50g.value - 3.078)).toBeLessThan(0.001);
    expect(watermelon.at50g.display).toBe("3.1");
    expect(watermelon.at50g.band).toBe("Low");
    expect(Math.abs(watermelon.at100g.value - 6.156)).toBeLessThan(0.001);
    expect(watermelon.at100g.display).toBe("6.2");
    expect(watermelon.at100g.band).toBe("Low");
    expect(Math.abs(watermelon.atTypical.value - 7.3872)).toBeLessThan(0.001);
    expect(watermelon.atTypical.display).toBe("7.4");
    expect(watermelon.atTypical.band).toBe("Low");

    // Couscous: gi 65, carbs 69 g/100 g (dry).
    //   50 g dry → 34.5 g → 22.425; 100 g → 69 g → 44.85;
    //   typical 50 g dry → same as the 50 g tier → 22.425.
    const couscous = byName.get("Couscous");
    expect(Math.abs(couscous.at50g.value - 22.425)).toBeLessThan(0.001);
    expect(couscous.at50g.display).toBe("22.4");
    expect(couscous.at50g.band).toBe("High");
    expect(Math.abs(couscous.at100g.value - 44.85)).toBeLessThan(0.001);
    expect(couscous.at100g.band).toBe("High");
    expect(Math.abs(couscous.atTypical.value - 22.425)).toBeLessThan(0.001);
    expect(couscous.atTypical.band).toBe("High");
  });

  it("generates a CSV with a header row plus one line per food (D7)", () => {
    const csv = glChartCsv();
    const lines = csv.trimEnd().split("\n");
    expect(lines).toHaveLength(1 + GL_CHART_TABLE.length);
    expect(lines[0]).toBe(
      "Food,GI,Carbs per 100 g,GL (50 g),Band (50 g),GL (100 g),Band (100 g),Typical serving,GL (typical serving),Band (typical serving)",
    );
    expect(lines.some((line) => line.startsWith("Rye bread,89,47,20.9,High,41.8,High"))).toBe(
      true,
    );
    // Display strings only — the unrounded raw values never leak into the CSV.
    expect(csv).not.toContain("20.915");
  });
});
