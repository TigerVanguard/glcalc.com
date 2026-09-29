// Content-ux batch CU-03: the /glucose-to-a1c-estimator range chart, built at
// module load from formulas.js + display.js. Raw floats are compared with
// tolerances; display strings with string equality (they ARE the display
// contract). Golden rows are the spec's 6, independently verified.

import { describe, expect, it } from "vitest";
import { a1cRange, mgdlToMmol } from "../../src/lib/formulas.js";
import { formatA1cRange, formatMgdl, formatMmol } from "../../src/lib/display.js";
import { ESTIMATOR_CHART } from "../../src/data/estimatorChart.js";

const EXPECTED_MGDL = [
  70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220,
  230, 240,
];

const RANGE_SHAPE = /^≈ (\d+\.\d)% – (\d+\.\d)%$/;

describe("ESTIMATOR_CHART (average glucose → estimated A1C range, 18 rows)", () => {
  it("holds exactly the 18 spec mg/dL values (70–240, every 10), in order", () => {
    expect(ESTIMATOR_CHART).toHaveLength(18);
    expect(ESTIMATOR_CHART.map((row) => row.mgdl)).toEqual(EXPECTED_MGDL);
    expect(ESTIMATOR_CHART.map((row) => row.mgdlDisplay)).toEqual(
      EXPECTED_MGDL.map(String),
    );
  });

  it("derives every value from formulas.js and every string from display.js", () => {
    for (const row of ESTIMATOR_CHART) {
      const label = `${row.mgdl} mg/dL`;
      expect(Math.abs(row.mmol - mgdlToMmol(row.mgdl)), label).toBeLessThan(1e-12);
      expect(Math.abs(row.mmol - row.mgdl / 18.018), label).toBeLessThan(1e-9);
      expect(row.mgdlDisplay, label).toBe(formatMgdl(row.mgdl));
      expect(row.mmolDisplay, label).toBe(formatMmol(row.mmol));
      expect(row.rangeDisplay, label).toBe(formatA1cRange(a1cRange(row.mgdl)));
    }
  });

  it("gives every row a genuine range, never a single A1C value", () => {
    for (const row of ESTIMATOR_CHART) {
      const label = `${row.mgdl} mg/dL`;
      const match = RANGE_SHAPE.exec(row.rangeDisplay);
      expect(match, label).not.toBeNull();
      const low = Math.round(Number(match[1]) * 10);
      const high = Math.round(Number(match[2]) * 10);
      // Half-width 15.7 / 28.7 ≈ 0.547 each side: the rounded endpoints sit
      // 1.0 or 1.1 percentage points apart, never collapsed to one point.
      expect([10, 11], label).toContain(high - low);
      expect(row.rangeDisplay.match(/%/g), label).toHaveLength(2);
    }
  });

  it("stays inside the ADAG window: no row is flagged outOfRange", () => {
    for (const row of ESTIMATOR_CHART) {
      expect(a1cRange(row.mgdl).outOfRange, `${row.mgdl} mg/dL`).toBe(false);
    }
  });

  it("matches the 6 spec golden rows", () => {
    const GOLDEN = [
      ["70", "3.9", "≈ 3.5% – 4.6%"],
      ["100", "5.6", "≈ 4.6% – 5.7%"],
      ["150", "8.3", "≈ 6.3% – 7.4%"],
      ["160", "8.9", "≈ 6.7% – 7.7%"],
      ["200", "11.1", "≈ 8.0% – 9.1%"],
      ["240", "13.3", "≈ 9.4% – 10.5%"],
    ];
    const byMgdl = new Map(ESTIMATOR_CHART.map((row) => [row.mgdlDisplay, row]));
    for (const [mgdl, mmol, range] of GOLDEN) {
      const row = byMgdl.get(mgdl);
      expect(row, `${mgdl} mg/dL`).toBeTruthy();
      expect(row.mmolDisplay, `${mgdl} mg/dL`).toBe(mmol);
      expect(row.rangeDisplay, `${mgdl} mg/dL`).toBe(range);
    }
  });

  it("is a pure lookup: increasing, with no band or label field", () => {
    for (let i = 1; i < ESTIMATOR_CHART.length; i += 1) {
      expect(ESTIMATOR_CHART[i].mmol).toBeGreaterThan(ESTIMATOR_CHART[i - 1].mmol);
    }
    for (const row of ESTIMATOR_CHART) {
      expect(Object.keys(row).sort()).toEqual(
        ["mgdl", "mgdlDisplay", "mmol", "mmolDisplay", "rangeDisplay"],
      );
    }
  });
});
